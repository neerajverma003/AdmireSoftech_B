import express from "express";
import {
  getChatbotSettings,
  updateChatbotSettings,
  submitChatbotLead,
  getChatbotLeads,
  updateChatbotLead,
  deleteChatbotLead,
} from "../controller/chatbot.controller.js";

const router = express.Router();

// ── Settings Endpoints ──
// Public: fetch current dynamic settings for the chatbot widget
router.get("/settings", getChatbotSettings);
router.get("/config", getChatbotSettings);

// Admin: update dynamic settings (prompts, options, budgets)
router.put("/settings", updateChatbotSettings);
router.put("/config", updateChatbotSettings);

// ── Leads Endpoints ──
// Public: visitor submits inquiry through the chatbot
router.post("/lead", submitChatbotLead);
router.post("/leads", submitChatbotLead);

// Admin: manage captured leads
router.get("/leads", getChatbotLeads);
router.patch("/leads/:id", updateChatbotLead);
router.delete("/leads/:id", deleteChatbotLead);

export default router;
