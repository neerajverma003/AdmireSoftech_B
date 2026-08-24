import Settings from "../models/settings.model.js";

/**
 * GET /api/settings
 * Fetch company settings, social links & global metadata (public)
 */
export const getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({});
        }

        res.status(200).json({
            success: true,
            settings,
        });
    } catch (error) {
        console.error("[SettingsController.getSettings] Error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to load company settings.",
            error: error.message,
        });
    }
};

/**
 * PUT /api/settings
 * Update company settings & social media links (Admin only)
 */
export const updateSettings = async (req, res) => {
    try {
        const {
            companyName,
            tagline,
            contactEmail,
            supportEmail,
            contactPhone,
            whatsappNumber,
            headquarters,
            workingHours,
            websiteUrl,
            frontendUrl,
            apiBaseUrl,
            socialLinks,
            stats,
        } = req.body;

        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings({});
        }

        if (companyName !== undefined) settings.companyName = companyName;
        if (tagline !== undefined) settings.tagline = tagline;
        if (contactEmail !== undefined) settings.contactEmail = contactEmail;
        if (supportEmail !== undefined) settings.supportEmail = supportEmail;
        if (contactPhone !== undefined) settings.contactPhone = contactPhone;
        if (whatsappNumber !== undefined) settings.whatsappNumber = whatsappNumber;
        if (headquarters !== undefined) settings.headquarters = headquarters;
        if (workingHours !== undefined) settings.workingHours = workingHours;
        if (websiteUrl !== undefined) settings.websiteUrl = websiteUrl;
        if (frontendUrl !== undefined) settings.frontendUrl = frontendUrl;
        if (apiBaseUrl !== undefined) settings.apiBaseUrl = apiBaseUrl;

        if (socialLinks && typeof socialLinks === "object") {
            settings.socialLinks = {
                linkedin: socialLinks.linkedin !== undefined ? socialLinks.linkedin : settings.socialLinks?.linkedin,
                twitter: socialLinks.twitter !== undefined ? socialLinks.twitter : settings.socialLinks?.twitter,
                github: socialLinks.github !== undefined ? socialLinks.github : settings.socialLinks?.github,
                youtube: socialLinks.youtube !== undefined ? socialLinks.youtube : settings.socialLinks?.youtube,
                instagram: socialLinks.instagram !== undefined ? socialLinks.instagram : settings.socialLinks?.instagram,
                facebook: socialLinks.facebook !== undefined ? socialLinks.facebook : settings.socialLinks?.facebook,
                discord: socialLinks.discord !== undefined ? socialLinks.discord : settings.socialLinks?.discord,
            };
        }

        if (stats && typeof stats === "object") {
            settings.stats = {
                totalProjects: stats.totalProjects !== undefined ? stats.totalProjects : settings.stats?.totalProjects,
                uptimeSLA: stats.uptimeSLA !== undefined ? stats.uptimeSLA : settings.stats?.uptimeSLA,
                clientSatisfaction: stats.clientSatisfaction !== undefined ? stats.clientSatisfaction : settings.stats?.clientSatisfaction,
                globalEnterprises: stats.globalEnterprises !== undefined ? stats.globalEnterprises : settings.stats?.globalEnterprises,
            };
        }

        const saved = await settings.save();

        res.status(200).json({
            success: true,
            message: "Company settings and social links updated successfully.",
            settings: saved,
        });
    } catch (error) {
        console.error("[SettingsController.updateSettings] Error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to update company settings.",
            error: error.message,
        });
    }
};
