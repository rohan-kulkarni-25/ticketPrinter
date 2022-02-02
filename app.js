const fs = require("fs");
const Jimp = require("jimp");
const express = require("express");
const app = express();
const cloudinary = require("cloudinary");
const cors = require('cors')
const Data = require('./dataModel')

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());




app.get("/", (req, res) => {
  res.status(200).end(`Hello`)
});

const uploadOnCloudinary = async (fileName) => {
  try {
    console.log(`In Upload function`);
    const file = `${__dirname}/Certificates/${fileName}`;
    const result = await cloudinary.v2.uploader.upload(file, {
      folder: "tickets",
    });
    console.log(result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.log(error);
  }
};

const generateTicket = async (Text, fileName) => {
  try {
    console.log(`In GEnerate function`);
    let loadedImage;
    const print = await Jimp.read(`${__dirname}/W.png`)
      .then((image) => {
        loadedImage = image;
        return Jimp.loadFont(Jimp.FONT_SANS_64_BLACK);
      })
      .then((font) => {
        loadedImage
          .print(
            font,
            500,
            400,
            {
              text: Text,
              alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
              alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
            },
            1000,
            50
          )
          .write("./Certificates/" + fileName);
      })
      .then(() => {
        console.log(`File Created`);
      });
  } catch (error) {
    console.log(error);
  }
};

app.post('/print', async (req, res) => {
  try {
    console.log(`------NEW POST REQUEST------`);
    const data = req.body.name || '';
    const dataOnDatabase = {
      name: req.body.name || 'null',
      email: req.body.email || 'null'
    }
    console.log(`Uploading Logs to DB`);
    if (!(dataOnDatabase.name === 'null' && dataOnDatabase.email === 'null')) {
      await Data.create(dataOnDatabase);
    }
    const stuName = data;
    console.log(`Priting Ticket for ${stuName}`);
    const fileName = stuName.trim().replace(/\s/g, "-") + ".png";
    const response = await generateTicket(stuName, fileName)

    setTimeout(() => {

      try {
        const response = uploadOnCloudinary(fileName).then(result => {
          try {
            const dir = `${__dirname}/Certificates/${fileName}`
            fs.unlink(dir, (err) => {
              if (err) {
                throw err;
              }
              console.log(`${dir} is deleted!`);

            });
          } catch (error) {
            console.log(error);
          }
          console.log(`response sent`);
          res.status(201).json({
            success: true,
            data: result
          })
        })
      } catch (error) {
        console.log(error);
      }
    }, 5000);
  } catch (error) {
    console.log(error);
    res.send({
      success: false,
      data: ''
    })
  }

  
})

app.get('/getlogs', async (req, res) => {
  const logs = await Data.find()

  res.status(200).json({
    data: logs
  })
})

module.exports = app;
