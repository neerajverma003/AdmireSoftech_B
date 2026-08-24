import express from "express";
import { getSettings, updateSettings } from "../controller/settings.controller.js";
import { optionalUserAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public: Fetch company settings, social links & global stats
router.get("/", getSettings);

// Update company settings & social links
router.put("/", optionalUserAuth, updateSettings);

export default router;
