const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // OR SMTP
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

module.exports = transporter;
