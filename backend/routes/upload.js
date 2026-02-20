const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const authMiddleware = require("../middleware/auth");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

router.post("/", authMiddleware, upload.single("file"), async (req, res) => {
  try {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;
    const isImage = req.file.mimetype.startsWith("image/");

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "storeroom",
      resource_type: "auto",
    });

    // For non-images, Cloudinary puts them under /raw/upload/ not /image/upload/
    // Fix the URL if needed
    const url = isImage
      ? result.secure_url
      : result.secure_url.replace("/image/upload/", "/raw/upload/");

    res.json({
      url,
      file_name: req.file.originalname,
      file_type: req.file.mimetype,
      is_image: isImage,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
