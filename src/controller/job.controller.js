import { Job } from "../models/job.model.js";
import { Applicant } from "../models/applicant.model.js";
import { generateGetSignedUrl } from "../utils/s3Utils.js";
import { sendJobApplicationEmails } from "../services/emailService.js";


export const getAllJobs = async (req, res) => {
  try {
    const { department, search, includeInactive } = req.query;

    const query = {};

    if (!includeInactive) {
      query.$or = [{ activeStatus: true }, { status: "Active" }];
    }

    if (department && department !== "All") {
      query.department = { $regex: new RegExp(`^${department}$`, "i") };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { department: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { requirements: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const jobs = await Job.find(query).sort({ order: 1, createdAt: -1 });

    const normalized = jobs.map((j) => {
      const obj = j.toObject ? j.toObject({ virtuals: true }) : j;
      return {
        ...obj,
        id: obj._id,
      };
    });

    return res.status(200).json({
      success: true,
      count: normalized.length,
      jobs: normalized,
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch job openings.",
      error: error.message,
    });
  }
};


export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job opening not found.",
      });
    }

    const obj = job.toObject({ virtuals: true });

    return res.status(200).json({
      success: true,
      job: {
        ...obj,
        id: obj._id,
      },
    });
  } catch (error) {
    console.error("Error fetching job:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch job details.",
      error: error.message,
    });
  }
};


export const createJob = async (req, res) => {
  try {
    const {
      title,
      department,
      location,
      type,
      experience,
      salary,
      description,
      responsibilities,
      requirements,
      status,
      activeStatus,
      order,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Job title is required.",
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: "Job description is required.",
      });
    }

    let responsibilitiesArray = [];
    if (Array.isArray(responsibilities)) {
      responsibilitiesArray = responsibilities.map((r) => String(r).trim()).filter(Boolean);
    } else if (typeof responsibilities === "string") {
      responsibilitiesArray = responsibilities.split("\n").map((r) => r.trim()).filter(Boolean);
    }

    let requirementsArray = [];
    if (Array.isArray(requirements)) {
      requirementsArray = requirements.map((r) => String(r).trim()).filter(Boolean);
    } else if (typeof requirements === "string") {
      requirementsArray = requirements.split("\n").map((r) => r.trim()).filter(Boolean);
    }

    const newJob = await Job.create({
      title: title.trim(),
      department: department ? department.trim() : "Engineering",
      location: location ? location.trim() : "Remote / Hybrid",
      type: type ? type.trim() : "Full-time",
      experience: experience ? experience.trim() : "3+ Years",
      salary: salary ? salary.trim() : "Competitive + Equity",
      description: description.trim(),
      responsibilities: responsibilitiesArray,
      requirements: requirementsArray,
      status: status || "Active",
      activeStatus: activeStatus !== undefined ? activeStatus : (status !== "Paused"),
      applicantsCount: 0,
      order: order ? Number(order) : 0,
    });

    const obj = newJob.toObject({ virtuals: true });

    return res.status(201).json({
      success: true,
      message: `Job opening "${newJob.title}" published successfully.`,
      job: {
        ...obj,
        id: obj._id,
      },
    });
  } catch (error) {
    console.error("Error creating job:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create job opening.",
      error: error.message,
    });
  }
};


export const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job opening not found.",
      });
    }

    const updates = { ...req.body };

    if (updates.responsibilities && typeof updates.responsibilities === "string") {
      updates.responsibilities = updates.responsibilities.split("\n").map((r) => r.trim()).filter(Boolean);
    }
    if (updates.requirements && typeof updates.requirements === "string") {
      updates.requirements = updates.requirements.split("\n").map((r) => r.trim()).filter(Boolean);
    }

    if (updates.status !== undefined) {
      updates.activeStatus = updates.status === "Active";
    } else if (updates.activeStatus !== undefined) {
      updates.status = updates.activeStatus ? "Active" : "Paused";
    }

    const updated = await Job.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    const obj = updated.toObject({ virtuals: true });

    return res.status(200).json({
      success: true,
      message: "Job opening updated successfully.",
      job: {
        ...obj,
        id: obj._id,
      },
    });
  } catch (error) {
    console.error("Error updating job:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update job opening.",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete job opening (Admin Only)
 * @route   DELETE /api/jobs/:id
 * @access  Private (adminAuth)
 */
export const deleteJob = async (req, res) => {
  try {
    const deleted = await Job.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Job opening not found.",
      });
    }

    // Cascade delete associated applicants
    await Applicant.deleteMany({ job: req.params.id });

    return res.status(200).json({
      success: true,
      message: "Job opening and associated applications deleted successfully.",
      id: req.params.id,
    });
  } catch (error) {
    console.error("Error deleting job:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete job opening.",
      error: error.message,
    });
  }
};


