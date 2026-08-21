import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Service title is required"],
      trim: true,
      unique: true,
    },
    category: {
      type: String,
      required: [true, "Service category is required"],
      enum: ["Cloud", "AI", "Development", "Security", "Data", "Design", "Infrastructure", "Consulting"],
      default: "Cloud",
      index: true,
    },
    badge: {
      type: String,
      default: "Popular",
      trim: true,
    },
    color: {
      type: String,
      default: "from-blue-500 to-cyan-400",
      trim: true,
    },
    iconName: {
      type: String,
      default: "Cloud",
    },
    description: {
      type: String,
      required: [true, "Short description is required"],
      trim: true,
    },
    fullDescription: {
      type: String,
      default: "",
      trim: true,
    },
    features: [
      {
        type: String,
        trim: true,
      },
    ],
    techStack: [
      {
        type: String,
        trim: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

serviceSchema.index({ title: "text", description: "text", category: "text", techStack: "text" });

export const Service = mongoose.model("Service", serviceSchema);
