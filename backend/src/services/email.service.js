const nodemailer = require('nodemailer');
const env = require('../config/env');

async function sendPasswordResetEmail(user, token) {
  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD
    }
  });
  const resetUrl = new URL(`/reset-password/${encodeURIComponent(token)}`, env.FRONTEND_URL);

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: user.email,
    subject: 'Reset your EcoLith Energy password',
    text: `Use this link to reset your password within 15 minutes: ${resetUrl.toString()}\n\nIf you did not request this, you can ignore this email.`
  });
}

module.exports = { sendPasswordResetEmail };
