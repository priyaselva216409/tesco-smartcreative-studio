"use client"

import type React from "react"

import { useCallback, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCanvas } from "@/lib/canvas-context"
import { Upload, Package, Search, FolderOpen, Trash2, Plus, Grid, List } from "lucide-react"
import { SAMPLE_BACKGROUNDS, SAMPLE_TEMPLATES, type Asset } from "@/lib/asset-library"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function AssetsPanel() {
  const { addLayer, canvasSize, setBackgroundColor } = useCanvas()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadedAssets, setUploadedAssets] = useState<Asset[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [activeCategory, setActiveCategory] = useState("uploads")

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>, type: Asset["type"] = "image") => {
    const files = Array.from(e.target.files || [])

    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (event) => {
          const src = event.target?.result as string

          // Get image dimensions
          const img = new window.Image()
          img.onload = () => {
            const asset: Asset = {
              id: `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name: file.name,
              type,
              src,
              category: type === "packshot" ? "packshots" : type === "logo" ? "logos" : "uploads",
              tags: [],
              uploadedAt: new Date(),
              dimensions: { width: img.width, height: img.height },
            }
            setUploadedAssets((prev) => [asset, ...prev])
          }
          img.src = src
        }
        reader.readAsDataURL(file)
      }
    })

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [])

  const addImageToCanvas = useCallback(
    (asset: Asset) => {
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

        addLayer({
          type: asset.type === "packshot" ? "packshot" : "image",
          name: asset.name,
          x: (canvasSize.width - width) / 2,
          y: (canvasSize.height - height) / 2,
          width,
          height,
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          src: asset.src,
          originalSrc: asset.src,
        })
      }
      img.src = asset.src
    },
    [addLayer, canvasSize],
  )

  const deleteAsset = (assetId: string) => {
    setUploadedAssets((prev) => prev.filter((a) => a.id !== assetId))
  }

  const filteredAssets = uploadedAssets.filter((asset) => {
    const matchesSearch =
      searchQuery === "" ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = activeCategory === "all" || asset.category === activeCategory

    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 text-sm font-medium text-foreground">Asset Library</h3>
        <p className="text-xs text-muted-foreground">Import and manage your creative assets</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFileUpload(e)}
        className="hidden"
      />

      {/* Upload Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="secondary"
          className="flex h-16 flex-col gap-1"
          onClick={() => {
            fileInputRef.current?.click()
          }}
        >
          <Upload className="h-4 w-4" />
          <span className="text-xs">Upload Image</span>
        </Button>
        <Button
          variant="secondary"
          className="flex h-16 flex-col gap-1"
          onClick={() => {
            const input = document.createElement("input")
            input.type = "file"
            input.accept = "image/*"
            input.multiple = true
            input.onchange = (e) => handleFileUpload(e as unknown as React.ChangeEvent<HTMLInputElement>, "packshot")
            input.click()
          }}
        >
          <Package className="h-4 w-4" />
          <span className="text-xs">Add Packshot</span>
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search assets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <Tabs defaultValue="uploads" onValueChange={setActiveCategory}>
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="uploads" className="text-xs py-2">
            My Uploads
          </TabsTrigger>
          <TabsTrigger value="backgrounds" className="text-xs py-2">
            Backgrounds
          </TabsTrigger>
          <TabsTrigger value="templates" className="text-xs py-2">
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="uploads" className="mt-4 space-y-3">
          {/* View Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{filteredAssets.length} assets</span>
            <div className="flex items-center gap-1">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-3 w-3" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={() => setViewMode("list")}
              >
                <List className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {filteredAssets.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-6 text-center">
              <FolderOpen className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">No assets yet</p>
              <p className="text-xs text-muted-foreground">Upload images to get started</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 gap-2">
              {filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-secondary"
                >
                  <img
                    src={asset.src || "/placeholder.svg"}
                    alt={asset.name}
                    className="h-full w-full object-cover cursor-pointer"
                    onClick={() => addImageToCanvas(asset)}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8"
                        onClick={() => addImageToCanvas(asset)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-8 w-8"
                        onClick={() => deleteAsset(asset.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-2">
                    <p className="truncate text-xs text-foreground">{asset.name}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="group flex items-center gap-3 rounded-lg border border-border p-2 hover:bg-secondary"
                >
                  <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded">
                    <img
                      src={asset.src || "/placeholder.svg"}
                      alt={asset.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{asset.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {asset.dimensions?.width}×{asset.dimensions?.height}
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => addImageToCanvas(asset)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => deleteAsset(asset.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="backgrounds" className="mt-4 space-y-3">
          <p className="text-xs text-muted-foreground">Click a background to apply to canvas</p>
          <div className="grid grid-cols-2 gap-2">
            {SAMPLE_BACKGROUNDS.map((bg) => (
              <button
                key={bg.id}
                className="group relative aspect-video overflow-hidden rounded-lg border border-border transition-all hover:border-primary hover:ring-2 hover:ring-primary/20"
                style={{ background: bg.css }}
                onClick={() => setBackgroundColor(bg.colors[0])}
              >
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-background/80 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                  <p className="p-2 text-xs font-medium text-foreground">{bg.name}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Solid Colors</p>
            <div className="grid grid-cols-6 gap-1">
              {[
                "#FFFFFF",
                "#F3F4F6",
                "#E5E7EB",
                "#D1D5DB",
                "#9CA3AF",
                "#6B7280",
                "#EF4444",
                "#F97316",
                "#FBBF24",
                "#22C55E",
                "#3B82F6",
                "#8B5CF6",
                "#EC4899",
                "#14B8A6",
                "#0EA5E9",
                "#A855F7",
                "#F43F5E",
                "#000000",
              ].map((color) => (
                <button
                  key={color}
                  className="aspect-square rounded border border-border transition-transform hover:scale-110"
                  style={{ backgroundColor: color }}
                  onClick={() => setBackgroundColor(color)}
                  title={color}
                />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="mt-4 space-y-3">
          <p className="text-xs text-muted-foreground">Quick start templates</p>
          <div className="space-y-2">
            {SAMPLE_TEMPLATES.map((template) => (
              <button
                key={template.id}
                className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:border-primary hover:bg-secondary"
              >
                <div className="h-16 w-20 flex-shrink-0 overflow-hidden rounded bg-muted">
                  <img
                    src={template.thumbnail || "/placeholder.svg"}
                    alt={template.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{template.name}</p>
                  <p className="text-xs text-muted-foreground">{template.description}</p>
                </div>
              </button>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
