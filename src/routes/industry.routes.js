import express from "express";
import {
  getAllIndustries,
  getIndustryById,
  createIndustry,
  updateIndustry,
  deleteIndustry,
} from "../controller/industry.controller.js";
import { adminAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes for client website & admin browsing
router.get("/", getAllIndustries);
router.get("/:id", getIndustryById);

// Admin-protected management routes
router.post("/", adminAuth, createIndustry);
router.patch("/:id", adminAuth, updateIndustry);
router.put("/:id", adminAuth, updateIndustry);
router.delete("/:id", adminAuth, deleteIndustry);

export default router;
