import { transporter } from "../lib/nodemailer.js";
import { NotificationRecipient } from "../models/notificationRecipient.model.js";

const getFromHeader = () => {
    const senderEmail = (process.env.EMAIL_USER || process.env.EMAIL || "notifications@admiresoftech.com")?.trim();
    const senderName = "Admire Softech";
    return `"${senderName}" <${senderEmail}>`;
};

/**
 * Fetch all active recipient emails configured for a specific module
 * PLUS any active recipients configured for UNIVERSAL_NOTIFICATION
 */
export const getActiveRecipientsForModule = async (moduleName) => {
    try {
        const recipients = await NotificationRecipient.find({
            isActive: true,
            module: { $in: [moduleName, "UNIVERSAL_NOTIFICATION"] },
        });

        const emails = recipients
            .map((r) => r.email?.trim().toLowerCase())
            .filter(Boolean);

        // Return unique email array
        return [...new Set(emails)];
    } catch (error) {
        console.error(`[EmailService] Error fetching recipients for module ${moduleName}:`, error.message);
        return [];
    }
};

/**
 * Helper to render robust, non-overlapping field tables in emails
 */
const renderFieldTable = (fields) => {
    const validFields = fields.filter((f) => f && f.value !== undefined && f.value !== null && f.value !== "");
    if (validFields.length === 0) return "";

    const rows = validFields
        .map(
            (f, i) => `
      <tr>
        <td width="35%" style="padding: 10px 14px; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; ${i < validFields.length - 1 ? "border-bottom: 1px solid #141f36;" : ""
                } vertical-align: top; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          ${f.label}
        </td>
        <td width="65%" style="padding: 10px 14px; font-size: 13px; color: #f1f5f9; ${i < validFields.length - 1 ? "border-bottom: 1px solid #141f36;" : ""
                } word-break: break-word; vertical-align: top; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          ${f.value}
        </td>
      </tr>
    `
        )
        .join("");

    return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0; background-color: #070d1e; border: 1px solid #1e293b; border-radius: 12px; border-collapse: collapse; width: 100%;">
      ${rows}
    </table>
  `;
};

/**
 * Base email layout wrapper with 100% inline CSS and robust table structure
 */
const renderEmailLayout = ({ title, preheader, bodyContent, ctaText, ctaLink }) => {
    return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #060b19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  <!-- Preheader -->
  <div style="display: none; font-size: 1px; color: #060b19; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${preheader || title}
  </div>

  <!-- Outer Full Width Background -->
  <table width="100%" bgcolor="#060b19" cellpadding="0" cellspacing="0" border="0" style="width: 100%; background-color: #060b19; margin: 0; padding: 24px 10px;">
    <tr>
      <td align="center" style="padding: 0;">
        
        <!-- Centered Main Email Card -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 580px; width: 100%; background-color: #0b1426; border: 1px solid #1e293b; border-radius: 16px; margin: 0 auto;">
          
          <!-- Card Header with Centered Logo -->
          <tr>
            <td align="center" style="padding: 32px 20px 24px 20px; background-color: #070d1e; border-bottom: 1px solid #1e293b; text-align: center; border-radius: 16px 16px 0 0;">
              <table align="center" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 16px auto;">
                <tr>
                  <td align="center" style="padding: 0;">
                    <img
                      src="https://raw.githubusercontent.com/neerajverma003/AdmireSoftech_Admin/main/src/assets/images/AdmireSoftech_logo.png"
                      alt="Admire Softech"
                      width="160"
                      style="display: block; width: 160px; max-width: 160px; height: auto; border: 0; outline: none; margin: 0 auto;"
                    />
                  </td>
                </tr>
              </table>
              <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: -0.3px; line-height: 1.3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                ${title}
              </h1>
            </td>
          </tr>

          <!-- Card Content Body -->
          <tr>
            <td style="padding: 28px 24px; background-color: #0b1426; color: #cbd5e1; font-size: 14px; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              ${bodyContent}

              ${ctaText && ctaLink
            ? `
              <table align="center" cellpadding="0" cellspacing="0" border="0" style="margin: 28px auto 8px auto;">
                <tr>
                  <td align="center" style="background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%); background-color: #00f2fe; border-radius: 10px; padding: 12px 28px;">
                    <a href="${ctaLink}" target="_blank" style="color: #060b19; font-size: 13px; font-weight: 800; text-decoration: none; display: inline-block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      ${ctaText}
                    </a>
                  </td>
                </tr>
              </table>
              `
            : ""
        }
            </td>
          </tr>

          <!-- Card Footer -->
          <tr>
            <td align="center" style="padding: 20px 24px; background-color: #070d1e; border-top: 1px solid #1e293b; text-align: center; font-size: 12px; color: #64748b; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; border-radius: 0 0 16px 16px;">
              <p style="margin: 0 0 4px 0; color: #94a3b8;">&copy; ${new Date().getFullYear()} Admire Softech. All rights reserved.</p>
              <p style="margin: 0; color: #475569; font-size: 11px;">Enterprise Software Development & Digital Transformation</p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
`;
};

