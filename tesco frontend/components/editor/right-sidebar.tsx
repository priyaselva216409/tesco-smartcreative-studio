"use client"

import { useState } from "react"
import { useCanvas } from "@/lib/canvas-context"
import { PropertiesPanel } from "./panels/properties-panel"
import { CanvasSettingsPanel } from "./panels/canvas-settings-panel"
import { CompliancePanel } from "./panels/compliance-panel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, ShieldCheck } from "lucide-react"

export function RightSidebar() {
  const { selectedLayer } = useCanvas()
  const [activeTab, setActiveTab] = useState("properties")

  return (
    <aside className="flex h-full w-72 flex-col border-l border-border bg-card">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full flex-col">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-none border-b border-border bg-transparent p-2">
          <TabsTrigger
            value="properties"
            className="flex items-center gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Settings className="h-4 w-4" />
            Properties
          </TabsTrigger>
          <TabsTrigger
            value="compliance"
            className="flex items-center gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <ShieldCheck className="h-4 w-4" />
            Compliance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="m-0 flex-1 overflow-auto">
          {selectedLayer ? <PropertiesPanel /> : <CanvasSettingsPanel />}
        </TabsContent>
        <TabsContent value="compliance" className="m-0 flex-1 overflow-auto p-4">
          <CompliancePanel />
        </TabsContent>
      </Tabs>
    </aside>
  )
}
