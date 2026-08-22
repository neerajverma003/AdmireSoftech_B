import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import s3Client from "../config/s3.js";
import { generateGetSignedUrl } from "../utils/s3Utils.js";

export const getPresignedUrl = async (req, res) => {
  try {
    const { filename, contentType, folder = "resumes" } = req.body;

    if (!filename || !contentType) {
      return res.status(400).json({
        success: false,
        message: "Filename and contentType are required",
      });
    }

    const bucketName = process.env.AWS_S3_BUCKET_NAME || process.env.S3_BUCKET_NAME || "admiresoftech";
    const region = process.env.AWS_REGION || process.env.S3_BUCKET_REGION || "ap-south-1";

    // Extract extension and generate unique filename
    const ext = filename.includes(".") ? filename.substring(filename.lastIndexOf(".")) : "";
    let uniqueFilename;
    if (folder && folder.startsWith("candidate-profile")) {
      uniqueFilename = `${folder.replace(/\/+$/, "")}/resume${ext || ".pdf"}`;
    } else {
      uniqueFilename = `${folder}/${Date.now()}-${randomUUID().slice(0, 8)}${ext}`;
    }

    let presignedUrl;
    try {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: uniqueFilename,
        ContentType: contentType,
      });

      // Generate PUT presigned URL for uploading (valid for 15 minutes)
      presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
    } catch (s3Err) {
      console.warn("[UploadController] S3 Presigned URL error (using simulated fallback for dev):", s3Err.message);
      presignedUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${uniqueFilename}?mock=true`;
    }

    // Construct the permanent public URL
    const publicUrl = process.env.CDN_DOMAIN && process.env.CDN_DOMAIN !== "test"
      ? `${process.env.CDN_DOMAIN.replace(/\/$/, "")}/${uniqueFilename}`
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
