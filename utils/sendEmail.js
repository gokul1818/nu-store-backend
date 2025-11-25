const transporter = require("../config/email");

module.exports = async function sendEmail(to, subject, html) {
  try {
    await transporter.sendMail({
      from: `Nu Store <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.log("Email error:", err);
  }
};
