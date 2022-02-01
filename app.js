const fs = require("fs");
const Jimp = require("jimp");
const express = require("express");
const app = express();
const cloudinary = require("cloudinary");


app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).json({
    data: {},
  });
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

app.post('/print',async (req,res)=> {
  console.log(`------NEW POST REQUEST------`);
  const data = req.body.name;
  const stuName = data;
  console.log(`Priting Ticket for ${stuName}`);
  const fileName = stuName.trim().replace(/\s/g, "-") + ".png";
  const response = await generateTicket(stuName, fileName)
  
  setTimeout(() => {
    
    const response = uploadOnCloudinary(fileName).then(result => {
      const dir = `${__dirname}/Certificates`
      fs.rmdir(dir, { recursive: true }, (err) => {
        if (err) {
            throw err;
        }
        console.log(`${dir} is deleted!`);
    });
      console.log(`response sent`);
      res.status(201).json({
        success:true,
        data:result
      })
    })
  }, 5000);
  
})

module.exports = app;
