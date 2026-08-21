import { Service } from "../models/service.model.js";


export const getAllServices = async (req, res) => {
  try {
    const { category, search, includeInactive } = req.query;

    const query = {};

    if (!includeInactive) {
      query.isActive = true;
    }

    if (category && category !== "All") {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { techStack: { $regex: search, $options: "i" } },
      ];
    }

    const services = await Service.find(query).sort({ order: 1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch services.",
      error: error.message,
    });
  }
};


export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found.",
      });
    }

    return res.status(200).json({
      success: true,
      service,
    });
  } catch (error) {
    console.error("Error fetching service:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch service details.",
      error: error.message,
    });
  }
};


export const createService = async (req, res) => {
  try {
    const {
      title,
      category,
      badge,
      color,
      iconName,
      description,
      fullDescription,
      features,
      techStack,
      isActive,
      order,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Service title is required.",
      });
    }

    const existingService = await Service.findOne({ title: title.trim() });
    if (existingService) {
      return res.status(409).json({
        success: false,
        message: `Service "${title}" already exists.`,
      });
    }

    const serviceDesc = description?.trim() || `${title.trim()} engineering and technical consultation services.`;

    const newService = await Service.create({
      title: title.trim(),
      category: category || "Cloud",
      badge: badge || "Popular",
      color: color || "from-blue-500 to-cyan-400",
      iconName: iconName || "Cloud",
      description: serviceDesc,
      fullDescription: fullDescription || serviceDesc,
      features: Array.isArray(features) ? features : [],
      techStack: Array.isArray(techStack) ? techStack : [],
      isActive: isActive !== undefined ? isActive : true,
      order: order || 0,
    });

    return res.status(201).json({
      success: true,
      message: "Service practice created successfully.",
      service: newService,
    });
  } catch (error) {
    console.error("Error creating service:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create service.",
      error: error.message,
    });
  }
};


export const updateService = async (req, res) => {
  try {
    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedService) {
      return res.status(404).json({
        success: false,
        message: "Service not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Service updated successfully.",
      service: updatedService,
    });
  } catch (error) {
    console.error("Error updating service:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update service.",
      error: error.message,
    });
  }
};


export const deleteService = async (req, res) => {
  try {
    const deletedService = await Service.findByIdAndDelete(req.params.id);

    if (!deletedService) {
      return res.status(404).json({
        success: false,
        message: "Service not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Service deleted successfully.",
      id: req.params.id,
    });
  } catch (error) {
    console.error("Error deleting service:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete service.",
      error: error.message,
    });
  }
};
