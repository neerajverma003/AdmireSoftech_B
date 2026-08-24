import "dotenv/config";
import { S3Client } from "@aws-sdk/client-s3";

export const getS3Config = () => {
  const region = process.env.S3_BUCKET_REGION || process.env.AWS_REGION || "ap-south-1";
  const accessKeyId = process.env.S3_ACCESS_KEY || process.env.AWS_ACCESS_KEY_ID || "";
  const secretAccessKey = process.env.S3_SECRET_KEY || process.env.AWS_SECRET_ACCESS_KEY || "";
  const bucketName = process.env.S3_BUCKET_NAME || process.env.AWS_S3_BUCKET_NAME || "admire-softech";
  const cdnDomain = process.env.CDN_DOMAIN || "";

  return {
    region,
    accessKeyId,
    secretAccessKey,
    bucketName,
    cdnDomain,
  };
};

export const createS3Client = () => {
  const config = getS3Config();
  return new S3Client({
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
};

const s3Client = createS3Client();
export default s3Client;
