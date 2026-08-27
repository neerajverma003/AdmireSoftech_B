import nodemailer from 'nodemailer';
import SenderAccount from '../models/senderAccount.model.js';
import { encryptPassword, decryptPassword } from '../utils/cryptoUtils.js';
import { getTransporter as getEnvTransporter } from '../lib/nodemailer.js';

/**
 * Dynamically resolves the fallback default sender email from .env
 */
export const getEnvDefaultEmail = () => {
  return (
    process.env.SUPPORT_EMAIL_USER ||
    process.env.EMAIL_USER ||
    process.env.EMAIL ||
    'support@admiresoftech.com'
  ).trim();
};

/**
 * Controller: List all active sender accounts (passwords securely hidden)
 * GET /api/outreach/senders
 */
export const getSenderAccounts = async (req, res) => {
  try {
    const senders = await SenderAccount.find({ isActive: true })
      .select('-encryptedPassword -iv')
      .sort({ isDefault: -1, createdAt: -1 })
      .lean();

    const envEmail = getEnvDefaultEmail();

    return res.status(200).json({
      success: true,
      senders,
      defaultEnvEmail: envEmail,
    });
  } catch (error) {
    console.error('[senderAccount.getSenderAccounts] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch sender accounts.',
      error: error.message,
    });
  }
};

/**
 * Controller: Add a new sender email account with real-time SMTP verification
 * POST /api/outreach/senders
 */
export const createSenderAccount = async (req, res) => {
  try {
    const {
      email,
      password,
      label,
      service = 'gmail',
      host = 'smtp.gmail.com',
      port = 465,
      secure = true,
      isDefault = false,
    } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Sender email address is required.',
      });
    }

    if (!password || !password.trim()) {
      return res.status(400).json({
        success: false,
        message: 'SMTP / App Password is required.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim().replace(/\s/g, ''); // strip spaces from Gmail 16-char app pass

    // Check if account already exists
    const existing = await SenderAccount.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Sender account for "${cleanEmail}" already exists. Delete or update the existing account.`,
      });
    }

    // 1. Verify SMTP credentials live before saving
    let testTransporter;
    if (service === 'gmail') {
      testTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: cleanEmail,
          pass: cleanPassword,
        },
        tls: { rejectUnauthorized: false },
      });
    } else {
      testTransporter = nodemailer.createTransport({
        host: host.trim(),
        port: Number(port) || 465,
        secure: Boolean(secure),
        auth: {
          user: cleanEmail,
          pass: cleanPassword,
        },
        tls: { rejectUnauthorized: false },
      });
    }

    try {
      await testTransporter.verify();
    } catch (verifyErr) {
      console.error('[createSenderAccount] SMTP Verification Failed:', verifyErr.message);
      
      let friendlyError = 'Google rejected the email or App password.';
      if (verifyErr.message?.includes('535') || verifyErr.message?.includes('Username and Password not accepted') || verifyErr.message?.includes('Invalid login')) {
        friendlyError = 'Invalid Google App Password. Please enter a valid 16-character App Password generated from Google Account Settings.';
      } else if (verifyErr.message?.includes('ENOTFOUND') || verifyErr.message?.includes('ETIMEDOUT')) {
        friendlyError = 'Could not connect to SMTP server. Please check your internet connection or email host.';
      }

      return res.status(400).json({
        success: false,
        message: friendlyError,
      });
    }

    // 2. Encrypt password using AES-256
    const { encryptedData, iv } = encryptPassword(cleanPassword);

    // If marked default, unset previous defaults
    if (isDefault) {
      await SenderAccount.updateMany({}, { isDefault: false });
    }

    const newAccount = await SenderAccount.create({
      email: cleanEmail,
      label: label?.trim() || cleanEmail,
      service,
      host,
      port: Number(port) || 465,
      secure: Boolean(secure),
      encryptedPassword: encryptedData,
      iv,
      isDefault: Boolean(isDefault),
      isActive: true,
      lastVerifiedAt: new Date(),
    });

    const sanitized = newAccount.toObject();
    delete sanitized.encryptedPassword;
    delete sanitized.iv;

    return res.status(201).json({
      success: true,
      message: `Sender account "${cleanEmail}" verified and added successfully!`,
      account: sanitized,
    });
  } catch (error) {
    console.error('[senderAccount.createSenderAccount] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create sender account.',
      error: error.message,
    });
  }
};

const senderTransporterPool = new Map();

/**
 * Invalidate cached transporter for an email
 */
export const invalidateTransporterCache = (email) => {
  if (!email) return;
  const cleanEmail = email.trim().toLowerCase();
  const existing = senderTransporterPool.get(cleanEmail);
  if (existing && typeof existing.close === 'function') {
    try {
      existing.close();
    } catch (e) {
      // Ignore close errors
    }
  }
  senderTransporterPool.delete(cleanEmail);
};

/**
 * Controller: Delete a sender account
 * DELETE /api/outreach/senders/:id
 */
export const deleteSenderAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const account = await SenderAccount.findByIdAndDelete(id);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Sender account not found.',
      });
    }

    // Invalidate cached pooled transporter
    invalidateTransporterCache(account.email);

    return res.status(200).json({
      success: true,
      message: `Sender account "${account.email}" deleted successfully.`,
    });
  } catch (error) {
    console.error('[senderAccount.deleteSenderAccount] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete sender account.',
      error: error.message,
    });
  }
};

/**
 * Controller: Set an account as the default sender
 * PATCH /api/outreach/senders/:id/default
 */
export const setDefaultSenderAccount = async (req, res) => {
  try {
    const { id } = req.params;

    await SenderAccount.updateMany({}, { isDefault: false });
    const account = await SenderAccount.findByIdAndUpdate(
      id,
      { isDefault: true },
      { new: true }
    ).select('-encryptedPassword -iv');

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Sender account not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Sender account "${account.email}" set as default!`,
      account,
    });
  } catch (error) {
    console.error('[senderAccount.setDefaultSenderAccount] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to set default sender account.',
      error: error.message,
    });
  }
};

