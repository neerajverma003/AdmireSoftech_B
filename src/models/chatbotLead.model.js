import mongoose from "mongoose";

const chatbotLeadSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    service: {
      type: String,
      required: [true, "Selected service is required"],
      trim: true,
      default: "General",
    },
    projectType: {
      type: String,
      default: "",
      trim: true,
    },
    features: {
      type: [String],
      default: [],
    },
    budget: {
      type: String,
      default: "",
      trim: true,
    },
    notes: {
      type: String,
      default: "",
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
    source: {
      type: String,
      default: "Chatbot",
      trim: true,
    },
    inquiryRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inquiry",
      default: null,
    },
    ipAddress: {
      type: String,
      default: "",
    },
    userAgent: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

chatbotLeadSchema.index({ fullName: "text", email: "text", phone: "text", service: "text" });

export const ChatbotLead = mongoose.model("ChatbotLead", chatbotLeadSchema);
