"use client"

import { Button } from "@/components/ui/button"
import { useCanvas } from "@/lib/canvas-context"
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  ImageIcon,
  Type,
  Square,
  Package,
} from "lucide-react"
import type { LayerType } from "@/lib/types"

const LayerIcon = ({ type }: { type: LayerType }) => {
  switch (type) {
    case "image":
      return <ImageIcon className="h-4 w-4" />
    case "packshot":
      return <Package className="h-4 w-4" />
    case "text":
      return <Type className="h-4 w-4" />
    case "shape":
      return <Square className="h-4 w-4" />
    default:
      return <Square className="h-4 w-4" />
  }
}

export function LayersPanel() {
  const {
    layers,
    selectedLayerId,
    setSelectedLayerId,
    updateLayer,
    deleteLayer,
    duplicateLayer,
    moveLayerUp,
    moveLayerDown,
  } = useCanvas()

  // Display layers in reverse order (top layer first)
  const reversedLayers = [...layers].reverse()

  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 text-sm font-medium text-foreground">Layers</h3>
        <p className="text-xs text-muted-foreground">
          {layers.length} layer{layers.length !== 1 ? "s" : ""}
        </p>
      </div>

      {reversedLayers.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-6 text-center">
          <p className="text-sm text-muted-foreground">No layers yet</p>
          <p className="mt-1 text-xs text-muted-foreground">Add images, text, or shapes to get started</p>
        </div>
      ) : (
        <div className="space-y-1">
          {reversedLayers.map((layer) => (
            <div
              key={layer.id}
              className={`group flex items-center gap-2 rounded-lg border p-2 transition-colors ${
                selectedLayerId === layer.id ? "border-primary bg-primary/10" : "border-transparent hover:bg-secondary"
              }`}
              onClick={() => setSelectedLayerId(layer.id)}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded bg-secondary">
                <LayerIcon type={layer.type} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{layer.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{layer.type}</p>
              </div>

              <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation()
                    updateLayer(layer.id, { visible: !layer.visible })
                  }}
                >
                  {layer.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation()
                    updateLayer(layer.id, { locked: !layer.locked })
                  }}
                >
                  {layer.locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedLayerId && (
        <div className="flex items-center justify-between border-t border-border pt-4">
          <div className="flex gap-1">
            <Button variant="secondary" size="icon" className="h-8 w-8" onClick={() => moveLayerUp(selectedLayerId)}>
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="icon" className="h-8 w-8" onClick={() => moveLayerDown(selectedLayerId)}>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-1">
            <Button variant="secondary" size="icon" className="h-8 w-8" onClick={() => duplicateLayer(selectedLayerId)}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => deleteLayer(selectedLayerId)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
