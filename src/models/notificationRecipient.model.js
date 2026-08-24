import mongoose from "mongoose";

const notificationRecipientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      trim: true,
      lowercase: true,
    },
    module: {
      type: String,
      required: [true, "Module is required"],
      enum: [
        "UNIVERSAL_NOTIFICATION",
        "CONTACT",
        "QUICK_NOTES",
        "FREELANCE",
        "JOB",
      ],
      default: "UNIVERSAL_NOTIFICATION",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent exact duplicate email within the same module
notificationRecipientSchema.index({ email: 1, module: 1 }, { unique: true });

export const NotificationRecipient = mongoose.model(
  "NotificationRecipient",
  notificationRecipientSchema
);
