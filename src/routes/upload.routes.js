import express from "express";
import { getPresignedUrl } from "../controller/upload.controller.js";
import { userAuth } from "../middleware/auth.middleware.js";

const uploadRoute = express.Router();

// Require authenticated user for upload presigned URLs
uploadRoute.post("/generate-presigned-url", userAuth, getPresignedUrl);
uploadRoute.post("/presigned-url", userAuth, getPresignedUrl);

export default uploadRoute;
