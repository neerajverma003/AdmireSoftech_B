import express from "express";
import {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} from "../controller/service.controller.js";
import { adminAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes for client website
router.get("/", getAllServices);
router.get("/:id", getServiceById);

// Admin protected management routes
router.post("/", adminAuth, createService);
router.patch("/:id", adminAuth, updateService);
router.put("/:id", adminAuth, updateService);
router.delete("/:id", adminAuth, deleteService);

export default router;
