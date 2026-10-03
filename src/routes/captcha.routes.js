import express from "express";
import { getCaptchaChallenge } from "../controller/captcha.controller.js";

const router = express.Router();

// Public security CAPTCHA generator for lead forms
router.get("/", getCaptchaChallenge);
router.get("/challenge", getCaptchaChallenge);

export default router;
