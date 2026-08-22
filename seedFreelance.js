import mongoose from "mongoose";
import dotenv from "dotenv";
import { Freelance } from "./src/models/freelance.model.js";

dotenv.config();

const freelanceSeedData = [
  {
    title: "Senior Cloud Infrastructure Architect",
    category: "Cloud",
    type: "FREELANCE · REMOTE",
    rate: "$85 - $125 / hr",
    duration: "6 Months",
    skills: ["AWS", "Terraform", "Kubernetes", "EKS", "Security & IAM"],
    description: "Lead enterprise cloud migration to AWS multi-region infrastructure with automated Terraform IaC and SOC2 security hardening.",
    deliverables: [
      "Multi-region AWS landing zone setup",
      "Automated Terraform deployment pipelines",
      "SOC2 compliance hardening and disaster recovery playbook",
    ],
    bidsCount: 0,
    activeStatus: true,
    order: 1,
  },
  {
    title: "Lead DevOps & GitOps Platform Engineer",
    category: "DevOps",
    type: "FREELANCE · REMOTE",
    rate: "$75 - $110 / hr",
    duration: "4 - 6 Months",
    skills: ["ArgoCD", "Kubernetes", "Docker", "GitHub Actions", "Helm"],
    description: "Build robust continuous deployment pipelines with GitOps workflows, zero-downtime blue/green rollouts, and autoscaling.",
    deliverables: [
      "ArgoCD declarative GitOps framework",
      "High-availability Prometheus & Grafana alerting",
      "Automated secret management with Vault",
    ],
    bidsCount: 0,
    activeStatus: true,
    order: 2,
  },
  {
    title: "Generative AI & LLM Systems Engineer",
    category: "AI & ML",
    type: "FREELANCE · REMOTE",
    rate: "$95 - $140 / hr",
    duration: "3 - 6 Months",
    skills: ["Python", "OpenAI / Claude API", "LangChain", "Vector DBs", "RAG"],
    description: "Design custom Retrieval-Augmented Generation (RAG) pipelines and enterprise conversational assistants with semantic search.",
    deliverables: [
      "Vector embeddings pipeline using Pinecone/Milvus",
      "Low-latency streaming LLM endpoints",
      "Evaluation benchmarks and guardrail safeguards",
    ],
    bidsCount: 0,
    activeStatus: true,
    order: 3,
  },
  {
    title: "Senior Full-Stack React & Node.js Developer",
    category: "Full-Stack",
    type: "FREELANCE · REMOTE",
    rate: "$65 - $95 / hr",
    duration: "3 - 5 Months",
    skills: ["React", "Node.js", "TypeScript", "Tailwind CSS", "GraphQL"],
    description: "Develop high-performance, real-time client management dashboards and microservice backend APIs with responsive animations.",
    deliverables: [
      "Real-time analytics frontend with Tailwind and Framer Motion",
      "Optimized REST / GraphQL backend services",
      "Comprehensive Jest & Cypress test coverage",
    ],
    bidsCount: 0,
    activeStatus: true,
    order: 4,
  },
  {
    title: "Database Performance & PostgreSQL Specialist",
    category: "Data Engineering",
    type: "FREELANCE · REMOTE",
    rate: "$80 - $115 / hr",
    duration: "2 - 4 Months",
    skills: ["PostgreSQL", "Query Optimization", "MongoDB", "Redis", "Kafka"],
    description: "Audit and optimize high-throughput database clusters, tune indexes, resolve query latency bottlenecks, and configure CDC pipelines.",
    deliverables: [
      "Database query profiling and index optimization report",
      "Redis caching layer architecture",
      "Zero-downtime migration scripts and replication setup",
    ],
    bidsCount: 0,
    activeStatus: true,
    order: 5,
  },
  {
    title: "Cloud Security & Penetration Testing Auditor",
    category: "Cybersecurity",
    type: "FREELANCE · REMOTE",
    rate: "$90 - $130 / hr",
    duration: "2 - 3 Months",
    skills: ["OWASP", "CloudTrail", "SIEM", "Penetration Testing", "ISO 27001"],
    description: "Perform comprehensive black-box and white-box security audits, API vulnerability assessments, and remediation roadmaps.",
    deliverables: [
      "Full penetration testing vulnerability report",
      "Automated SAST/DAST CI/CD integration",
      "Remediation guidance and executive risk scorecards",
    ],
    bidsCount: 0,
    activeStatus: true,
    order: 6,
  },
  {
    title: "Senior UI/UX & Design Systems Lead",
    category: "UI/UX Design",
    type: "FREELANCE · REMOTE",
    rate: "$60 - $85 / hr",
    duration: "2 - 4 Months",
    skills: ["Figma", "Design Systems", "Prototyping", "Design Tokens", "Wireframing"],
    description: "Craft state-of-the-art enterprise web interfaces, futuristic dark-mode aesthetics, design systems, and developer-ready tokens.",
    deliverables: [
      "Comprehensive Figma design system with components and variants",
      "Interactive high-fidelity prototypes for client apps",
      "Design token handoff documentation",
    ],
    bidsCount: 0,
    activeStatus: true,
    order: 7,
  },
];

async function seedFreelance() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error("❌ MONGO_URI is missing in .env file!");
      process.exit(1);
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB successfully.");

    console.log("Clearing existing freelance gigs...");
    await Freelance.deleteMany({});

    console.log(`Inserting ${freelanceSeedData.length} freelance gigs...`);
    const createdGigs = await Freelance.insertMany(freelanceSeedData);

    console.log(`✅ Successfully seeded ${createdGigs.length} freelance contractor gigs!`);
    createdGigs.forEach((g, idx) => {
      console.log(`   [${idx + 1}] ${g.title} | ${g.category} | ${g.rate}`);
    });

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding freelance gigs:", error);
    process.exit(1);
  }
}

seedFreelance();
