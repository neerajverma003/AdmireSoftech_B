import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { User } from "./src/models/user.model.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      console.error(" Error: MONGO_URI is not defined in your .env file.");
      process.exit(1);
    }

    console.log(" Connecting to MongoDB for Admin User Seeding...");
    await mongoose.connect(mongoUri);
    console.log(" MongoDB connected successfully.");

    const adminEmail = process.env.ADMIN_EMAIL || "test123@gmail.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const adminName = process.env.ADMIN_NAME || "Super Admin";

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log(` Admin user (${adminEmail}) already exists. Updating password & role...`);
      existingAdmin.name = adminName;
      existingAdmin.password = hashedPassword;
      existingAdmin.role = "admin";
      await existingAdmin.save();
      console.log(" Admin user credentials updated successfully.");
    } else {
      console.log(` Creating new Admin user (${adminEmail})...`);
      await User.create({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
      });
      console.log(" Admin user created successfully.");
    }

    console.log(" Admin seeding completed.");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(" Error seeding admin user:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedAdmin();
