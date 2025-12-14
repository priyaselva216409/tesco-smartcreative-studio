"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useCanvas } from "@/lib/canvas-context"
import { CANVAS_SIZES } from "@/lib/types"
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Download,
  ChevronDown,
  FileImage,
  Info,
  Eye,
  EyeOff,
  Grid3X3,
  Save,
  FolderOpen,
  FilePlus,
} from "lucide-react"
import { KeyboardShortcutsDialog } from "./keyboard-shortcuts-dialog"

export function EditorHeader() {
  const {
    canvasSize,
    setCanvasSize,
    zoom,
    setZoom,
    undo,
    redo,
    canUndo,
    canRedo,
    layers,
    previewMode,
    setPreviewMode,
    snapSettings,
    setSnapSettings,
    setProjectName,
    backgroundColor,
    clearCanvas,
    loadProject,
  } = useCanvas()

  const [showInfo, setShowInfo] = useState(false)

  // 🔒 FORCE PROJECT NAME (NO "Untitled Project")
  useEffect(() => {
    setProjectName("Tesco Creative Studio")
  }, [setProjectName])

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
      {/* LEFT */}
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold text-foreground">
          Tesco Creative Studio
        </h1>

        <div className="h-6 w-px bg-border" />

        {/* FILE MENU */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              File <ChevronDown className="ml-1 h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={clearCanvas}>
              <FilePlus className="mr-2 h-4 w-4" /> New Project
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Save className="mr-2 h-4 w-4" /> Save Project
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FolderOpen className="mr-2 h-4 w-4" /> Load Project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* CANVAS SIZE */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <FileImage className="mr-1 h-4 w-4" />
              {canvasSize.name}
              <ChevronDown className="ml-1 h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            {CANVAS_SIZES.map((size) => (
              <DropdownMenuItem
                key={size.name}
                onClick={() => setCanvasSize(size)}
                className="flex justify-between"
              >
                <span>{size.name}</span>
                <span className="text-xs text-muted-foreground">
                  {size.width}×{size.height}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <span className="rounded-full bg-secondary px-2 py-1 text-xs text-muted-foreground">
          {layers.length} layers
        </span>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon">
              <Grid3X3 />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="end">
            <div className="flex justify-between">
              <span>Snap to Grid</span>
              <Switch
                checked={snapSettings.enabled}
                onCheckedChange={(v) =>
                  setSnapSettings({ ...snapSettings, enabled: v })
                }
              />
            </div>
          </PopoverContent>
        </Popover>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setPreviewMode(!previewMode)}
        >
          {previewMode ? <EyeOff /> : <Eye />}
        </Button>

        <Button size="icon" variant="ghost" onClick={undo} disabled={!canUndo}>
          <Undo2 />
        </Button>
        <Button size="icon" variant="ghost" onClick={redo} disabled={!canRedo}>
          <Redo2 />
        </Button>

        <Button size="icon" variant="ghost" onClick={() => setZoom(zoom - 0.25)}>
          <ZoomOut />
        </Button>
        <span className="w-12 text-center text-sm">
          {Math.round(zoom * 100)}%
        </span>
        <Button size="icon" variant="ghost" onClick={() => setZoom(zoom + 0.25)}>
          <ZoomIn />
        </Button>

        <KeyboardShortcutsDialog />

        {/* INFO */}
        <Dialog open={showInfo} onOpenChange={setShowInfo}>
          <DialogTrigger asChild>
            <Button size="icon" variant="ghost">
              <Info />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tesco Creative Studio</DialogTitle>
              <DialogDescription>
                AI-powered creative editor for retail media designs
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>

        <Button className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>
    </header>
  )
}