/**
 * Generic Mail Sender with Error Catching & credential validation
 */
const sendMailSafe = async ({ to, subject, html, text }) => {
    if (!to || (Array.isArray(to) && to.length === 0)) {
        return false;
    }

    const recipientList = Array.isArray(to) ? to.join(", ") : to;
    const emailUser = (process.env.EMAIL_USER || process.env.EMAIL)?.trim();
    const emailPass = process.env.EMAIL_PASS?.trim();

    if (!emailUser || !emailPass) {
        console.error(
            `\n⚠️ [EmailService ERROR] Cannot send email to [${recipientList}]: EMAIL_USER and/or EMAIL_PASS are not configured in AdmireSoftech_B/.env!\n`
        );
        return false;
    }

    try {
        const from = getFromHeader();
        const info = await transporter.sendMail({
            from,
            to: recipientList,
            subject,
            text: text || subject,
            html,
        });
        console.log(`[EmailService] Email sent successfully to [${recipientList}] - MessageId: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error(`[EmailService] Failed to send email to [${recipientList}]:`, error.message);
        return false;
    }
};

// =========================================================================
// 1. CONTACT FORM EMAILS
// =========================================================================
export const sendContactEmails = async ({ inquiry }) => {
    const { fullName, name, email, phone, company, subject, service, budget, timeline, message } = inquiry;
    const clientName = fullName || name || "Valued Client";

    // A. User Confirmation Email
    if (email) {
        const fields = [
            { label: "Subject", value: subject || "General Inquiry" },
            { label: "Service Area", value: service || "General" },
            { label: "Your Message", value: message },
        ];

        const userHtml = renderEmailLayout({
            title: "We Received Your Message",
            preheader: "Thank you for contacting Admire Softech. Our engineering team will reply shortly.",
            bodyContent: `
        <p style="margin: 0 0 14px 0; color: #cbd5e1;">Hello <strong>${clientName}</strong>,</p>
        <p style="margin: 0 0 16px 0; color: #94a3b8;">Thank you for reaching out to <strong>Admire Softech</strong>. We have received your inquiry regarding <strong>${service || "Engineering Services"}</strong> and our specialists will review it and get in touch within 24 hours.</p>
        ${renderFieldTable(fields)}
        <p style="margin: 16px 0 0 0; color: #94a3b8;">If you have any urgent queries, feel free to reply directly to this email.</p>
      `,
        });

        sendMailSafe({
            to: email,
            subject: "Thank You for Contacting Admire Softech - We Received Your Inquiry",
            html: userHtml,
        });
    }

    // B. Admin & Universal Notification
    const adminRecipients = await getActiveRecipientsForModule("CONTACT");
    if (adminRecipients.length > 0) {
        const fields = [
            { label: "Full Name", value: `<strong>${clientName}</strong>` },
            { label: "Email", value: `<a href="mailto:${email}" style="color: #00f2fe; text-decoration: none;">${email}</a>` },
            { label: "Phone", value: phone || "Not provided" },
            { label: "Company", value: company || "Individual" },
            { label: "Service", value: service || "General" },
            { label: "Budget / Timeline", value: `${budget || "Flexible"} &middot; ${timeline || "Not specified"}` },
            { label: "Message", value: message },
        ];

        const adminHtml = renderEmailLayout({
            title: "New Contact Lead Received",
            preheader: `New inquiry from ${clientName} (${company || "Individual"})`,
            bodyContent: `
        <p style="margin: 0 0 14px 0; color: #cbd5e1;">A new contact inquiry has been submitted on the website:</p>
        ${renderFieldTable(fields)}
      `,
            ctaText: "Open Admin Inquiries",
            ctaLink: "http://localhost:5174/inquiries",
        });

        sendMailSafe({
            to: adminRecipients,
            subject: `[New Contact Lead] ${clientName} - ${service || "General Inquiry"}`,
            html: adminHtml,
        });
    }
};

// =========================================================================
// 2. QUICK NOTES / QUOTES EMAILS
// =========================================================================
export const sendQuoteEmails = async ({ quote }) => {
    const { name, email, phone, serviceType, scope, projectScope, timeline, estimatedBudget, notes, urgency } = quote;
    const clientName = name || "Valued Client";

    // A. User Confirmation Email
    if (email) {
        const fields = [
            { label: "Service Type", value: `<strong>${serviceType}</strong>` },
            { label: "Project Scope", value: projectScope || scope },
            { label: "Expected Timeline", value: timeline },
            { label: "Estimated Budget", value: estimatedBudget },
        ];

        const userHtml = renderEmailLayout({
            title: "Quote Request Received",
            preheader: `We are preparing your custom engineering proposal for ${serviceType}.`,
            bodyContent: `
        <p style="margin: 0 0 14px 0; color: #cbd5e1;">Hello <strong>${clientName}</strong>,</p>
        <p style="margin: 0 0 16px 0; color: #94a3b8;">Thank you for requesting a project quote with <strong>Admire Softech</strong>. Our architecture team is reviewing your project scope for <strong>${serviceType}</strong> and will prepare a tailored proposal for you.</p>
        ${renderFieldTable(fields)}
        <p style="margin: 16px 0 0 0; color: #94a3b8;">We will get back to you with a comprehensive roadmap and pricing breakdown.</p>
      `,
        });

        sendMailSafe({
            to: email,
            subject: `Quote Request Confirmed: ${serviceType} - Admire Softech`,
            html: userHtml,
        });
    }

    // B. Admin & Universal Notification
    const adminRecipients = await getActiveRecipientsForModule("QUICK_NOTES");
    if (adminRecipients.length > 0) {
        const fields = [
            { label: "Client Name", value: `<strong>${clientName}</strong>` },
            { label: "Email", value: `<a href="mailto:${email}" style="color: #00f2fe; text-decoration: none;">${email}</a>` },
            { label: "Phone", value: phone || "Not provided" },
            { label: "Service Required", value: `<strong>${serviceType}</strong>` },
            { label: "Urgency", value: urgency || "Medium" },
            { label: "Target Timeline", value: timeline },
            { label: "Budget Estimate", value: estimatedBudget || "Not specified" },
            { label: "Project Scope", value: projectScope || scope },
            { label: "Additional Notes", value: notes },
        ];

        const adminHtml = renderEmailLayout({
            title: "New Quick Quote / Note Request",
            preheader: `Quote request from ${clientName} for ${serviceType} (${urgency || "Medium"} Urgency)`,
            bodyContent: `
        <p style="margin: 0 0 14px 0; color: #cbd5e1;">A new custom quote request has been submitted:</p>
        ${renderFieldTable(fields)}
      `,
            ctaText: "Review Quotes Pipeline",
            ctaLink: "http://localhost:5174/quotes",
        });

        sendMailSafe({
            to: adminRecipients,
            subject: `[New Quick Quote] ${clientName} - ${serviceType} (${urgency || "Normal"})`,
            html: adminHtml,
        });
    }
};

// =========================================================================
// 3. APPLY FOR FREELANCE / PROPOSAL EMAILS
// =========================================================================
export const sendFreelanceProposalEmails = async ({ gig, proposal }) => {
    const { fullName, email, phone, hourlyRate, portfolioUrl, experienceNote, resumeUrl, resumeFileName } = proposal;
    const gigTitle = gig?.title || "Freelance Project";

    // A. User Confirmation Email
    if (email) {
        const fields = [
            { label: "Project Title", value: `<strong>${gigTitle}</strong>` },
            { label: "Your Rate", value: hourlyRate || "Standard" },
            { label: "Portfolio", value: portfolioUrl ? `<a href="${portfolioUrl}" style="color: #00f2fe; text-decoration: none;">${portfolioUrl}</a>` : null },
            { label: "Status", value: `<span style="color: #38bdf8; font-weight: 700;">Pending Review</span>` },
        ];

        const userHtml = renderEmailLayout({
            title: "Proposal Received",
            preheader: `Your proposal for "${gigTitle}" has been received by Admire Softech.`,
            bodyContent: `
        <p style="margin: 0 0 14px 0; color: #cbd5e1;">Hello <strong>${fullName}</strong>,</p>
        <p style="margin: 0 0 16px 0; color: #94a3b8;">Thank you for submitting your contractor proposal for <strong>"${gigTitle}"</strong> at <strong>Admire Softech</strong>. Our engineering leads will review your profile, rates, and portfolio.</p>
        ${renderFieldTable(fields)}
        <p style="margin: 16px 0 0 0; color: #94a3b8;">If your background matches the project needs, our project manager will reach out for an introductory call.</p>
      `,
        });

        sendMailSafe({
            to: email,
            subject: `Proposal Received: ${gigTitle} - Admire Softech`,
            html: userHtml,
        });
    }

    // B. Admin & Universal Notification
    const adminRecipients = await getActiveRecipientsForModule("FREELANCE");
    if (adminRecipients.length > 0) {
        const fields = [
            { label: "Target Gig", value: `<strong>${gigTitle}</strong>` },
            { label: "Applicant Name", value: `<strong>${fullName}</strong>` },
            { label: "Email", value: `<a href="mailto:${email}" style="color: #00f2fe; text-decoration: none;">${email}</a>` },
            { label: "Phone", value: phone || "Not provided" },
            { label: "Proposed Rate", value: hourlyRate || "Not specified" },
            { label: "Portfolio URL", value: portfolioUrl ? `<a href="${portfolioUrl}" target="_blank" style="color: #00f2fe; text-decoration: none;">${portfolioUrl}</a>` : null },
            { label: "Resume / CV", value: resumeUrl ? `<a href="${resumeUrl}" target="_blank" style="color: #00f2fe; text-decoration: none;">View Resume (${resumeFileName || "Attached"})</a>` : null },
            { label: "Experience Note", value: experienceNote },
        ];

        const adminHtml = renderEmailLayout({
            title: "New Freelance Proposal Submitted",
            preheader: `New proposal from ${fullName} for "${gigTitle}" (${hourlyRate || "Flexible"})`,
            bodyContent: `
        <p style="margin: 0 0 14px 0; color: #cbd5e1;">A new freelance contractor proposal has been submitted:</p>
        ${renderFieldTable(fields)}
      `,
            ctaText: "Review Contractor Proposals",
            ctaLink: "http://localhost:5174/freelance",
        });

        sendMailSafe({
            to: adminRecipients,
            subject: `[New Freelance Proposal] ${fullName} - ${gigTitle}`,
            html: adminHtml,
        });
    }
};

// =========================================================================
// 4. APPLY FOR JOB / CAREERS ATS EMAILS
// =========================================================================
export const sendJobApplicationEmails = async ({ job, applicant }) => {
    const { fullName, email, phone, experience, currentCompany, portfolioUrl, coverNote, resumeUrl, resumeFileName } = applicant;
    const jobTitle = job?.title || applicant.jobTitle || "Engineering Position";

    // A. User Confirmation Email
    if (email) {
        const fields = [
            { label: "Role", value: `<strong>${jobTitle}</strong>` },
            { label: "Department", value: job?.department || "Engineering" },
            { label: "Status", value: `<span style="color: #38bdf8; font-weight: 700;">Application Under Review</span>` },
        ];

        const userHtml = renderEmailLayout({
            title: "Job Application Received",
            preheader: `Thank you for applying for ${jobTitle} at Admire Softech.`,
            bodyContent: `
        <p style="margin: 0 0 14px 0; color: #cbd5e1;">Hello <strong>${fullName}</strong>,</p>
        <p style="margin: 0 0 16px 0; color: #94a3b8;">Thank you for applying for the position of <strong>${jobTitle}</strong> at <strong>Admire Softech</strong>. We have received your application materials and our talent acquisition team is currently reviewing your profile.</p>
        ${renderFieldTable(fields)}
        <p style="margin: 16px 0 0 0; color: #94a3b8;">If your qualifications align with our team requirements, a recruiter will reach out to schedule an interview.</p>
      `,
        });

        sendMailSafe({
            to: email,
            subject: `Application Received: ${jobTitle} - Admire Softech`,
            html: userHtml,
        });
    }

    // B. Admin & Universal Notification
    const adminRecipients = await getActiveRecipientsForModule("JOB");
    if (adminRecipients.length > 0) {
        const fields = [
            { label: "Target Role", value: `<strong>${jobTitle}</strong>` },
            { label: "Candidate Name", value: `<strong>${fullName}</strong>` },
            { label: "Email", value: `<a href="mailto:${email}" style="color: #00f2fe; text-decoration: none;">${email}</a>` },
            { label: "Phone", value: phone || "Not provided" },
            { label: "Experience", value: experience || "Not specified" },
            { label: "Current Company", value: currentCompany || "Not specified" },
            { label: "Portfolio / GitHub", value: portfolioUrl ? `<a href="${portfolioUrl}" target="_blank" style="color: #00f2fe; text-decoration: none;">${portfolioUrl}</a>` : null },
            { label: "Resume", value: resumeUrl ? `<a href="${resumeUrl}" target="_blank" style="color: #00f2fe; text-decoration: none;">View Resume (${resumeFileName || "Attached"})</a>` : null },
            { label: "Cover Note", value: coverNote },
        ];

        const adminHtml = renderEmailLayout({
            title: "New Job Applicant Submitted",
            preheader: `New candidate ${fullName} applied for ${jobTitle} (${experience || "Experienced"})`,
            bodyContent: `
        <p style="margin: 0 0 14px 0; color: #cbd5e1;">A new candidate has applied for an open position:</p>
        ${renderFieldTable(fields)}
      `,
            ctaText: "Open Careers ATS",
            ctaLink: "http://localhost:5174/careers",
        });

        sendMailSafe({
            to: adminRecipients,
            subject: `[New Candidate] ${fullName} - ${jobTitle}`,
            html: adminHtml,
        });
    }
};

// =========================================================================
// 5. FORGOT PASSWORD / OTP VERIFICATION EMAILS 
// =========================================================================
export const sendPasswordResetOtpEmail = async ({ email, name, otp }) => {
    const clientName = name || "User";

    const simpleHtml = `
      <div style="font-family: Arial, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; color: #222222; line-height: 1.6; max-width: 550px; padding: 10px 0;">
        <p style="margin: 0 0 14px 0;">Hi <strong>${clientName}</strong>,</p>
        <p style="margin: 0 0 14px 0;">We received a request to reset your password for your <strong>Admire Softech</strong> account.</p>
        <p style="margin: 0 0 10px 0;">Your one-time verification code (OTP) is:</p>
        
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0f172a; font-family: monospace; padding: 12px 0; margin: 10px 0;">
          ${otp}
        </div>

        <p style="margin: 10px 0 14px 0; color: #555555; font-size: 14px;">
          This code is valid for <strong>10 minutes</strong>. Please do not share this code with anyone.
        </p>

        <p style="margin: 20px 0 0 0; color: #777777; font-size: 13px;">
          If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
        </p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0 16px 0;" />
        <p style="margin: 0; font-size: 12px; color: #94a3b8;">
          &copy; ${new Date().getFullYear()} Admire Softech &middot; All rights reserved.
        </p>
      </div>
    `;

    const plainText = `Hi ${clientName},\n\nWe received a request to reset your password for your Admire Softech account.\n\nYour one-time verification code (OTP) is: ${otp}\n\nThis code is valid for 10 minutes. Please do not share this code with anyone.\n\nIf you did not request a password reset, you can safely ignore this email.\n\n- Admire Softech`;

    return sendMailSafe({
        to: email,
        subject: `${otp} is your Admire Softech password reset code`,
        html: simpleHtml,
        text: plainText,
    });
};

export const sendPasswordResetSuccessEmail = async ({ email, name }) => {
    const clientName = name || "User";

    const simpleHtml = `
      <div style="font-family: Arial, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; color: #222222; line-height: 1.6; max-width: 550px; padding: 10px 0;">
        <p style="margin: 0 0 14px 0;">Hi <strong>${clientName}</strong>,</p>
        <p style="margin: 0 0 14px 0;">Your password for your Admire Softech account (<strong>${email}</strong>) was successfully reset.</p>
        <p style="margin: 0 0 14px 0;">You can now log in with your new password.</p>

        <p style="margin: 20px 0 0 0; color: #b91c1c; font-size: 13px;">
          If you did not perform this change, please contact our support team immediately at <a href="mailto:support@admiresoftech.com" style="color: #0284c7;">support@admiresoftech.com</a>.
        </p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0 16px 0;" />
        <p style="margin: 0; font-size: 12px; color: #94a3b8;">
          &copy; ${new Date().getFullYear()} Admire Softech Security
        </p>
      </div>
    `;

    const plainText = `Hi ${clientName},\n\nYour password for your Admire Softech account (${email}) was successfully reset.\n\nIf you did not make this change, please contact support@admiresoftech.com immediately.\n\n- Admire Softech Security`;

    return sendMailSafe({
        to: email,
        subject: "Security Notification: Password Changed - Admire Softech",
        html: simpleHtml,
        text: plainText,
    });
};

