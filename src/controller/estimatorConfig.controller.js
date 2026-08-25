import EstimatorConfig from "../models/estimatorConfig.model.js";

/**
 * Get or automatically initialize default Estimator Configuration
 */
export const getEstimatorConfig = async (req, res) => {
  try {
    let config = await EstimatorConfig.findOne();

    // If no config found in DB, create initial default instance
    if (!config) {
      config = await EstimatorConfig.create({});
    }

    return res.status(200).json({
      success: true,
      config,
    });
  } catch (error) {
    console.error("[EstimatorConfig Controller] Error fetching config:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch estimator configuration",
      error: error.message,
    });
  }
};

/**
 * Update Estimator Configuration (Admin Only)
 */
export const updateEstimatorConfig = async (req, res) => {
  try {
    const {
      header,
      services,
      scopes,
      timelines,
      contactModalConfig,
      fieldSettings,
    } = req.body;

    let config = await EstimatorConfig.findOne();

    if (!config) {
      config = new EstimatorConfig();
    }

    if (header) {
      config.header = { ...config.header, ...header };
    }

    if (Array.isArray(services)) {
      config.services = services.map((s, idx) => ({
        id: s.id || `srv-${idx + 1}`,
        title: s.title || "Custom Service",
        desc: s.desc || "",
        iconName: s.iconName || "Code2",
        isEnabled: s.isEnabled !== undefined ? s.isEnabled : true,
        order: s.order !== undefined ? s.order : idx + 1,
      }));
    }

    if (Array.isArray(scopes)) {
      config.scopes = scopes.map((sc, idx) => ({
        id: sc.id || `scope-${idx + 1}`,
        title: sc.title || "Custom Scope",
        subtitle: sc.subtitle || "",
        estPrice: sc.estPrice || "Contact for Quote",
        minPrice: sc.minPrice !== undefined ? Number(sc.minPrice) : 0,
        maxPrice: sc.maxPrice !== undefined ? Number(sc.maxPrice) : 0,
        currency: sc.currency || "INR",
        badge: sc.badge || "",
        isEnabled: sc.isEnabled !== undefined ? sc.isEnabled : true,
        order: sc.order !== undefined ? sc.order : idx + 1,
      }));
    }

    if (Array.isArray(timelines)) {
      config.timelines = timelines.map((t, idx) => ({
        id: t.id || `time-${idx + 1}`,
        label: t.label || "Custom Timeline",
        note: t.note || "",
        isEnabled: t.isEnabled !== undefined ? t.isEnabled : true,
        order: t.order !== undefined ? t.order : idx + 1,
      }));
    }

    if (contactModalConfig) {
      config.contactModalConfig = {
        title: contactModalConfig.title || config.contactModalConfig.title,
        subtitle: contactModalConfig.subtitle || config.contactModalConfig.subtitle,
        badge: contactModalConfig.badge || config.contactModalConfig.badge,
        budgetRanges: Array.isArray(contactModalConfig.budgetRanges)
          ? contactModalConfig.budgetRanges
          : config.contactModalConfig.budgetRanges,
        servicesList: Array.isArray(contactModalConfig.servicesList)
          ? contactModalConfig.servicesList
          : config.contactModalConfig.servicesList,
      };
    }

    if (fieldSettings) {
      config.fieldSettings = { ...config.fieldSettings, ...fieldSettings };
    }

    await config.save();

    return res.status(200).json({
      success: true,
      message: "Estimator configuration updated successfully",
      config,
    });
  } catch (error) {
    console.error("[EstimatorConfig Controller] Error updating config:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update estimator configuration",
      error: error.message,
    });
  }
};

/**
 * Reset Estimator Configuration to System Defaults (Admin Only)
 */
export const resetEstimatorConfig = async (req, res) => {
  try {
    await EstimatorConfig.deleteMany({});
    const newConfig = await EstimatorConfig.create({});

    return res.status(200).json({
      success: true,
      message: "Estimator configuration reset to factory defaults",
      config: newConfig,
    });
  } catch (error) {
    console.error("[EstimatorConfig Controller] Error resetting config:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reset estimator configuration",
      error: error.message,
    });
  }
};
