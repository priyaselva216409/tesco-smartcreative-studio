export type LayerType = "image" | "text" | "shape" | "packshot"

export interface Layer {
  id: string
  type: LayerType
  name: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  opacity: number
  visible: boolean
  locked: boolean
  content?: string
  src?: string
  originalSrc?: string
  fill?: string
  fontSize?: number
  fontFamily?: string
  fontWeight?: string
  textAlign?: "left" | "center" | "right"
  shapeType?: "rectangle" | "circle" | "triangle"
}

export interface CanvasSize {
  name: string
  width: number
  height: number
  platform: string
}

export interface ColorPalette {
  id: string
  name: string
  colors: string[]
}

export interface Project {
  id: string
  name: string
  canvasSize: CanvasSize
  backgroundColor: string
  layers: Layer[]
  colorPalettes: ColorPalette[]
}

export const CANVAS_SIZES: CanvasSize[] = [
  { name: "Facebook Post", width: 1200, height: 630, platform: "Facebook" },
  { name: "Facebook Story", width: 1080, height: 1920, platform: "Facebook" },
  { name: "Instagram Post", width: 1080, height: 1080, platform: "Instagram" },
  { name: "Instagram Story", width: 1080, height: 1920, platform: "Instagram" },
  { name: "Instagram Landscape", width: 1080, height: 566, platform: "Instagram" },
  { name: "Twitter Post", width: 1200, height: 675, platform: "Twitter" },
]

export const DEFAULT_COLOR_PALETTES: ColorPalette[] = [
  {
    id: "brand-1",
    name: "Professional Blue",
    colors: ["#1E3A8A", "#3B82F6", "#93C5FD", "#FFFFFF", "#1F2937"],
  },
  {
    id: "brand-2",
    name: "Fresh Green",
    colors: ["#166534", "#22C55E", "#86EFAC", "#FFFFFF", "#374151"],
  },
  {
    id: "brand-3",
    name: "Warm Orange",
    colors: ["#C2410C", "#F97316", "#FDBA74", "#FFFFFF", "#1F2937"],
  },
]
