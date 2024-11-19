const jwt = require("jsonwebtoken");
require("dotenv").config();

// in this auth middleware we check the authentication:-
const auth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      res.status(401).json({
        success: false,
        message: "Token is not valid",
      });
    }
    console.log(decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "error in auth middleware try catch block" + err.message,
    });
  }
};

// isStudent:-
const isStudent = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Student") {
      return res.status(401).json({
        success: false,
        message:
          "You are not a student, this is a protected route for students only",
      });
    }

    next();
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message:
        "user accountType cannot be verified, please try again" + err.message,
    });
  }
};

// isInstructor:-
const isInstructor = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Instructor") {
      return res.status(401).json({
        success: false,
        message:
          "You are not a Instructor, this is a protected route for Instructor only",
      });
    }

    next();
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message:
        "user accountType cannot be verified, please try again" + err.message,
    });
  }
};

// isAdmin:-
const isAdmin = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Admin") {
      return res.status(401).json({
        success: false,
        message:
          "You are not a Admin, this is a protected route for Admin only",
      });
    }

    next();
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message:
        "user accountType cannot be verified, please try again" + err.message,
    });
  }
};

module.exports = { auth, isStudent, isInstructor, isAdmin };
