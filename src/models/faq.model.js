import mongoose from "mongoose";

const faqSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      default: "General",
      trim: true,
      index: true,
    },
    question: {
      type: String,
      required: [true, "FAQ question is required"],
      trim: true,
    },
    answer: {
      type: String,
      required: [true, "FAQ answer is required"],
      trim: true,
    },
    highlights: {
      type: [String],
      default: [],
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export const Faq = mongoose.model("Faq", faqSchema);
