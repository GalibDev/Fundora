import { Router } from "express";
import { v2 as cloudinary } from "cloudinary";
import { auth } from "../middleware/auth.js";

const router = Router();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.post("/", auth, async (req, res) => {
  if (!req.body.image) return res.status(400).json({ message: "Image data is required" });
  if (!process.env.CLOUDINARY_CLOUD_NAME) return res.status(503).json({ message: "Image hosting is not configured" });
  const uploaded = await cloudinary.uploader.upload(req.body.image, {
    folder: "fundora",
    resource_type: "image",
    transformation: [{ width: 1600, height: 1000, crop: "limit", quality: "auto", fetch_format: "auto" }],
  });
  res.status(201).json({ url: uploaded.secure_url, publicId: uploaded.public_id });
});

export default router;
