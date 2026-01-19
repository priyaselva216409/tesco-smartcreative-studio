import './setupEnv.js';
import request from "supertest";
import mongoose from "mongoose";
import express from "express";
import jwt from "jsonwebtoken";
import projectRoutes from "../routes/projects.js";
import User from "../models/User.js";
import Project from "../models/Project.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use("/api/projects", projectRoutes);

let token = "";
let userId = "";
let projectId = "";

beforeAll(async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required for tests");
  }
  await mongoose.connect(process.env.MONGODB_URI + "_test_projects", {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  await User.deleteMany({});
  await Project.deleteMany({});

  const user = new User({
    username: "projuser",
    email: "projuser@example.com",
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

describe("Project Routes", () => {
  test("Create project - missing title", async () => {
    const res = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({ canvasData: { objects: [] } });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "Project title is required");
  });

  test("Create project - success", async () => {
    const res = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "My Project",
        canvasData: { objects: [{ type: "rect", left: 10, top: 10 }] }
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("title", "My Project");
    expect(res.body).toHaveProperty("canvasData");
    projectId = res.body._id;
  });

  test("Get all projects", async () => {
    const res = await request(app)
      .get("/api/projects")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test("Get project by ID - success", async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("_id", projectId);
  });

  test("Update project - success", async () => {
    const res = await request(app)
      .put(`/api/projects/${projectId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Updated Title" });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("title", "Updated Title");
  });

  test("Delete project - success", async () => {
    const res = await request(app)
      .delete(`/api/projects/${projectId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Project deleted successfully");
  });
});
