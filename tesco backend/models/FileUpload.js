import mongoose from "mongoose";

const fileUploadSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    filename: {
      type: String,
      required: true
    },
    fileUrl: {
      type: String,
      required: true
    },
    mimetype: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true // bytes
    }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const FileUpload = mongoose.model("FileUpload", fileUploadSchema);
export default FileUpload;
