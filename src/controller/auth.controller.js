import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../models/user.model.js";
import {
  sendPasswordResetOtpEmail,
  sendPasswordResetSuccessEmail,
} from "../services/emailService.js";


const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};


const generateTokens = (userId, role) => {
  const accessToken = jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" } 
  );

  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" } 
  );

  return { accessToken, refreshToken };
};


export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role === "admin" ? "admin" : "user",
    });

    const { accessToken, refreshToken } = generateTokens(user._id, user.role);

    res.cookie("refreshToken", refreshToken, cookieOptions);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const { accessToken, refreshToken } = generateTokens(user._id, user.role);

    res.cookie("refreshToken", refreshToken, cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const refreshToken = async (req, res) => {
  try {
    const token =
      req.body?.refreshToken ||
      req.headers["x-refresh-token"] ||
      req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({ message: "Refresh token is missing" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const tokens = generateTokens(user._id, user.role);

    res.cookie("refreshToken", tokens.refreshToken, cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Access token refreshed successfully",
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Refresh error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
};


export const logout = async (req, res) => {
  res.clearCookie("refreshToken", cookieOptions);
  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

/**
 * Request Password Reset OTP
 * POST /api/auth/forgot-password
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Please provide your email address" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email address" });
    }

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpires = otpExpires;
    await user.save();

    // Send branded OTP email
    await sendPasswordResetOtpEmail({
      email: user.email,
      name: user.name,
      otp,
    });

    return res.status(200).json({
      success: true,
      message: `A 6-digit verification code has been sent to ${user.email}.`,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ message: "Failed to send reset code. Please try again later." });
  }
};

/**
 * Verify OTP
 * POST /api/auth/verify-otp
 */
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.resetPasswordOtp || user.resetPasswordOtp !== otp.toString().trim()) {
      return res.status(400).json({ message: "Invalid verification code. Please check and try again." });
    }

    if (!user.resetPasswordOtpExpires || new Date() > user.resetPasswordOtpExpires) {
      return res.status(400).json({ message: "Verification code has expired. Please request a new one." });
    }

    return res.status(200).json({
      success: true,
      message: "Verification code verified successfully.",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(500).json({ message: "Verification failed. Please try again." });
  }
};

/**
 * Reset Password with verified OTP
 * POST /api/auth/reset-password
 */
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, OTP, and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.resetPasswordOtp || user.resetPasswordOtp !== otp.toString().trim()) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    if (!user.resetPasswordOtpExpires || new Date() > user.resetPasswordOtpExpires) {
      return res.status(400).json({ message: "Verification code has expired. Please request a new one." });
    }

    // Hash and update password
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordOtp = null;
    user.resetPasswordOtpExpires = null;
    await user.save();

    // Send confirmation email
    sendPasswordResetSuccessEmail({ email: user.email, name: user.name });

    return res.status(200).json({
      success: true,
      message: "Password reset successfully! You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: "Failed to reset password. Please try again." });
  }
};

/**
 * Update User / Admin Profile (Name, Email, Avatar)
 * PUT /api/auth/profile
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { name, email, avatar } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name && name.trim()) {
      user.name = name.trim();
    }

    if (email && email.trim()) {
      const normalizedEmail = email.toLowerCase().trim();
      if (normalizedEmail !== user.email) {
        const existing = await User.findOne({
          email: normalizedEmail,
          _id: { $ne: user._id },
        });
        if (existing) {
          return res.status(400).json({ message: "This email address is already in use by another account" });
        }
        user.email = normalizedEmail;
      }
    }

    if (avatar !== undefined) {
      if (avatar && typeof avatar === "string" && avatar.startsWith("data:")) {
        return res.status(400).json({
          message: "Base64 images are not supported. Please upload your photo to AWS S3 or provide an HTTPS image URL.",
        });
      }
      user.avatar = avatar;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ message: "Failed to update profile. Please try again." });
  }
};