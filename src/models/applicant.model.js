import mongoose from "mongoose";

const applicantSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: [true, "Associated job is required"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Authenticated user reference is required"],
    },
    jobTitle: {
      type: String,
      trim: true,
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
    experience: {
      type: String,
      trim: true,
      default: "",
    },
    currentCompany: {
      type: String,
      trim: true,
      default: "",
    },
    portfolioUrl: {
      type: String,
      trim: true,
      default: "",
    },
    coverNote: {
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
    stage: {
      type: String,
      enum: [
        "Applied",
        "Under Review",
        "Shortlisted",
        "Interview Scheduled",
        "Offer Extended",
        "Hired",
        "Rejected",
      ],
      default: "Applied",
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 4,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

// Virtual id property
applicantSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

applicantSchema.set("toJSON", {
  virtuals: true,
});

export const Applicant = mongoose.model("Applicant", applicantSchema);
