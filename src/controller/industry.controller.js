import { Industry } from "../models/industry.model.js";

const DEFAULT_SEED_INDUSTRIES = [
  {
    title: "Web Development & SaaS",
    category: "Engineering",
    icon: "Code2",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80",
    description: "High-performance React/Next.js web applications, responsive dashboards, and multi-tenant SaaS platforms.",
    badge: "Web Dev",
    metrics: "99.9% Uptime",
    order: 1,
    isActive: true,
  },
  {
    title: "Mobile App Development",
    category: "Mobile",
    icon: "Smartphone",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80",
    description: "Native and cross-platform iOS & Android mobile applications built with React Native and Flutter.",
    badge: "App Dev",
    metrics: "4.9★ App Store",
    order: 2,
    isActive: true,
  },
  {
    title: "Cloud & DevOps Solutions",
    category: "Infrastructure",
    icon: "Cloud",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
    description: "AWS/Azure multi-cloud architecture, zero-downtime CI/CD pipelines, and scalable Kubernetes clusters.",
    badge: "Cloud & DevOps",
    metrics: "60% Faster Deploys",
    order: 3,
    isActive: true,
  },
  {
    title: "Generative AI & LLM Systems",
    category: "Artificial Intelligence",
    icon: "Cpu",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
    description: "Enterprise RAG pipelines, autonomous AI agent workflows, and private open-source model fine-tuning.",
    badge: "AI / ML",
    metrics: "10x Productivity",
    order: 4,
    isActive: true,
  },
  {
    title: "FinTech & Digital Payments",
    category: "FinTech",
    icon: "TrendingUp",
    image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80",
    description: "PCI-DSS certified payment gateways, automated multi-currency ledgers, and real-time fraud detection.",
    badge: "FinTech",
    metrics: "$2.5B+ Processed",
    order: 5,
    isActive: true,
  },
  {
    title: "Healthcare & Life Sciences",
    category: "Healthcare",
    icon: "Activity",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80",
    description: "HIPAA-compliant telemedicine portals, electronic health records (EHR), and medical diagnostics AI.",
    badge: "HealthTech",
    metrics: "100% HIPAA Compliant",
    order: 6,
    isActive: true,
  },
  {
    title: "Digital Marketing & Growth",
    category: "Marketing",
    icon: "BarChart3",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
    description: "High-converting headless commerce, programmatic AdTech automation, and SEO growth engines.",
    badge: "Marketing",
    metrics: "3.8x ROI Lift",
    order: 7,
    isActive: true,
  },
  {
    title: "Blockchain & Web3 Startups",
    category: "Web3",
    icon: "ShieldCheck",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=600&q=80",
    description: "Audited smart contracts, decentralized applications (dApps), and non-custodial crypto wallet integrations.",
    badge: "Blockchain",
    metrics: "Zero Vulnerabilities",
    order: 8,
    isActive: true,
  },
  {
    title: "EdTech & E-Learning Platforms",
    category: "Education",
    icon: "GraduationCap",
    image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=600&q=80",
    description: "Interactive virtual classrooms, adaptive AI learning paths, and LMS enterprise integrations.",
    badge: "EdTech",
    metrics: "500k+ Learners",
    order: 9,
    isActive: true,
  },
  {
    title: "Logistics & Supply Chain",
    category: "Logistics",
    icon: "Truck",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80",
    description: "Real-time GPS/IoT fleet tracking, automated route dispatching, and predictive inventory warehousing.",
    badge: "Logistics",
    metrics: "35% Route Efficiency",
    order: 10,
    isActive: true,
  },
  {
    title: "Real Estate & PropTech",
    category: "Real Estate",
    icon: "Building2",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80",
    description: "3D WebGL virtual property tours, automated tenant lease portals, and MLS/IDX database sync.",
    badge: "PropTech",
    metrics: "4.9★ Satisfaction",
    order: 11,
    isActive: true,
  },
  {
    title: "Cybersecurity & Enterprise Defense",
    category: "Security",
    icon: "Lock",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80",
    description: "Zero-trust network architecture, penetration testing, and automated SOC2 / ISO 27001 readiness.",
    badge: "Cybersecurity",
    metrics: "SOC2 Type II",
    order: 12,
    isActive: true,
  },
];


export const getAllIndustries = async (req, res) => {
  try {
    const { category, search, includeInactive } = req.query;

    const count = await Industry.countDocuments();
    if (count === 0) {
      await Industry.insertMany(DEFAULT_SEED_INDUSTRIES);
    }

    const query = {};

    if (!includeInactive || includeInactive === "false") {
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
        { badge: { $regex: search, $options: "i" } },
      ];
    }

    const industries = await Industry.find(query).sort({ order: 1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: industries.length,
      industries,
    });
  } catch (error) {
    console.error("Error fetching industries:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch industries.",
      error: error.message,
    });
  }
};


export const getIndustryById = async (req, res) => {
  try {
    const industry = await Industry.findById(req.params.id);

    if (!industry) {
      return res.status(404).json({
        success: false,
        message: "Industry vertical not found.",
      });
    }

    return res.status(200).json({
      success: true,
      industry,
    });
  } catch (error) {
    console.error("Error fetching industry by ID:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch industry details.",
      error: error.message,
    });
  }
};


export const createIndustry = async (req, res) => {
  try {
    const { title, category, badge, icon, image, description, metrics, isActive, order } = req.body;

    if (!title || !category || !image || !description) {
      return res.status(400).json({
        success: false,
        message: "Title, category, cover image, and description are required.",
      });
    }

    const existing = await Industry.findOne({ title: title.trim() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `An industry named "${title}" already exists.`,
      });
    }

    const newIndustry = await Industry.create({
      title: title.trim(),
      category: category.trim(),
      badge: badge ? badge.trim() : "Vertical",
      icon: icon ? icon.trim() : "Code2",
      image: image.trim(),
      description: description.trim(),
      metrics: metrics ? metrics.trim() : "",
      isActive: isActive !== undefined ? isActive : true,
      order: Number(order) || 0,
    });

    return res.status(201).json({
      success: true,
      message: "Industry vertical created successfully.",
      industry: newIndustry,
    });
  } catch (error) {
    console.error("Error creating industry:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create industry vertical.",
      error: error.message,
    });
  }
};


export const updateIndustry = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.title) {
      updates.title = updates.title.trim();
      const duplicate = await Industry.findOne({
        title: updates.title,
        _id: { $ne: id },
      });
      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: `Another industry named "${updates.title}" already exists.`,
        });
      }
    }

    if (updates.category) updates.category = updates.category.trim();
    if (updates.badge) updates.badge = updates.badge.trim();
    if (updates.icon) updates.icon = updates.icon.trim();
    if (updates.image) updates.image = updates.image.trim();
    if (updates.description) updates.description = updates.description.trim();
    if (updates.metrics) updates.metrics = updates.metrics.trim();
    if (updates.order !== undefined) updates.order = Number(updates.order);

    const updatedIndustry = await Industry.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedIndustry) {
      return res.status(404).json({
        success: false,
        message: "Industry vertical not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Industry vertical updated successfully.",
      industry: updatedIndustry,
    });
  } catch (error) {
    console.error("Error updating industry:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update industry vertical.",
      error: error.message,
    });
  }
};


export const deleteIndustry = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Industry.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Industry vertical not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Industry vertical deleted successfully.",
      id,
    });
  } catch (error) {
    console.error("Error deleting industry:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete industry vertical.",
      error: error.message,
    });
  }
};
