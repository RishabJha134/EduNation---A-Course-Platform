const { User } = require("../models/User");
const crypto = require("crypto");
const { mailSender } = require("../utils/mailSender");
const bcrypt = require("bcrypt");

// resetPasswordToken:-
const resetPasswordToken = async (req, res) => {
  try {
    // extract email
    const { email } = req.body;
    // validate email and find user
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    // generate token
    const token = crypto.randomUUID();

    // update user by adding token and resetPasswordExpires time:-
    // token user ke andar isiliye hum assign kar rahe hai kyoki agar hume kabhi user ko find karna hua ya user ko nikaalna hua toh hum token User.findOne({token:token}) karke user ko find kar sakte hai kyoki token is unique we use because taaki hum baad me new password ko user ke andar insert kar paaye.

    const updatedDetails = await User.findOneAndUpdate(
      { email: email },
      {
        token: token,
        resetPasswordExpires: Date.now() + 5 * 60 * 1000, // 5 minute ke baad token invalid ho jaayega user has only 5 minute to reset password:-
      },
      {
        new: true,
      }
    );
    console.log("updatedDetails" + updatedDetails);

    // create url and send to mail:-
    const url = `http://localhost:5173/update-password/${token}`;
    await mailSender(
      email,
      "Password reset link",
      `Password Reset link: ${url}`
    );

    // return response:-
    return res.json({
      success: true,
      message:
        "Email Sent successfully, Please check email and change password",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while in resetPasswordToken" + err.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword, token } = req.body;
    if (!password || !confirmPassword || !token) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and confirmPassword do not match",
      });
    }

    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "token is invalid",
      });
    }

    // token time check:-
    if (user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Token is expired, Please generate new token",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 11);
    const updatedUser = await User.findOneAndUpdate(
      { token: token },
      {
        password: hashedPassword,
        // token: null,
        // resetPasswordExpires: null,
      },
      {
        new: true,
      },
    );

    if (updatedUser) {
      await mailSender(
        user.email,
        "Password reset successfully",
        "your password has been reset successfully"
      );
    }

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });


  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while in resetPassword" + err.message,
    });
  }
};

module.exports = { resetPasswordToken, resetPassword };
