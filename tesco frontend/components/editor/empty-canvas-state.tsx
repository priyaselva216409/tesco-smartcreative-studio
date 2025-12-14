"use client"

import { ImageIcon, Type, Square, Sparkles, Upload } from "lucide-react"

export function EmptyCanvasState() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h3 className="mb-2 text-xl font-semibold text-foreground">Start Creating</h3>
        <p className="mb-6 text-sm text-muted-foreground">
          Add elements to your canvas using the tools on the left, or drag and drop images directly here.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card/50 px-3 py-2.5">
            <Upload className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Drag images here</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card/50 px-3 py-2.5">
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Add from Assets</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card/50 px-3 py-2.5">
            <Type className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Add Text</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card/50 px-3 py-2.5">
            <Square className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Add Shapes</span>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-dashed border-border p-4">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Keyboard shortcuts:</strong>
            <br />
            Delete - Remove selected · Cmd+D - Duplicate · Cmd+Z - Undo
          </p>
        </div>
      </div>
    </div>
  )
}
