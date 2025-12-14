import Project from "../models/Project.js";

export const createProject = async (req, res) => {
  try {
    const { title, canvasData } = req.body;
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return res.status(400).json({ message: "Project title is required" });
    }
    if (!canvasData || typeof canvasData !== "object") {
      return res.status(400).json({ message: "Canvas data is required" });
    }

    const project = new Project({
      userId: req.user.id,
      title: title.trim(),
      canvasData
    });

    await project.save();

    return res.status(201).json(project);
  } catch (error) {
    console.error("Create project error:", error);
    return res.status(500).json({ message: "Server error creating project" });
  }
};

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user.id }).sort({ updatedAt: -1 });
    return res.status(200).json(projects);
  } catch (error) {
    console.error("Get projects error:", error);
    return res.status(500).json({ message: "Server error fetching projects" });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const projectId = req.params.id;
    if (!projectId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    if (project.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    return res.status(200).json(project);
  } catch (error) {
    console.error("Get project by ID error:", error);
    return res.status(500).json({ message: "Server error fetching project" });
  }
};

export const updateProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const { title, canvasData } = req.body;

    if (!projectId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }
    if (title && (typeof title !== "string" || title.trim().length === 0)) {
      return res.status(400).json({ message: "Invalid project title" });
    }
    if (canvasData && typeof canvasData !== "object") {
      return res.status(400).json({ message: "Invalid canvas data" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    if (project.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (title) project.title = title.trim();
    if (canvasData) project.canvasData = canvasData;
    project.updatedAt = new Date();

    await project.save();

    return res.status(200).json(project);
  } catch (error) {
    console.error("Update project error:", error);
    return res.status(500).json({ message: "Server error updating project" });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    if (!projectId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    if (project.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    await Project.deleteOne({ _id: projectId });

    return res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Delete project error:", error);
    return res.status(500).json({ message: "Server error deleting project" });
  }
};
