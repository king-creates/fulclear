const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST,
  port:   Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* Verify connection once on server startup so we know immediately if credentials are wrong */
transporter.verify((error) => {
  if (error) {
    console.error('❌ Email service failed to connect:', error.message);
    console.error('   Check EMAIL_USER and EMAIL_PASS in .env — EMAIL_PASS must be a Gmail App Password.');
  } else {
    console.log('✅ Email service ready');
  }
});

module.exports = transporter;