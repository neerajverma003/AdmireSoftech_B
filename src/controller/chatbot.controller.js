import { ChatbotSettings } from "../models/chatbotSettings.model.js";
import { ChatbotLead } from "../models/chatbotLead.model.js";
import { Inquiry } from "../models/inquiry.model.js";
import { sendChatbotLeadEmail } from "../services/emailService.js";
import { verifyCaptcha } from "../services/captchaService.js";

/**
 * @desc Get live chatbot settings (prompts, options, budgets)
 * @route GET /api/chatbot/settings
 * @access Public
 */
export const getChatbotSettings = async (req, res) => {
  try {
    let settings = await ChatbotSettings.findOne();

    if (!settings) {
      settings = await ChatbotSettings.create({});
    }

    return res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("[Chatbot Controller] Error fetching chatbot settings:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch chatbot configuration",
      error: error.message,
    });
  }
};

/**
 * @desc Update chatbot settings from Admin Panel
 * @route PUT /api/chatbot/settings
 * @access Admin
 */
export const updateChatbotSettings = async (req, res) => {
  try {
    const payload = req.body;

    let settings = await ChatbotSettings.findOne();

    if (settings) {
      settings = await ChatbotSettings.findByIdAndUpdate(
        settings._id,
        { $set: payload },
        { new: true, runValidators: true }
      );
    } else {
      settings = await ChatbotSettings.create(payload);
    }

    return res.status(200).json({
      success: true,
      message: "Chatbot settings updated successfully!",
      settings,
    });
  } catch (error) {
    console.error("[Chatbot Controller] Error updating chatbot settings:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update chatbot settings",
      error: error.message,
    });
  }
};

/**
 * @desc Submit chatbot lead from website visitor
 * @route POST /api/chatbot/lead
 * @access Public
 */
export const submitChatbotLead = async (req, res) => {
  try {
    const {
      fullName,
      name,
      email,
      phone,
      service,
      projectType,
      features,
      budget,
      notes,
      captchaToken,
      captchaAnswer,
      hp_field,
    } = req.body;

    if (captchaToken || captchaAnswer || hp_field) {
      const captchaResult = verifyCaptcha(captchaToken, captchaAnswer, hp_field);
      if (!captchaResult.isValid) {
        return res.status(400).json({
          success: false,
          isCaptchaError: true,
          message: captchaResult.message || "Invalid or expired security verification code.",
        });
      }
    }

    const contactName = (fullName || name || "").trim();

    if (!contactName || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Full name, email address, and phone number are required.",
      });
    }

    // Sanitize and auto-correct common academic & regional domain typos
    let cleanEmail = (email || "").trim().toLowerCase();
    if (cleanEmail.endsWith(".acin")) {
      cleanEmail = cleanEmail.replace(/\.acin$/, ".ac.in");
    } else if (cleanEmail.endsWith(".coin")) {
      cleanEmail = cleanEmail.replace(/\.coin$/, ".co.in");
    } else if (cleanEmail.endsWith(".eduin")) {
      cleanEmail = cleanEmail.replace(/\.eduin$/, ".edu.in");
    } else if (cleanEmail.endsWith(".govin")) {
      cleanEmail = cleanEmail.replace(/\.govin$/, ".gov.in");
    }

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    const cleanPhone = phone.trim();

    // 1. Create dedicated Chatbot Lead record
    const newLead = await ChatbotLead.create({
      fullName: contactName,
      email: cleanEmail,
      phone: cleanPhone,
      service: service || "Website Development",
      projectType: projectType || "",
      features: Array.isArray(features) ? features : [],
      budget: budget || "",
      notes: notes || "",
      source: "Chatbot",
      ipAddress: req.ip || req.headers["x-forwarded-for"] || "",
      userAgent: req.headers["user-agent"] || "",
    });

    // 2. Seamlessly sync into universal Inquiry collection for admin notification drawer & inquiries table
    let syncedInquiry = null;
    try {
      const featureListStr = Array.isArray(features) && features.length > 0 ? features.join(", ") : "Standard";
      const messageContent = [
        `[Chatbot Lead - ${service || "IT Project"}]`,
        `Project Type: ${projectType || "Not Specified"}`,
        `Features Requested: ${featureListStr}`,
        `Budget Range: ${budget || "Flexible"}`,
        notes ? `Client Notes: ${notes}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      syncedInquiry = await Inquiry.create({
        fullName: contactName,
        email: cleanEmail,
        phone: cleanPhone,
        subject: `[Chatbot] ${service || "IT Solution"} Inquiry`,
        service: service || "General",
        budget: budget || "",
        message: messageContent,
        notes: `Selected Features: ${featureListStr}`,
        source: "Chatbot",
        projectType: projectType || "",
        features: Array.isArray(features) ? features : [],
        priority: "High",
        status: "New",
      });

      // Link inquiryRef in ChatbotLead
      newLead.inquiryRef = syncedInquiry._id;
      await newLead.save();
    } catch (inquirySyncError) {
      console.warn("[Chatbot Controller] Non-blocking inquiry sync error:", inquirySyncError.message);
    }

    // 3. Send email notifications (user confirmation + universal/admin notification)
    const leadPayload = newLead.toObject ? newLead.toObject() : newLead;
    sendChatbotLeadEmail({ lead: leadPayload }).catch((err) =>
      console.error("[Chatbot Controller] Email notification error:", err.message)
    );

    return res.status(201).json({
      success: true,
      message: `Thank you ${contactName}! Your project requirement has been submitted. Our team will contact you shortly.`,
      lead: newLead,
    });
  } catch (error) {
    console.error("[Chatbot Controller] Error submitting chatbot lead:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit chatbot lead. Please try again later.",
      error: error.message,
    });
  }
};

/**
 * @desc Get all chatbot leads for Admin
 * @route GET /api/chatbot/leads
 * @access Admin
 */
export const getChatbotLeads = async (req, res) => {
  try {
    const { status, service, search } = req.query;

    const query = {};
    if (status && status !== "All") query.status = status;
    if (service && service !== "All") query.service = service;
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { service: { $regex: search, $options: "i" } },
        { projectType: { $regex: search, $options: "i" } },
      ];
    }

    const leads = await ChatbotLead.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: leads.length,
      leads,
    });
  } catch (error) {
    console.error("[Chatbot Controller] Error fetching leads:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch chatbot leads",
      error: error.message,
    });
  }
};

/**
 * @desc Update lead status/notes from Admin
 * @route PATCH /api/chatbot/leads/:id
 * @access Admin
 */
export const updateChatbotLead = async (req, res) => {
  try {
    const updatedLead = await ChatbotLead.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedLead) {
      return res.status(404).json({
        success: false,
        message: "Chatbot lead not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lead updated successfully",
      lead: updatedLead,
    });
  } catch (error) {
    console.error("[Chatbot Controller] Error updating lead:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update lead",
      error: error.message,
    });
  }
};

/**
 * @desc Delete chatbot lead from Admin
 * @route DELETE /api/chatbot/leads/:id
 * @access Admin
 */
export const deleteChatbotLead = async (req, res) => {
  try {
    const deleted = await ChatbotLead.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lead deleted successfully",
      id: req.params.id,
    });
  } catch (error) {
    console.error("[Chatbot Controller] Error deleting lead:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete lead",
      error: error.message,
    });
  }
};
