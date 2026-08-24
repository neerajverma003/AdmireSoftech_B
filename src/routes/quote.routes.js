import express from "express";
import {
  createQuote,
  getAllQuotes,
  getQuoteById,
  updateQuote,
  deleteQuote,
} from "../controller/quote.controller.js";
import { optionalUserAuth, adminAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

// Quote submission (supports authenticated users and guest clients)
router.post("/", optionalUserAuth, createQuote);

// Admin protected quote management
router.get("/", adminAuth, getAllQuotes);
router.get("/:id", adminAuth, getQuoteById);
router.patch("/:id", adminAuth, updateQuote);
router.put("/:id", adminAuth, updateQuote);
router.delete("/:id", adminAuth, deleteQuote);

export default router;
