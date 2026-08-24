import { NotificationRecipient } from "../models/notificationRecipient.model.js";

export const AVAILABLE_MODULES = [
  {
    key: "UNIVERSAL_NOTIFICATION",
    name: "Universal Notification",
    description: "Global receiver: automatically receives notifications from all modules.",
    icon: "Globe",
  },
  {
    key: "CONTACT",
    name: "Contact Form",
    description: "Contact us form submissions and general inquiries.",
    icon: "Mail",
  },
  {
    key: "QUICK_NOTES",
    name: "Quick Notes & Quotes",
    description: "Quick notes and custom engineering quote requests.",
    icon: "FileSpreadsheet",
  },
  {
    key: "FREELANCE",
    name: "Freelance Applications",
    description: "Freelance gig contractor proposals and bids.",
    icon: "Laptop",
  },
  {
    key: "JOB",
    name: "Job Applications",
    description: "Careers and ATS candidate job applications.",
    icon: "Briefcase",
  },
];


export const getAllRecipients = async (req, res) => {
  try {
    const recipients = await NotificationRecipient.find().sort({
      createdAt: -1,
    });

    const totalRecipients = recipients.length;
    const activeCount = recipients.filter((r) => r.isActive).length;

  
    const moduleStats = AVAILABLE_MODULES.map((mod) => {
      const moduleRecipients = recipients.filter((r) => r.module === mod.key);
      return {
        ...mod,
        total: moduleRecipients.length,
        active: moduleRecipients.filter((r) => r.isActive).length,
      };
    });

    return res.status(200).json({
      success: true,
      totalRecipients,
      activeCount,
      totalModules: AVAILABLE_MODULES.length,
      moduleStats,
      recipients,
    });
  } catch (error) {
    console.error("Error fetching notification recipients:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notification recipients.",
      error: error.message,
    });
  }
};


export const createRecipient = async (req, res) => {
  try {
    const { name, email, module } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email address is required.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const targetModule = module || "UNIVERSAL_NOTIFICATION";

    const validKeys = AVAILABLE_MODULES.map((m) => m.key);
    if (!validKeys.includes(targetModule)) {
      return res.status(400).json({
        success: false,
        message: `Invalid module. Must be one of: ${validKeys.join(", ")}`,
      });
    }

    // Check for duplicate in the same module
    const existing = await NotificationRecipient.findOne({
      email: cleanEmail,
      module: targetModule,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Email "${cleanEmail}" is already registered for "${targetModule}".`,
      });
    }

    const newRecipient = await NotificationRecipient.create({
      name: (name || "").trim(),
      email: cleanEmail,
      module: targetModule,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: `Notification recipient "${cleanEmail}" added successfully.`,
      recipient: newRecipient,
    });
  } catch (error) {
    console.error("Error creating notification recipient:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create notification recipient.",
      error: error.message,
    });
  }
};

/**
 * @desc Toggle active status of a recipient
 * @route PATCH /api/notifications/recipients/:id/toggle
 */
export const toggleRecipientStatus = async (req, res) => {
  try {
    const recipient = await NotificationRecipient.findById(req.params.id);

    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: "Recipient not found.",
      });
    }

    recipient.isActive = !recipient.isActive;
    await recipient.save();

    return res.status(200).json({
      success: true,
      message: `Recipient "${recipient.email}" is now ${
        recipient.isActive ? "Active" : "Inactive"
      }.`,
      recipient,
    });
  } catch (error) {
    console.error("Error toggling recipient status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update recipient status.",
      error: error.message,
    });
  }
};

/**
 * @desc Delete a notification recipient
 * @route DELETE /api/notifications/recipients/:id
 */
export const deleteRecipient = async (req, res) => {
  try {
    const deleted = await NotificationRecipient.findByIdAndDelete(
      req.params.id
    );

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Recipient not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Recipient "${deleted.email}" removed successfully.`,
      id: req.params.id,
    });
  } catch (error) {
    console.error("Error deleting recipient:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete recipient.",
      error: error.message,
    });
  }
};
