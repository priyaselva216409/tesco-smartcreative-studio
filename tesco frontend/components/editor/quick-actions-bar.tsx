"use client"

import { Button } from "@/components/ui/button"
import { useCanvas } from "@/lib/canvas-context"
import {
  AlignHorizontalJustifyCenter,
  AlignVerticalJustifyCenter,
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  RotateCcw,
  Lock,
  Unlock,
} from "lucide-react"

export function QuickActionsBar() {
  const {
    selectedLayer,
    updateLayer,
    deleteLayer,
    duplicateLayer,
    moveLayerUp,
    moveLayerDown,
    canvasSize,
    previewMode,
  } = useCanvas()

  if (!selectedLayer || previewMode) return null

  const centerHorizontally = () => {
    updateLayer(selectedLayer.id, {
      x: (canvasSize.width - selectedLayer.width) / 2,
    })
  }

  const centerVertically = () => {
    updateLayer(selectedLayer.id, {
      y: (canvasSize.height - selectedLayer.height) / 2,
    })
  }

  const resetRotation = () => {
    updateLayer(selectedLayer.id, { rotation: 0 })
  }

  const toggleLock = () => {
    updateLayer(selectedLayer.id, { locked: !selectedLayer.locked })
  }

  return (
    <div className="absolute bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-lg border border-border bg-card/95 p-1 shadow-lg backdrop-blur-sm">
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={centerHorizontally} title="Center Horizontally">
        <AlignHorizontalJustifyCenter className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={centerVertically} title="Center Vertically">
        <AlignVerticalJustifyCenter className="h-4 w-4" />
      </Button>

      <div className="mx-1 h-6 w-px bg-border" />

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => moveLayerUp(selectedLayer.id)}
        title="Move Up"
      >
        <ArrowUp className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => moveLayerDown(selectedLayer.id)}
        title="Move Down"
      >
        <ArrowDown className="h-4 w-4" />
      </Button>

      <div className="mx-1 h-6 w-px bg-border" />

      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={resetRotation} title="Reset Rotation">
        <RotateCcw className="h-4 w-4" />
      </Button>
      <Button
        variant={selectedLayer.locked ? "secondary" : "ghost"}
        size="icon"
        className="h-8 w-8"
        onClick={toggleLock}
        title={selectedLayer.locked ? "Unlock" : "Lock"}
      >
        {selectedLayer.locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
      </Button>

      <div className="mx-1 h-6 w-px bg-border" />

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => duplicateLayer(selectedLayer.id)}
        title="Duplicate"
      >
        <Copy className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive hover:text-destructive"
        onClick={() => deleteLayer(selectedLayer.id)}
        title="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
