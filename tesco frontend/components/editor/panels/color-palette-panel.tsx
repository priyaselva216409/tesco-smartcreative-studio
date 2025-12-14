"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCanvas } from "@/lib/canvas-context"
import { Plus, Trash2, Check, Pipette, Copy, Star, StarOff } from "lucide-react"
import type { ColorPalette } from "@/lib/types"

export function ColorPalettePanel() {
  const { colorPalettes, setColorPalettes, setBackgroundColor, selectedLayer, updateLayer } = useCanvas()
  const [newPaletteName, setNewPaletteName] = useState("")
  const [newColors, setNewColors] = useState<string[]>(["#000000"])
  const [isCreating, setIsCreating] = useState(false)
  const [copiedColor, setCopiedColor] = useState<string | null>(null)
  const [favoritePalettes, setFavoritePalettes] = useState<string[]>([])

  const applyColor = (color: string) => {
    if (selectedLayer) {
      if (selectedLayer.type === "text" || selectedLayer.type === "shape") {
        updateLayer(selectedLayer.id, { fill: color })
      }
    } else {
      setBackgroundColor(color)
    }
  }

  const copyColorToClipboard = async (color: string) => {
    try {
      await navigator.clipboard.writeText(color)
      setCopiedColor(color)
      setTimeout(() => setCopiedColor(null), 2000)
    } catch {
      console.error("Failed to copy color")
    }
  }

  const addPalette = () => {
    if (newPaletteName && newColors.length > 0) {
      const palette: ColorPalette = {
        id: `palette-${Date.now()}`,
        name: newPaletteName,
        colors: newColors,
      }
      setColorPalettes([...colorPalettes, palette])
      setNewPaletteName("")
      setNewColors(["#000000"])
      setIsCreating(false)
    }
  }

  const deletePalette = (id: string) => {
    setColorPalettes(colorPalettes.filter((p) => p.id !== id))
    setFavoritePalettes((prev) => prev.filter((f) => f !== id))
  }

  const toggleFavorite = (id: string) => {
    setFavoritePalettes((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]))
  }

  const addColorToPalette = (paletteId: string, color: string) => {
    setColorPalettes(
      colorPalettes.map((p) =>
        p.id === paletteId && p.colors.length < 10 ? { ...p, colors: [...p.colors, color] } : p,
      ),
    )
  }

  const removeColorFromPalette = (paletteId: string, colorIndex: number) => {
    setColorPalettes(
      colorPalettes.map((p) =>
        p.id === paletteId && p.colors.length > 1 ? { ...p, colors: p.colors.filter((_, i) => i !== colorIndex) } : p,
      ),
    )
  }

  // Sort palettes with favorites first
  const sortedPalettes = [...colorPalettes].sort((a, b) => {
    const aFav = favoritePalettes.includes(a.id) ? -1 : 0
    const bFav = favoritePalettes.includes(b.id) ? -1 : 0
    return aFav - bFav
  })

  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 text-sm font-medium text-foreground">Color Palettes</h3>
        <p className="text-xs text-muted-foreground">
          {selectedLayer ? "Click a color to apply to selected layer" : "Click a color to set as background"}
        </p>
      </div>

      {/* Quick color picker */}
      <div className="space-y-2">
        <Label className="text-xs">Quick Color Picker</Label>
        <div className="flex gap-2">
          <div className="relative">
            <input
              type="color"
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              onChange={(e) => applyColor(e.target.value)}
            />
            <Button variant="secondary" size="icon" className="h-9 w-9">
              <Pipette className="h-4 w-4" />
            </Button>
          </div>
          <Input placeholder="#000000" className="flex-1 font-mono" onBlur={(e) => applyColor(e.target.value)} />
        </div>
      </div>

      {/* Palettes */}
      <div className="space-y-3">
        {sortedPalettes.map((palette) => (
          <div key={palette.id} className="space-y-2 rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button onClick={() => toggleFavorite(palette.id)} className="text-muted-foreground hover:text-primary">
                  {favoritePalettes.includes(palette.id) ? (
                    <Star className="h-3 w-3 fill-primary text-primary" />
                  ) : (
                    <StarOff className="h-3 w-3" />
                  )}
                </button>
                <span className="text-xs font-medium text-foreground">{palette.name}</span>
              </div>
              {!palette.id.startsWith("brand-") && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                  onClick={() => deletePalette(palette.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="flex gap-1">
              {palette.colors.map((color, index) => (
                <div key={index} className="group relative flex-1">
                  <button
                    className="h-8 w-full rounded-md border border-border transition-transform hover:scale-105 hover:z-10"
                    style={{ backgroundColor: color }}
                    onClick={() => applyColor(color)}
                    title={color}
                  />
                  {/* Color actions on hover */}
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-20 hidden group-hover:flex items-center gap-1 bg-popover border border-border rounded p-1 shadow-lg">
                    <button
                      className="p-1 hover:bg-secondary rounded"
                      onClick={(e) => {
                        e.stopPropagation()
                        copyColorToClipboard(color)
                      }}
                      title="Copy color"
                    >
                      {copiedColor === color ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                    {!palette.id.startsWith("brand-") && palette.colors.length > 1 && (
                      <button
                        className="p-1 hover:bg-destructive/10 rounded text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeColorFromPalette(palette.id, index)
                        }}
                        title="Remove color"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {/* Add color button for custom palettes */}
              {!palette.id.startsWith("brand-") && palette.colors.length < 10 && (
                <div className="relative">
                  <input
                    type="color"
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    onChange={(e) => addColorToPalette(palette.id, e.target.value)}
                  />
                  <button className="flex h-8 w-8 items-center justify-center rounded-md border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create new palette */}
      {isCreating ? (
        <div className="space-y-3 rounded-lg border border-primary bg-primary/5 p-3">
          <Input
            placeholder="Palette name"
            value={newPaletteName}
            onChange={(e) => setNewPaletteName(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            {newColors.map((color, index) => (
              <div key={index} className="relative group">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => {
                    const updated = [...newColors]
                    updated[index] = e.target.value
                    setNewColors(updated)
                  }}
                  className="h-8 w-8 cursor-pointer rounded border-0"
                />
                {newColors.length > 1 && (
                  <button
                    className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 flex items-center justify-center"
                    onClick={() => setNewColors(newColors.filter((_, i) => i !== index))}
                  >
                    <Trash2 className="h-2 w-2" />
                  </button>
                )}
              </div>
            ))}
            {newColors.length < 10 && (
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8"
                onClick={() => setNewColors([...newColors, "#808080"])}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="flex-1" onClick={addPalette} disabled={!newPaletteName.trim()}>
              <Check className="mr-2 h-3 w-3" />
              Save Palette
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setIsCreating(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" className="w-full bg-transparent" onClick={() => setIsCreating(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Palette
        </Button>
      )}

      {/* Brand Guidelines Info */}
      <div className="rounded-lg bg-secondary p-3 text-xs text-muted-foreground">
        <p className="font-medium text-foreground mb-1">Brand Color Tips</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>Use your primary brand color for CTAs</li>
          <li>Maintain consistent accent colors</li>
          <li>Ensure sufficient contrast for readability</li>
        </ul>
      </div>
    </div>
  )
}
