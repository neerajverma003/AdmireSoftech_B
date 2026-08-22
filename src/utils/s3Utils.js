import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "../config/s3.js";

/**
 * Generates a temporary GET signed URL for an S3 object.
 * @param {string} key - The S3 object key (filename or path/filename).
 * @param {number} expiresIn - Expiration time in seconds (default 3600).
 * @returns {Promise<string>} - The presigned URL.
 */
export const generateGetSignedUrl = async (key, expiresIn = 3600) => {
  if (!key) return null;

  const bucketName = process.env.AWS_S3_BUCKET_NAME || process.env.S3_BUCKET_NAME;
  const region = process.env.AWS_REGION || process.env.S3_BUCKET_REGION || "ap-south-1";

  // If the key is a full URL, extract the key part
  let s3Key = key;
  const s3UrlPrefix = `https://${bucketName}.s3.${region}.amazonaws.com/`;
  const cdnPrefix = process.env.CDN_DOMAIN
    ? process.env.CDN_DOMAIN.endsWith("/")
      ? process.env.CDN_DOMAIN
      : `${process.env.CDN_DOMAIN}/`
    : null;

  if (key.startsWith(s3UrlPrefix)) {
    s3Key = key.replace(s3UrlPrefix, "").split("?")[0];
  } else if (cdnPrefix && key.startsWith(cdnPrefix)) {
    s3Key = key.replace(cdnPrefix, "").split("?")[0];
  } else if (key.startsWith("http")) {
    // Handle other possible URL formats or return as is if it's already a full public URL
    return key.split("?")[0];
  }

  if (!bucketName || bucketName === "test") {
    // If running in development without real AWS credentials, return clean URL
    return `https://${bucketName || "admiresoftech"}.s3.${region}.amazonaws.com/${s3Key}`;
  }

  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error("Error generating signed URL for key:", s3Key, error.message);
    return key; // Fallback to original key/URL if signing fails
  }
};

export const signAllUrls = async (items) => {
  if (!items) return items;
  if (Array.isArray(items)) {
    return Promise.all(
      items.map(async (item) => {
        if (typeof item === "object" && item !== null && item.url) {
          return { ...item, url: await generateGetSignedUrl(item.url) };
        }
        return generateGetSignedUrl(item);
      })
    );
  }
  if (typeof items === "object" && items !== null && items.url) {
    return { ...items, url: await generateGetSignedUrl(items.url) };
  }
  return generateGetSignedUrl(items);
};
