"use client";

import { CanvasProvider } from "@/lib/canvas-context";
import { EditorHeader } from "./editor/editor-header";
import { LeftSidebar } from "./editor/left-sidebar";
import { CanvasArea } from "./editor/canvas-area";
import { RightSidebar } from "./editor/right-sidebar";
import { askAI } from "@/lib/api";

export function CreativeEditor() {
  const handleAskAI = async () => {
    try {
      const response = await askAI(
        "Suggest a modern Instagram post design"
      );

      console.log("AI RESPONSE:", response.reply);
      alert("AI response received! Check console.");
    } catch (err) {
      console.error(err);
      alert("AI failed");
    }
  };

  return (
    <CanvasProvider>
      <div className="flex h-full flex-col bg-background">
        <EditorHeader />

        {/* AI BUTTON */}
        <div className="p-2 border-b">
          <button
            onClick={handleAskAI}
            className="px-4 py-2 bg-black text-white rounded"
          >
            Ask AI Assistant
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <LeftSidebar />
          <CanvasArea />
          <RightSidebar />
        </div>
      </div>
    </CanvasProvider>
  );
}
