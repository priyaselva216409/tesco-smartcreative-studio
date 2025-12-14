"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCanvas } from "@/lib/canvas-context"
import { LayoutTemplate, Search, Sparkles } from "lucide-react"
import type { Layer } from "@/lib/types"

interface Template {
  id: string
  name: string
  description: string
  category: string
  thumbnail: string
  layers: Omit<Layer, "id">[]
  backgroundColor: string
}

const TEMPLATES: Template[] = [
  {
    id: "product-spotlight",
    name: "Product Spotlight",
    description: "Highlight a single product with bold text",
    category: "Product",
    thumbnail: "/product-spotlight-template.jpg",
    backgroundColor: "#1a1a2e",
    layers: [
      {
        type: "shape",
        name: "Background Accent",
        x: 0,
        y: 300,
        width: 1080,
        height: 780,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        fill: "#16213e",
        shapeType: "rectangle",
      },
      {
        type: "text",
        name: "Sale Badge",
        x: 40,
        y: 40,
        width: 200,
        height: 60,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        content: "SALE",
        fontSize: 32,
        fontWeight: "bold",
        fill: "#e94560",
      },
      {
        type: "text",
        name: "Product Name",
        x: 40,
        y: 800,
        width: 1000,
        height: 80,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        content: "Product Name",
        fontSize: 48,
        fontWeight: "bold",
        fill: "#ffffff",
      },
      {
        type: "text",
        name: "Price",
        x: 40,
        y: 900,
        width: 300,
        height: 60,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        content: "$99.99",
        fontSize: 36,
        fontWeight: "bold",
        fill: "#e94560",
      },
      {
        type: "text",
        name: "CTA",
        x: 40,
        y: 980,
        width: 200,
        height: 50,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        content: "Shop Now →",
        fontSize: 20,
        fontWeight: "normal",
        fill: "#ffffff",
      },
    ],
  },
  {
    id: "flash-sale",
    name: "Flash Sale",
    description: "Urgent sale announcement with countdown feel",
    category: "Sale",
    thumbnail: "/flash-sale-banner-template.jpg",
    backgroundColor: "#ff6b6b",
    layers: [
      {
        type: "text",
        name: "Flash Sale",
        x: 140,
        y: 400,
        width: 800,
        height: 120,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        content: "FLASH SALE",
        fontSize: 72,
        fontWeight: "bold",
        fill: "#ffffff",
        textAlign: "center",
      },
      {
        type: "text",
        name: "Discount",
        x: 240,
        y: 520,
        width: 600,
        height: 150,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        content: "50% OFF",
        fontSize: 96,
        fontWeight: "bold",
        fill: "#1a1a2e",
        textAlign: "center",
      },
      {
        type: "text",
        name: "Subtitle",
        x: 240,
        y: 680,
        width: 600,
        height: 50,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        content: "Limited time only",
        fontSize: 24,
        fill: "#ffffff",
        textAlign: "center",
      },
    ],
  },
  {
    id: "minimal-product",
    name: "Minimal Product",
    description: "Clean, modern product showcase",
    category: "Product",
    thumbnail: "/minimal-product-showcase-template.jpg",
    backgroundColor: "#f8f9fa",
    layers: [
      {
        type: "text",
        name: "Brand",
        x: 440,
        y: 100,
        width: 200,
        height: 40,
        rotation: 0,
        opacity: 0.6,
        visible: true,
        locked: false,
        content: "BRAND",
        fontSize: 14,
        fill: "#212529",
        textAlign: "center",
      },
      {
        type: "text",
        name: "Title",
        x: 140,
        y: 800,
        width: 800,
        height: 80,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        content: "Product Collection",
        fontSize: 48,
        fontWeight: "bold",
        fill: "#212529",
        textAlign: "center",
      },
      {
        type: "text",
        name: "Subtitle",
        x: 240,
        y: 880,
        width: 600,
        height: 40,
        rotation: 0,
        opacity: 0.7,
        visible: true,
        locked: false,
        content: "Discover our latest arrivals",
        fontSize: 18,
        fill: "#495057",
        textAlign: "center",
      },
    ],
  },
  {
    id: "story-promo",
    name: "Story Promo",
    description: "Vertical format for Instagram/Facebook stories",
    category: "Stories",
    thumbnail: "/story-promotion-template.jpg",
    backgroundColor: "#6c5ce7",
    layers: [
      {
        type: "shape",
        name: "Top Gradient",
        x: 0,
        y: 0,
        width: 1080,
        height: 400,
        rotation: 0,
        opacity: 0.5,
        visible: true,
        locked: false,
        fill: "#a29bfe",
        shapeType: "rectangle",
      },
      {
        type: "text",
        name: "Headline",
        x: 80,
        y: 1400,
        width: 920,
        height: 100,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        content: "New Arrivals",
        fontSize: 56,
        fontWeight: "bold",
        fill: "#ffffff",
        textAlign: "center",
      },
      {
        type: "text",
        name: "Swipe CTA",
        x: 340,
        y: 1700,
        width: 400,
        height: 50,
        rotation: 0,
        opacity: 0.9,
        visible: true,
        locked: false,
        content: "Swipe up to shop",
        fontSize: 20,
        fill: "#ffffff",
        textAlign: "center",
      },
    ],
  },
]

export function TemplatesPanel() {
  const { addLayer, setBackgroundColor, setLayers } = useCanvas()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = Array.from(new Set(TEMPLATES.map((t) => t.category)))

  const filteredTemplates = TEMPLATES.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const applyTemplate = (template: Template) => {
    setBackgroundColor(template.backgroundColor)
    // Clear existing layers and add template layers
    const newLayers = template.layers.map((layer, index) => ({
      ...layer,
      id: `layer-${Date.now()}-${index}`,
    }))
    setLayers(newLayers)
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
          <LayoutTemplate className="h-4 w-4 text-primary" />
          Templates
        </h3>
        <p className="text-xs text-muted-foreground">Start with a pre-designed layout</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory(null)}
          className="h-7 text-xs"
        >
          All
        </Button>
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="h-7 text-xs"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Template Grid */}
      <div className="space-y-3">
        {filteredTemplates.map((template) => (
          <button
            key={template.id}
            className="group w-full overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-primary hover:shadow-md"
            onClick={() => applyTemplate(template)}
          >
            <div className="h-24 w-full" style={{ backgroundColor: template.backgroundColor }}>
              <div className="flex h-full items-center justify-center p-4">
                <Sparkles className="h-8 w-8 text-white/50" />
              </div>
            </div>
            <div className="p-3 text-left">
              <p className="text-sm font-medium text-foreground">{template.name}</p>
              <p className="text-xs text-muted-foreground">{template.description}</p>
            </div>
          </button>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="py-8 text-center">
          <p className="text-sm text-muted-foreground">No templates found</p>
        </div>
      )}
    </div>
  )
}
