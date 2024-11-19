const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
  try {
    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    let info = await transporter.sendMail({
      from: "StudyNotion || CodeHelp- by Babbar",
      to: `${email}`,
      subject: `${title}`,
      text: `${body}`,
    });
    console.log("Email sent: ", info);
  } catch (error) {
    console.log("error in nodemailer code", error);
  }
};

module.exports = { mailSender };
