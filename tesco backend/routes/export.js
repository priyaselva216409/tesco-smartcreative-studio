import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { exportDesign } from "../controllers/exportController.js";

const router = express.Router();

router.use(authMiddleware);

/**
 * @route POST /api/export
 * @desc Export design canvas JSON to image
 * @access Private
 */
router.post("/", exportDesign);

export default router;
