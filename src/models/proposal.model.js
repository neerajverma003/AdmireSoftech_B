import mongoose from "mongoose";

const proposalSchema = new mongoose.Schema(
  {
    freelance: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Freelance",
      required: [true, "Freelance gig reference is required"],
    },
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
      trim: true,
      default: "",
    },
    hourlyRate: {
      type: String,
      trim: true,
      default: "",
    },
    portfolioUrl: {
      type: String,
      trim: true,
      default: "",
    },
    experienceNote: {
      type: String,
      trim: true,
      default: "",
    },
    resumeUrl: {
      type: String,
      trim: true,
      default: "",
    },
    resumeFileName: {
      type: String,
      trim: true,
      default: "",
    },
    resumeKey: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "Review", "Interview", "Accepted", "Declined"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export const Proposal = mongoose.model("Proposal", proposalSchema);
