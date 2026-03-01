const express = require("express");
const router = express.Router();
const multer = require("multer");
const authMiddleware = require("../middleware/auth");
const { UTApi } = require("uploadthing/server");
require("dotenv").config();

const utapi = new UTApi({ token: process.env.UPLOADTHING_SECRET });

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

router.post("/", authMiddleware, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file provided" });
    }

    const isImage = req.file.mimetype.startsWith("image/");
    const originalName = req.file.originalname;

    const file = new File([req.file.buffer], originalName, {
      type: req.file.mimetype,
    });

    const response = await utapi.uploadFiles(file);

    if (response.error) {
      console.error("UPLOAD ERROR:", response.error);
      return res.status(500).json({ message: response.error.message });
    }

    res.json({
      url: response.data.url,
      file_name: originalName,
      file_type: req.file.mimetype,
      is_image: isImage,
    });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
