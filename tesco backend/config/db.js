import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.warn("⚠️ MongoDB connection failed (running in demo mode). AI features will work.", error.message);
    // Don't exit; allow server to run without DB for demo
  }
};

export default connectDB;
