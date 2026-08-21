import express from "express";
import {
  getAllTestimonials,
  getTestimonialById,
  createTestimonial,
  submitReview,
  updateTestimonial,
  deleteTestimonial,
} from "../controller/testimonial.controller.js";
import { userAuth, adminAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes for client website
router.get("/", getAllTestimonials);
router.get("/:id", getTestimonialById);

// Authenticated client user review submission
router.post("/submit", userAuth, submitReview);

// Admin protected management routes
router.post("/", adminAuth, createTestimonial);
router.patch("/:id", adminAuth, updateTestimonial);
router.put("/:id", adminAuth, updateTestimonial);
router.delete("/:id", adminAuth, deleteTestimonial);

export default router;
