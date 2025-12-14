import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject
} from "../controllers/projectController.js";

const router = express.Router();

router.use(authMiddleware);

/**
 * @route POST /api/projects
 * @desc Create a new project
 * @access Private
 */
router.post("/", createProject);

/**
 * @route GET /api/projects
 * @desc Get all projects of the logged-in user
 * @access Private
 */
router.get("/", getProjects);

/**
 * @route GET /api/projects/:id
 * @desc Get project by ID
 * @access Private
 */
router.get("/:id", getProjectById);

/**
 * @route PUT /api/projects/:id
 * @desc Update project by ID
 * @access Private
 */
router.put("/:id", updateProject);

/**
 * @route DELETE /api/projects/:id
 * @desc Delete project by ID
 * @access Private
 */
router.delete("/:id", deleteProject);

export default router;
