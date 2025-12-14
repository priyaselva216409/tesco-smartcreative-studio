"use client"

import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ImageIcon,
  Type,
  Square,
  Sparkles,
  Palette,
  Layers,
  Download,
  SlidersHorizontal,
  LayoutTemplate,
} from "lucide-react"
import { LayersPanel } from "./panels/layers-panel"
import { AssetsPanel } from "./panels/assets-panel"
import { TextPanel } from "./panels/text-panel"
import { ShapesPanel } from "./panels/shapes-panel"
import { AIPanel } from "./panels/ai-panel"
import { ColorPalettePanel } from "./panels/color-palette-panel"
import { ExportPanel } from "./panels/export-panel"
import { ImageManipulationPanel } from "./panels/image-manipulation-panel"
import { TemplatesPanel } from "./panels/templates-panel"

export function LeftSidebar() {
  const [activeTab, setActiveTab] = useState("templates")

  return (
    <aside className="flex h-full w-72 flex-col border-r border-border bg-card">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full flex-col">
        <TabsList className="grid h-auto w-full grid-cols-9 gap-1 rounded-none border-b border-border bg-transparent p-2">
          <TabsTrigger
            value="templates"
            className="flex h-10 w-auto items-center justify-center rounded-lg p-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            title="Templates"
          >
            <LayoutTemplate className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger
            value="assets"
            className="flex h-10 w-auto items-center justify-center rounded-lg p-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            title="Assets"
          >
            <ImageIcon className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger
            value="text"
            className="flex h-10 w-auto items-center justify-center rounded-lg p-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            title="Text"
          >
            <Type className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger
            value="shapes"
            className="flex h-10 w-auto items-center justify-center rounded-lg p-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            title="Shapes"
          >
            <Square className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger
            value="adjust"
            className="flex h-10 w-auto items-center justify-center rounded-lg p-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            title="Adjust"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger
            value="ai"
            className="flex h-10 w-auto items-center justify-center rounded-lg p-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            title="AI Tools"
          >
            <Sparkles className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger
            value="colors"
            className="flex h-10 w-auto items-center justify-center rounded-lg p-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            title="Colors"
          >
            <Palette className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger
            value="layers"
            className="flex h-10 w-auto items-center justify-center rounded-lg p-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            title="Layers"
          >
            <Layers className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger
            value="export"
            className="flex h-10 w-auto items-center justify-center rounded-lg p-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            title="Export"
          >
            <Download className="h-4 w-4" />
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <TabsContent value="templates" className="m-0 p-4">
            <TemplatesPanel />
          </TabsContent>
          <TabsContent value="assets" className="m-0 p-4">
            <AssetsPanel />
          </TabsContent>
          <TabsContent value="text" className="m-0 p-4">
            <TextPanel />
          </TabsContent>
          <TabsContent value="shapes" className="m-0 p-4">
            <ShapesPanel />
          </TabsContent>
          <TabsContent value="adjust" className="m-0 p-4">
            <ImageManipulationPanel />
          </TabsContent>
          <TabsContent value="ai" className="m-0 p-4">
            <AIPanel />
          </TabsContent>
          <TabsContent value="colors" className="m-0 p-4">
            <ColorPalettePanel />
          </TabsContent>
          <TabsContent value="layers" className="m-0 p-4">
            <LayersPanel />
          </TabsContent>
          <TabsContent value="export" className="m-0 p-4">
            <ExportPanel />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </aside>
  )
}
