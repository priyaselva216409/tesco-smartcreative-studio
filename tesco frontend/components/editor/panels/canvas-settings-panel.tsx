"use client"

import { useCanvas } from "@/lib/canvas-context"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CANVAS_SIZES } from "@/lib/types"

export function CanvasSettingsPanel() {
  const { canvasSize, setCanvasSize, backgroundColor, setBackgroundColor } = useCanvas()

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-4">
        <h3 className="text-sm font-medium text-foreground">Canvas Settings</h3>
        <p className="text-xs text-muted-foreground">Configure your creative canvas</p>
      </div>

      <div className="flex-1 space-y-4 p-4">
        {/* Canvas Size */}
        <div className="space-y-2">
          <Label className="text-xs">Format</Label>
          <Select
            value={canvasSize.name}
            onValueChange={(value) => {
              const size = CANVAS_SIZES.find((s) => s.name === value)
              if (size) setCanvasSize(size)
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CANVAS_SIZES.map((size) => (
                <SelectItem key={size.name} value={size.name}>
                  <div className="flex items-center justify-between gap-4">
                    <span>{size.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {size.width}×{size.height}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Dimensions (read-only) */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label className="text-xs">Width</Label>
            <Input value={canvasSize.width} disabled />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Height</Label>
            <Input value={canvasSize.height} disabled />
          </div>
        </div>

        {/* Platform */}
        <div className="space-y-2">
          <Label className="text-xs">Platform</Label>
          <Input value={canvasSize.platform} disabled />
        </div>

        {/* Background Color */}
        <div className="space-y-2">
          <Label className="text-xs">Background Color</Label>
          <div className="flex gap-2">
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="h-9 w-12 cursor-pointer rounded border border-border"
            />
            <Input value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} />
          </div>
        </div>

        {/* Quick Colors */}
        <div className="space-y-2">
          <Label className="text-xs">Quick Colors</Label>
          <div className="grid grid-cols-6 gap-1">
            {[
              "#FFFFFF",
              "#F3F4F6",
              "#1F2937",
              "#EF4444",
              "#22C55E",
              "#3B82F6",
              "#8B5CF6",
              "#F97316",
              "#EC4899",
              "#14B8A6",
              "#FBBF24",
              "#000000",
            ].map((color) => (
              <button
                key={color}
                className="h-8 w-full rounded border border-border transition-transform hover:scale-110"
                style={{ backgroundColor: color }}
                onClick={() => setBackgroundColor(color)}
                title={color}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
