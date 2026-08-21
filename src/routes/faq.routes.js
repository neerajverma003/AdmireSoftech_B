import express from "express";
import {
  getAllFaqs,
  getFaqById,
  createFaq,
  updateFaq,
  deleteFaq,
} from "../controller/faq.controller.js";
import { adminAuth } from "../middleware/auth.middleware.js";

const router = express.Router();


router.get("/", getAllFaqs);
router.get("/:id", getFaqById);


router.post("/", adminAuth, createFaq);
router.patch("/:id", adminAuth, updateFaq);
router.put("/:id", adminAuth, updateFaq);
router.delete("/:id", adminAuth, deleteFaq);

export default router;
