import mongoose from "mongoose";

const outreachDraftSchema = new mongoose.Schema(
  {
    to: {
      type: [String],
      default: [],
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
      default: "",
    },
    subject: {
      type: String,
      default: "",
      trim: true,
    },
    htmlContent: {
      type: String,
      default: "",
    },
    emailFormat: {
      type: String,
      enum: ["normal", "template"],
      default: "normal",
    },
    attachments: [
      {
        filename: { type: String, required: true },
        contentType: { type: String },
        size: { type: Number },
        content: { type: String },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const OutreachDraft = mongoose.model("OutreachDraft", outreachDraftSchema);
export default OutreachDraft;
