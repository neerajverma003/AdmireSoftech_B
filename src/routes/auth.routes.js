import express from "express";
import {
  signup,
  login,
  refreshToken,
  getMe,
  logout,
  forgotPassword,
  verifyOtp,
  resetPassword,
  updateProfile,
} from "../controller/auth.controller.js";
import { userAuth, adminAuth } from "../middleware/auth.middleware.js";

const router = express.Router();


router.post("/signup", signup);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.post("/refresh", refreshToken);
router.post("/logout", logout);

// Password Reset via OTP
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

// Profile management
router.put("/profile", userAuth, updateProfile);

router.get("/me", userAuth, getMe);


router.get("/admin-only", adminAuth, (req, res) => {
  res.json({
    success: true,
    message: "Welcome Admin! You have access to this protected admin endpoint.",
    admin: req.user,
  });
});

export default router;
