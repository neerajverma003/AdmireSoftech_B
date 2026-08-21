import express from "express";
import {
  createQuote,
  getAllQuotes,
  getQuoteById,
  updateQuote,
  deleteQuote,
} from "../controller/quote.controller.js";
import { userAuth, adminAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

// User authenticated quote submission
router.post("/", userAuth, createQuote);

// Admin protected quote management
router.get("/", adminAuth, getAllQuotes);
router.get("/:id", adminAuth, getQuoteById);
router.patch("/:id", adminAuth, updateQuote);
router.put("/:id", adminAuth, updateQuote);
router.delete("/:id", adminAuth, deleteQuote);

export default router;
