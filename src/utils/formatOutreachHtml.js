/**
 * Clean HTML inline styles that might break rendering
 */
const cleanHtmlStyles = (htmlContent) => {
  return (htmlContent || "")
    .replace(/background-color\s*:\s*[^;"]+;?/gi, "")
    .replace(/background\s*:\s*[^;"]+;?/gi, "")
    .replace(
      /color\s*:\s*(#fff|#ffffff|white|#cbd5e1|#94a3b8|#e2e8f0|#f1f5f9|#f8fafc|rgb\(255,\s*255,\s*255\)|rgba\(255,\s*255,\s*255,[^)]+\));?/gi,
      ""
    );
};

/**
 * Extract invisible preheader preview text to prevent snippet breakage in inboxes
 */
const getPreviewSnippet = (htmlContent) => {
  return (htmlContent || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, 120);
};

/**
 * 1. Normal (Plain / Direct) Email Format
 * Standard direct 1-on-1 email format: clean left-aligned text exactly as typed.
 * No centered containers, no cards, no unexpected line breaking.
 */
export const formatNormalOutreachHtml = ({ htmlContent, subject, fromName }) => {
  const cleanedContent = cleanHtmlStyles(htmlContent);
  const previewSnippet = getPreviewSnippet(htmlContent);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${subject || "Message"}</title>
  <style type="text/css">
    body, html {
      margin: 0;
      padding: 0;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: #222222;
      background-color: #ffffff;
      text-align: left;
    }
    div, p, span, td, th {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: #222222;
    }
    p {
      margin: 0 0 12px 0;
    }
    a {
      color: #1a73e8;
      text-decoration: underline;
    }
    table {
      border-collapse: collapse;
    }
    img {
      max-width: 100%;
      height: auto;
    }
  </style>
</head>
<body style="margin: 0; padding: 12px 8px; font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.5; color: #222222; background-color: #ffffff; text-align: left;">
  <!-- Invisible Preheader Preview Text -->
  <div style="display: none; max-height: 0px; overflow: hidden; mso-hide: all; font-size: 1px; line-height: 1px; opacity: 0;">
    ${previewSnippet} &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
  </div>

  <!-- Direct Clean Content (Natural Left-Aligned Flow, No Centering) -->
  <div dir="ltr" style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.5; color: #222222; text-align: left; margin: 0; padding: 0;">
    ${cleanedContent}
  </div>
</body>
</html>`;
};

/**
 * 2. Branded Template Format
 * Modern card container with dark brand logo header and corporate signature footer.
 */
export const formatTemplateOutreachHtml = ({ htmlContent, subject, fromName }) => {
  const cleanedContent = cleanHtmlStyles(htmlContent);
  const previewSnippet = getPreviewSnippet(htmlContent);

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta name="color-scheme" content="light"/>
  <meta name="supported-color-schemes" content="light"/>
  <title>${subject || "Message from Admire Softech"}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; color: #0f172a;">
  <!-- Invisible Preheader Preview Text (Prevents spam snippets in inbox) -->
  <div style="display: none; max-height: 0px; overflow: hidden; mso-hide: all; font-size: 1px; line-height: 1px; opacity: 0;">
    ${previewSnippet} &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
  </div>

  <!-- Outer Canvas -->
  <table width="100%" bgcolor="#f1f5f9" cellpadding="0" cellspacing="0" border="0" style="width: 100%; background-color: #f1f5f9; margin: 0; padding: 32px 12px;">
    <tr>
      <td align="center" style="padding: 0;">
        
        <!-- Main Email Card Container -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; margin: 0 auto; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); overflow: hidden;">
          
          <!-- Centered Brand Logo Header -->
          <tr>
            <td align="center" style="padding: 24px 20px; background-color: #070d1e; border-bottom: 2px solid #00f2fe; text-align: center;">
              <table align="center" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="text-align: center;">
                    <img
                      src="https://media.admiresoftech.com/emails/assets/logo.png"
                      alt="Admire Softech"
                      width="180"
                      style="display: block; width: 180px; max-width: 180px; height: auto; border: 0; outline: none; margin: 0 auto; text-align: center;"
                    />
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Email Content Body -->
          <tr>
            <td style="padding: 32px 28px; font-size: 15px; line-height: 1.7; color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; text-align: left; background-color: #ffffff;">
              <div style="color: #0f172a !important; font-size: 15px; line-height: 1.7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                ${cleanedContent}
              </div>
            </td>
          </tr>

          <!-- Footer Area -->
          <tr>
            <td align="center" style="padding: 24px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0 0 4px 0; font-size: 13px; font-weight: 700; color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                Admire Softech Solution Pvt. Ltd
              </p>
              <p style="margin: 0; font-size: 12px; color: #64748b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                Admire Softech Solution Pvt. Ltd &bull; Premium IT, Web Engineering &amp; Software Solutions
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
};

/**
 * Dynamic Formatter: Dispatches to normal or template layout based on format param
 */
export const formatOutreachHtml = ({ htmlContent, subject, fromName, format = "normal" }) => {
  if (format === "template") {
    return formatTemplateOutreachHtml({ htmlContent, subject, fromName });
  }
  return formatNormalOutreachHtml({ htmlContent, subject, fromName });
};

export default formatOutreachHtml;

