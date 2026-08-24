import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export const getTransporter = () => {
  const emailUser = (process.env.EMAIL_USER || process.env.EMAIL)?.trim();
  const emailPass = process.env.EMAIL_PASS?.trim().replace(/\s/g, '');

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

export const transporter = {
  sendMail: async (mailOptions) => {
    const activeTransporter = getTransporter();
    return activeTransporter.sendMail(mailOptions);
  },
  verify: (cb) => {
    const activeTransporter = getTransporter();
    return activeTransporter.verify(cb);
  },
};