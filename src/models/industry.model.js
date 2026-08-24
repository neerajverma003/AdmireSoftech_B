import mongoose from "mongoose";

const industrySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Industry title is required"],
      trim: true,
      unique: true,
    },
    category: {
      type: String,
      required: [true, "Industry category is required"],
      trim: true,
      index: true,
    },
    badge: {
      type: String,
      default: "Vertical",
      trim: true,
    },
    icon: {
      type: String,
      default: "Code2",
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Cover image URL is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    metrics: {
      type: String,
      default: "",
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  { timestamps: true }
);

industrySchema.index({ title: "text", description: "text", category: "text", badge: "text" });

export const Industry = mongoose.model("Industry", industrySchema);
