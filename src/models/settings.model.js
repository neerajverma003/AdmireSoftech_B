import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
    {
        companyName: {
            type: String,
            default: "Admire Softech Pvt. Ltd.",
            trim: true,
        },
        tagline: {
            type: String,
            default: "Architecting Future-Ready Cloud, AI & Enterprise Software",
            trim: true,
        },
        contactEmail: {
            type: String,
            default: "contact@admiresoftech.com",
            trim: true,
            lowercase: true,
        },
        supportEmail: {
            type: String,
            default: "support@admiresoftech.com",
            trim: true,
            lowercase: true,
        },
        contactPhone: {
            type: String,
            default: "+91 (120) 456-7890",
            trim: true,
        },
        whatsappNumber: {
            type: String,
            default: "+91 98765 43210",
            trim: true,
        },
        headquarters: {
            type: String,
            default: "Sector 62, Noida, NCR, India",
            trim: true,
        },
        workingHours: {
            type: String,
            default: "Mon - Fri: 9:00 AM - 6:00 PM IST",
            trim: true,
        },
        websiteUrl: {
            type: String,
            default: "https://admiresoftech.com",
            trim: true,
        },
        frontendUrl: {
            type: String,
            default: "http://localhost:5173",
            trim: true,
        },
        apiBaseUrl: {
            type: String,
            default: "http://localhost:5000/api",
            trim: true,
        },
        socialLinks: {
            linkedin: {
                type: String,
                default: "https://linkedin.com/company/admiresoftech",
                trim: true,
            },
            twitter: {
                type: String,
                default: "https://twitter.com/admiresoftech",
                trim: true,
            },
            github: {
                type: String,
                default: "https://github.com/admiresoftech",
                trim: true,
            },
            youtube: {
                type: String,
                default: "https://youtube.com/@admiresoftech",
                trim: true,
            },
            instagram: {
                type: String,
                default: "https://instagram.com/admiresoftech",
                trim: true,
            },
            facebook: {
                type: String,
                default: "",
                trim: true,
            },
            discord: {
                type: String,
                default: "",
                trim: true,
            },
        },
        stats: {
            totalProjects: {
                type: String,
                default: "500+",
            },
            uptimeSLA: {
                type: String,
                default: "99.9%",
            },
            clientSatisfaction: {
                type: String,
                default: "98%",
            },
            globalEnterprises: {
                type: String,
                default: "45+",
            },
        },
    },
    {
        timestamps: true,
    }
);

const Settings = mongoose.model("Settings", settingsSchema);
export default Settings;
