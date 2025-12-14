import path from "path";
import fs from "fs";
import FileUpload from "../models/FileUpload.js";

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const file = req.file;

    // Validate mimetype
    if (!["image/png", "image/jpeg", "image/jpg"].includes(file.mimetype)) {
      // Delete the uploaded file if invalid mimetype
      fs.unlink(file.path, () => {});
      return res.status(400).json({ message: "Invalid file type. Only PNG and JPG are allowed." });
    }

    // Build public URL
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;

    // Save file info to DB
    const fileUploadDoc = new FileUpload({
      userId: req.user.id,
      filename: file.filename,
      fileUrl,
      mimetype: file.mimetype,
      size: file.size
    });

    await fileUploadDoc.save();

    return res.status(201).json({ fileUrl });
  } catch (error) {
    console.error("Upload image error:", error);
    return res.status(500).json({ message: "Server error uploading image" });
  }
};
