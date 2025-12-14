import { NextResponse } from "next/server"
import type { Layer, CanvasSize } from "@/lib/types"

interface LayoutSuggestion {
  id: string
  name: string
  description: string
  layers: Partial<Layer>[]
}

export async function POST(request: Request) {
  try {
    const { canvasSize, layers } = (await request.json()) as {
      canvasSize: CanvasSize
      layers: Layer[]
    }

    // AI-powered layout suggestions based on:
    // - Canvas dimensions
    // - Number and types of existing elements
    // - Best practices for the platform

    const suggestions: LayoutSuggestion[] = []

    // Find image layers and text layers
    const imageLayers = layers.filter((l) => l.type === "image" || l.type === "packshot")
    const textLayers = layers.filter((l) => l.type === "text")

    // Suggestion 1: Center Focus
    suggestions.push({
      id: "center-focus",
      name: "Center Focus",
      description: "Product centered with text above and below",
      layers: [
        ...(imageLayers.length > 0
          ? [
              {
                id: imageLayers[0].id,
                x: canvasSize.width * 0.2,
                y: canvasSize.height * 0.25,
                width: canvasSize.width * 0.6,
                height: canvasSize.height * 0.5,
              },
            ]
          : []),
        ...(textLayers.length > 0
          ? [
              {
                id: textLayers[0].id,
                x: canvasSize.width * 0.1,
                y: canvasSize.height * 0.05,
                width: canvasSize.width * 0.8,
              },
            ]
          : []),
      ],
    })

    // Suggestion 2: Left Align
    suggestions.push({
      id: "left-align",
      name: "Left Aligned",
      description: "Product on left with text on right",
      layers: [
        ...(imageLayers.length > 0
          ? [
              {
                id: imageLayers[0].id,
                x: canvasSize.width * 0.05,
                y: canvasSize.height * 0.15,
                width: canvasSize.width * 0.45,
                height: canvasSize.height * 0.7,
              },
            ]
          : []),
        ...(textLayers.length > 0
          ? [
              {
                id: textLayers[0].id,
                x: canvasSize.width * 0.55,
                y: canvasSize.height * 0.35,
                width: canvasSize.width * 0.4,
              },
            ]
          : []),
      ],
    })

    // Suggestion 3: Hero Banner
    suggestions.push({
      id: "hero-banner",
      name: "Hero Banner",
      description: "Large product image with overlay text",
      layers: [
        ...(imageLayers.length > 0
          ? [
              {
                id: imageLayers[0].id,
                x: canvasSize.width * 0.3,
                y: canvasSize.height * 0.1,
                width: canvasSize.width * 0.4,
                height: canvasSize.height * 0.6,
              },
            ]
          : []),
        ...(textLayers.length > 0
          ? [
              {
                id: textLayers[0].id,
                x: canvasSize.width * 0.1,
                y: canvasSize.height * 0.75,
                width: canvasSize.width * 0.8,
              },
            ]
          : []),
      ],
    })

    return NextResponse.json({ suggestions })
  } catch {
    return NextResponse.json({ error: "Failed to generate suggestions" }, { status: 500 })
  }
}
