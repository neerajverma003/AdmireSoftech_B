import { generateCaptcha } from "../services/captchaService.js";

/**
 * @desc Generate security CAPTCHA challenge for lead forms
 * @route GET /api/captcha
 * @access Public
 */
export const getCaptchaChallenge = async (req, res) => {
  try {
    const { captchaToken, captchaSvg } = generateCaptcha();

    return res.status(200).json({
      success: true,
      captchaToken,
      captchaSvg,
    });
  } catch (error) {
    console.error("[Captcha Controller] Error generating captcha:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate security verification challenge.",
    });
  }
};
