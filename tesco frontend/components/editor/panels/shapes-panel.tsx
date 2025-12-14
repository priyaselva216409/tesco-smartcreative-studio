"use client"
import { useCanvas } from "@/lib/canvas-context"
import { Square, Circle, Triangle } from "lucide-react"

const shapes = [
  { name: "Rectangle", type: "rectangle", icon: Square },
  { name: "Circle", type: "circle", icon: Circle },
  { name: "Triangle", type: "triangle", icon: Triangle },
]

export function ShapesPanel() {
  const { addLayer, canvasSize } = useCanvas()

  const addShape = (shapeType: string) => {
    const size = Math.min(canvasSize.width, canvasSize.height) * 0.2

    addLayer({
      type: "shape",
      name: shapeType.charAt(0).toUpperCase() + shapeType.slice(1),
      x: (canvasSize.width - size) / 2,
      y: (canvasSize.height - size) / 2,
      width: size,
      height: size,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      fill: "#3B82F6",
      shapeType: shapeType as "rectangle" | "circle" | "triangle",
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 text-sm font-medium text-foreground">Shapes</h3>
        <p className="text-xs text-muted-foreground">Add basic shapes to your design</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {shapes.map((shape) => (
          <button
            key={shape.name}
            className="flex aspect-square flex-col items-center justify-center gap-2 rounded-lg border border-border transition-colors hover:border-primary hover:bg-secondary"
            onClick={() => addShape(shape.type)}
          >
            <shape.icon className="h-6 w-6" />
            <span className="text-xs text-muted-foreground">{shape.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
