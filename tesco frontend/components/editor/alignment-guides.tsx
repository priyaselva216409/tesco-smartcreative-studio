"use client"

import { useCanvas } from "@/lib/canvas-context"

export function AlignmentGuides() {
  const { guideLines, zoom, canvasSize } = useCanvas()

  if (guideLines.length === 0) return null

  return (
    <div className="pointer-events-none absolute inset-0">
      {guideLines.map((line, index) => (
        <div
          key={index}
          className={`absolute ${line.isCenter ? "bg-primary" : "bg-rose-500"}`}
          style={
            line.type === "vertical"
              ? {
                  left: line.position * zoom,
                  top: 0,
                  width: 1,
                  height: canvasSize.height * zoom,
                }
              : {
                  left: 0,
                  top: line.position * zoom,
                  width: canvasSize.width * zoom,
                  height: 1,
                }
          }
        />
      ))}
    </div>
  )
}
