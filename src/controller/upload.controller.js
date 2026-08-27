import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import s3Client, { getS3Config } from "../config/s3.js";
import { generateGetSignedUrl } from "../utils/s3Utils.js";

/**
 * Sanitizes a string into a clean, URL-safe folder slug
 */
const sanitizeSlug = (str, fallback = "general") => {
  if (!str || typeof str !== "string") return fallback;
  const slug = str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // remove special characters
    .replace(/[\s_-]+/g, "-") // collapse dashes and spaces
    .replace(/^-+|-+$/g, ""); // trim leading/trailing dashes
  return slug || fallback;
};

/**
 * Sanitizes an email into a unique, clean URL-safe folder identifier
 * e.g., "kaiff.ansari@gmail.com" -> "kaiff-ansari-at-gmail-com"
 */
const sanitizeEmailSlug = (email, fallback = "applicant") => {
  if (!email || typeof email !== "string") return fallback;
  const clean = email
    .toLowerCase()
    .trim()
    .replace(/@/g, "-at-")
    .replace(/[^\w\s-]/g, "-")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return clean || fallback;
};

/**
 * Sanitizes a filename while preserving its extension
 */
const sanitizeFilename = (filename) => {
  if (!filename || typeof filename !== "string") return `file_${Date.now()}`;
  const dotIndex = filename.lastIndexOf(".");
  const ext = dotIndex !== -1 ? filename.substring(dotIndex).toLowerCase() : "";
  const nameWithoutExt = dotIndex !== -1 ? filename.substring(0, dotIndex) : filename;
  const cleanName = sanitizeSlug(nameWithoutExt, "document");
  return `${cleanName}${ext}`;
};

/**
 * Builds a clean, hierarchical S3 key path based on context, category, experience, and unique email
 */
export const buildCleanS3Key = ({
  module = "general",
  category = "",
  experience = "",
  email = "",
  candidateName = "",
  filename = "document.pdf",
  folder = "",
}) => {
  const timestamp = Date.now();
  const cleanFile = sanitizeFilename(filename);
  const normalizedModule = sanitizeSlug(module, "general");
  // Prioritize unique email slug over name to avoid duplicate/name collisions
  const userFolder = sanitizeEmailSlug(email || candidateName, "applicant");

  switch (normalizedModule) {
    case "careers":
    case "career":
    case "jobs": {
      const jobSlug = sanitizeSlug(category, "general-position");
      const expSlug = sanitizeSlug(experience, "experience");
      return `careers/${jobSlug}/${expSlug}/${userFolder}/${timestamp}_${cleanFile}`;
    }

    case "freelance":
    case "gig":
    case "contract": {
      const categorySlug = sanitizeSlug(category, "general-services");
      const expSlug = sanitizeSlug(experience, "flexible-hours");
      return `freelance/${categorySlug}/${expSlug}/${userFolder}/${timestamp}_${cleanFile}`;
    }

    case "avatars":
    case "avatar":
    case "profile": {
      const roleSlug = sanitizeSlug(category, "user");
      return `avatars/${roleSlug}/${userFolder}/${timestamp}_${cleanFile}`;
    }

    case "industries":
    case "industry": {
      const industrySlug = sanitizeSlug(category, "general");
      return `industries/${industrySlug}/${timestamp}_${cleanFile}`;
    }

    case "case-studies":
    case "casestudy":
    case "case-study":
    case "casestudies": {
      const categorySlug = sanitizeSlug(category, "general");
      const titleSlug = sanitizeSlug(folder || candidateName, "project");
      return `case-studies/${categorySlug}/${titleSlug}/${timestamp}_${cleanFile}`;
    }

    case "emails":
    case "email":
    case "outreach": {
      const campaignSlug = sanitizeSlug(category || folder, "general");
      const senderSlug = sanitizeEmailSlug(email || candidateName, "admin");
      return `emails/outreach/${campaignSlug}/${senderSlug}/${timestamp}_${cleanFile}`;
    }

    case "assets":
    case "quotes":
    case "documents": {
      const subFolder = sanitizeSlug(category || folder, "general");
      return `assets/${subFolder}/${timestamp}_${cleanFile}`;
    }

    default: {
      if (folder) {
        const cleanFolder = folder.replace(/\/+$/, "");
        return `${cleanFolder}/${userFolder}/${timestamp}_${cleanFile}`;
      }
      return `uploads/${normalizedModule}/${userFolder}/${timestamp}_${cleanFile}`;
    }
  }
};

/**
 * POST /api/upload/generate-presigned-url
 * Generates an AWS S3 Presigned PUT URL with clean, email-based folder hierarchy
 */
export const getPresignedUrl = async (req, res) => {
  try {
    const {
      filename,
      contentType,
      module = "general",
      category = "",
      experience = "",
      email = "",
      candidateName = "",
      folder = "",
    } = req.body;

    if (!filename || !contentType) {
      return res.status(400).json({
        success: false,
        message: "Filename and contentType are required",
      });
    }

    const { bucketName, region, cdnDomain } = getS3Config();

    // Generate clean email-based hierarchical S3 key
    const uniqueFilename = buildCleanS3Key({
      module,
      category,
      experience,
      email: email || candidateName,
      candidateName,
      filename,
      folder,
    });

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: uniqueFilename,
      ContentType: contentType,
    });

    // Generate PUT presigned URL for direct browser upload (valid for 15 minutes)
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

    // Construct the permanent public URL
    const publicUrl = cdnDomain && cdnDomain !== "test"
      ? `${cdnDomain.replace(/\/$/, "")}/${uniqueFilename}`
      : `https://${bucketName}.s3.${region}.amazonaws.com/${uniqueFilename}`;

    // Generate a temporary GET signed URL for immediate preview in frontend
    const previewUrl = await generateGetSignedUrl(uniqueFilename, 3600);

    return res.status(200).json({
      success: true,
      presignedUrl,
      publicUrl,
      previewUrl,
      key: uniqueFilename,
      fileName: filename,
    });
  } catch (error) {
    console.error("Presigned URL Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate presigned URL",
      error: error.message,
    });
  }
};
