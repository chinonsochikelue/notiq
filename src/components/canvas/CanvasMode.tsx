"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Plus,
  StickyNote,
  FileText,
  Shapes,
  Move,
  Trash2,
  X,
  Palette,
  Sparkles,
} from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";

export interface CanvasCard {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: "note" | "doc" | "board";
  title: string;
  content: string;
  color?: string;
}

const NOTE_COLORS = [
  { name: "Yellow", bg: "bg-amber-100 dark:bg-amber-950/70 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-100" },
  { name: "Blue", bg: "bg-sky-100 dark:bg-sky-950/70 border-sky-300 dark:border-sky-800 text-sky-900 dark:text-sky-100" },
  { name: "Emerald", bg: "bg-emerald-100 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100" },
  { name: "Purple", bg: "bg-purple-100 dark:bg-purple-950/70 border-purple-300 dark:border-purple-800 text-purple-900 dark:text-purple-100" },
  { name: "Rose", bg: "bg-rose-100 dark:bg-rose-950/70 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-100" },
];

export interface CanvasModeProps {
  documentContent?: string;
  onClose?: () => void;
  className?: string;
}

export default function CanvasMode({
  documentContent = "",
  onClose,
  className,
}: CanvasModeProps) {
  // Canvas viewport state
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 80, y: 80 });
  const [isPanning, setIsPanning] = useState(false);
  const startPanRef = useRef({ x: 0, y: 0 });

  // Canvas elements state
  const [cards, setCards] = useState<CanvasCard[]>([
    {
      id: "primary-doc",
      x: 100,
      y: 100,
      width: 480,
      height: 380,
      type: "doc",
      title: "Document Core",
      content:
        documentContent ||
        `# Project Roadmap\n\n- [x] Modern Editor Framework Architecture\n- [x] Command Chaining Engine\n- [x] Inline AI Command Bar (Cmd+K)\n- [x] Notion-style Drag Handles\n- [ ] Infinite Spatial Canvas`,
      color: "bg-card border-border",
    },
    {
      id: "note-1",
      x: 640,
      y: 100,
      width: 260,
      height: 200,
      type: "note",
      title: "Architectural Vision",
      content:
        "Tiptap's ergonomics backed by Lexical's 60fps AST engine. Unmatched speed and zero cloud lock-ins.",
      color: NOTE_COLORS[0].bg,
    },
    {
      id: "note-2",
      x: 640,
      y: 340,
      width: 260,
      height: 180,
      type: "note",
      title: "Real-Time CRDTs",
      content: "Yjs + WebSocket + IndexedDB persistent offline synchronization.",
      color: NOTE_COLORS[1].bg,
    },
    {
      id: "board-1",
      x: 940,
      y: 100,
      width: 420,
      height: 320,
      type: "board",
      title: "System Flowchart (Excalidraw)",
      content: "[Interactive Whiteboard Canvas]",
      color: "bg-card border-border",
    },
  ]);

  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  // Pan canvas gesture
  const handleMouseDownCanvas = (e: React.MouseEvent) => {
    // Only pan if clicking on canvas backdrop, not on cards
    if ((e.target as HTMLElement).closest(".canvas-card")) return;
    setIsPanning(true);
    startPanRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isPanning) {
        setPan({
          x: e.clientX - startPanRef.current.x,
          y: e.clientY - startPanRef.current.y,
        });
      } else if (activeDragId) {
        setCards((prev) =>
          prev.map((card) => {
            if (card.id === activeDragId) {
              const newX = (e.clientX - pan.x) / scale - dragOffsetRef.current.x;
              const newY = (e.clientY - pan.y) / scale - dragOffsetRef.current.y;
              return { ...card, x: Math.round(newX), y: Math.round(newY) };
            }
            return card;
          })
        );
      }
    },
    [isPanning, activeDragId, pan, scale]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setActiveDragId(null);
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Card drag start
  const handleStartCardDrag = (e: React.MouseEvent, card: CanvasCard) => {
    e.stopPropagation();
    setActiveDragId(card.id);
    const mouseCanvasX = (e.clientX - pan.x) / scale;
    const mouseCanvasY = (e.clientY - pan.y) / scale;
    dragOffsetRef.current = {
      x: mouseCanvasX - card.x,
      y: mouseCanvasY - card.y,
    };
  };

  // Add new note
  const handleAddNote = () => {
    const randomColor = NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)].bg;
    const newCard: CanvasCard = {
      id: `note-${Date.now()}`,
      x: Math.round(-pan.x / scale + 200 + Math.random() * 80),
      y: Math.round(-pan.y / scale + 200 + Math.random() * 80),
      width: 240,
      height: 180,
      type: "note",
      title: "New Idea",
      content: "Type your notes or thoughts here...",
      color: randomColor,
    };
    setCards((prev) => [...prev, newCard]);
  };

  const handleDeleteCard = (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
  };

  const handleUpdateCardContent = (id: string, content: string) => {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, content } : c))
    );
  };

  const handleUpdateCardTitle = (id: string, title: string) => {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title } : c))
    );
  };

  // Zoom controls
  const zoomIn = () => setScale((s) => Math.min(2.5, s + 0.15));
  const zoomOut = () => setScale((s) => Math.max(0.4, s - 0.15));
  const resetZoom = () => {
    setScale(1);
    setPan({ x: 80, y: 80 });
  };

  return (
    <div
      className={cn(
        "relative w-full h-[calc(100vh-4rem)] overflow-hidden bg-dot-grid select-none",
        isPanning ? "cursor-grabbing" : "cursor-default",
        className
      )}
      onMouseDown={handleMouseDownCanvas}
    >
      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-6 z-30 flex items-center gap-2 p-1.5 rounded-xl border border-border/80 bg-background/90 text-foreground shadow-lg backdrop-blur-md">
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-2.5 py-1">
          Canvas View
        </Badge>

        <div className="w-[1px] h-5 bg-border/60 mx-1" />

        <Button
          size="sm"
          variant="ghost"
          onClick={handleAddNote}
          className="h-8 gap-1.5 text-xs font-medium"
        >
          <StickyNote className="w-3.5 h-3.5 text-amber-500" />
          <span>Add Sticky Note</span>
        </Button>

        <div className="w-[1px] h-5 bg-border/60 mx-1" />

        <Button
          size="sm"
          variant="ghost"
          onClick={zoomOut}
          className="h-8 w-8 p-0"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>

        <span className="text-xs font-mono font-medium px-1">
          {Math.round(scale * 100)}%
        </span>

        <Button
          size="sm"
          variant="ghost"
          onClick={zoomIn}
          className="h-8 w-8 p-0"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={resetZoom}
          className="h-8 w-8 p-0"
          title="Reset View"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </Button>

        {onClose && (
          <>
            <div className="w-[1px] h-5 bg-border/60 mx-1" />
            <Button
              size="sm"
              variant="outline"
              onClick={onClose}
              className="h-8 text-xs font-medium"
            >
              Exit Canvas
            </Button>
          </>
        )}
      </div>

      {/* Infinite Canvas Plane */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          transformOrigin: "0 0",
        }}
        className="absolute inset-0 pointer-events-none"
      >
        {cards.map((card) => (
          <div
            key={card.id}
            style={{
              position: "absolute",
              left: `${card.x}px`,
              top: `${card.y}px`,
              width: `${card.width}px`,
              minHeight: `${card.height}px`,
            }}
            className={cn(
              "canvas-card pointer-events-auto rounded-xl border shadow-xl flex flex-col overflow-hidden transition-shadow duration-150",
              card.color || "bg-card border-border",
              activeDragId === card.id ? "ring-2 ring-primary shadow-2xl z-20 cursor-grabbing" : "hover:shadow-2xl z-10"
            )}
          >
            {/* Card Header (Drag Handle) */}
            <div
              onMouseDown={(e) => handleStartCardDrag(e, card)}
              className="flex items-center justify-between px-3 py-2 border-b border-border/30 bg-black/5 dark:bg-white/5 cursor-grab active:cursor-grabbing"
            >
              <div className="flex items-center gap-1.5 flex-1 mr-2">
                {card.type === "doc" && <FileText className="w-3.5 h-3.5 text-primary shrink-0" />}
                {card.type === "note" && <StickyNote className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                {card.type === "board" && <Shapes className="w-3.5 h-3.5 text-indigo-500 shrink-0" />}

                <input
                  type="text"
                  value={card.title}
                  onChange={(e) => handleUpdateCardTitle(card.id, e.target.value)}
                  className="bg-transparent font-medium text-xs outline-none w-full"
                />
              </div>

              <div className="flex items-center gap-1">
                {card.id !== "primary-doc" && (
                  <button
                    onClick={() => handleDeleteCard(card.id)}
                    className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 opacity-60 hover:opacity-100 transition-opacity"
                    title="Delete card"
                  >
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </button>
                )}
              </div>
            </div>

            {/* Card Content Area */}
            <div className="p-3 flex-1 flex flex-col">
              {card.type === "board" ? (
                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border/50 rounded-lg p-6 text-center text-muted-foreground text-xs gap-2">
                  <Shapes className="w-8 h-8 text-indigo-500/70" />
                  <span className="font-medium text-foreground">Interactive Whiteboard</span>
                  <p className="text-[11px] max-w-[200px]">
                    Integrated with Excalidraw vector sketches and visual wireframes.
                  </p>
                </div>
              ) : (
                <textarea
                  value={card.content}
                  onChange={(e) => handleUpdateCardContent(card.id, e.target.value)}
                  className="w-full h-full min-h-[120px] bg-transparent text-xs leading-relaxed resize-none outline-none font-sans"
                  placeholder="Type your notes..."
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
