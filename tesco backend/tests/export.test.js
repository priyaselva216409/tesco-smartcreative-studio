import './setupEnv.js';
import request from "supertest";
import mongoose from "mongoose";
import express from "express";
import exportRoutes from "../routes/export.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

const app = express();
app.use(express.json({ limit: "15mb" }));
app.use("/api/export", exportRoutes);

let token = "";
let userId = "";

beforeAll(async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required for tests");
  }
  await mongoose.connect(process.env.MONGODB_URI + "_test_export", {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  await User.deleteMany({});

  const user = new User({
    username: "exportuser",
    email: "exportuser@example.com",
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

describe("Export Routes", () => {
  test("Export valid canvas JSON as PNG", async () => {
    const canvasJSON = {
      version: "5.2.4",
      objects: [
        {
          type: "rect",
          left: 100,
          top: 100,
          width: 200,
          height: 100,
          fill: "red"
        }
      ]
    };

    const res = await request(app)
      .post("/api/export")
      .set("Authorization", `Bearer ${token}`)
      .send({ canvasJSON, format: "png" });

    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toBe("image/png");
    expect(res.body).toBeInstanceOf(Buffer);
  });

  test("Export valid canvas JSON as JPEG", async () => {
    const canvasJSON = {
      version: "5.2.4",
      objects: [
        {
          type: "circle",
          left: 50,
          top: 50,
          radius: 40,
          fill: "blue"
        }
      ]
    };

    const res = await request(app)
      .post("/api/export")
      .set("Authorization", `Bearer ${token}`)
      .send({ canvasJSON, format: "jpeg" });

    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toBe("image/jpeg");
    expect(res.body).toBeInstanceOf(Buffer);
  });

  test("Export missing canvasJSON", async () => {
    const res = await request(app)
      .post("/api/export")
      .set("Authorization", `Bearer ${token}`)
      .send({ format: "png" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "Canvas JSON data is required");
  });
});
