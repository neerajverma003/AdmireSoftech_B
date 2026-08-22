import mongoose from "mongoose";
import dotenv from "dotenv";
import { Job } from "./src/models/job.model.js";

dotenv.config();

const jobsSeedData = [
  {
    title: "Senior Full Stack Engineer (React & Node.js)",
    department: "Engineering",
    location: "Remote / Hybrid (India)",
    type: "Full-time",
    experience: "4+ Years",
    salary: "$80,000 - $110,000 / yr",
    description: "We are seeking an experienced Full Stack Engineer to lead the architecture and development of scalable SaaS applications for enterprise clients.",
    responsibilities: [
      "Architect and deploy high-performance frontend interfaces in React / Next.js.",
      "Design clean RESTful and GraphQL APIs using Node.js and PostgreSQL.",
      "Collaborate with cloud architects to containerize applications on Docker & AWS.",
      "Mentor junior engineers and champion code quality standards.",
    ],
    requirements: [
      "4+ years of professional experience with React, Node.js, and TypeScript.",
      "Strong expertise in relational databases (PostgreSQL/MySQL) and caching (Redis).",
      "Familiarity with cloud platforms (AWS/GCP) and CI/CD pipelines.",
      "Excellent problem-solving skills and communication.",
    ],
    status: "Active",
    activeStatus: true,
    applicantsCount: 0,
    order: 1,
  },
  {
    title: "AI / ML Solutions Engineer",
    department: "Artificial Intelligence",
    location: "Remote / On-site",
    type: "Full-time",
    experience: "3+ Years",
    salary: "$90,000 - $130,000 / yr",
    description: "Join our AI Innovation Lab building LLM agents, custom RAG pipelines, and predictive analytics models for global enterprise accounts.",
    responsibilities: [
      "Fine-tune open-source models (Llama, Mistral) and build RAG vector search pipelines.",
      "Integrate LLM APIs with backend microservices.",
      "Optimize model latency, throughput, and GPU resource utilization.",
      "Conduct R&D on emerging Generative AI frameworks.",
    ],
    requirements: [
      "3+ years of experience with Python, PyTorch, LangChain, and Vector DBs.",
      "Solid understanding of NLP, embeddings, and Transformer architectures.",
      "Hands-on experience deploying ML models to cloud environments.",
    ],
    status: "Active",
    activeStatus: true,
    applicantsCount: 0,
    order: 2,
  },
  {
    title: "DevOps & Cloud Security Architect",
    department: "Infrastructure",
    location: "Remote",
    type: "Full-time",
    experience: "5+ Years",
    salary: "$100,000 - $145,000 / yr",
    description: "Lead multi-cloud infrastructure automation, Kubernetes orchestration, and Zero-Trust security across client deployments.",
    responsibilities: [
      "Design modular Infrastructure as Code using Terraform and Ansible.",
      "Manage multi-region Kubernetes clusters on AWS EKS and Azure AKS.",
      "Enforce Zero-Trust security policies and automated vulnerability scanning.",
      "Establish 24/7 observability with Prometheus, Grafana, and Datadog.",
    ],
    requirements: [
      "5+ years in DevOps / Cloud Architecture (AWS/Azure Certified preferred).",
      "Expert level knowledge in Kubernetes, Docker, Terraform, and CI/CD.",
      "Strong scripting background in Bash, Python, or Go.",
    ],
    status: "Active",
    activeStatus: true,
    applicantsCount: 0,
    order: 3,
  },
  {
    title: "Senior UI/UX Product Designer",
    department: "Design",
    location: "Hybrid",
    type: "Full-time",
    experience: "3+ Years",
    salary: "$70,000 - $95,000 / yr",
    description: "Craft beautiful, intuitive design systems and high-converting product interfaces for modern web and mobile applications.",
    responsibilities: [
      "Lead user research, journey mapping, and interactive prototyping in Figma.",
      "Maintain and expand enterprise design systems for our clients.",
      "Collaborate closely with engineering teams during design handoff.",
    ],
    requirements: [
      "3+ years designing complex web applications or mobile SaaS apps.",
      "Mastery of Figma, component libraries, auto-layout, and design tokens.",
      "Strong portfolio demonstrating user-centric problem solving.",
    ],
    status: "Active",
    activeStatus: true,
    applicantsCount: 0,
    order: 4,
  },
];

async function seedJobs() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error("❌ MONGO_URI is missing in .env file!");
      process.exit(1);
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB successfully.");

    console.log("Clearing existing job openings...");
    await Job.deleteMany({});

    console.log(`Inserting ${jobsSeedData.length} job openings...`);
    const createdJobs = await Job.insertMany(jobsSeedData);

    console.log(`✅ Successfully seeded ${createdJobs.length} career job openings!`);
    createdJobs.forEach((j, idx) => {
      console.log(`   [${idx + 1}] ${j.title} | ${j.department} | ${j.salary}`);
    });

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding jobs:", error);
    process.exit(1);
  }
}

seedJobs();
