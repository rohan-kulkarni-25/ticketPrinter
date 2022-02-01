require("dotenv").config();
const app = require("./app");
const cloudinary = require("cloudinary");

const PORT = process.env.PORT;

const mongoose = require("mongoose");



mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(console.log(`DB CONNECTED SUCESSFULLY`)).catch(error => {
  console.log(`DB CONNECTION FAILED`);
  console.log(error);
  process.exit(1);
})


// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.listen(PORT, () => {
  console.log(`Server Running on PORT ${PORT}`);
});
