import mongoose from "mongoose";

const chatbotSettingsSchema = new mongoose.Schema(
  {
    step1: {
      promptMessage: {
        type: String,
        default: "Hi! 👋 Welcome to Admire Softech. I'm your AI IT solutions assistant. How can we help you today?",
        trim: true,
      },
      options: {
        type: [String],
        default: [
          "Website Development",
          "Mobile App Development",
          "Cloud & DevOps",
          "AI/ML Solutions",
          "Website Maintenance",
          "Hire a Developer",
          "Submit an Enquiry",
        ],
      },
    },
    step2: {
      promptMessage: {
        type: String,
        default: "Great! What type of project or solution are you looking for?",
        trim: true,
      },
      options: {
        type: [String],
        default: [
          "Business Website",
          "E-commerce Website",
          "Custom Web Application",
          "Mobile App (iOS / Android)",
          "Cloud & DevOps Infrastructure",
          "AI Chatbot / Custom Agent",
          "Not Sure / Let's Discuss",
        ],
      },
    },
    step3: {
      promptMessage: {
        type: String,
        default: "Nice! What features or capabilities do you need?",
        trim: true,
      },
      options: {
        type: [String],
        default: [
          "Payment Gateway Integration",
          "Product & Inventory Management",
          "User Login & Authentication",
          "Admin Analytics Dashboard",
          "Order Management & Cart",
          "Responsive Modern UI/UX",
          "CMS & Content Management",
          "REST/GraphQL API Integration",
          "SEO & Speed Optimization",
          "Cloud Auto-scaling & CI/CD",
        ],
      },
    },
    step4: {
      promptMessage: {
        type: String,
        default: "What is your approximate budget range for this project? 💰",
        trim: true,
      },
      options: {
        type: [String],
        default: [
          "Below ₹25,000",
          "₹25,000 - ₹50,000",
          "₹50,000 - ₹1,00,000",
          "₹1,00,000 - ₹2,50,000",
          "Above ₹2,50,000",
          "Not Sure / Let's Discuss",
        ],
      },
    },
    step5: {
      formPromptMessage: {
        type: String,
        default: "Wonderful! We have great technical solutions for you. Please share your details so our engineering team can send a tailored proposal:",
        trim: true,
      },
      successMessage: {
        type: String,
        default: "🎉 Thank you! Your project requirements have been received. Our solutions architect will reach out within 24 hours.",
        trim: true,
      },
      whatsappNumber: {
        type: String,
        default: "+919876543210",
        trim: true,
      },
      whatsappPrefillText: {
        type: String,
        default: "Hello Admire Softech, I just submitted an inquiry through your AI Chatbot and would like to discuss my project!",
        trim: true,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const ChatbotSettings = mongoose.model("ChatbotSettings", chatbotSettingsSchema);
