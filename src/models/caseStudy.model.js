import mongoose from "mongoose";

const caseStudySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Case study title is required"],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      trim: true,
      unique: true,
      index: true,
    },
    client: {
      type: String,
      required: [true, "Client or enterprise identifier is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Cloud & DevOps",
        "AI & Machine Learning",
        "Full-Stack Web & SaaS",
        "Mobile Engineering",
        "Cybersecurity & Audit",
        "FinTech",
        "Healthcare",
        "Enterprise Systems",
      ],
      default: "Cloud & DevOps",
      index: true,
    },
    badge: {
      type: String,
      default: "Featured Impact",
      trim: true,
    },
    thumbnail: {
      type: String,
      required: [true, "Thumbnail image URL is required"],
      trim: true,
    },
    summary: {
      type: String,
      required: [true, "Executive summary is required"],
      trim: true,
    },
    challenge: {
      type: String,
      required: [true, "Challenge problem statement is required"],
      trim: true,
    },
    solution: {
      type: String,
      required: [true, "Technical solution is required"],
      trim: true,
    },
    impactMetrics: [
      {
        label: {
          type: String,
          required: true,
          trim: true,
        },
        value: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
    techStack: [
      {
        type: String,
        trim: true,
      },
    ],
    clientQuote: {
      quote: { type: String, default: "", trim: true },
      author: { type: String, default: "", trim: true },
      role: { type: String, default: "", trim: true },
    },
    isFeatured: {
      type: Boolean,
      default: true,
      index: true,
    },
    isPublished: {
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

caseStudySchema.index({
  title: "text",
  summary: "text",
  category: "text",
  client: "text",
  techStack: "text",
});

export const CaseStudy = mongoose.model("CaseStudy", caseStudySchema);
