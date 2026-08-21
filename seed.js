import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { User } from "./src/models/user.model.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      console.error(" Error: MONGO_URI is not defined in your .env file.");
      process.exit(1);
    }

    console.log(" Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log(" MongoDB connected successfully.");

    const adminEmail = (process.env.ADMIN_EMAIL || "mohdkaif8672@gmail.com").toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const adminName = process.env.ADMIN_NAME || "Super Admin";

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log(` Admin user already exists with email: ${adminEmail}`);
      if (existingAdmin.role !== "admin") {
        existingAdmin.role = "admin";
        await existingAdmin.save();
        console.log("👑 Updated user role to 'admin'.");
      }
    } else {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const newAdmin = await User.create({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
      });

      console.log(" Admin user created successfully!");
      console.log("-----------------------------------------");
      console.log(` Name:     ${newAdmin.name}`);
      console.log(` Email:    ${newAdmin.email}`);
      console.log(` Password: ${adminPassword}`);
      console.log(` Role:     ${newAdmin.role}`);
      console.log("-----------------------------------------");
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
