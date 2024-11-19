const { OTP } = require("../models/OTP");
const { Profile } = require("../models/Profile");
const { User } = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { mailSender } = require("../utils/mailSender");

const sendOTP = async (req, res) => {
  try {
    //1. fetch email from input field:-
    const { email } = req.body;
    //2. validate email is exist or not:-
    const checkUserPresent = await User.findOne({ email: email });
    if (checkUserPresent) {
      res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    //3 generate OTP:-
    function generateOTP(length = 6) {
      // Ensure the OTP is always numeric and has the desired length
      const otp = Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit number
      return otp.toString();
    }
    const otp = generateOTP(); // Generates a 6-digit numeric OTP

    console.log(otp); // Example output: 123456

    //4.save otp in db:-
    const otpPayload = { email, otp };
    const otpBody = await OTP.create(otpPayload);
    console.log(otpBody);

    // OTP ko db me save karne se pehle ye OTP.pre save wala method call hojayega jo ki otp ko mail ke through user ko bhej rha hai req.body wali email id par.
    const response = await OTP.save();
    console.log(response);

    return res.status(201).json({
      success: true,
      message: "OTP sent successfully",
      otp,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "error in sendOTP try catch block" + err.message,
    });
  }
};

const signup = async (req, res) => {
  try {
    //1. extract req.body data from input field:-
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body;
    //2. data sanitization
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    //3. match password and confirm password:-

    if (password != confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and Confirm Password does not match",
      });
    }

    //4. check is user exists or not:-
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }
    //5. find most recent otp of the user
    const recentOTP = await OTP.find({ email: email })
      .sort({ createdAt: -1 })
      .limit(1);
    console.log("recentOTP" + recentOTP);
    if (!recentOTP) {
      return res.status(400).json({
        success: false,
        message: "No OTP found for this email",
      });
    }
    if (otp != recentOTP.otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    //6. last step-> otp validation hoga agar otp thik hai tab jaake password hash hoga and then user ki entry db me create and store and save hogi.

    const hashedPassword = await bcrypt.hash(password, 11);

    //7. entry create in DB:-
    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });

    // const newProfileDetails = await profileDetails.save();

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      accountType,
      profile: profileDetails._id,
      contactNumber,
      additionalDetails: newProfileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });

    res.status(201).json({
      success: true,
      message: "User signup successful",
      user,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "error in Signup try catch block" + err.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      req.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password",
      });
    }

    // password is match generate token and send in frontend (cookies);
    const payload = {
      email: user.email,
      id: user._id,
      accountType: user.accountType,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });
    user.token = token;
    user.password = undefined;

    // create cookie and send response:-
    const options = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };
    res.cookie("token", token, options);
    res.status(200).json({
      success: true,
      token,
      message: "login successfull and token generated",
      user,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "error in login try catch block" + err.message,
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmNewPassword } = req.body;
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (newPassword != confirmNewPassword) {
      res.status(401).json({
        success: false,
        message: "New Password and Confirm New Password does not match",
      });
    }

    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect old password",
      });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 11);
    user.password = hashedNewPassword;
    await mailSender(
      req.email,
      "password changes successfully",
      "your password changes successfully"
    );
    await user.save();
    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "error in changePassword try catch block" + err.message,
    });
  }
};






module.exports = { sendOTP };

module.exports = { sendOTP };

module.exports = { sendOTP, signup, login, changePassword };
