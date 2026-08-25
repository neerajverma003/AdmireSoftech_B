import express from "express";
import {
  getAllCaseStudies,
  getCaseStudyByIdOrSlug,
  createCaseStudy,
  updateCaseStudy,
  deleteCaseStudy,
  toggleCaseStudyStatus,
} from "../controller/caseStudy.controller.js";
import { adminAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes for client website & admin browsing
router.get("/", getAllCaseStudies);
router.get("/:id", getCaseStudyByIdOrSlug);

// Admin-protected management routes
router.post("/", adminAuth, createCaseStudy);
router.patch("/:id/toggle-status", adminAuth, toggleCaseStudyStatus);
router.patch("/:id", adminAuth, updateCaseStudy);
router.put("/:id", adminAuth, updateCaseStudy);
router.delete("/:id", adminAuth, deleteCaseStudy);

export default router;
