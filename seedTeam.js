import mongoose from "mongoose";
import dotenv from "dotenv";
import { Team } from "./src/models/team.model.js";

dotenv.config();

export const defaultTeamMembers = [
  {
    name: "Allen",
    role: "Founder & Chief Executive Officer",
    department: "Leadership",
    experience: "8+ Years Exp",
    bio: "Pioneering cloud solutions, enterprise SaaS architecture, and guiding high-impact engineering teams.",
    specialties: ["Enterprise Architecture", "Cloud Strategy", "Product Leadership"],
    avatarImg: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    social: {
      linkedin: "https://linkedin.com",
      github: "https://github.com",
      twitter: "https://twitter.com",
    },
    isFeatured: true,
    order: 1,
    isActive: true,
  },
  {
    name: "Aarav Sharma",
    role: "Chief Technology Officer & AI Lead",
    department: "AI & Engineering",
    experience: "7+ Years Exp",
    bio: "Specialist in custom LLM fine-tuning, enterprise RAG pipelines, and high-throughput microservices.",
    specialties: ["Generative AI", "PyTorch / LangChain", "Distributed Systems"],
    avatarImg: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    social: {
      linkedin: "https://linkedin.com",
      github: "https://github.com",
    },
    isFeatured: true,
    order: 2,
    isActive: true,
  },
  {
    name: "David Miller",
    role: "Principal Cloud & DevOps Architect",
    department: "Infrastructure",
    experience: "9+ Years Exp",
    bio: "Automating multi-cloud architectures across AWS/Azure, Kubernetes orchestration, and GitOps CI/CD.",
    specialties: ["Kubernetes / EKS", "Terraform", "Zero-Downtime CI/CD"],
    avatarImg: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
    social: {
      linkedin: "https://linkedin.com",
      github: "https://github.com",
    },
    isFeatured: true,
    order: 3,
    isActive: true,
  },
  {
    name: "Elena Rostova",
    role: "Head of Product Design & UX",
    department: "Design",
    experience: "6+ Years Exp",
    bio: "Crafting intuitive design systems, interactive prototypes, and conversion-optimized SaaS products.",
    specialties: ["Design Systems", "Figma", "User Research & Prototyping"],
    avatarImg: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
    social: {
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com",
    },
    isFeatured: true,
    order: 4,
    isActive: true,
  },
  {
    name: "Vikram Patel",
    role: "Principal Full Stack Architect",
    department: "Engineering",
    experience: "6+ Years Exp",
    bio: "Building hyper-scalable React/Next.js frontend architectures and low-latency Node.js/Go backends.",
    specialties: ["React 19 / Next.js", "Node.js & Go", "GraphQL / WebSockets"],
    avatarImg: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80",
    social: {
      linkedin: "https://linkedin.com",
      github: "https://github.com",
    },
    isFeatured: false,
    order: 5,
    isActive: true,
  },
  {
    name: "Sarah Jenkins",
    role: "Lead Cybersecurity Architect",
    department: "Security",
    experience: "8+ Years Exp",
    bio: "Enforcing Zero-Trust frameworks, SOC2 compliance audits, and cloud penetration testing protocols.",
    specialties: ["Zero Trust", "SOC2 / ISO 27001", "Cloud Security Audits"],
    avatarImg: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80",
    social: {
      linkedin: "https://linkedin.com",
      github: "https://github.com",
    },
    isFeatured: false,
    order: 6,
    isActive: true,
  },
  {
    name: "Rohan Gupta",
    role: "Staff Data & ETL Systems Engineer",
    department: "Data",
    experience: "5+ Years Exp",
    bio: "Designing real-time Kafka streaming data pipelines, Snowflake warehousing, and analytics infrastructure.",
    specialties: ["Snowflake / dbt", "Apache Kafka", "PostgreSQL Optimization"],
    avatarImg: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=600&q=80",
    social: {
      linkedin: "https://linkedin.com",
      github: "https://github.com",
    },
    isFeatured: false,
    order: 7,
    isActive: true,
  },
];

const seedTeam = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      console.error("❌ Error: MONGO_URI is not defined in your .env file.");
      process.exit(1);
    }

    console.log("🔄 Connecting to MongoDB for Team Seeding...");
    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB connected successfully.");

    console.log("🔄 Upserting default team members...");
    for (const item of defaultTeamMembers) {
      await Team.findOneAndUpdate(
        { name: item.name },
        { $set: item },
        { upsert: true, returnDocument: "after" }
      );
    }
    console.log(`✅ Seeded / updated ${defaultTeamMembers.length} team members.`);

    console.log("✨ Team seeding completed.");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding team members:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedTeam();
