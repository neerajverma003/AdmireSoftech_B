import { Faq } from "../models/faq.model.js";


export const getAllFaqs = async (req, res) => {
  try {
    const { category, search, includeInactive } = req.query;

    const query = {};

    if (!includeInactive) {
      query.isActive = true;
    }

    if (category && category !== "ALL" && category !== "All") {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { question: { $regex: search, $options: "i" } },
        { answer: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    const faqs = await Faq.find(query).sort({ order: 1, createdAt: 1 });

    const normalized = faqs.map((f, index) => {
      const obj = f.toObject ? f.toObject({ virtuals: true }) : f;
      const formattedNum = String(index + 1).padStart(2, "0");
      return {
        ...obj,
        id: obj._id,
        faqNumber: formattedNum,
      };
    });

    return res.status(200).json({
      success: true,
      count: normalized.length,
      faqs: normalized,
    });
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch FAQs.",
      error: error.message,
    });
  }
};


export const getFaqById = async (req, res) => {
  try {
    const faq = await Faq.findById(req.params.id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found.",
      });
    }

    const obj = faq.toObject({ virtuals: true });

    return res.status(200).json({
      success: true,
      faq: {
        ...obj,
        id: obj._id,
      },
    });
  } catch (error) {
    console.error("Error fetching FAQ:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch FAQ.",
      error: error.message,
    });
  }
};


export const createFaq = async (req, res) => {
  try {
    const { category, question, answer, highlights, order, isActive } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: "FAQ question is required.",
      });
    }

    if (!answer || !answer.trim()) {
      return res.status(400).json({
        success: false,
        message: "FAQ answer is required.",
      });
    }

    let parsedHighlights = [];
    if (Array.isArray(highlights)) {
      parsedHighlights = highlights.filter(Boolean);
    } else if (typeof highlights === "string" && highlights.trim()) {
      parsedHighlights = highlights
        .split("\n")
        .map((h) => h.trim())
        .filter(Boolean);
    }

    const newFaq = await Faq.create({
      category: (category || "General").trim(),
      question: question.trim(),
      answer: answer.trim(),
      highlights: parsedHighlights,
      order: order ? Number(order) : 0,
      isActive: isActive !== undefined ? isActive : true,
    });

    const obj = newFaq.toObject({ virtuals: true });

    return res.status(201).json({
      success: true,
      message: "FAQ created successfully.",
      faq: {
        ...obj,
        id: obj._id,
      },
    });
  } catch (error) {
    console.error("Error creating FAQ:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create FAQ.",
      error: error.message,
    });
  }
};


export const updateFaq = async (req, res) => {
  try {
    const updatePayload = { ...req.body };

    if (updatePayload.highlights && typeof updatePayload.highlights === "string") {
      updatePayload.highlights = updatePayload.highlights
        .split("\n")
        .map((h) => h.trim())
        .filter(Boolean);
    }

    const updated = await Faq.findByIdAndUpdate(
      req.params.id,
      { $set: updatePayload },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found.",
      });
    }

    const obj = updated.toObject({ virtuals: true });

    return res.status(200).json({
      success: true,
      message: "FAQ updated successfully.",
      faq: {
        ...obj,
        id: obj._id,
      },
    });
  } catch (error) {
    console.error("Error updating FAQ:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update FAQ.",
      error: error.message,
    });
  }
};


export const deleteFaq = async (req, res) => {
  try {
    const deleted = await Faq.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "FAQ deleted successfully.",
      id: req.params.id,
    });
  } catch (error) {
    console.error("Error deleting FAQ:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete FAQ.",
      error: error.message,
    });
  }
};
