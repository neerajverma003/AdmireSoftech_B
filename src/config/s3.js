import { S3Client } from "@aws-sdk/client-s3";

const region = process.env.AWS_REGION || process.env.S3_BUCKET_REGION || "ap-south-1";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY || "test";
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || process.env.S3_SECRET_KEY || "test";

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export default s3Client;
