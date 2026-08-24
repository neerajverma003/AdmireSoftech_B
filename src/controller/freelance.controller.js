import { Freelance } from "../models/freelance.model.js";
import { Proposal } from "../models/proposal.model.js";
import { generateGetSignedUrl } from "../utils/s3Utils.js";
import { sendFreelanceProposalEmails } from "../services/emailService.js";


export const getAllFreelance = async (req, res) => {
  try {
    const { category, search, includeInactive } = req.query;

    const query = {};

    if (!includeInactive) {
      query.activeStatus = true;
    }

    if (category && category !== "All") {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { skills: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const gigs = await Freelance.find(query).sort({ order: 1, createdAt: -1 });

    const normalized = gigs.map((g) => {
      const obj = g.toObject ? g.toObject({ virtuals: true }) : g;
      return {
        ...obj,
        id: obj._id,
      };
    });

    return res.status(200).json({
      success: true,
      count: normalized.length,
      gigs: normalized,
      freelance: normalized,
    });
  } catch (error) {
    console.error("Error fetching freelance gigs:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch freelance projects.",
      error: error.message,
    });
  }
};


export const getFreelanceById = async (req, res) => {
  try {
    const gig = await Freelance.findById(req.params.id);

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: "Freelance project not found.",
      });
    }

    const obj = gig.toObject({ virtuals: true });

    return res.status(200).json({
      success: true,
      gig: {
        ...obj,
        id: obj._id,
      },
    });
  } catch (error) {
    console.error("Error fetching freelance gig:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch project details.",
      error: error.message,
    });
  }
};


export const createFreelance = async (req, res) => {
  try {
    const {
      title,
      category,
      type,
      rate,
      duration,
      skills,
      description,
      deliverables,
      activeStatus,
      order,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Project title is required.",
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: "Project description is required.",
      });
    }

    let skillsArray = [];
    if (Array.isArray(skills)) {
      skillsArray = skills.map((s) => String(s).trim()).filter(Boolean);
    } else if (typeof skills === "string") {
      skillsArray = skills.split(",").map((s) => s.trim()).filter(Boolean);
    }

    let deliverablesArray = [];
    if (Array.isArray(deliverables)) {
      deliverablesArray = deliverables.map((d) => String(d).trim()).filter(Boolean);
    } else if (typeof deliverables === "string") {
      deliverablesArray = deliverables.split("\n").map((d) => d.trim()).filter(Boolean);
    }

    const newGig = await Freelance.create({
      title: title.trim(),
      category: category || "Cloud",
      type: type || "FREELANCE · REMOTE",
      rate: rate || "$60 - $95 / hr",
      duration: duration || "3 - 6 Months",
      skills: skillsArray,
      description: description.trim(),
      deliverables: deliverablesArray,
      bidsCount: 0,
      activeStatus: activeStatus !== undefined ? activeStatus : true,
      order: order ? Number(order) : 0,
    });

    const obj = newGig.toObject({ virtuals: true });

    return res.status(201).json({
      success: true,
      message: "Freelance project published successfully.",
      gig: {
        ...obj,
        id: obj._id,
      },
    });
  } catch (error) {
    console.error("Error creating freelance gig:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create freelance gig.",
      error: error.message,
    });
  }
};


export const updateFreelance = async (req, res) => {
  try {
    const updatePayload = { ...req.body };

    if (updatePayload.skills && typeof updatePayload.skills === "string") {
      updatePayload.skills = updatePayload.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    if (updatePayload.deliverables && typeof updatePayload.deliverables === "string") {
      updatePayload.deliverables = updatePayload.deliverables
        .split("\n")
        .map((d) => d.trim())
        .filter(Boolean);
    }

    const updated = await Freelance.findByIdAndUpdate(
      req.params.id,
      { $set: updatePayload },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Freelance gig not found.",
      });
    }

    const obj = updated.toObject({ virtuals: true });

    return res.status(200).json({
      success: true,
      message: "Freelance project updated successfully.",
      gig: {
        ...obj,
        id: obj._id,
      },
    });
  } catch (error) {
    console.error("Error updating freelance gig:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update freelance gig.",
      error: error.message,
    });
  }
};


