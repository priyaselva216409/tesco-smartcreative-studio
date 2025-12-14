"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { type Layer, type CanvasSize, type ColorPalette, CANVAS_SIZES, DEFAULT_COLOR_PALETTES } from "./types"

interface SnapSettings {
  enabled: boolean
  gridSize: number
  showGuides: boolean
}

interface GuideLine {
  type: "horizontal" | "vertical"
  position: number
  isCenter?: boolean
}

interface CanvasContextType {
  layers: Layer[]
  setLayers: (layers: Layer[]) => void
  selectedLayerId: string | null
  setSelectedLayerId: (id: string | null) => void
  canvasSize: CanvasSize
  setCanvasSize: (size: CanvasSize) => void
  backgroundColor: string
  setBackgroundColor: (color: string) => void
  colorPalettes: ColorPalette[]
  setColorPalettes: (palettes: ColorPalette[]) => void
  zoom: number
  setZoom: (zoom: number) => void
  addLayer: (layer: Omit<Layer, "id">) => void
  updateLayer: (id: string, updates: Partial<Layer>) => void
  deleteLayer: (id: string) => void
  duplicateLayer: (id: string) => void
  moveLayerUp: (id: string) => void
  moveLayerDown: (id: string) => void
  selectedLayer: Layer | null
  history: Layer[][]
  historyIndex: number
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  snapSettings: SnapSettings
  setSnapSettings: (settings: SnapSettings) => void
  guideLines: GuideLine[]
  setGuideLines: (lines: GuideLine[]) => void
  previewMode: boolean
  setPreviewMode: (preview: boolean) => void
  projectName: string
  setProjectName: (name: string) => void
  clearCanvas: () => void
  loadProject: (project: {
    layers: Layer[]
    backgroundColor: string
    canvasSize: CanvasSize
    projectName: string
  }) => void
}

const CanvasContext = createContext<CanvasContextType | null>(null)

export function CanvasProvider({ children }: { children: ReactNode }) {
  const [layers, setLayersState] = useState<Layer[]>([])
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null)
  const [canvasSize, setCanvasSize] = useState<CanvasSize>(CANVAS_SIZES[2]) // Instagram Post default
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF")
  const [colorPalettes, setColorPalettes] = useState<ColorPalette[]>(DEFAULT_COLOR_PALETTES)
  const [zoom, setZoom] = useState(1)
  const [history, setHistory] = useState<Layer[][]>([[]])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [snapSettings, setSnapSettings] = useState<SnapSettings>({
    enabled: true,
    gridSize: 10,
    showGuides: true,
  })
  const [guideLines, setGuideLines] = useState<GuideLine[]>([])
  const [previewMode, setPreviewMode] = useState(false)
  const [projectName, setProjectName] = useState("Untitled Project")

  const pushToHistory = useCallback(
    (newLayers: Layer[]) => {
      setHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1)
        newHistory.push(newLayers)
        return newHistory.slice(-50)
      })
      setHistoryIndex((prev) => Math.min(prev + 1, 49))
    },
    [historyIndex],
  )

  const setLayers = useCallback(
    (newLayers: Layer[]) => {
      setLayersState(newLayers)
      pushToHistory(newLayers)
    },
    [pushToHistory],
  )

  const addLayer = useCallback(
    (layer: Omit<Layer, "id">) => {
      const newLayer: Layer = {
        ...layer,
        id: `layer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      }
      const newLayers = [...layers, newLayer]
      setLayers(newLayers)
      setSelectedLayerId(newLayer.id)
    },
    [layers, setLayers],
  )

  const updateLayer = useCallback(
    (id: string, updates: Partial<Layer>) => {
      const newLayers = layers.map((layer) => (layer.id === id ? { ...layer, ...updates } : layer))
      setLayersState(newLayers)
      pushToHistory(newLayers)
    },
    [layers, pushToHistory],
  )

  const deleteLayer = useCallback(
    (id: string) => {
      const newLayers = layers.filter((layer) => layer.id !== id)
      setLayers(newLayers)
      if (selectedLayerId === id) {
        setSelectedLayerId(null)
      }
    },
    [layers, selectedLayerId, setLayers],
  )

  const duplicateLayer = useCallback(
    (id: string) => {
      const layerToDuplicate = layers.find((l) => l.id === id)
      if (layerToDuplicate) {
        const newLayer: Layer = {
          ...layerToDuplicate,
          id: `layer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: `${layerToDuplicate.name} (copy)`,
          x: layerToDuplicate.x + 20,
          y: layerToDuplicate.y + 20,
        }
        const layerIndex = layers.findIndex((l) => l.id === id)
        const newLayers = [...layers]
        newLayers.splice(layerIndex + 1, 0, newLayer)
        setLayers(newLayers)
        setSelectedLayerId(newLayer.id)
      }
    },
    [layers, setLayers],
  )

  const moveLayerUp = useCallback(
    (id: string) => {
      const index = layers.findIndex((l) => l.id === id)
      if (index < layers.length - 1) {
        const newLayers = [...layers]
        ;[newLayers[index], newLayers[index + 1]] = [newLayers[index + 1], newLayers[index]]
        setLayers(newLayers)
      }
    },
    [layers, setLayers],
  )

  const moveLayerDown = useCallback(
    (id: string) => {
      const index = layers.findIndex((l) => l.id === id)
      if (index > 0) {
        const newLayers = [...layers]
        ;[newLayers[index], newLayers[index - 1]] = [newLayers[index - 1], newLayers[index]]
        setLayers(newLayers)
      }
    },
    [layers, setLayers],
  )

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setLayersState(history[newIndex])
    }
  }, [history, historyIndex])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setLayersState(history[newIndex])
    }
  }, [history, historyIndex])

  const clearCanvas = useCallback(() => {
    setLayers([])
    setSelectedLayerId(null)
    setBackgroundColor("#FFFFFF")
  }, [setLayers])

  const loadProject = useCallback(
    (project: { layers: Layer[]; backgroundColor: string; canvasSize: CanvasSize; projectName: string }) => {
      setLayersState(project.layers)
      setBackgroundColor(project.backgroundColor)
      setCanvasSize(project.canvasSize)
      setProjectName(project.projectName)
      setHistory([project.layers])
      setHistoryIndex(0)
      setSelectedLayerId(null)
    },
    [],
  )

  const selectedLayer = layers.find((l) => l.id === selectedLayerId) || null

  return (
    <CanvasContext.Provider
      value={{
        layers,
        setLayers,
        selectedLayerId,
        setSelectedLayerId,
        canvasSize,
        setCanvasSize,
        backgroundColor,
        setBackgroundColor,
        colorPalettes,
        setColorPalettes,
        zoom,
        setZoom,
        addLayer,
        updateLayer,
        deleteLayer,
        duplicateLayer,
        moveLayerUp,
        moveLayerDown,
        selectedLayer,
        history,
        historyIndex,
        undo,
        redo,
        canUndo: historyIndex > 0,
        canRedo: historyIndex < history.length - 1,
        snapSettings,
        setSnapSettings,
        guideLines,
        setGuideLines,
        previewMode,
        setPreviewMode,
        projectName,
        setProjectName,
        clearCanvas,
        loadProject,
      }}
    >
      {children}
    </CanvasContext.Provider>
  )
}

export function useCanvas() {
  const context = useContext(CanvasContext)
  if (!context) {
    throw new Error("useCanvas must be used within a CanvasProvider")
  }
  return context
}
