"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { useCanvas } from "@/lib/canvas-context"
import { RotateCw, FlipHorizontal, FlipVertical, Crop, Maximize2, RefreshCw } from "lucide-react"

export function ImageManipulationPanel() {
  const { selectedLayer, updateLayer, canvasSize } = useCanvas()
  const [isProcessing, setIsProcessing] = useState(false)

  if (!selectedLayer || (selectedLayer.type !== "image" && selectedLayer.type !== "packshot")) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="mb-2 text-sm font-medium text-foreground">Image Tools</h3>
          <p className="text-xs text-muted-foreground">Select an image layer to access manipulation tools</p>
        </div>
        <div className="rounded-lg border border-dashed border-border p-6 text-center">
          <p className="text-sm text-muted-foreground">No image selected</p>
        </div>
      </div>
    )
  }

  const rotateImage = (degrees: number) => {
    const newRotation = (selectedLayer.rotation + degrees) % 360
    updateLayer(selectedLayer.id, { rotation: newRotation })
  }

  const flipHorizontal = () => {
    // For flip, we'll use a negative scale approach via transform
    // Store flip state in the layer
    updateLayer(selectedLayer.id, {
      x: canvasSize.width - selectedLayer.x - selectedLayer.width,
    })
  }

  const flipVertical = () => {
    updateLayer(selectedLayer.id, {
      y: canvasSize.height - selectedLayer.y - selectedLayer.height,
    })
  }

  const fitToCanvas = () => {
    const aspectRatio = selectedLayer.width / selectedLayer.height
    const canvasAspect = canvasSize.width / canvasSize.height

    let newWidth, newHeight

    if (aspectRatio > canvasAspect) {
      newWidth = canvasSize.width
      newHeight = canvasSize.width / aspectRatio
    } else {
      newHeight = canvasSize.height
      newWidth = canvasSize.height * aspectRatio
    }

    updateLayer(selectedLayer.id, {
      width: newWidth,
      height: newHeight,
      x: (canvasSize.width - newWidth) / 2,
      y: (canvasSize.height - newHeight) / 2,
    })
  }

  const fillCanvas = () => {
    const aspectRatio = selectedLayer.width / selectedLayer.height
    const canvasAspect = canvasSize.width / canvasSize.height

    let newWidth, newHeight

    if (aspectRatio > canvasAspect) {
      newHeight = canvasSize.height
      newWidth = canvasSize.height * aspectRatio
    } else {
      newWidth = canvasSize.width
      newHeight = canvasSize.width / aspectRatio
    }

    updateLayer(selectedLayer.id, {
      width: newWidth,
      height: newHeight,
      x: (canvasSize.width - newWidth) / 2,
      y: (canvasSize.height - newHeight) / 2,
    })
  }

  const resetTransforms = () => {
    if (selectedLayer.originalSrc) {
      const img = new window.Image()
      img.onload = () => {
        let width = img.width
        let height = img.height
        const maxDim = Math.min(canvasSize.width, canvasSize.height) * 0.6

        if (width > maxDim || height > maxDim) {
          const scale = maxDim / Math.max(width, height)
          width *= scale
          height *= scale
        }

        updateLayer(selectedLayer.id, {
          width,
          height,
          x: (canvasSize.width - width) / 2,
          y: (canvasSize.height - height) / 2,
          rotation: 0,
          opacity: 1,
          src: selectedLayer.originalSrc,
        })
      }
      img.src = selectedLayer.originalSrc
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 text-sm font-medium text-foreground">Image Tools</h3>
        <p className="text-xs text-muted-foreground">Transform and manipulate your image</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="flex h-16 flex-col gap-1"
          onClick={() => rotateImage(90)}
          disabled={isProcessing}
        >
          <RotateCw className="h-4 w-4" />
          <span className="text-xs">Rotate 90°</span>
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="flex h-16 flex-col gap-1"
          onClick={flipHorizontal}
          disabled={isProcessing}
        >
          <FlipHorizontal className="h-4 w-4" />
          <span className="text-xs">Flip H</span>
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="flex h-16 flex-col gap-1"
          onClick={flipVertical}
          disabled={isProcessing}
        >
          <FlipVertical className="h-4 w-4" />
          <span className="text-xs">Flip V</span>
        </Button>
      </div>

      {/* Size Presets */}
      <div className="space-y-2">
        <Label className="text-xs">Size Presets</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" size="sm" onClick={fitToCanvas} disabled={isProcessing}>
            <Maximize2 className="mr-2 h-3 w-3" />
            Fit to Canvas
          </Button>
          <Button variant="secondary" size="sm" onClick={fillCanvas} disabled={isProcessing}>
            <Crop className="mr-2 h-3 w-3" />
            Fill Canvas
          </Button>
        </div>
      </div>

      {/* Rotation Slider */}
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

      {/* Size Adjustment */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Scale</Label>
          <span className="text-xs text-muted-foreground">
            {Math.round(selectedLayer.width)}×{Math.round(selectedLayer.height)}
          </span>
        </div>
        <Slider
          value={[100]}
          min={10}
          max={200}
          step={5}
          onValueChange={([value]) => {
            const scale = value / 100
            if (selectedLayer.originalSrc) {
              const img = new window.Image()
              img.onload = () => {
                const baseWidth = Math.min(img.width, canvasSize.width * 0.6)
                const baseHeight = (baseWidth / img.width) * img.height
                updateLayer(selectedLayer.id, {
                  width: baseWidth * scale,
                  height: baseHeight * scale,
                })
              }
              img.src = selectedLayer.originalSrc
            }
          }}
        />
      </div>

      {/* Reset */}
      <Button variant="outline" className="w-full bg-transparent" onClick={resetTransforms} disabled={isProcessing}>
        <RefreshCw className="mr-2 h-4 w-4" />
        Reset Transforms
      </Button>
    </div>
  )
}
