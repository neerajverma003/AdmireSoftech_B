import { CaseStudy } from "../models/caseStudy.model.js";

const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const getAllCaseStudies = async (req, res) => {
  try {
    const {
      category,
      search,
      isPublished,
      isFeatured,
      sort = "createdAt",
      order = "desc",
      page,
      limit,
    } = req.query;

    const query = {};

    
    if (isPublished !== undefined) {
      query.isPublished = isPublished === "true";
    }

    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured === "true";
    }

    if (category && category !== "All") {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { summary: { $regex: search, $options: "i" } },
        { client: { $regex: search, $options: "i" } },
        { techStack: { $regex: search, $options: "i" } },
      ];
    }

    const sortObj = {};
    if (sort === "createdAt") {
      sortObj.createdAt = order === "asc" ? 1 : -1;
    } else {
      sortObj[sort] = order === "desc" ? -1 : 1;
      sortObj.createdAt = -1;
    }

    let dbQuery = CaseStudy.find(query).sort(sortObj);

    if (page && limit) {
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 12;
      const skip = (pageNum - 1) * limitNum;
      dbQuery = dbQuery.skip(skip).limit(limitNum);
    }

    const [caseStudies, total] = await Promise.all([
      dbQuery.exec(),
      CaseStudy.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: caseStudies,
      total,
      count: caseStudies.length,
    });
  } catch (error) {
    console.error("Error fetching case studies:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch case studies",
      error: error.message,
    });
  }
};


export const getCaseStudyByIdOrSlug = async (req, res) => {
  try {
    const { id } = req.params;
    let caseStudy = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      caseStudy = await CaseStudy.findById(id);
    }

    if (!caseStudy) {
      caseStudy = await CaseStudy.findOne({ slug: id });
    }

    if (!caseStudy) {
      return res.status(404).json({
        success: false,
        message: "Case study not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: caseStudy,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch case study details",
      error: error.message,
    });
  }
};


export const createCaseStudy = async (req, res) => {
  try {
    const {
      title,
      client,
      category,
      badge,
      thumbnail,
      summary,
      challenge,
      solution,
      impactMetrics,
      techStack,
      clientQuote,
      isFeatured,
      isPublished,
      order,
    } = req.body;

    if (!title || !client || !category || !thumbnail || !summary || !challenge || !solution) {
      return res.status(400).json({
        success: false,
        message: "All required fields (title, client, category, thumbnail, summary, challenge, solution) must be provided.",
      });
    }

    let slug = generateSlug(title);
    const existingSlug = await CaseStudy.findOne({ slug });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const newCaseStudy = await CaseStudy.create({
      title: title.trim(),
      slug,
      client: client.trim(),
      category,
      badge: badge || "Featured Impact",
      thumbnail: thumbnail.trim(),
      summary: summary.trim(),
      challenge: challenge.trim(),
      solution: solution.trim(),
      impactMetrics: Array.isArray(impactMetrics) ? impactMetrics : [],
      techStack: Array.isArray(techStack) ? techStack : [],
      clientQuote: clientQuote || {},
      isFeatured: isFeatured !== undefined ? isFeatured : true,
      isPublished: isPublished !== undefined ? isPublished : true,
      order: order !== undefined ? Number(order) : 0,
    });

    return res.status(201).json({
      success: true,
      message: "Case study created successfully",
      data: newCaseStudy,
    });
  } catch (error) {
    console.error("Create Case Study Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create case study",
      error: error.message,
    });
  }
};


export const updateCaseStudy = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.title) {
      updateData.title = updateData.title.trim();
      const existing = await CaseStudy.findById(id);
      if (existing && existing.title !== updateData.title) {
        let newSlug = generateSlug(updateData.title);
        const slugExists = await CaseStudy.findOne({ slug: newSlug, _id: { $ne: id } });
        if (slugExists) {
          newSlug = `${newSlug}-${Date.now().toString().slice(-4)}`;
        }
        updateData.slug = newSlug;
      }
    }

    const updatedCaseStudy = await CaseStudy.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedCaseStudy) {
      return res.status(404).json({
        success: false,
        message: "Case study not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Case study updated successfully",
      data: updatedCaseStudy,
    });
  } catch (error) {
    console.error("Update Case Study Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update case study",
      error: error.message,
    });
  }
};


export const deleteCaseStudy = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await CaseStudy.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Case study not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Case study deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete case study",
      error: error.message,
    });
  }
};


export const toggleCaseStudyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { field = "isPublished" } = req.body;

    const caseStudy = await CaseStudy.findById(id);
    if (!caseStudy) {
      return res.status(404).json({
        success: false,
        message: "Case study not found",
      });
    }

    caseStudy[field] = !caseStudy[field];
    await caseStudy.save();

    return res.status(200).json({
      success: true,
      message: `Case study ${field} updated to ${caseStudy[field]}`,
      data: caseStudy,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to toggle case study status",
      error: error.message,
    });
  }
};
