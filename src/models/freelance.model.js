import mongoose from "mongoose";

const freelanceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      default: "Development",
    },
    type: {
      type: String,
      default: "FREELANCE · REMOTE",
      trim: true,
    },
    rate: {
      type: String,
      default: "$60 - $95 / hr",
      trim: true,
    },
    duration: {
      type: String,
      default: "3 - 6 Months",
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      required: [true, "Project description is required"],
      trim: true,
    },
    deliverables: {
      type: [String],
      default: [],
    },
    bidsCount: {
      type: Number,
      default: 0,
    },
    activeStatus: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Freelance = mongoose.model("Freelance", freelanceSchema);
