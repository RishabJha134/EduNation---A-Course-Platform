const mongoose = require("mongoose");
const { mailSender } = require("../utils/mailSender");

const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 5 * 60, // 5 minute
  },
});

// a function -> to send emails:-
async function sendVerificationEmail(email, otp) {
  try {
    const mailResponse = await mailSender(
      email,
      "Verification Email from StudyNotion ",
      otp
    );
  } catch (error) {
    console.log("error occured while sending verification email", error);
    throw error;
  }
}

OTPSchema.pre("save", async function (next) {
  // this is object of OTPSchema:-
  console.log("email->" + this.email + "and" + "otp->" + this.otp);
  await sendVerificationEmail(this.email, this.otp);
  next();
});

const OTP = mongoose.model("OTP", OTPSchema);
module.exports = { OTP };
