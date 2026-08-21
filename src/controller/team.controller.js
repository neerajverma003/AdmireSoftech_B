import { Team } from "../models/team.model.js";

export const getAllTeamMembers = async (req, res) => {
  try {
    const { department, isFeatured, search, includeInactive } = req.query;

    const query = {};

    if (!includeInactive) {
      query.isActive = true;
    }

    if (department && department !== "ALL" && department !== "All") {
      query.department = department;
    }

    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured === "true" || isFeatured === true;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { role: { $regex: search, $options: "i" } },
        { department: { $regex: search, $options: "i" } },
        { bio: { $regex: search, $options: "i" } },
        { specialties: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const members = await Team.find(query).sort({ order: 1, createdAt: 1 });

    const normalized = members.map((m) => {
      const obj = m.toObject ? m.toObject({ virtuals: true }) : m;
      return {
        ...obj,
        id: obj._id,
      };
    });

    return res.status(200).json({
      success: true,
      count: normalized.length,
      team: normalized,
    });
  } catch (error) {
    console.error("Error fetching team members:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch team members.",
      error: error.message,
    });
  }
};

export const getTeamMemberById = async (req, res) => {
  try {
    const member = await Team.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Team member not found.",
      });
    }

    const obj = member.toObject({ virtuals: true });

    return res.status(200).json({
      success: true,
      member: {
        ...obj,
        id: obj._id,
      },
    });
  } catch (error) {
    console.error("Error fetching team member:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch team member.",
      error: error.message,
    });
  }
};

export const createTeamMember = async (req, res) => {
  try {
    const {
      name,
      role,
      department,
      experience,
      bio,
      specialties,
      avatarImg,
      social,
      isFeatured,
      order,
      isActive,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Team member name is required.",
      });
    }

    if (!role || !role.trim()) {
      return res.status(400).json({
        success: false,
        message: "Team member role/designation is required.",
      });
    }

    let parsedSpecialties = [];
    if (Array.isArray(specialties)) {
      parsedSpecialties = specialties.filter(Boolean);
    } else if (typeof specialties === "string" && specialties.trim()) {
      parsedSpecialties = specialties
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    const newMember = await Team.create({
      name: name.trim(),
      role: role.trim(),
      department: (department || "Engineering").trim(),
      experience: (experience || "5+ Years Exp").trim(),
      bio: (bio || "").trim(),
      specialties: parsedSpecialties,
      avatarImg: (avatarImg || "").trim(),
      social: {
        linkedin: (social?.linkedin || "").trim(),
        github: (social?.github || "").trim(),
        twitter: (social?.twitter || "").trim(),
      },
      isFeatured: isFeatured !== undefined ? isFeatured : false,
      order: order ? Number(order) : 0,
      isActive: isActive !== undefined ? isActive : true,
    });

    const obj = newMember.toObject({ virtuals: true });

    return res.status(201).json({
      success: true,
      message: "Team member created successfully.",
      member: {
        ...obj,
        id: obj._id,
      },
    });
  } catch (error) {
    console.error("Error creating team member:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create team member.",
      error: error.message,
    });
  }
};

export const updateTeamMember = async (req, res) => {
  try {
    const updatePayload = { ...req.body };

    if (updatePayload.specialties && typeof updatePayload.specialties === "string") {
      updatePayload.specialties = updatePayload.specialties
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    const updated = await Team.findByIdAndUpdate(
      req.params.id,
      { $set: updatePayload },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Team member not found.",
      });
    }

    const obj = updated.toObject({ virtuals: true });

    return res.status(200).json({
      success: true,
      message: "Team member updated successfully.",
      member: {
        ...obj,
        id: obj._id,
      },
    });
  } catch (error) {
    console.error("Error updating team member:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update team member.",
      error: error.message,
    });
  }
};

export const deleteTeamMember = async (req, res) => {
  try {
    const deleted = await Team.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Team member not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Team member deleted successfully.",
      id: req.params.id,
    });
  } catch (error) {
    console.error("Error deleting team member:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete team member.",
      error: error.message,
    });
  }
};
