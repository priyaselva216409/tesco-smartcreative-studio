"use client"

import { useCanvas } from "@/lib/canvas-context"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Copy, Lock, Unlock, Eye, EyeOff } from "lucide-react"

const FONT_FAMILIES = [
  { value: "Inter, sans-serif", label: "Inter" },
  { value: "Arial, sans-serif", label: "Arial" },
  { value: "Helvetica, sans-serif", label: "Helvetica" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "Times New Roman, serif", label: "Times New Roman" },
  { value: "Courier New, monospace", label: "Courier New" },
  { value: "Verdana, sans-serif", label: "Verdana" },
  { value: "Trebuchet MS, sans-serif", label: "Trebuchet" },
  { value: "Impact, sans-serif", label: "Impact" },
  { value: "Comic Sans MS, cursive", label: "Comic Sans" },
]

const FONT_WEIGHTS = [
  { value: "normal", label: "Regular" },
  { value: "500", label: "Medium" },
  { value: "600", label: "Semi Bold" },
  { value: "bold", label: "Bold" },
  { value: "800", label: "Extra Bold" },
]

export function PropertiesPanel() {
  const { selectedLayer, updateLayer, deleteLayer, duplicateLayer } = useCanvas()

  if (!selectedLayer) return null

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-foreground">Properties</h3>
            <p className="text-xs text-muted-foreground capitalize">{selectedLayer.type} Layer</p>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => updateLayer(selectedLayer.id, { visible: !selectedLayer.visible })}
              title={selectedLayer.visible ? "Hide" : "Show"}
            >
              {selectedLayer.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => updateLayer(selectedLayer.id, { locked: !selectedLayer.locked })}
              title={selectedLayer.locked ? "Unlock" : "Lock"}
            >
              {selectedLayer.locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-auto p-4">
        {/* Name */}
        <div className="space-y-2">
          <Label className="text-xs">Name</Label>
          <Input value={selectedLayer.name} onChange={(e) => updateLayer(selectedLayer.id, { name: e.target.value })} />
        </div>

        {/* Position */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label className="text-xs">X Position</Label>
            <Input
              type="number"
              value={Math.round(selectedLayer.x)}
              onChange={(e) => updateLayer(selectedLayer.id, { x: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Y Position</Label>
            <Input
              type="number"
              value={Math.round(selectedLayer.y)}
              onChange={(e) => updateLayer(selectedLayer.id, { y: Number(e.target.value) })}
            />
          </div>
        </div>

        {/* Size */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label className="text-xs">Width</Label>
            <Input
              type="number"
              value={Math.round(selectedLayer.width)}
              onChange={(e) => updateLayer(selectedLayer.id, { width: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Height</Label>
            <Input
              type="number"
              value={Math.round(selectedLayer.height)}
              onChange={(e) => updateLayer(selectedLayer.id, { height: Number(e.target.value) })}
            />
          </div>
        </div>

        {/* Rotation */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Rotation</Label>
            <span className="text-xs text-muted-foreground">{selectedLayer.rotation}°</span>
          </div>
          <Slider
            value={[selectedLayer.rotation]}
            min={-180}
            max={180}
            step={1}
            onValueChange={([value]) => updateLayer(selectedLayer.id, { rotation: value })}
          />
        </div>

        {/* Opacity */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Opacity</Label>
            <span className="text-xs text-muted-foreground">{Math.round(selectedLayer.opacity * 100)}%</span>
          </div>
          <Slider
            value={[selectedLayer.opacity * 100]}
            min={0}
            max={100}
            step={1}
            onValueChange={([value]) => updateLayer(selectedLayer.id, { opacity: value / 100 })}
          />
        </div>

        {/* Text-specific properties */}
        {selectedLayer.type === "text" && (
          <>
            <div className="space-y-2">
              <Label className="text-xs">Text Content</Label>
              <Input
                value={selectedLayer.content || ""}
                onChange={(e) => updateLayer(selectedLayer.id, { content: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Font Family</Label>
              <Select
                value={selectedLayer.fontFamily || "Inter, sans-serif"}
                onValueChange={(value) => updateLayer(selectedLayer.id, { fontFamily: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_FAMILIES.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      <span style={{ fontFamily: font.value }}>{font.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label className="text-xs">Font Size</Label>
                <Input
                  type="number"
                  value={selectedLayer.fontSize || 24}
                  onChange={(e) => updateLayer(selectedLayer.id, { fontSize: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Font Weight</Label>
                <Select
                  value={selectedLayer.fontWeight || "normal"}
                  onValueChange={(value) => updateLayer(selectedLayer.id, { fontWeight: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_WEIGHTS.map((weight) => (
                      <SelectItem key={weight.value} value={weight.value}>
                        {weight.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Text Align</Label>
              <Select
                value={selectedLayer.textAlign || "center"}
                onValueChange={(value) =>
                  updateLayer(selectedLayer.id, { textAlign: value as "left" | "center" | "right" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Text Color</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={selectedLayer.fill || "#000000"}
                  onChange={(e) => updateLayer(selectedLayer.id, { fill: e.target.value })}
                  className="h-9 w-12 cursor-pointer rounded border border-border"
                />
                <Input
                  value={selectedLayer.fill || "#000000"}
                  onChange={(e) => updateLayer(selectedLayer.id, { fill: e.target.value })}
                />
              </div>
            </div>
          </>
        )}

        {/* Shape-specific properties */}
        {selectedLayer.type === "shape" && (
          <div className="space-y-2">
            <Label className="text-xs">Fill Color</Label>
            <div className="flex gap-2">
              <input
                type="color"
                value={selectedLayer.fill || "#3B82F6"}
                onChange={(e) => updateLayer(selectedLayer.id, { fill: e.target.value })}
                className="h-9 w-12 cursor-pointer rounded border border-border"
              />
              <Input
                value={selectedLayer.fill || "#3B82F6"}
                onChange={(e) => updateLayer(selectedLayer.id, { fill: e.target.value })}
              />
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="border-t border-border p-4">
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1 gap-2" onClick={() => duplicateLayer(selectedLayer.id)}>
            <Copy className="h-4 w-4" />
            Duplicate
          </Button>
          <Button variant="destructive" size="icon" onClick={() => deleteLayer(selectedLayer.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
