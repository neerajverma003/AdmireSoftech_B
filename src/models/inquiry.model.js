import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    company: {
      type: String,
      default: "",
      trim: true,
    },
    subject: {
      type: String,
      default: "General Inquiry",
      trim: true,
    },
    service: {
      type: String,
      default: "General",
      trim: true,
    },
    budget: {
      type: String,
      default: "",
      trim: true,
    },
    timeline: {
      type: String,
      default: "",
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["New", "In Discussion", "Contacted", "Converted", "Closed"],
      default: "New",
      index: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Add text search index for admin dashboard searching
inquirySchema.index({ fullName: "text", email: "text", company: "text", message: "text" });

export const Inquiry = mongoose.model("Inquiry", inquirySchema);
