const nodemailer = require("nodemailer");
const logger = require("../utils/logger");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// This is for test purpose
const EMAIL_FROM = "godhanikashyap9@gmail.com";
const EMAIL_TO = "kobanab116@chosenx.com";

exports.send = async (notification) => {
  try {
    await transporter.sendMail({
      // from: process.env.EMAIL_FROM,
      // to: notification.userId, //email // Assuming userId is the email address
      from: EMAIL_FROM, //currently we are using same email as per crediantial
      to: notification.userId ? notification.userId : EMAIL_TO, //email // Assuming userId is the email address
      subject: "Notification",
      text: notification.content,
    });
    // logger.info(`Email sent to ${notification.userId}`);
    logger.info(`Email sent to ${process.env.EMAIL_TO}`);
  } catch (error) {
    logger.error("Error sending email:", error);
    throw error;
  }
};
