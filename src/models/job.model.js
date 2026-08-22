import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
      default: "Engineering",
    },
    location: {
      type: String,
      default: "Remote / Hybrid",
      trim: true,
    },
    type: {
      type: String,
      default: "Full-time",
      trim: true,
    },
    experience: {
      type: String,
      default: "3+ Years",
      trim: true,
    },
    salary: {
      type: String,
      default: "Competitive + Equity",
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
      trim: true,
    },
    responsibilities: {
      type: [String],
      default: [],
    },
    requirements: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["Active", "Paused"],
      default: "Active",
    },
    activeStatus: {
      type: Boolean,
      default: true,
    },
    applicantsCount: {
      type: Number,
      default: 0,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Virtual id property
jobSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

jobSchema.set("toJSON", {
  virtuals: true,
});

export const Job = mongoose.model("Job", jobSchema);
