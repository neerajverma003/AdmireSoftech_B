import express from "express";
import {
  getAllTeamMembers,
  getTeamMemberById,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
} from "../controller/team.controller.js";
import { adminAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getAllTeamMembers);
router.get("/:id", getTeamMemberById);

router.post("/", adminAuth, createTeamMember);
router.patch("/:id", adminAuth, updateTeamMember);
router.put("/:id", adminAuth, updateTeamMember);
router.delete("/:id", adminAuth, deleteTeamMember);

export default router;
