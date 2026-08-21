import { Testimonial } from "../models/testimonial.model.js";

/**
 * @desc    Get all testimonials (Public / Admin)
 * @route   GET /api/testimonials OR GET /api/reviews
 * @access  Public
 */
export const getAllTestimonials = async (req, res) => {
  try {
    const { category, search, includeUnapproved } = req.query;

    const query = {};

    if (!includeUnapproved) {
      query.isApproved = true;
    }

    if (category && category !== "All") {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { author: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { role: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    const testimonials = await Testimonial.find(query).sort({ order: 1, createdAt: -1 });

    const normalized = testimonials.map((t) => {
      const obj = t.toObject ? t.toObject({ virtuals: true }) : t;
      return {
        ...obj,
        id: obj._id,
        quote: obj.content,
      };
    });

    return res.status(200).json({
      success: true,
      count: normalized.length,
      testimonials: normalized,
    });
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch testimonials.",
      error: error.message,
    });
  }
};

/**
 * @desc    Get single testimonial by ID
 * @route   GET /api/testimonials/:id
 * @access  Public
 */
export const getTestimonialById = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found.",
      });
    }

    const obj = testimonial.toObject({ virtuals: true });

    return res.status(200).json({
      success: true,
      testimonial: {
        ...obj,
        id: obj._id,
        quote: obj.content,
      },
    });
  } catch (error) {
    console.error("Error fetching testimonial:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch testimonial.",
      error: error.message,
    });
  }
};

/**
 * @desc    Create a new testimonial (Admin Only)
 * @route   POST /api/testimonials
 * @access  Private (adminAuth)
 */
export const createTestimonial = async (req, res) => {
  try {
    const {
      author,
      role,
      company,
      content,
      quote,
      avatar,
      rating,
      category,
      isApproved,
      isFeatured,
      order,
    } = req.body;

    const testimonialContent = (content || quote || "").trim();

    if (!author || !author.trim()) {
      return res.status(400).json({
        success: false,
        message: "Author name is required.",
      });
    }

    if (!testimonialContent) {
      return res.status(400).json({
        success: false,
        message: "Review / testimonial content is required.",
      });
    }

    const newTestimonial = await Testimonial.create({
      author: author.trim(),
      role: (role || "").trim(),
      company: (company || "").trim(),
      content: testimonialContent,
      avatar: (avatar || "").trim() || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80",
      rating: rating ? Number(rating) : 5,
      category: category || "General",
      isApproved: isApproved !== undefined ? isApproved : true,
      isFeatured: isFeatured !== undefined ? isFeatured : true,
      order: order ? Number(order) : 0,
    });

    const obj = newTestimonial.toObject({ virtuals: true });

    return res.status(201).json({
      success: true,
      message: "Testimonial created successfully.",
      testimonial: {
        ...obj,
        id: obj._id,
        quote: obj.content,
      },
    });
  } catch (error) {
    console.error("Error creating testimonial:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create testimonial.",
      error: error.message,
    });
  }
};

/**
 * @desc    Update testimonial (Admin Only)
 * @route   PATCH /api/testimonials/:id OR PUT /api/testimonials/:id
 * @access  Private (adminAuth)
 */
export const updateTestimonial = async (req, res) => {
  try {
    const updatePayload = { ...req.body };
    if (updatePayload.quote && !updatePayload.content) {
      updatePayload.content = updatePayload.quote;
    }

    const updated = await Testimonial.findByIdAndUpdate(
      req.params.id,
      { $set: updatePayload },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found.",
      });
    }

    const obj = updated.toObject({ virtuals: true });

    return res.status(200).json({
      success: true,
      message: "Testimonial updated successfully.",
      testimonial: {
        ...obj,
        id: obj._id,
        quote: obj.content,
      },
    });
  } catch (error) {
    console.error("Error updating testimonial:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update testimonial.",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete testimonial (Admin Only)
 * @route   DELETE /api/testimonials/:id
 * @access  Private (adminAuth)
 */
export const deleteTestimonial = async (req, res) => {
  try {
    const deleted = await Testimonial.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Testimonial deleted successfully.",
      id: req.params.id,
    });
  } catch (error) {
    console.error("Error deleting testimonial:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete testimonial.",
      error: error.message,
    });
  }
};

/**
 * @desc    Client user submits a new review (Requires Admin Approval)
 * @route   POST /api/testimonials/submit OR POST /api/reviews/submit
 * @access  Public / Authenticated
 */
export const submitReview = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please sign in to submit a review.",
      });
    }

    const { author, role, company, content, quote, avatar, rating, category } = req.body;

    const testimonialContent = (content || quote || "").trim();
    const authorName = (author || req.user.name || "").trim();

    if (!authorName) {
      return res.status(400).json({
        success: false,
        message: "Your name is required.",
      });
    }

    if (!testimonialContent) {
      return res.status(400).json({
        success: false,
        message: "Review message / feedback is required.",
      });
    }

    const newReview = await Testimonial.create({
      user: req.user._id,
      author: authorName,
      role: (role || "Client").trim(),
      company: (company || "").trim(),
      content: testimonialContent,
      avatar: (avatar || "").trim() || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80",
      rating: rating ? Math.min(5, Math.max(1, Number(rating))) : 5,
      category: category || "General",
      isApproved: false, // Starts as pending for Admin moderation!
      isFeatured: false,
      order: 0,
    });

    const obj = newReview.toObject({ virtuals: true });

    return res.status(201).json({
      success: true,
      message: "Thank you! Your review has been submitted and is pending admin approval.",
      testimonial: {
        ...obj,
        id: obj._id,
        quote: obj.content,
      },
    });
  } catch (error) {
    console.error("Error submitting client review:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit review.",
      error: error.message,
    });
  }
};
