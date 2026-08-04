const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST,
  port:   Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 15000,
  greetingTimeout:   15000,
  socketTimeout:     15000,
  family: 4,
});

/* Verify connection once on server startup so we know immediately if credentials are wrong */
transporter.verify((error) => {
  if (error) {
    console.error("❌ Email verification failed:");
    console.error(error);
  } else {
    console.log("✅ Email service ready");
  }
});

module.exports = transporter;