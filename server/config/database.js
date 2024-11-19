const mongoose = require("mongoose");
require("dotenv").config();
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("connection established successfully");
  } catch (err) {
    console.log("DB connection error: " + err);
    console.error(err);
  }
};
