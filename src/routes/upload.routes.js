import express from "express";
import { getPresignedUrl } from "../controller/upload.controller.js";
import { optionalUserAuth } from "../middleware/auth.middleware.js";

const uploadRoute = express.Router();

// Generate presigned PUT URL for direct S3 browser upload
uploadRoute.post("/generate-presigned-url", optionalUserAuth, getPresignedUrl);
uploadRoute.post("/presigned-url", optionalUserAuth, getPresignedUrl);

export default uploadRoute;
