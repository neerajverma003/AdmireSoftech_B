import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import dns from 'node:dns';

dotenv.config();

// Optimize DNS lookup to prefer IPv4 first (prevents 2-4s IPv6 fallback latency on Windows)
if (dns && dns.setDefaultResultOrder) {
  try {
    dns.setDefaultResultOrder('ipv4first');
  } catch (e) {
    // Ignore if not supported
  }
}

let cachedEnvTransporter = null;

/**
 * Creates or retrieves a persistent, connection-pooled SMTP transporter for default .env credentials
 */
export const getTransporter = () => {
  const emailUser = (
    process.env.SUPPORT_EMAIL_USER ||
    process.env.EMAIL_USER ||
    process.env.EMAIL
  )?.trim();

  const emailPass = (
    process.env.SUPPORT_EMAIL_PASS ||
    process.env.EMAIL_PASS ||
    process.env.EMAIL_PASSWORD
  )?.trim().replace(/\s/g, '');

  if (cachedEnvTransporter) {
    return cachedEnvTransporter;
  }

  cachedEnvTransporter = nodemailer.createTransport({
    pool: true, // Enables persistent connection pooling for high-speed delivery
    maxConnections: 5,
    maxMessages: 100,
    rateLimit: 14,
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 10000,
    socketTimeout: 30000,
  });

  return cachedEnvTransporter;
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