/**
 * Helper: Resolve dynamic Nodemailer transporter and sender email address with Connection Pooling
 * @param {string} requestedEmail - The email address requested for sending
 * @returns {Promise<{ transporter: nodemailer.Transporter, senderEmail: string }>}
 */
export const resolveTransporterForEmail = async (requestedEmail) => {
  if (requestedEmail && requestedEmail.trim()) {
    const cleanEmail = requestedEmail.trim().toLowerCase();

    // Check if a warm pooled transporter is already cached in memory
    if (senderTransporterPool.has(cleanEmail)) {
      return {
        transporter: senderTransporterPool.get(cleanEmail),
        senderEmail: cleanEmail,
      };
    }

    // Check if account exists in MongoDB
    const account = await SenderAccount.findOne({
      email: cleanEmail,
      isActive: true,
    });

    if (account && account.encryptedPassword && account.iv) {
      const decryptedPassword = decryptPassword(account.encryptedPassword, account.iv);

      if (decryptedPassword) {
        let activeTransporter;
        if (account.service === 'gmail') {
          activeTransporter = nodemailer.createTransport({
            pool: true, // Enables persistent connection pooling for high-speed delivery
            maxConnections: 5,
            maxMessages: 100,
            rateLimit: 14,
            service: 'gmail',
            auth: {
              user: account.email,
              pass: decryptedPassword,
            },
            tls: { rejectUnauthorized: false },
            connectionTimeout: 10000,
            socketTimeout: 30000,
          });
        } else {
          activeTransporter = nodemailer.createTransport({
            pool: true,
            maxConnections: 5,
            maxMessages: 100,
            rateLimit: 14,
            host: account.host || 'smtp.gmail.com',
            port: account.port || 465,
            secure: account.secure !== false,
            auth: {
              user: account.email,
              pass: decryptedPassword,
            },
            tls: { rejectUnauthorized: false },
            connectionTimeout: 10000,
            socketTimeout: 30000,
          });
        }

        // Cache the pooled transporter for instant reuse across requests
        senderTransporterPool.set(cleanEmail, activeTransporter);

        return {
          transporter: activeTransporter,
          senderEmail: account.email,
        };
      }
    }
  }

  // Fallback to default .env credentials
  const defaultEnvEmail = getEnvDefaultEmail();
  return {
    transporter: getEnvTransporter(),
    senderEmail: defaultEnvEmail,
  };
};
