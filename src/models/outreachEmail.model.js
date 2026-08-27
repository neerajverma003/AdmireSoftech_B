import mongoose from "mongoose";

const outreachEmailSchema = new mongoose.Schema(
  {
    to: {
      type: [String],
      required: [true, "At least one recipient email is required"],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: "At least one recipient email is required",
      },
    },
    cc: {
      type: [String],
      default: [],
    },
    bcc: {
      type: [String],
      default: [],
    },
    fromName: {
      type: String,
      default: "Admire Softech",
      trim: true,
    },
    fromEmail: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    htmlContent: {
      type: String,
      required: [true, "Email message content is required"],
    },
    textContent: {
      type: String,
      default: "",
    },
    attachments: [
      {
        filename: { type: String, required: true },
        contentType: { type: String },
        size: { type: Number },
      },
    ],
    emailFormat: {
      type: String,
      enum: ["normal", "template"],
      default: "normal",
    },
    status: {
      type: String,
      enum: ["SENT", "FAILED"],
      default: "SENT",
    },
    errorMessage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const OutreachEmail = mongoose.model("OutreachEmail", outreachEmailSchema);
export default OutreachEmail;
