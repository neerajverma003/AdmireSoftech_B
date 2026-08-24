import mongoose from "mongoose";

const quoteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
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
    serviceType: {
      type: String,
      required: [true, "Service type is required"],
      trim: true,
    },
    scope: {
      type: String,
      required: [true, "Project scope is required"],
      trim: true,
    },
    projectScope: {
      type: String,
      default: "",
      trim: true,
    },
    timeline: {
      type: String,
      required: [true, "Timeline is required"],
      trim: true,
    },
    estimatedBudget: {
      type: String,
      default: "",
      trim: true,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    urgency: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Pending Review", "Estimate Sent", "Approved", "Rejected"],
      default: "Pending Review",
      index: true,
    },
  },
  { timestamps: true }
);

quoteSchema.index({ name: "text", email: "text", serviceType: "text", notes: "text" });

export const Quote = mongoose.model("Quote", quoteSchema);
