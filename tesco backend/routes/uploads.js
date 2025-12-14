import express from "express";
import multer from "multer";
import path from "path";
import authMiddleware from "../middlewares/authMiddleware.js";
import { uploadImage } from "../controllers/uploadController.js";
import fs from "fs";

const router = express.Router();

const uploadsDir = path.resolve("uploads");
// Create uploads directory if not exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    // Sanitize filename: remove spaces and special chars
    const originalName = file.originalname.replace(/\s+/g, "_").replace(/[^\w.-]/g, "");
    cb(null, `${timestamp}_${originalName}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PNG and JPG are allowed."), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB max
});

router.post("/upload", authMiddleware, upload.single("file"), (req, res, next) => {
  // multer error handling
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded or invalid file type" });
  }
  next();
}, uploadImage);

export default router;
