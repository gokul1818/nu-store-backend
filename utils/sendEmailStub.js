// simple placeholder — replace with sendgrid/nodemailer in production
exports.sendEmail = async ({ to, subject, text }) => {
  console.log(`Send email to ${to}: ${subject}\n${text}`);
  return true;
};
