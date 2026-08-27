import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const ALGORITHM = 'aes-256-cbc';
const SECRET_KEY = crypto
  .createHash('sha256')
  .update(process.env.JWT_SECRET || 'admire-softech-fallback-secret-key-32b')
  .digest(); // 32 bytes key

/**
 * Encrypt plaintext password using AES-256-CBC
 * @param {string} text - Plain password string
 * @returns {{ encryptedData: string, iv: string }}
 */
export const encryptPassword = (text) => {
  if (!text) return { encryptedData: '', iv: '' };
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
  let encrypted = cipher.update(text.trim(), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return {
    encryptedData: encrypted,
    iv: iv.toString('hex'),
  };
};

/**
 * Decrypt encrypted password back to plaintext using AES-256-CBC
 * @param {string} encryptedData - Hex encoded cipher text
 * @param {string} ivHex - Hex encoded initialization vector
 * @returns {string} - Decrypted plaintext password
 */
export const decryptPassword = (encryptedData, ivHex) => {
  if (!encryptedData || !ivHex) return '';
  try {
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('[cryptoUtils] Decryption error:', error.message);
    return '';
  }
};
