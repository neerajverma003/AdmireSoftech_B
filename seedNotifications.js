import mongoose from "mongoose";
import dotenv from "dotenv";
import { NotificationRecipient } from "./src/models/notificationRecipient.model.js";

dotenv.config();

const initialRecipients = [
  {
    name: "kaifff",
    email: "mohdsaif8672370@gmail.com",
    module: "UNIVERSAL_NOTIFICATION",
    isActive: false,
  },
  {
    name: "Universal Boss",
    email: "ansarikaif8587@gmail.com",
    module: "UNIVERSAL_NOTIFICATION",
    isActive: true,
  },
  {
    name: "Sales Desk",
    email: "sales@admiresoftech.com",
    module: "CONTACT",
    isActive: true,
  },
  {
    name: "Solutions Estimator",
    email: "quotes@admiresoftech.com",
    module: "QUICK_NOTES",
    isActive: true,
  },
  {
    name: "Talent Acquisition",
    email: "careers@admiresoftech.com",
    module: "JOB",
    isActive: true,
  },
  {
    name: "Gig Manager",
    email: "freelance@admiresoftech.com",
    module: "FREELANCE",
    isActive: true,
  },
];

const seedNotifications = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error("❌ Error: MONGO_URI is not defined in .env file.");
      process.exit(1);
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected successfully.");

    for (const item of initialRecipients) {
      const existing = await NotificationRecipient.findOne({
        email: item.email,
        module: item.module,
      });

      if (!existing) {
        await NotificationRecipient.create(item);
        console.log(`✅ Added recipient: ${item.name} (${item.email}) -> [${item.module}]`);
      } else {
        console.log(`ℹ️ Already exists: ${item.name} (${item.email}) -> [${item.module}]`);
      }
    }

    console.log("Seeding notifications completed.");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error seeding notifications:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedNotifications();
