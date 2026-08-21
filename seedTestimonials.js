import mongoose from "mongoose";
import dotenv from "dotenv";
import { Testimonial } from "./src/models/testimonial.model.js";

dotenv.config();

export const defaultTestimonials = [
  {
    author: "Dean Chandler",
    role: "SOFTWARE TEAM LEAD",
    company: "SKYLINE ROBOTICS",
    content: "I was impressed with the amount of professionalism, communication, and speed of delivery.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80",
    rating: 5,
    category: "Full-Stack Development",
    isApproved: true,
    isFeatured: true,
    order: 1,
  },
  {
    author: "Gil Zeldner",
    role: "INFRASTRUCTURE LEAD",
    company: "VOLTRON AI",
    content: "Good consultants execute on task and deliver as planned. Better consultants overdeliver on their tasks. Great consultants become full technology partners and provide expertise beyond their scope. I am happy to call AdmireSoftech my technology partner as they overdelivered, provide high level expertise and I recommend their services as a very happy customer.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80",
    rating: 5,
    category: "Cloud & DevOps",
    isApproved: true,
    isFeatured: true,
    order: 2,
  },
  {
    author: "Nir Yahalom",
    role: "VP ENGINEERING",
    company: "SYNTHIX",
    content: "AdmireSoftech is a champ. They're fast, highly reliable, and have great communication. Well done!",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80",
    rating: 5,
    category: "AI & Machine Learning",
    isApproved: true,
    isFeatured: true,
    order: 3,
  },
  {
    author: "Robert Vance",
    role: "CTO",
    company: "FINSCALE GLOBAL",
    content: "AdmireSoftech completely transformed our legacy architecture into a cloud-native SaaS in under 4 months. Their engineering speed, Kubernetes expertise, and code quality are world class.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&h=200&q=80",
    rating: 5,
    category: "Cloud & DevOps",
    isApproved: true,
    isFeatured: true,
    order: 4,
  },
  {
    author: "Paul Mattal",
    role: "CTO",
    company: "JAIDE HEALTH",
    content: "They made helpful suggestions from the start about the tools and mechanisms that would be most flexible and maintainable over time, and they delivered on time and on budget.",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&h=200&q=80",
    rating: 5,
    category: "Full-Stack Development",
    isApproved: true,
    isFeatured: true,
    order: 5,
  },
  {
    author: "David Shaw",
    role: "SENIOR SOFTWARE ENGINEER",
    company: "LEANDATA",
    content: "We've gone from zero to 20 engineers who can self-serve on AWS, and AdmireSoftech stays very flexible to our changing needs.",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&h=200&q=80",
    rating: 5,
    category: "Cloud & DevOps",
    isApproved: true,
    isFeatured: true,
    order: 6,
  },
  {
    author: "Nir Ronen",
    role: "PROJECT MANAGER",
    company: "SURPASS",
    content: "We were impressed with their commitment to the project. They took full ownership of our CI/CD pipelines and cut our deployment times by 70%.",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&h=200&q=80",
    rating: 5,
    category: "DevOps & Automation",
    isApproved: true,
    isFeatured: true,
    order: 7,
  },
  {
    author: "Sarah Chen",
    role: "HEAD OF ENGINEERING",
    company: "FINPULSE SYSTEMS",
    content: "Kept proper transparency on progress and always delivered on time. Highly recommended technology partners for any complex cloud migration.",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80",
    rating: 5,
    category: "Cloud & DevOps",
    isApproved: true,
    isFeatured: true,
    order: 8,
  },
];

const seedTestimonials = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      console.error("❌ Error: MONGO_URI is not defined in your .env file.");
      process.exit(1);
    }

    console.log("🔄 Connecting to MongoDB for Testimonials Seeding...");
    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB connected successfully.");

    console.log("🔄 Upserting comprehensive client testimonials...");
    for (const item of defaultTestimonials) {
      await Testimonial.findOneAndUpdate(
        { author: item.author, company: item.company },
        { $set: item },
        { upsert: true, returnDocument: "after" }
      );
    }
    console.log(`✅ Seeded / updated ${defaultTestimonials.length} default testimonials.`);

    console.log("✨ Testimonials seeding completed.");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding testimonials:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedTestimonials();
