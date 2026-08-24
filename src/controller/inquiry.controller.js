import jwt from "jsonwebtoken";
import { Inquiry } from "../models/inquiry.model.js";
import { sendContactEmails } from "../services/emailService.js";

// Helper to extract user ID if authenticated
const getOptionalUserId = (req) => {
  try {
    const token =
      req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : req.cookies?.accessToken || req.cookies?.token;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded.id || null;
    }
  } catch (e) {
    
  }
  return null;
};


export const createInquiry = async (req, res) => {
  try {
    const {
      fullName,
      name,
      email,
      phone,
      company,
      subject,
      service,
      budget,
      timeline,
      message,
      priority,
      notes,
    } = req.body;

    const contactName = fullName || name;

    if (!contactName || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, and message are required fields.",
      });
    }

    const userId = getOptionalUserId(req);

    const newInquiry = await Inquiry.create({
      user: userId,
      fullName: contactName,
      email,
      phone: phone || "",
      company: company || "",
      subject: subject || "General Inquiry",
      service: service || "General",
      budget: budget || "",
      timeline: timeline || "",
      message,
      priority: priority || "Medium",
      notes: notes || "",
    });

    // Send confirmation email to user & notification to configured admin + universal recipients
    sendContactEmails({ inquiry: newInquiry }).catch((err) =>
      console.error("[Inquiry Controller] Email notification error:", err.message)
    );

    return res.status(201).json({
      success: true,
      message: `Thank you ${contactName}! Your inquiry has been received. Our engineering team will respond within 24 hours.`,
      inquiry: newInquiry,
    });
  } catch (error) {
    console.error("Error creating inquiry:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit inquiry. Please try again later.",
      error: error.message,
    });
  }
};


 
export const getAllInquiries = async (req, res) => {
  try {
    const { status, priority, search, sortBy = "createdAt", sortOrder = "desc" } = req.query;

    const query = {};

    if (status && status !== "All") {
      query.status = status;
    }

    if (priority && priority !== "All") {
      query.priority = priority;
    }

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { service: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    const inquiries = await Inquiry.find(query).sort(sortOptions);
    const totalCount = await Inquiry.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: inquiries.length,
      totalCount,
      inquiries,
    });
  } catch (error) {
    console.error("Error fetching inquiries:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch inquiries.",
      error: error.message,
    });
  }
};


export const getInquiryById = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found.",
      });
    }

    return res.status(200).json({
      success: true,
      inquiry,
    });
  } catch (error) {
    console.error("Error fetching inquiry:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch inquiry details.",
      error: error.message,
    });
  }
};


export const updateInquiry = async (req, res) => {
  try {
    const updatedInquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedInquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Inquiry updated successfully.",
      inquiry: updatedInquiry,
    });
  } catch (error) {
    console.error("Error updating inquiry:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update inquiry.",
      error: error.message,
    });
  }
};


export const deleteInquiry = async (req, res) => {
  try {
    const deletedInquiry = await Inquiry.findByIdAndDelete(req.params.id);

    if (!deletedInquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Inquiry deleted successfully.",
      id: req.params.id,
    });
  } catch (error) {
    console.error("Error deleting inquiry:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete inquiry.",
      error: error.message,
    });
  }
};
