import mongoose from "mongoose";
import dotenv from "dotenv";
import { Service } from "./src/models/service.model.js";

dotenv.config();

export const defaultServices = [
  {
    title: "Cloud Services & DevOps",
    category: "Cloud",
    badge: "Popular",
    color: "from-blue-500 to-cyan-400",
    iconName: "Cloud",
    description: "Scalable multi-cloud infrastructure and CI/CD automation to power enterprise workloads.",
    fullDescription:
      "Our Cloud & DevOps engineering team helps businesses architect, migrate, and optimize cloud-native applications on AWS, Azure, and Google Cloud Platform. We automate release cycles with Kubernetes and Terraform to eliminate downtime and maximize agility.",
    features: [
      "Multi-Cloud Architecture (AWS, Azure, GCP)",
      "Automated CI/CD Pipelines with GitHub Actions & Jenkins",
      "Container Orchestration (Docker & Kubernetes)",
      "Infrastructure as Code (Terraform & Ansible)",
      "24/7 Cloud Cost & Performance Monitoring",
    ],
    techStack: ["AWS", "Azure", "Kubernetes", "Docker", "Terraform", "GitHub Actions"],
    isActive: true,
    order: 1,
  },
  {
    title: "Artificial Intelligence & ML",
    category: "AI",
    badge: "Trending",
    color: "from-purple-500 to-indigo-500",
    iconName: "Cpu",
    description: "Empowering enterprise software with LLMs, predictive analytics, and smart automation.",
    fullDescription:
      "We build custom machine learning pipelines, fine-tune Generative AI / Large Language Models, and deploy intelligent business process automation that unlocks actionable predictions from complex data.",
    features: [
      "Custom LLM Fine-Tuning & RAG Architecture",
      "Computer Vision & Object Recognition Systems",
      "Predictive Analytics & Financial Forecasting",
      "Natural Language Processing (NLP) Chatbots",
      "Automated Data Annotation & Pipeline Setup",
    ],
    techStack: ["Python", "PyTorch", "TensorFlow", "OpenAI", "LangChain", "Pinecone"],
    isActive: true,
    order: 2,
  },
  {
    title: "Full-Stack Web & Mobile Development",
    category: "Development",
    badge: "Core",
    color: "from-cyan-400 to-blue-500",
    iconName: "Code2",
    description: "Ultra-fast, high-performance web applications and native iOS/Android mobile solutions.",
    fullDescription:
      "From high-concurrency SaaS applications to cross-platform mobile apps, we design resilient frontend interfaces and microservices backends tailored for high speed, security, and effortless scaling.",
    features: [
      "Custom SaaS & Web Application Development",
      "Cross-Platform iOS & Android Mobile Apps",
      "Headless CMS & E-Commerce Integration",
      "RESTful & GraphQL Microservice APIs",
      "SEO & Progressive Web App (PWA) Optimization",
    ],
    techStack: ["React", "Next.js", "Node.js", "React Native", "TypeScript", "PostgreSQL"],
    isActive: true,
    order: 3,
  },
  {
    title: "Cybersecurity & Compliance",
    category: "Security",
    badge: "Enterprise",
    color: "from-rose-500 to-pink-500",
    iconName: "ShieldCheck",
    description: "Protecting digital infrastructure with zero-trust protocols, audits, and threat defense.",
    fullDescription:
      "Safeguard your critical applications with end-to-end security audits, automated threat detection, and continuous compliance enforcement across SOC2, HIPAA, and GDPR frameworks.",
    features: [
      "Penetration Testing & Vulnerability Assessment",
      "Zero-Trust Identity & Access Management (IAM)",
      "SOC2, ISO 27001 & GDPR Compliance Advisory",
      "Real-Time Threat Detection & Response",
      "Data Encryption at Rest & In Transit",
    ],
    techStack: ["Zero Trust", "OAuth 2.0", "AWS KMS", "HashiCorp Vault", "SOC2"],
    isActive: true,
    order: 4,
  },
  {
    title: "Data Engineering & Analytics",
    category: "Data",
    badge: "Strategic",
    color: "from-amber-500 to-orange-500",
    iconName: "BarChart3",
    description: "Building modern data lakes, real-time streaming pipelines, and executive BI dashboards.",
    fullDescription:
      "Transform messy operational data into unified data lakes and sub-second BI analytics with automated ETL pipelines, Snowflake warehouses, and real-time Kafka streams.",
    features: [
      "Real-Time Telemetry & Event Streaming (Apache Kafka)",
      "Data Lakehouse Architecture (Snowflake, Databricks)",
      "Automated ETL Pipelines with Apache Airflow",
      "Interactive Executive BI Dashboards (Tableau, PowerBI)",
      "Data Governance & Quality Assurance Monitoring",
    ],
    techStack: ["Apache Kafka", "Snowflake", "Databricks", "Apache Airflow", "dbt", "PowerBI"],
    isActive: true,
    order: 5,
  },
  {
    title: "UI/UX & Product Design Systems",
    category: "Design",
    badge: "Design",
    color: "from-teal-400 to-emerald-500",
    iconName: "Palette",
    description: "Intuitive, high-converting digital product design powered by scalable design tokens.",
    fullDescription:
      "We build conversion-focused user interfaces, interactive wireframes, and scalable design token libraries in Figma that empower your development teams to ship consistent UI 3x faster.",
    features: [
      "Enterprise Design Systems & Figma Component Libraries",
      "High-Fidelity Interactive Wireframing & Prototyping",
      "User Journey Mapping & Usability Research",
      "Design Token Integration for React & Tailwind CSS",
      "WCAG 2.1 Accessibility & Mobile-First UX Audits",
    ],
    techStack: ["Figma", "Tailwind CSS", "Storybook", "Adobe XD", "Design Tokens"],
    isActive: true,
    order: 6,
  },
];

const seedServices = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      console.error("❌ Error: MONGO_URI is not defined in your .env file.");
      process.exit(1);
    }

    console.log("🔄 Connecting to MongoDB for Services Seeding...");
    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB connected successfully.");

    const existingCount = await Service.countDocuments();

    if (existingCount > 0) {
      console.log(`ℹ️ Services collection already contains ${existingCount} items.`);
      console.log("🔄 Updating/Upserting practice services...");
      for (const svc of defaultServices) {
        await Service.findOneAndUpdate(
          { title: svc.title },
          { $set: svc },
          { upsert: true, new: true }
        );
      }
      console.log("✅ Practice services updated successfully.");
    } else {
      console.log("🔄 Inserting default practice services...");
      await Service.insertMany(defaultServices);
      console.log(`✅ Seeded ${defaultServices.length} default practice services.`);
    }

    console.log("✨ Services seeding completed.");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding services:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedServices();