export const deleteFreelance = async (req, res) => {
  try {
    const deleted = await Freelance.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Freelance project not found.",
      });
    }

    // Also delete associated proposals
    await Proposal.deleteMany({ freelance: req.params.id });

    return res.status(200).json({
      success: true,
      message: "Freelance gig and associated proposals deleted successfully.",
      id: req.params.id,
    });
  } catch (error) {
    console.error("Error deleting freelance gig:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete freelance project.",
      error: error.message,
    });
  }
};


export const submitProposal = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please sign in to submit a proposal.",
      });
    }

    const gigId = req.params.id || req.body.freelanceId || req.body.gigId;
    const {
      fullName,
      email,
      phone,
      hourlyRate,
      portfolioUrl,
      experienceNote,
      resumeUrl,
      resumeFileName,
      resumeKey,
    } = req.body;

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Full name is required.",
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email address is required.",
      });
    }

    const gig = await Freelance.findById(gigId);
    if (!gig) {
      return res.status(404).json({
        success: false,
        message: "Freelance project not found.",
      });
    }

    const proposal = await Proposal.create({
      freelance: gig._id,
      user: req.user?._id || null,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: (phone || "").trim(),
      hourlyRate: (hourlyRate || "").trim(),
      portfolioUrl: (portfolioUrl || "").trim(),
      experienceNote: (experienceNote || "").trim(),
      resumeUrl: (resumeUrl || "").trim(),
      resumeFileName: (resumeFileName || "").trim(),
      resumeKey: (resumeKey || "").trim(),
      status: "Pending",
    });

    // Increment proposals / bidsCount on the gig
    await Freelance.findByIdAndUpdate(gig._id, { $inc: { bidsCount: 1 } });

    // Send confirmation to user & notification to configured admin + universal recipients
    sendFreelanceProposalEmails({ gig, proposal }).catch((err) =>
      console.error("[Freelance Controller] Email notification error:", err.message)
    );

    return res.status(201).json({
      success: true,
      message: `Proposal submitted successfully for "${gig.title}". Our engineering team will review it within 24 hours!`,
      proposal: {
        id: proposal._id,
        user: proposal.user,
        fullName: proposal.fullName,
        email: proposal.email,
        status: proposal.status,
        resumeUrl: proposal.resumeUrl,
      },
    });
  } catch (error) {
    console.error("Error submitting proposal:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit proposal.",
      error: error.message,
    });
  }
};


export const getGigProposals = async (req, res) => {
  try {
    const { id } = req.params;
    const filter = id && id !== "all" ? { freelance: id } : {};

    const proposals = await Proposal.find(filter)
      .populate("freelance", "title category rate type")
      .sort({ createdAt: -1 });

    // Generate signed GET URLs for resumes if S3 keys are stored
    const enriched = await Promise.all(
      proposals.map(async (p) => {
        const obj = p.toObject ? p.toObject({ virtuals: true }) : p;
        let signedResumeUrl = obj.resumeUrl;
        if (obj.resumeKey || obj.resumeUrl) {
          signedResumeUrl = await generateGetSignedUrl(obj.resumeKey || obj.resumeUrl, 3600);
        }
        return {
          ...obj,
          id: obj._id,
          signedResumeUrl,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: enriched.length,
      proposals: enriched,
    });
  } catch (error) {
    console.error("Error fetching proposals:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch contractor proposals.",
      error: error.message,
    });
  }
};


export const updateProposalStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Pending", "Review", "Interview", "Accepted", "Declined"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const proposal = await Proposal.findByIdAndUpdate(
      req.params.proposalId,
      { status },
      { new: true }
    );

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: "Proposal not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Proposal status updated to "${status}".`,
      proposal: {
        id: proposal._id,
        status: proposal.status,
      },
    });
  } catch (error) {
    console.error("Error updating proposal status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update proposal status.",
      error: error.message,
    });
  }
};