export const submitJobApplication = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please sign in or create an account to apply.",
      });
    }

    const jobId = req.params.id || req.body.jobId;
    const {
      fullName,
      email,
      phone,
      experience,
      currentCompany,
      portfolioUrl,
      coverNote,
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

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job opening not found.",
      });
    }

    const applicant = await Applicant.create({
      job: job._id,
      user: req.user._id,
      jobTitle: job.title,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: (phone || "").trim(),
      experience: (experience || "").trim(),
      currentCompany: (currentCompany || "").trim(),
      portfolioUrl: (portfolioUrl || "").trim(),
      coverNote: (coverNote || "").trim(),
      resumeUrl: (resumeUrl || "").trim(),
      resumeFileName: (resumeFileName || "").trim(),
      resumeKey: (resumeKey || "").trim(),
      stage: "Applied",
      rating: 4,
      notes: "",
    });

    
    await Job.findByIdAndUpdate(job._id, { $inc: { applicantsCount: 1 } });

    // Send confirmation to applicant & notification to configured admin + universal recipients
    sendJobApplicationEmails({ job, applicant }).catch((err) =>
      console.error("[Job Controller] Email notification error:", err.message)
    );

    return res.status(201).json({
      success: true,
      message: `Application submitted successfully for "${job.title}". Our talent team will review your profile!`,
      applicant: {
        id: applicant._id,
        user: applicant.user,
        jobId: job._id,
        jobTitle: job.title,
        fullName: applicant.fullName,
        email: applicant.email,
        stage: applicant.stage,
        resumeUrl: applicant.resumeUrl,
      },
    });
  } catch (error) {
    console.error("Error submitting job application:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit job application.",
      error: error.message,
    });
  }
};


export const getAllApplicants = async (req, res) => {
  try {
    const { jobId, stage, search } = req.query;
    const targetJobId = req.params.id || jobId;

    const query = {};
    if (targetJobId && targetJobId !== "all") {
      query.job = targetJobId;
    }
    if (stage && stage !== "All") {
      query.stage = stage;
    }
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { currentCompany: { $regex: search, $options: "i" } },
        { jobTitle: { $regex: search, $options: "i" } },
      ];
    }

    const applicants = await Applicant.find(query)
      .populate("job", "title department location type salary")
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    const normalized = await Promise.all(
      applicants.map(async (app) => {
        const obj = app.toObject({ virtuals: true });
        let signedResumeUrl = obj.resumeUrl;

        // If resumeKey exists, generate temporary signed GET URL
        if (obj.resumeKey) {
          try {
            signedResumeUrl = await generateGetSignedUrl(obj.resumeKey, 3600);
          } catch (e) {
            signedResumeUrl = obj.resumeUrl;
          }
        }

        return {
          ...obj,
          id: obj._id,
          appliedAt: obj.createdAt,
          jobId: obj.job?._id || obj.job,
          jobTitle: obj.job?.title || obj.jobTitle || "Engineering Position",
          signedResumeUrl,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: normalized.length,
      applicants: normalized,
    });
  } catch (error) {
    console.error("Error fetching applicants:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch applicants.",
      error: error.message,
    });
  }
};


export const updateApplicant = async (req, res) => {
  try {
    const { stage, rating, notes } = req.body;

    const updates = {};
    if (stage !== undefined) updates.stage = stage;
    if (rating !== undefined) updates.rating = Number(rating);
    if (notes !== undefined) updates.notes = notes;

    const updated = await Applicant.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Applicant record not found.",
      });
    }

    const obj = updated.toObject({ virtuals: true });

    return res.status(200).json({
      success: true,
      message: `Applicant stage updated to "${updated.stage}".`,
      applicant: {
        ...obj,
        id: obj._id,
        appliedAt: obj.createdAt,
      },
    });
  } catch (error) {
    console.error("Error updating applicant:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update applicant record.",
      error: error.message,
    });
  }
};


export const deleteApplicant = async (req, res) => {
  try {
    const deleted = await Applicant.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Applicant record not found.",
      });
    }

    
    if (deleted.job) {
      await Job.findByIdAndUpdate(deleted.job, {
        $inc: { applicantsCount: -1 },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Applicant record removed successfully.",
      id: req.params.id,
    });
  } catch (error) {
    console.error("Error deleting applicant:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete applicant record.",
      error: error.message,
    });
  }
};
