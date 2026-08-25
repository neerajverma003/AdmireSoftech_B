import mongoose from "mongoose";

const serviceItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    desc: { type: String, default: "", trim: true },
    iconName: { type: String, default: "Code2", trim: true },
    isEnabled: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const scopeItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: "", trim: true },
    estPrice: { type: String, required: true, trim: true },
    minPrice: { type: Number, default: 0 },
    maxPrice: { type: Number, default: 0 },
    currency: { type: String, default: "INR", trim: true },
    badge: { type: String, default: "", trim: true },
    isEnabled: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const timelineItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true, trim: true },
    note: { type: String, default: "", trim: true },
    isEnabled: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const estimatorConfigSchema = new mongoose.Schema(
  {
    header: {
      title: { type: String, default: "Instant Project Estimator", trim: true },
      subtitle: { type: String, default: "Architecting Future-Ready Cloud, AI & Enterprise Solutions", trim: true },
      badge: { type: String, default: "Admire Softech • Direct Architect Access", trim: true },
      avgResponseTime: { type: String, default: "< 2 hours", trim: true },
    },
    services: {
      type: [serviceItemSchema],
      default: [
        {
          id: "web-saas",
          title: "Web & SaaS Development",
          desc: "Custom web apps, platforms & enterprise portals",
          iconName: "Code2",
          isEnabled: true,
          order: 1,
        },
        {
          id: "ai-ml",
          title: "AI & Machine Learning",
          desc: "LLM agents, vector DBs & automation workflows",
          iconName: "Cpu",
          isEnabled: true,
          order: 2,
        },
        {
          id: "devops-cloud",
          title: "DevOps & Cloud Automation",
          desc: "AWS, Kubernetes & high-availability CI/CD",
          iconName: "Cloud",
          isEnabled: true,
          order: 3,
        },
        {
          id: "mobile-app",
          title: "Mobile App Development",
          desc: "iOS, Android & cross-platform React Native",
          iconName: "Smartphone",
          isEnabled: true,
          order: 4,
        },
        {
          id: "security-audit",
          title: "Cybersecurity & Audit",
          desc: "Pen-testing, compliance & zero-trust posture",
          iconName: "ShieldCheck",
          isEnabled: true,
          order: 5,
        },
      ],
    },
    scopes: {
      type: [scopeItemSchema],
      default: [
        {
          id: "mvp-initial",
          title: "MVP / Initial Release",
          subtitle: "Core features, agile prototype launch",
          estPrice: "₹50k - ₹1.5 Lakhs",
          minPrice: 50000,
          maxPrice: 150000,
          currency: "INR",
          badge: "Most Popular",
          isEnabled: true,
          order: 1,
        },
        {
          id: "enterprise-system",
          title: "Full Enterprise System",
          subtitle: "Production scale, high-throughput SLAs & microservices",
          estPrice: "₹2.5 Lakhs - ₹7.5 Lakhs",
          minPrice: 250000,
          maxPrice: 750000,
          currency: "INR",
          badge: "Enterprise",
          isEnabled: true,
          order: 2,
        },
        {
          id: "legacy-modernization",
          title: "Legacy Modernization & Cloud",
          subtitle: "Microservices migration & infrastructure overhaul",
          estPrice: "₹1.5 Lakhs - ₹4 Lakhs",
          minPrice: 150000,
          maxPrice: 400000,
          currency: "INR",
          badge: "",
          isEnabled: true,
          order: 3,
        },
      ],
    },
    timelines: {
      type: [timelineItemSchema],
      default: [
        {
          id: "t-1-2m",
          label: "1 - 2 Months",
          note: "Fast-track Sprint",
          isEnabled: true,
          order: 1,
        },
        {
          id: "t-3-6m",
          label: "3 - 6 Months",
          note: "Standard Delivery",
          isEnabled: true,
          order: 2,
        },
        {
          id: "t-6m-plus",
          label: "6+ Months",
          note: "Strategic Roadmap",
          isEnabled: true,
          order: 3,
        },
      ],
    },
    contactModalConfig: {
      title: { type: String, default: "Let's Build Something Amazing", trim: true },
      subtitle: {
        type: String,
        default: "Share your project vision or technical requirements with our engineering leaders.",
        trim: true,
      },
      badge: { type: String, default: "Direct Architect Access", trim: true },
      budgetRanges: {
        type: [String],
        default: ["< ₹50k", "₹50k - ₹1.5L", "₹1.5L - ₹5L", "₹5L - ₹15L", "₹15L+"],
      },
      servicesList: {
        type: [String],
        default: [
          "DevOps & Cloud Automation",
          "AI & Machine Learning",
          "Full-Stack Web & SaaS",
          "Mobile App Development",
          "Cybersecurity & Audit",
          "Dedicated IT Staffing",
          "General IT Consultation",
        ],
      },
    },
    fieldSettings: {
      requirePhone: { type: Boolean, default: false },
      minMessageLength: { type: Number, default: 10 },
      requireAuthForQuote: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export const EstimatorConfig = mongoose.model("EstimatorConfig", estimatorConfigSchema);
export default EstimatorConfig;
