"use client"

import type React from "react"

import { useRef, useState, useCallback, useEffect } from "react"
import { useCanvas } from "@/lib/canvas-context"
import { CanvasLayer } from "./canvas-layer"
import { EmptyCanvasState } from "./empty-canvas-state"
import { QuickActionsBar } from "./quick-actions-bar"
import { AlignmentGuides } from "./alignment-guides"

export function CanvasArea() {
  const {
    layers,
    canvasSize,
    backgroundColor,
    zoom,
    selectedLayerId,
    setSelectedLayerId,
    addLayer,
    deleteLayer,
    duplicateLayer,
    undo,
    redo,
    canUndo,
    canRedo,
    previewMode,
  } = useCanvas()

  const containerRef = useRef<HTMLDivElement>(null)
  const [isDraggingOver, setIsDraggingOver] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDraggingOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDraggingOver(false)

      const files = Array.from(e.dataTransfer.files)
      const imageFile = files.find((f) => f.type.startsWith("image/"))

      if (imageFile) {
        const reader = new FileReader()
        reader.onload = (event) => {
          const img = new window.Image()
          img.onload = () => {
            const rect = containerRef.current?.getBoundingClientRect()
            if (!rect) return

            const canvasRect = {
              left: (rect.width - canvasSize.width * zoom) / 2,
              top: (rect.height - canvasSize.height * zoom) / 2,
            }

            const x = (e.clientX - rect.left - canvasRect.left) / zoom
            const y = (e.clientY - rect.top - canvasRect.top) / zoom

            let width = img.width
            let height = img.height
            const maxDim = Math.min(canvasSize.width, canvasSize.height) * 0.8

            if (width > maxDim || height > maxDim) {
              const scale = maxDim / Math.max(width, height)
              width *= scale
              height *= scale
            }

            addLayer({
              type: "image",
              name: imageFile.name,
              x: Math.max(0, x - width / 2),
              y: Math.max(0, y - height / 2),
              width,
              height,
              rotation: 0,
              opacity: 1,
              visible: true,
              locked: false,
              src: event.target?.result as string,
              originalSrc: event.target?.result as string,
            })
          }
          img.src = event.target?.result as string
        }
        reader.readAsDataURL(imageFile)
      }
    },
    [addLayer, canvasSize, zoom],
  )

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.canvas === "true") {
        setSelectedLayerId(null)
      }
    },
    [setSelectedLayerId],
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      if (e.key === "Escape") {
        setSelectedLayerId(null)
      }

      if ((e.key === "Delete" || e.key === "Backspace") && selectedLayerId) {
        e.preventDefault()
        deleteLayer(selectedLayerId)
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "d" && selectedLayerId) {
        e.preventDefault()
        duplicateLayer(selectedLayerId)
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey && canUndo) {
        e.preventDefault()
        undo()
      }

      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "z" && canRedo) {
        e.preventDefault()
        redo()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [setSelectedLayerId, selectedLayerId, deleteLayer, duplicateLayer, undo, redo, canUndo, canRedo])

  return (
    <div
      ref={containerRef}
      className="relative flex-1 overflow-auto bg-background"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleCanvasClick}
    >
      {!previewMode && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, oklch(0.22 0.01 260) 1px, transparent 1px),
              linear-gradient(to bottom, oklch(0.22 0.01 260) 1px, transparent 1px)
            `,
            backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
          }}
        />
      )}

      {/* Canvas container - centered */}
      <div className="flex min-h-full min-w-full items-center justify-center p-8">
        <div
          data-canvas="true"
          className={`relative shadow-2xl transition-shadow ${isDraggingOver ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
          style={{
            width: canvasSize.width * zoom,
            height: canvasSize.height * zoom,
            backgroundColor,
            transform: `scale(1)`,
            transformOrigin: "center center",
          }}
          onClick={handleCanvasClick}
        >
          {layers.length === 0 && !isDraggingOver && !previewMode && <EmptyCanvasState />}

          <AlignmentGuides />

          {/* Render layers in order (first layer = bottom) */}
          {layers.map(
            (layer) =>
              layer.visible && (
                <CanvasLayer key={layer.id} layer={layer} zoom={zoom} isSelected={selectedLayerId === layer.id} />
              ),
          )}

          {/* Drop overlay */}
          {isDraggingOver && !previewMode && (
            <div className="absolute inset-0 flex items-center justify-center bg-primary/20 backdrop-blur-sm">
              <div className="rounded-lg bg-card px-6 py-4 text-center shadow-lg">
                <p className="text-lg font-medium text-foreground">Drop image here</p>
                <p className="text-sm text-muted-foreground">Release to add to canvas</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {!previewMode && <QuickActionsBar />}
    </div>
  )
}
