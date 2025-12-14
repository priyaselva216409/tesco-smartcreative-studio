import request from "supertest";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import express from "express";
import authRoutes from "../routes/auth.js";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);

beforeAll(async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required for tests");
  }
  await mongoose.connect(process.env.MONGODB_URI + "_test_auth", {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe("Auth Routes", () => {
  const testUser = {
    username: "testuser",
    email: "testuser@example.com",
    password: "password123"
  };

  test("Register - success", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(testUser);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user).toHaveProperty("email", testUser.email.toLowerCase());
    expect(res.body.user).toHaveProperty("username", testUser.username);
  });

  test("Register - duplicate email", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        username: "anotheruser",
        email: testUser.email,
        password: "password123"
      });
    expect(res.statusCode).toBe(409);
    expect(res.body).toHaveProperty("message", "Email already registered");
  });

  test("Register - duplicate username", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        username: testUser.username,
        email: "uniqueemail@example.com",
        password: "password123"
      });
    expect(res.statusCode).toBe(409);
    expect(res.body).toHaveProperty("message", "Username already taken");
  });

  test("Login - success", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: testUser.email,
        password: testUser.password
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user).toHaveProperty("email", testUser.email.toLowerCase());
  });

  test("Login - wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: testUser.email,
        password: "wrongpassword"
      });
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("message", "Invalid email or password");
  });

  test("Login - non-existent email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "nonexistent@example.com",
        password: "password123"
      });
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("message", "Invalid email or password");
  });
});
