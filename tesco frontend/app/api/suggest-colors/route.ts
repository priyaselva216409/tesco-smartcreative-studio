import { NextResponse } from "next/server"

interface ColorSuggestion {
  id: string
  name: string
  colors: string[]
  description: string
}

export async function POST(request: Request) {
  try {
    const { baseColor, style } = (await request.json()) as {
      baseColor?: string
      style?: "professional" | "vibrant" | "minimal" | "warm" | "cool"
    }

    // AI-powered color suggestions based on color theory
    // In production, this could use AI to analyze brand colors and suggest harmonious palettes

    const suggestions: ColorSuggestion[] = []

    // Based on style preference or default to professional
    const selectedStyle = style || "professional"

    const palettes: Record<string, ColorSuggestion[]> = {
      professional: [
        {
          id: "corp-blue",
          name: "Corporate Blue",
          colors: ["#1E40AF", "#3B82F6", "#93C5FD", "#FFFFFF", "#1F2937"],
          description: "Trustworthy and professional",
        },
        {
          id: "slate-modern",
          name: "Modern Slate",
          colors: ["#0F172A", "#334155", "#94A3B8", "#F8FAFC", "#0EA5E9"],
          description: "Clean and contemporary",
        },
        {
          id: "emerald-pro",
          name: "Emerald Professional",
          colors: ["#064E3B", "#10B981", "#6EE7B7", "#FFFFFF", "#374151"],
          description: "Growth and stability",
        },
      ],
      vibrant: [
        {
          id: "sunset-glow",
          name: "Sunset Glow",
          colors: ["#DC2626", "#F97316", "#FBBF24", "#FEF3C7", "#1F2937"],
          description: "Energetic and attention-grabbing",
        },
        {
          id: "ocean-burst",
          name: "Ocean Burst",
          colors: ["#0891B2", "#06B6D4", "#22D3EE", "#FFFFFF", "#0F172A"],
          description: "Fresh and dynamic",
        },
        {
          id: "berry-pop",
          name: "Berry Pop",
          colors: ["#BE185D", "#EC4899", "#F9A8D4", "#FDF2F8", "#1F2937"],
          description: "Bold and memorable",
        },
      ],
      minimal: [
        {
          id: "pure-mono",
          name: "Pure Monochrome",
          colors: ["#000000", "#404040", "#808080", "#D4D4D4", "#FFFFFF"],
          description: "Timeless simplicity",
        },
        {
          id: "warm-gray",
          name: "Warm Gray",
          colors: ["#292524", "#57534E", "#A8A29E", "#F5F5F4", "#FFFFFF"],
          description: "Subtle and sophisticated",
        },
      ],
      warm: [
        {
          id: "autumn-harvest",
          name: "Autumn Harvest",
          colors: ["#92400E", "#D97706", "#FCD34D", "#FFFBEB", "#422006"],
          description: "Cozy and inviting",
        },
        {
          id: "terracotta",
          name: "Terracotta",
          colors: ["#9A3412", "#EA580C", "#FB923C", "#FFF7ED", "#431407"],
          description: "Earthy and natural",
        },
      ],
      cool: [
        {
          id: "arctic-blue",
          name: "Arctic Blue",
          colors: ["#0C4A6E", "#0284C7", "#38BDF8", "#E0F2FE", "#082F49"],
          description: "Cool and calming",
        },
        {
          id: "mint-fresh",
          name: "Mint Fresh",
          colors: ["#115E59", "#14B8A6", "#5EEAD4", "#F0FDFA", "#134E4A"],
          description: "Fresh and clean",
        },
      ],
    }

    suggestions.push(...palettes[selectedStyle])

    // If base color provided, generate complementary palette
    if (baseColor) {
      // Simple complementary color calculation
      const hex = baseColor.replace("#", "")
      const r = Number.parseInt(hex.substr(0, 2), 16)
      const g = Number.parseInt(hex.substr(2, 2), 16)
      const b = Number.parseInt(hex.substr(4, 2), 16)

      // Complementary
      const compR = 255 - r
      const compG = 255 - g
      const compB = 255 - b

      const toHex = (n: number) => Math.round(n).toString(16).padStart(2, "0")

      suggestions.unshift({
        id: "custom-complementary",
        name: "Based on Your Color",
        colors: [
          baseColor,
          `#${toHex(r * 0.7)}${toHex(g * 0.7)}${toHex(b * 0.7)}`,
          `#${toHex(Math.min(255, r * 1.3))}${toHex(Math.min(255, g * 1.3))}${toHex(Math.min(255, b * 1.3))}`,
          "#FFFFFF",
          `#${toHex(compR)}${toHex(compG)}${toHex(compB)}`,
        ],
        description: "Complementary palette from your brand color",
      })
    }

    return NextResponse.json({ suggestions })
  } catch {
    return NextResponse.json({ error: "Failed to generate color suggestions" }, { status: 500 })
  }
}
