"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { useCanvas } from "@/lib/canvas-context"
import { Download, Loader2, Check, FileImage, AlertTriangle } from "lucide-react"
import { CANVAS_SIZES } from "@/lib/types"
import { Progress } from "@/components/ui/progress"
import { runComplianceCheck } from "@/lib/compliance-rules"
import { Alert, AlertDescription } from "@/components/ui/alert"

type ExportFormat = "png" | "jpeg"

interface ExportSize {
  name: string
  width: number
  height: number
  platform: string
}

export function ExportPanel() {
  const { layers, canvasSize, backgroundColor } = useCanvas()
  const [format, setFormat] = useState<ExportFormat>("png")
  const [quality, setQuality] = useState(90)
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [selectedSizes, setSelectedSizes] = useState<string[]>([canvasSize.name])
  const [showComplianceWarning, setShowComplianceWarning] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const toggleSize = (sizeName: string) => {
    setSelectedSizes((prev) => (prev.includes(sizeName) ? prev.filter((s) => s !== sizeName) : [...prev, sizeName]))
  }

  const checkCompliance = () => {
    const report = runComplianceCheck(layers, canvasSize, backgroundColor)
    return report.errors.length === 0
  }

  const exportCreative = async (size: ExportSize): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas")
      canvas.width = size.width
      canvas.height = size.height
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        resolve(null)
        return
      }

      // Draw background
      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, size.width, size.height)

      // Calculate scale factor if exporting to different size
      const scaleX = size.width / canvasSize.width
      const scaleY = size.height / canvasSize.height

      // Draw layers
      const drawLayers = async () => {
        for (const layer of layers) {
          if (!layer.visible) continue

          ctx.save()

          // Apply transforms
          const centerX = (layer.x + layer.width / 2) * scaleX
          const centerY = (layer.y + layer.height / 2) * scaleY
          ctx.translate(centerX, centerY)
          ctx.rotate((layer.rotation * Math.PI) / 180)
          ctx.globalAlpha = layer.opacity

          const scaledWidth = layer.width * scaleX
          const scaledHeight = layer.height * scaleY

          switch (layer.type) {
            case "image":
            case "packshot":
              if (layer.src) {
                const img = new window.Image()
                img.crossOrigin = "anonymous"
                await new Promise<void>((imgResolve) => {
                  img.onload = () => {
                    ctx.drawImage(img, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight)
                    imgResolve()
                  }
                  img.onerror = () => imgResolve()
                  img.src = layer.src!
                })
              }
              break

            case "text":
              ctx.font = `${layer.fontWeight || "normal"} ${(layer.fontSize || 24) * Math.min(scaleX, scaleY)}px ${layer.fontFamily || "Arial, sans-serif"}`
              ctx.fillStyle = layer.fill || "#000000"
              ctx.textAlign = layer.textAlign || "center"
              ctx.textBaseline = "middle"
              ctx.fillText(layer.content || "", 0, 0)
              break

            case "shape":
              ctx.fillStyle = layer.fill || "#000000"
              if (layer.shapeType === "circle") {
                ctx.beginPath()
                ctx.ellipse(0, 0, scaledWidth / 2, scaledHeight / 2, 0, 0, Math.PI * 2)
                ctx.fill()
              } else if (layer.shapeType === "triangle") {
                ctx.beginPath()
                ctx.moveTo(0, -scaledHeight / 2)
                ctx.lineTo(-scaledWidth / 2, scaledHeight / 2)
                ctx.lineTo(scaledWidth / 2, scaledHeight / 2)
                ctx.closePath()
                ctx.fill()
              } else {
                ctx.fillRect(-scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight)
              }
              break
          }

          ctx.restore()
        }
      }

      drawLayers().then(() => {
        // First try at current quality
        canvas.toBlob(
          (blob) => {
            if (blob && blob.size > 500 * 1024 && format === "jpeg") {
              // If too large, try with lower quality
              canvas.toBlob((smallerBlob) => resolve(smallerBlob), "image/jpeg", 0.6)
            } else {
              resolve(blob)
            }
          },
          format === "jpeg" ? "image/jpeg" : "image/png",
          format === "jpeg" ? quality / 100 : undefined,
        )
      })
    })
  }

  const handleExport = async () => {
    if (selectedSizes.length === 0) return

    // Check compliance first
    if (!checkCompliance()) {
      setShowComplianceWarning(true)
      return
    }

    setShowComplianceWarning(false)
    setIsExporting(true)
    setExportProgress(0)

    const totalSizes = selectedSizes.length

    for (let i = 0; i < selectedSizes.length; i++) {
      const sizeName = selectedSizes[i]
      const size = CANVAS_SIZES.find((s) => s.name === sizeName)
      if (!size) continue

      const blob = await exportCreative(size)
      if (blob) {
        downloadBlob(blob, `creative-${sizeName.toLowerCase().replace(/\s+/g, "-")}.${format}`)
      }

      setExportProgress(((i + 1) / totalSizes) * 100)
    }

    setIsExporting(false)
  }

  const handleExportAnyway = async () => {
    setShowComplianceWarning(false)
    setIsExporting(true)
    setExportProgress(0)

    const totalSizes = selectedSizes.length

    for (let i = 0; i < selectedSizes.length; i++) {
      const sizeName = selectedSizes[i]
      const size = CANVAS_SIZES.find((s) => s.name === sizeName)
      if (!size) continue

      const blob = await exportCreative(size)
      if (blob) {
        downloadBlob(blob, `creative-${sizeName.toLowerCase().replace(/\s+/g, "-")}.${format}`)
      }

      setExportProgress(((i + 1) / totalSizes) * 100)
    }

    setIsExporting(false)
  }

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const estimatedSize = Math.round(
    ((canvasSize.width * canvasSize.height * (format === "png" ? 4 : 3)) / 1024 / 1024) *
      (format === "jpeg" ? quality / 100 : 1) *
      0.3,
  )

  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 text-sm font-medium text-foreground">Export Creative</h3>
        <p className="text-xs text-muted-foreground">Download your creative in various formats</p>
      </div>

      {/* Compliance Warning */}
      {showComplianceWarning && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="space-y-2">
            <p>Your creative has compliance errors. Review the Compliance tab to fix issues.</p>
            <Button variant="outline" size="sm" onClick={handleExportAnyway} className="mt-2 bg-transparent">
              Export Anyway
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Format Selection */}
      <div className="space-y-2">
        <Label className="text-xs">Format</Label>
        <RadioGroup value={format} onValueChange={(v) => setFormat(v as ExportFormat)} className="flex gap-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="png" id="png" />
            <Label htmlFor="png" className="text-sm font-normal cursor-pointer">
              PNG (Transparent)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="jpeg" id="jpeg" />
            <Label htmlFor="jpeg" className="text-sm font-normal cursor-pointer">
              JPEG (Smaller)
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Quality Slider (JPEG only) */}
      {format === "jpeg" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Quality</Label>
            <span className="text-xs text-muted-foreground">{quality}%</span>
          </div>
          <Slider value={[quality]} min={50} max={100} step={5} onValueChange={([v]) => setQuality(v)} />
        </div>
      )}

      {/* Size Selection */}
      <div className="space-y-2">
        <Label className="text-xs">Export Sizes</Label>
        <div className="space-y-1 rounded-lg border border-border p-2 max-h-48 overflow-auto">
          {CANVAS_SIZES.map((size) => (
            <button
              key={size.name}
              className={`flex w-full items-center justify-between rounded-md p-2 text-left transition-colors ${
                selectedSizes.includes(size.name) ? "bg-primary/10 text-foreground" : "hover:bg-secondary"
              }`}
              onClick={() => toggleSize(size.name)}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-4 w-4 items-center justify-center rounded border ${
                    selectedSizes.includes(size.name) ? "border-primary bg-primary" : "border-muted-foreground"
                  }`}
                >
                  {selectedSizes.includes(size.name) && <Check className="h-3 w-3 text-primary-foreground" />}
                </div>
                <div>
                  <span className="text-sm">{size.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{size.platform}</span>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">
                {size.width}×{size.height}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* File Size Info */}
      <div className="flex items-start gap-2 rounded-lg bg-secondary p-3">
        <FileImage className="mt-0.5 h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-xs font-medium text-foreground">Estimated Size: ~{estimatedSize}KB per image</p>
          <p className="text-xs text-muted-foreground">Target: Under 500KB for optimal performance</p>
        </div>
      </div>

      {/* Export Progress */}
      {isExporting && (
        <div className="space-y-2">
          <Progress value={exportProgress} className="h-2" />
          <p className="text-center text-xs text-muted-foreground">Exporting... {Math.round(exportProgress)}%</p>
        </div>
      )}

      {/* Export Button */}
      <Button className="w-full gap-2" onClick={handleExport} disabled={isExporting || selectedSizes.length === 0}>
        {isExporting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            Export {selectedSizes.length} Creative{selectedSizes.length !== 1 ? "s" : ""}
          </>
        )}
      </Button>
    </div>
  )
}
