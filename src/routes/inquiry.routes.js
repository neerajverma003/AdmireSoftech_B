import express from "express";
import {
  createInquiry,
  getAllInquiries,
  getInquiryById,
  updateInquiry,
  deleteInquiry,
} from "../controller/inquiry.controller.js";
import { adminAuth } from "../middleware/auth.middleware.js";

const router = express.Router();


router.post("/", createInquiry);


router.get("/", adminAuth, getAllInquiries);
router.get("/:id", adminAuth, getInquiryById);
router.patch("/:id", adminAuth, updateInquiry);
router.put("/:id", adminAuth, updateInquiry);
router.delete("/:id", adminAuth, deleteInquiry);

export default router;
