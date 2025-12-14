"use client"

import type React from "react"

import { useRef, useState, useCallback, useEffect } from "react"
import { useCanvas } from "@/lib/canvas-context"
import type { Layer } from "@/lib/types"

interface CanvasLayerProps {
  layer: Layer
  zoom: number
  isSelected: boolean
}

export function CanvasLayer({ layer, zoom, isSelected }: CanvasLayerProps) {
  const { updateLayer, setSelectedLayerId, canvasSize, snapSettings, setGuideLines, layers, previewMode } = useCanvas()
  const elementRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState<string | null>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [initialState, setInitialState] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState("")
  const textInputRef = useRef<HTMLTextAreaElement>(null)

  const calculateSnap = useCallback(
    (x: number, y: number, width: number, height: number) => {
      if (!snapSettings.enabled) return { x, y, guides: [] }

      const guides: Array<{ type: "horizontal" | "vertical"; position: number; isCenter?: boolean }> = []
      let snappedX = x
      let snappedY = y
      const snapThreshold = 8

      // Canvas center guides
      const canvasCenterX = canvasSize.width / 2
      const canvasCenterY = canvasSize.height / 2
      const layerCenterX = x + width / 2
      const layerCenterY = y + height / 2

      // Snap to canvas center
      if (Math.abs(layerCenterX - canvasCenterX) < snapThreshold) {
        snappedX = canvasCenterX - width / 2
        guides.push({ type: "vertical", position: canvasCenterX, isCenter: true })
      }
      if (Math.abs(layerCenterY - canvasCenterY) < snapThreshold) {
        snappedY = canvasCenterY - height / 2
        guides.push({ type: "horizontal", position: canvasCenterY, isCenter: true })
      }

      // Snap to other layers
      layers.forEach((otherLayer) => {
        if (otherLayer.id === layer.id) return

        const otherCenterX = otherLayer.x + otherLayer.width / 2
        const otherCenterY = otherLayer.y + otherLayer.height / 2

        // Align centers
        if (Math.abs(layerCenterX - otherCenterX) < snapThreshold) {
          snappedX = otherCenterX - width / 2
          guides.push({ type: "vertical", position: otherCenterX })
        }
        if (Math.abs(layerCenterY - otherCenterY) < snapThreshold) {
          snappedY = otherCenterY - height / 2
          guides.push({ type: "horizontal", position: otherCenterY })
        }

        // Align edges
        if (Math.abs(x - otherLayer.x) < snapThreshold) {
          snappedX = otherLayer.x
          guides.push({ type: "vertical", position: otherLayer.x })
        }
        if (Math.abs(x + width - (otherLayer.x + otherLayer.width)) < snapThreshold) {
          snappedX = otherLayer.x + otherLayer.width - width
          guides.push({ type: "vertical", position: otherLayer.x + otherLayer.width })
        }
        if (Math.abs(y - otherLayer.y) < snapThreshold) {
          snappedY = otherLayer.y
          guides.push({ type: "horizontal", position: otherLayer.y })
        }
        if (Math.abs(y + height - (otherLayer.y + otherLayer.height)) < snapThreshold) {
          snappedY = otherLayer.y + otherLayer.height - height
          guides.push({ type: "horizontal", position: otherLayer.y + otherLayer.height })
        }
      })

      // Grid snap
      if (snapSettings.gridSize > 0 && guides.length === 0) {
        snappedX = Math.round(snappedX / snapSettings.gridSize) * snapSettings.gridSize
        snappedY = Math.round(snappedY / snapSettings.gridSize) * snapSettings.gridSize
      }

      return { x: snappedX, y: snappedY, guides }
    },
    [snapSettings, canvasSize, layers, layer.id],
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (layer.locked || isEditing || previewMode) return
      e.stopPropagation()
      setSelectedLayerId(layer.id)

      const handle = (e.target as HTMLElement).dataset.handle
      if (handle) {
        setIsResizing(true)
        setResizeHandle(handle)
      } else {
        setIsDragging(true)
      }

      setDragStart({ x: e.clientX, y: e.clientY })
      setInitialState({
        x: layer.x,
        y: layer.y,
        width: layer.width,
        height: layer.height,
      })
    },
    [layer, setSelectedLayerId, isEditing, previewMode],
  )

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (layer.type === "text" && !layer.locked && !previewMode) {
        e.stopPropagation()
        setIsEditing(true)
        setEditText(layer.content || "")
      }
    },
    [layer, previewMode],
  )

  useEffect(() => {
    if (isEditing && textInputRef.current) {
      textInputRef.current.focus()
      textInputRef.current.select()
    }
  }, [isEditing])

  const handleTextBlur = useCallback(() => {
    if (isEditing) {
      updateLayer(layer.id, { content: editText })
      setIsEditing(false)
    }
  }, [isEditing, editText, layer.id, updateLayer])

  const handleTextKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleTextBlur()
      }
      if (e.key === "Escape") {
        setIsEditing(false)
        setEditText(layer.content || "")
      }
    },
    [handleTextBlur, layer.content],
  )

  useEffect(() => {
    if (!isDragging && !isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      const dx = (e.clientX - dragStart.x) / zoom
      const dy = (e.clientY - dragStart.y) / zoom

      if (isDragging) {
        const rawX = initialState.x + dx
        const rawY = initialState.y + dy

        const { x: snappedX, y: snappedY, guides } = calculateSnap(rawX, rawY, layer.width, layer.height)

        if (snapSettings.showGuides) {
          setGuideLines(guides)
        }

        updateLayer(layer.id, {
          x: Math.max(0, Math.min(canvasSize.width - layer.width, snappedX)),
          y: Math.max(0, Math.min(canvasSize.height - layer.height, snappedY)),
        })
      } else if (isResizing && resizeHandle) {
        let newWidth = initialState.width
        let newHeight = initialState.height
        let newX = initialState.x
        let newY = initialState.y

        if (resizeHandle.includes("e")) {
          newWidth = Math.max(20, initialState.width + dx)
        }
        if (resizeHandle.includes("w")) {
          newWidth = Math.max(20, initialState.width - dx)
          newX = initialState.x + (initialState.width - newWidth)
        }
        if (resizeHandle.includes("s")) {
          newHeight = Math.max(20, initialState.height + dy)
        }
        if (resizeHandle.includes("n")) {
          newHeight = Math.max(20, initialState.height - dy)
          newY = initialState.y + (initialState.height - newHeight)
        }

        if (layer.type === "image" && e.shiftKey) {
          const aspectRatio = initialState.width / initialState.height
          if (resizeHandle.includes("e") || resizeHandle.includes("w")) {
            newHeight = newWidth / aspectRatio
          } else {
            newWidth = newHeight * aspectRatio
          }
        }

        updateLayer(layer.id, { width: newWidth, height: newHeight, x: newX, y: newY })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setIsResizing(false)
      setResizeHandle(null)
      setGuideLines([]) // Clear guides on mouse up
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [
    isDragging,
    isResizing,
    resizeHandle,
    dragStart,
    initialState,
    layer,
    zoom,
    updateLayer,
    canvasSize,
    calculateSnap,
    snapSettings,
    setGuideLines,
  ])

  const renderContent = () => {
    switch (layer.type) {
      case "image":
      case "packshot":
        return (
          <img
            src={layer.src || "/placeholder.svg"}
            alt={layer.name}
            className="pointer-events-none h-full w-full object-contain"
            style={{ transform: `rotate(${layer.rotation}deg)` }}
            draggable={false}
          />
        )
      case "text":
        if (isEditing) {
          return (
            <textarea
              ref={textInputRef}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={handleTextBlur}
              onKeyDown={handleTextKeyDown}
              className="h-full w-full resize-none bg-transparent outline-none"
              style={{
                fontSize: (layer.fontSize || 24) * zoom,
                fontFamily: layer.fontFamily || "inherit",
                fontWeight: layer.fontWeight || "normal",
                color: layer.fill || "#000000",
                textAlign: layer.textAlign || "center",
                lineHeight: 1.2,
              }}
            />
          )
        }
        return (
          <div
            className="flex h-full w-full items-center justify-center overflow-hidden"
            style={{
              fontSize: (layer.fontSize || 24) * zoom,
              fontFamily: layer.fontFamily || "inherit",
              fontWeight: layer.fontWeight || "normal",
              color: layer.fill || "#000000",
              textAlign: layer.textAlign || "center",
              transform: `rotate(${layer.rotation}deg)`,
            }}
          >
            {layer.content || "Text"}
          </div>
        )
      case "shape":
        if (layer.shapeType === "circle") {
          return (
            <div
              className="h-full w-full rounded-full"
              style={{
                backgroundColor: layer.fill || "#000000",
                transform: `rotate(${layer.rotation}deg)`,
              }}
            />
          )
        }
        if (layer.shapeType === "triangle") {
          return (
            <div
              className="h-full w-full"
              style={{
                clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                backgroundColor: layer.fill || "#000000",
                transform: `rotate(${layer.rotation}deg)`,
              }}
            />
          )
        }
        return (
          <div
            className="h-full w-full"
            style={{
              backgroundColor: layer.fill || "#000000",
              borderRadius: 4,
              transform: `rotate(${layer.rotation}deg)`,
            }}
          />
        )
      default:
        return null
    }
  }

  const handles = ["nw", "n", "ne", "e", "se", "s", "sw", "w"]

  return (
    <div
      ref={elementRef}
      className={`absolute ${previewMode ? "" : "cursor-move"} ${isSelected && !previewMode ? "z-50" : ""} ${layer.locked ? "cursor-not-allowed" : ""}`}
      style={{
        left: layer.x * zoom,
        top: layer.y * zoom,
        width: layer.width * zoom,
        height: layer.height * zoom,
        opacity: layer.opacity,
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      {renderContent()}

      {isSelected && !layer.locked && !isEditing && !previewMode && (
        <>
          <div className="pointer-events-none absolute inset-0 border-2 border-primary" />
          {handles.map((handle) => (
            <div
              key={handle}
              data-handle={handle}
              className={`absolute h-3 w-3 rounded-sm border-2 border-primary bg-background ${
                handle.includes("n") ? "-top-1.5" : ""
              } ${handle.includes("s") ? "-bottom-1.5" : ""} ${handle.includes("e") ? "-right-1.5" : ""} ${
                handle.includes("w") ? "-left-1.5" : ""
              } ${handle === "n" || handle === "s" ? "left-1/2 -translate-x-1/2" : ""} ${
                handle === "e" || handle === "w" ? "top-1/2 -translate-y-1/2" : ""
              } ${handle.includes("n") && handle.includes("w") ? "cursor-nw-resize" : ""} ${
                handle.includes("n") && handle.includes("e") ? "cursor-ne-resize" : ""
              } ${handle.includes("s") && handle.includes("w") ? "cursor-sw-resize" : ""} ${
                handle.includes("s") && handle.includes("e") ? "cursor-se-resize" : ""
              } ${handle === "n" || handle === "s" ? "cursor-ns-resize" : ""} ${
                handle === "e" || handle === "w" ? "cursor-ew-resize" : ""
              }`}
            />
          ))}
        </>
      )}
    </div>
  )
}
