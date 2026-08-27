import "dotenv/config";
import OutreachEmail from "../models/outreachEmail.model.js";
import { formatOutreachHtml } from "../utils/formatOutreachHtml.js";
import {
  resolveTransporterForEmail,
  getEnvDefaultEmail,
} from "./senderAccount.controller.js";

/**
 * Dynamically resolves the configured sender email from environment variables
 */
export const getDefaultSenderEmail = () => {
  return getEnvDefaultEmail();
};

/**
 * Controller: Send Direct Outreach Email (Gmail Style)
 * POST /api/outreach/send
 */
export const sendOutreachEmail = async (req, res) => {
  try {
    const {
      to,
      cc,
      bcc,
      subject,
      fromName,
      fromEmail: customFromEmail,
      htmlContent,
      emailFormat = "normal",
      attachments = [],
    } = req.body;

    // Normalize recipients
    const toRecipients = Array.isArray(to)
      ? to.map((e) => e.trim()).filter(Boolean)
      : typeof to === "string"
        ? to
          .split(/[,;\n]/)
          .map((e) => e.trim())
          .filter(Boolean)
        : [];

    if (toRecipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one recipient email address is required in 'To'.",
      });
    }

    if (!subject || !subject.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email subject line is required.",
      });
    }

    if (!htmlContent || !htmlContent.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email message body content cannot be empty.",
      });
    }

    const ccRecipients = Array.isArray(cc)
      ? cc.map((e) => e.trim()).filter(Boolean)
      : typeof cc === "string" && cc.trim()
        ? cc
          .split(/[,;\n]/)
          .map((e) => e.trim())
          .filter(Boolean)
        : [];

    const bccRecipients = Array.isArray(bcc)
      ? bcc.map((e) => e.trim()).filter(Boolean)
      : typeof bcc === "string" && bcc.trim()
        ? bcc
          .split(/[,;\n]/)
          .map((e) => e.trim())
          .filter(Boolean)
        : [];

    // Dynamically resolve SMTP transporter for the requested sender account
    const { transporter: activeTransporter, senderEmail: resolvedSenderEmail } =
      await resolveTransporterForEmail(customFromEmail);

    const senderDisplayName = (fromName || "Admire Softech").trim();
    const fromHeader = `"${senderDisplayName}" <${resolvedSenderEmail}>`;

    // Process user-uploaded attachments AND inline base64 images from HTML editor
    const nodemailerAttachments = [];
    const savedAttachmentMeta = [];
    let processedHtmlContent = htmlContent;

    // 1. Extract inline base64 images inside editor HTML and convert to CID attachments (compatible with all email clients)
    const base64ImgRegex = /<img[^>]+src=["'](data:image\/(png|jpeg|jpg|webp|gif);base64,([^"']+))["'][^>]*>/gi;
    let imgMatch;
    let imgCounter = 1;

    // Replace all base64 data URIs in HTML with clean cid: references
    processedHtmlContent = processedHtmlContent.replace(base64ImgRegex, (match, fullDataUri, imgType, base64Data) => {
      const cid = `inline_img_${Date.now()}_${imgCounter++}`;
      const ext = imgType === "jpeg" ? "jpg" : imgType;
      const filename = `image_${imgCounter}.${ext}`;

      nodemailerAttachments.push({
        filename,
        content: Buffer.from(base64Data, "base64"),
        contentType: `image/${imgType}`,
        cid, // Content-ID for inline email rendering
      });

      savedAttachmentMeta.push({
        filename,
        contentType: `image/${imgType}`,
        size: Buffer.byteLength(base64Data, "base64"),
      });

      return match.replace(fullDataUri, `cid:${cid}`);
    });

    // 2. Process external attached files
    if (Array.isArray(attachments) && attachments.length > 0) {
      for (const att of attachments) {
        if (att && att.filename && att.content) {
          let base64Data = att.content;
          if (base64Data.includes(";base64,")) {
            base64Data = base64Data.split(";base64,")[1];
          }

          nodemailerAttachments.push({
            filename: att.filename,
            content: Buffer.from(base64Data, "base64"),
            contentType: att.contentType,
          });

          savedAttachmentMeta.push({
            filename: att.filename,
            contentType: att.contentType,
            size: att.size || Buffer.byteLength(base64Data, "base64"),
          });
        }
      }
    }

    // Format HTML based on chosen format (normal direct vs branded template)
    const activeFormat = emailFormat === "template" ? "template" : "normal";
    const styledHtml = formatOutreachHtml({
      htmlContent: processedHtmlContent,
      subject: subject.trim(),
      fromName: senderDisplayName,
      format: activeFormat,
    });

    // Extract clean plain text for multipart/alternative anti-spam compliance
    const plainText = (htmlContent || "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const mailOptions = {
      from: fromHeader,
      to: toRecipients.join(", "),
      subject: subject.trim(),
      html: styledHtml,
      text: plainText,
      replyTo: resolvedSenderEmail,
      attachments: nodemailerAttachments,
    };

    if (ccRecipients.length > 0) {
      mailOptions.cc = ccRecipients.join(", ");
    }
    if (bccRecipients.length > 0) {
      mailOptions.bcc = bccRecipients.join(", ");
    }

    let sendResult;
    let status = "SENT";
    let errorMessage = null;

    try {
      sendResult = await activeTransporter.sendMail(mailOptions);
    } catch (mailError) {
      console.error("[OutreachController.sendOutreachEmail] Send Error:", mailError);
      status = "FAILED";
      errorMessage = mailError.message || "Failed to deliver email through SMTP.";
    }

    // Save record to DB
    const outreachRecord = await OutreachEmail.create({
      to: toRecipients,
      cc: ccRecipients,
      bcc: bccRecipients,
      fromName: senderDisplayName,
      fromEmail: resolvedSenderEmail,
      subject: subject.trim(),
      htmlContent,
      emailFormat: activeFormat,
      attachments: savedAttachmentMeta,
      status,
      errorMessage,
    });

    if (status === "FAILED") {
      return res.status(500).json({
        success: false,
        message: `Failed to send email: ${errorMessage}`,
        record: outreachRecord,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Email successfully dispatched to ${toRecipients.join(", ")}!`,
      messageId: sendResult?.messageId,
      record: outreachRecord,
    });
  } catch (error) {
    console.error("[OutreachController.sendOutreachEmail] Unexpected Exception:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while processing outreach email.",
      error: error.message,
    });
  }
};

/**
 * Controller: Get Outreach Email History & Logs
 * GET /api/outreach/history
 */
export const getOutreachHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 30;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      OutreachEmail.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      OutreachEmail.countDocuments(),
    ]);

    const defaultSender = getDefaultSenderEmail();

    return res.status(200).json({
      success: true,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      defaultSender,
      logs,
    });
  } catch (error) {
    console.error("[OutreachController.getOutreachHistory] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch outreach history.",
      error: error.message,
    });
  }
};

/**
 * Controller: Delete an Outreach Log
 * DELETE /api/outreach/history/:id
 */
export const deleteOutreachLog = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await OutreachEmail.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Outreach email record not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Outreach record deleted successfully.",
      id,
    });
  } catch (error) {
    console.error("[OutreachController.deleteOutreachLog] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete record.",
      error: error.message,
    });
  }
};
