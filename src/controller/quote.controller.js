import { Quote } from "../models/quote.model.js";
import { sendQuoteEmails } from "../services/emailService.js";

export const createQuote = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      serviceType,
      scope,
      projectScope,
      timeline,
      estimatedBudget,
      notes,
      urgency,
    } = req.body;

    const quoteName = name || req.user?.name;
    const quoteEmail = email || req.user?.email;

    if (!quoteName || !quoteEmail || !serviceType || !scope || !timeline) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields (name, email, serviceType, scope, timeline).",
      });
    }

    const newQuote = await Quote.create({
      user: req.user?._id || null,
      name: quoteName,
      email: quoteEmail,
      phone: phone || "",
      serviceType,
      scope,
      projectScope: projectScope || scope,
      timeline,
      estimatedBudget: estimatedBudget || "",
      notes: notes || "",
      urgency: urgency || "Medium",
      status: "Pending Review",
    });

    // Trigger confirmation email to client & notification to configured admin + universal recipients
    sendQuoteEmails({ quote: newQuote }).catch((err) =>
      console.error("[Quote Controller] Email notification error:", err.message)
    );

    return res.status(201).json({
      success: true,
      message: `Quote request submitted successfully for ${serviceType}! Our engineering team will prepare your custom proposal.`,
      quote: newQuote,
    });
  } catch (error) {
    console.error("Error creating quote:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit quote request. Please try again.",
      error: error.message,
    });
  }
};


export const getAllQuotes = async (req, res) => {
  try {
    const { status, urgency, search, sortBy = "createdAt", sortOrder = "desc" } = req.query;

    const query = {};

    if (status && status !== "All") {
      query.status = status;
    }

    if (urgency && urgency !== "All") {
      query.urgency = urgency;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { serviceType: { $regex: search, $options: "i" } },
        { scope: { $regex: search, $options: "i" } },
        { notes: { $regex: search, $options: "i" } },
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    const quotes = await Quote.find(query)
      .populate("user", "name email role")
      .sort(sortOptions);

    const totalCount = await Quote.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: quotes.length,
      totalCount,
      quotes,
    });
  } catch (error) {
    console.error("Error fetching quotes:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch quotes.",
      error: error.message,
    });
  }
};


export const getQuoteById = async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id).populate("user", "name email role");

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: "Quote request not found.",
      });
    }

    return res.status(200).json({
      success: true,
      quote,
    });
  } catch (error) {
    console.error("Error fetching quote:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch quote details.",
      error: error.message,
    });
  }
};


export const updateQuote = async (req, res) => {
  try {
    const updatedQuote = await Quote.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate("user", "name email role");

    if (!updatedQuote) {
      return res.status(404).json({
        success: false,
        message: "Quote request not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Quote updated successfully.",
      quote: updatedQuote,
    });
  } catch (error) {
    console.error("Error updating quote:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update quote.",
      error: error.message,
    });
  }
};


export const deleteQuote = async (req, res) => {
  try {
    const deletedQuote = await Quote.findByIdAndDelete(req.params.id);

    if (!deletedQuote) {
      return res.status(404).json({
        success: false,
        message: "Quote request not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Quote deleted successfully.",
      id: req.params.id,
    });
  } catch (error) {
    console.error("Error deleting quote:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete quote.",
      error: error.message,
    });
  }
};
