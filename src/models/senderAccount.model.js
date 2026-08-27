import mongoose from 'mongoose';

const senderAccountSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Sender email address is required.'],
      trim: true,
      lowercase: true,
      unique: true,
    },
    label: {
      type: String,
      trim: true,
      default: 'Outreach Sender',
    },
    service: {
      type: String,
      trim: true,
      default: 'gmail', // 'gmail' or custom smtp
    },
    host: {
      type: String,
      trim: true,
      default: 'smtp.gmail.com',
    },
    port: {
      type: Number,
      default: 465,
    },
    secure: {
      type: Boolean,
      default: true,
    },
    encryptedPassword: {
      type: String,
      required: [true, 'Encrypted password is required.'],
    },
    iv: {
      type: String,
      required: [true, 'Initialization vector is required.'],
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastVerifiedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const SenderAccount = mongoose.model('SenderAccount', senderAccountSchema);

export default SenderAccount;
