import express from "express";
import {
  getEstimatorConfig,
  updateEstimatorConfig,
  resetEstimatorConfig,
} from "../controller/estimatorConfig.controller.js";
import { adminAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public: client fetches live estimator configuration
router.get("/", getEstimatorConfig);

// Admin: fetch config
router.get("/admin", adminAuth, getEstimatorConfig);

// Admin: save & update config
router.put("/admin", adminAuth, updateEstimatorConfig);

// Admin: reset to default
router.post("/admin/reset", adminAuth, resetEstimatorConfig);

export default router;
