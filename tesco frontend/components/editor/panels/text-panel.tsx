"use client"
import { useCanvas } from "@/lib/canvas-context"
import { Type } from "lucide-react"

const textPresets = [
  { name: "Heading", fontSize: 48, fontWeight: "bold" },
  { name: "Subheading", fontSize: 32, fontWeight: "600" },
  { name: "Body", fontSize: 18, fontWeight: "normal" },
  { name: "Caption", fontSize: 14, fontWeight: "normal" },
  { name: "CTA Button", fontSize: 20, fontWeight: "bold" },
]

export function TextPanel() {
  const { addLayer, canvasSize } = useCanvas()

  const addText = (preset: (typeof textPresets)[0]) => {
    addLayer({
      type: "text",
      name: preset.name,
      x: canvasSize.width / 2 - 100,
      y: canvasSize.height / 2 - 20,
      width: 200,
      height: preset.fontSize * 1.5,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      content: preset.name === "CTA Button" ? "Shop Now" : `Your ${preset.name}`,
      fontSize: preset.fontSize,
      fontWeight: preset.fontWeight,
      fill: "#000000",
      textAlign: "center",
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 text-sm font-medium text-foreground">Add Text</h3>
        <p className="text-xs text-muted-foreground">Click a preset to add text to your canvas</p>
      </div>

      <div className="space-y-2">
        {textPresets.map((preset) => (
          <button
            key={preset.name}
            className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:border-primary hover:bg-secondary"
            onClick={() => addText(preset)}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
              <Type className="h-4 w-4" />
            </div>
            <div>
              <p
                className="font-medium text-foreground"
                style={{
                  fontSize: Math.min(preset.fontSize / 3, 16),
                  fontWeight: preset.fontWeight as any,
                }}
              >
                {preset.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {preset.fontSize}px • {preset.fontWeight}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
