import request from "supertest";
import mongoose from "mongoose";
import express from "express";
import fs from "fs";
import path from "path";
import uploadRoutes from "../routes/uploads.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

const app = express();
app.use(express.json());
app.use("/api/uploads", uploadRoutes);

let token = "";
let userId = "";

beforeAll(async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required for tests");
  }
  await mongoose.connect(process.env.MONGODB_URI + "_test_upload", {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  await User.deleteMany({});

  const user = new User({
    username: "uploaduser",
    email: "uploaduser@example.com",
    password: await bcrypt.hash("password123", 12)
  });
  await user.save();
  userId = user._id.toString();

  token = jwt.sign(
    { id: userId, username: user.username, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe("Upload Routes", () => {
  test("Upload valid PNG image", async () => {
    const res = await request(app)
      .post("/api/uploads/upload")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", path.resolve("tests", "test_files", "test.png"));
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("fileUrl");
  });

  test("Upload valid JPG image", async () => {
    const res = await request(app)
      .post("/api/uploads/upload")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", path.resolve("tests", "test_files", "test.jpg"));
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("fileUrl");
  });

  test("Upload invalid file type", async () => {
    const res = await request(app)
      .post("/api/uploads/upload")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", path.resolve("tests", "test_files", "test.txt"));
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  test("Upload no file", async () => {
    const res = await request(app)
      .post("/api/uploads/upload")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message");
  });
});
