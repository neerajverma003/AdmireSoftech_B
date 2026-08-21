import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Team member name is required"],
      trim: true,
    },
    role: {
      type: String,
      required: [true, "Team member role/designation is required"],
      trim: true,
    },
    department: {
      type: String,
      default: "Engineering",
      trim: true,
      index: true,
    },
    experience: {
      type: String,
      default: "5+ Years Exp",
      trim: true,
    },
    bio: {
      type: String,
      default: "",
      trim: true,
    },
    specialties: {
      type: [String],
      default: [],
    },
    avatarImg: {
      type: String,
      default: "",
      trim: true,
    },
    social: {
      linkedin: { type: String, default: "", trim: true },
      github: { type: String, default: "", trim: true },
      twitter: { type: String, default: "", trim: true },
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
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

teamSchema.virtual("avatar").get(function () {
  return this.avatarImg || "";
});

export const Team = mongoose.model("Team", teamSchema);
