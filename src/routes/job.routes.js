import express from "express";
import {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  submitJobApplication,
  getAllApplicants,
  updateApplicant,
  deleteApplicant,
} from "../controller/job.controller.js";
import { adminAuth, userAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllJobs);
router.get("/:id", getJobById);

// Candidate Job Application (Authenticated User Only)
router.post("/:id/apply", userAuth, submitJobApplication);
router.post("/apply", userAuth, submitJobApplication);

// Admin Routes (Protected by adminAuth)
router.post("/", adminAuth, createJob);
router.patch("/:id", adminAuth, updateJob);
router.put("/:id", adminAuth, updateJob);
router.delete("/:id", adminAuth, deleteJob);

// ATS Applicants Routes (Admin Only)
router.get("/applicants/all", adminAuth, getAllApplicants);
router.get("/:id/applicants", adminAuth, getAllApplicants);
router.patch("/applicants/:id", adminAuth, updateApplicant);
router.delete("/applicants/:id", adminAuth, deleteApplicant);

export default router;
