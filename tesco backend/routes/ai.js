import express from "express";

const router = express.Router();

/**
 * POST /api/ai/ask
 * Hackathon-safe AI mock
 */
router.post("/ask", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({
      success: false,
      message: "Prompt is required",
    });
  }

  // MOCK AI RESPONSE (FAST & SAFE)
  res.json({
    success: true,
    reply: `
AI Assistant Suggestion:

🎨 Design Style:
• Modern & minimal
• Instagram-friendly layout

🎯 Layout:
• Centered main text
• Bold heading
• Clear CTA button

🎨 Colors:
• Purple → Pink gradient
• White text
• Accent yellow highlights

📱 Platform:
• Optimized for mobile screens
`,
  });
});

/**
 * POST /api/ai/suggest-colors
 */
router.post("/suggest-colors", (req, res) => {
  res.json({
    success: true,
    colors: ["#6A11CB", "#FF4E50", "#F9D423", "#FFFFFF"],
  });
});

export default router;
