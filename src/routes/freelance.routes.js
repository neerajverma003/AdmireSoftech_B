import express from "express";
import {
  getAllFreelance,
  getFreelanceById,
  createFreelance,
  updateFreelance,
  deleteFreelance,
  submitProposal,
  getGigProposals,
  updateProposalStatus,
} from "../controller/freelance.controller.js";
import { adminAuth, userAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllFreelance);
router.get("/:id", getFreelanceById);

// Candidate / Contractor Proposal Submission (Authenticated User Only)
router.post("/:id/proposals", userAuth, submitProposal);
router.post("/:id/apply", userAuth, submitProposal);

// Admin routes (Protected by adminAuth)
router.post("/", adminAuth, createFreelance);
router.patch("/:id", adminAuth, updateFreelance);
router.put("/:id", adminAuth, updateFreelance);
router.delete("/:id", adminAuth, deleteFreelance);

// Proposals Admin Routes
router.get("/:id/proposals", adminAuth, getGigProposals);
router.get("/proposals/all", adminAuth, getGigProposals);
router.patch("/proposals/:proposalId", adminAuth, updateProposalStatus);

export default router;
