"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useCanvas } from "@/lib/canvas-context"
import { Sparkles, Wand2, ImageMinus, Palette, LayoutTemplate, Loader2, Check, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

type ColorStyle = "professional" | "vibrant" | "minimal" | "warm" | "cool"

interface LayoutSuggestion {
  id: string
  name: string
  description: string
  layers: Array<{ id: string; x?: number; y?: number; width?: number; height?: number }>
}

interface ColorSuggestion {
  id: string
  name: string
  colors: string[]
  description: string
}

export function AIPanel() {
  const { selectedLayer, updateLayer, layers, canvasSize, setBackgroundColor } = useCanvas()
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingFeature, setProcessingFeature] = useState<string | null>(null)
  const [processingStatus, setProcessingStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [aiPrompt, setAiPrompt] = useState("")
  const [colorStyle, setColorStyle] = useState<ColorStyle>("professional")
  const [layoutSuggestions, setLayoutSuggestions] = useState<LayoutSuggestion[]>([])
  const [colorSuggestions, setColorSuggestions] = useState<ColorSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState<"layouts" | "colors" | null>(null)

  const handleRemoveBackground = async () => {
    if (!selectedLayer || selectedLayer.type !== "image") return

    setIsProcessing(true)
    setProcessingFeature("background")
    setProcessingStatus("processing")
    setErrorMessage(null)

    try {
      const response = await fetch("/api/remove-background", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData: selectedLayer.src }),
      })

      if (!response.ok) throw new Error("Failed to remove background")

      const { processedImage } = await response.json()
      updateLayer(selectedLayer.id, { src: processedImage })

      setProcessingStatus("success")
    } catch {
      setProcessingStatus("error")
      setErrorMessage("Background removal failed. Please try again.")
    } finally {
      setIsProcessing(false)
      setTimeout(() => {
        setProcessingStatus("idle")
        setProcessingFeature(null)
      }, 2000)
    }
  }

  const handleSuggestLayouts = async () => {
    if (layers.length === 0) return

    setIsProcessing(true)
    setProcessingFeature("layouts")
    setProcessingStatus("processing")
    setErrorMessage(null)

    try {
      const response = await fetch("/api/suggest-layouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ canvasSize, layers }),
      })

      if (!response.ok) throw new Error("Failed to get layout suggestions")

      const { suggestions } = await response.json()
      setLayoutSuggestions(suggestions)
      setShowSuggestions("layouts")
      setProcessingStatus("success")
    } catch {
      setProcessingStatus("error")
      setErrorMessage("Failed to generate layout suggestions.")
    } finally {
      setIsProcessing(false)
      setTimeout(() => {
        setProcessingFeature(null)
      }, 500)
    }
  }

  const handleSuggestColors = async () => {
    setIsProcessing(true)
    setProcessingFeature("colors")
    setProcessingStatus("processing")
    setErrorMessage(null)

    try {
      // Get base color from any existing element
      const baseColor = layers.find((l) => l.fill)?.fill || layers.find((l) => l.type === "shape")?.fill || undefined

      const response = await fetch("/api/suggest-colors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baseColor, style: colorStyle }),
      })

      if (!response.ok) throw new Error("Failed to get color suggestions")

      const { suggestions } = await response.json()
      setColorSuggestions(suggestions)
      setShowSuggestions("colors")
      setProcessingStatus("success")
    } catch {
      setProcessingStatus("error")
      setErrorMessage("Failed to generate color suggestions.")
    } finally {
      setIsProcessing(false)
      setTimeout(() => {
        setProcessingFeature(null)
      }, 500)
    }
  }

  const applyLayout = (suggestion: LayoutSuggestion) => {
    suggestion.layers.forEach((layerUpdate) => {
      if (layerUpdate.id) {
        const updates: Partial<typeof layerUpdate> = {}
        if (layerUpdate.x !== undefined) updates.x = layerUpdate.x
        if (layerUpdate.y !== undefined) updates.y = layerUpdate.y
        if (layerUpdate.width !== undefined) updates.width = layerUpdate.width
        if (layerUpdate.height !== undefined) updates.height = layerUpdate.height
        updateLayer(layerUpdate.id, updates)
      }
    })
    setShowSuggestions(null)
  }

  const applyColorPalette = (suggestion: ColorSuggestion) => {
    // Apply first color as background
    if (suggestion.colors[0]) {
      setBackgroundColor(suggestion.colors[3] || "#FFFFFF")
    }
    // Could also apply other colors to text/shapes
    setShowSuggestions(null)
  }

  const getButtonContent = (featureName: string, icon: React.ReactNode, defaultIcon: React.ReactNode) => {
    if (processingFeature === featureName) {
      if (processingStatus === "processing") return <Loader2 className="h-4 w-4 animate-spin text-primary" />
      if (processingStatus === "success") return <Check className="h-4 w-4 text-green-500" />
      if (processingStatus === "error") return <AlertCircle className="h-4 w-4 text-destructive" />
    }
    return defaultIcon
  }

  const aiFeatures = [
    {
      id: "background",
      icon: ImageMinus,
      name: "Remove Background",
      description: "AI-powered background removal",
      action: handleRemoveBackground,
      disabled: !selectedLayer || selectedLayer.type !== "image",
    },
    {
      id: "colors",
      icon: Palette,
      name: "Suggest Colors",
      description: "Get AI color recommendations",
      action: handleSuggestColors,
      disabled: false,
    },
    {
      id: "layouts",
      icon: LayoutTemplate,
      name: "Auto Layout",
      description: "Optimize element positioning",
      action: handleSuggestLayouts,
      disabled: layers.length === 0,
    },
    {
      id: "enhance",
      icon: Wand2,
      name: "Enhance Image",
      description: "Improve image quality",
      action: async () => {
        if (!selectedLayer || selectedLayer.type !== "image") return
        setIsProcessing(true)
        setProcessingFeature("enhance")
        setProcessingStatus("processing")
        setErrorMessage(null)
        try {
          // Simulate image enhancement with delay
          await new Promise((resolve) => setTimeout(resolve, 1500))
          setProcessingStatus("success")
          // In production, would apply filters/enhancement
        } catch {
          setProcessingStatus("error")
          setErrorMessage("Image enhancement failed.")
        } finally {
          setIsProcessing(false)
          setTimeout(() => {
            setProcessingStatus("idle")
            setProcessingFeature(null)
          }, 2000)
        }
      },
      disabled: !selectedLayer || selectedLayer.type !== "image",
    },
  ]

  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          AI Tools
        </h3>
        <p className="text-xs text-muted-foreground">Leverage AI to enhance your creatives</p>
      </div>

      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        {aiFeatures.map((feature) => (
          <button
            key={feature.id}
            className={`flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors ${
              feature.disabled ? "cursor-not-allowed opacity-50" : "hover:border-primary hover:bg-secondary"
            }`}
            onClick={feature.action}
            disabled={feature.disabled || isProcessing}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              {getButtonContent(feature.id, null, <feature.icon className="h-4 w-4 text-primary" />)}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{feature.name}</p>
              <p className="text-xs text-muted-foreground">{feature.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Color Style Selection */}
      <div className="space-y-2 border-t border-border pt-4">
        <Label className="text-xs">Color Style Preference</Label>
        <RadioGroup
          value={colorStyle}
          onValueChange={(v) => setColorStyle(v as ColorStyle)}
          className="grid grid-cols-2 gap-2"
        >
          {(["professional", "vibrant", "minimal", "warm", "cool"] as const).map((style) => (
            <div key={style} className="flex items-center space-x-2">
              <RadioGroupItem value={style} id={style} />
              <Label htmlFor={style} className="text-xs capitalize cursor-pointer">
                {style}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Layout Suggestions */}
      {showSuggestions === "layouts" && layoutSuggestions.length > 0 && (
        <div className="space-y-2 border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Layout Suggestions</Label>
            <Button variant="ghost" size="sm" onClick={() => setShowSuggestions(null)}>
              Close
            </Button>
          </div>
          <div className="space-y-2">
            {layoutSuggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                className="w-full rounded-lg border border-border p-3 text-left transition-colors hover:border-primary hover:bg-secondary"
                onClick={() => applyLayout(suggestion)}
              >
                <p className="text-sm font-medium text-foreground">{suggestion.name}</p>
                <p className="text-xs text-muted-foreground">{suggestion.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color Suggestions */}
      {showSuggestions === "colors" && colorSuggestions.length > 0 && (
        <div className="space-y-2 border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Color Suggestions</Label>
            <Button variant="ghost" size="sm" onClick={() => setShowSuggestions(null)}>
              Close
            </Button>
          </div>
          <div className="space-y-2">
            {colorSuggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                className="w-full space-y-2 rounded-lg border border-border p-3 text-left transition-colors hover:border-primary hover:bg-secondary"
                onClick={() => applyColorPalette(suggestion)}
              >
                <p className="text-sm font-medium text-foreground">{suggestion.name}</p>
                <div className="flex gap-1">
                  {suggestion.colors.map((color, i) => (
                    <div key={i} className="h-6 flex-1 rounded" style={{ backgroundColor: color }} title={color} />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">{suggestion.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* AI Creative Assistant */}
      <div className="space-y-2 border-t border-border pt-4">
        <h4 className="text-xs font-medium text-muted-foreground">AI Creative Assistant</h4>
        <Textarea
          placeholder="Describe what you want to create or modify..."
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          className="min-h-20 resize-none"
        />
        <Button 
          className="w-full gap-2" 
          disabled={!aiPrompt.trim() || isProcessing}
          onClick={async () => {
            setIsProcessing(true)
            setProcessingFeature("assistant")
            setProcessingStatus("processing")
            setErrorMessage(null)
            
            try {
              const response = await fetch("http://localhost:5000/api/ai/ask", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: aiPrompt }),
              })
              
              if (!response.ok) throw new Error("Failed to get AI suggestions")
              
              const { reply } = await response.json()
              alert("🤖 AI Assistant Reply:\n\n" + reply)
              setAiPrompt("")
              setProcessingStatus("success")
            } catch (error) {
              setProcessingStatus("error")
              setErrorMessage("AI suggestions failed. Please try again.")
              console.error(error)
            } finally {
              setIsProcessing(false)
              setTimeout(() => {
                setProcessingStatus("idle")
                setProcessingFeature(null)
              }, 1000)
            }
          }}
        >
          {isProcessing && processingFeature === "assistant" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Suggestions
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
