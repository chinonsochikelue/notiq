"use client";

import React, { useEffect, useState, useRef, useContext } from "react";
import { createPortal } from "react-dom";
import type { NotiqEditor } from "../types";
import { NotiqContext } from "./context";
import { $getSelection, $isRangeSelection } from "lexical";
import { Sparkles } from "lucide-react";
import { cn } from "../../lib/utils";

export interface BubbleMenuProps {
  editor?: NotiqEditor | null;
  className?: string;
  children: React.ReactNode;
  shouldShow?: (props: { editor: NotiqEditor }) => boolean;
  offset?: number;
  showAskAI?: boolean;
}

export function BubbleMenu({
  editor: propEditor,
  className,
  children,
  shouldShow,
  offset = 8,
  showAskAI = true,
}: BubbleMenuProps) {
  const context = useContext(NotiqContext);
  const editor = propEditor || context.editor;
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!editor) return;

    const updatePosition = () => {
      let isVisible = false;

      editor.lexical.getEditorState().read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection) && !selection.isCollapsed()) {
          if (shouldShow) {
            isVisible = shouldShow({ editor });
          } else {
            // Default: show if selection is non-empty and editor is focused
            isVisible = selection.getTextContent().trim().length > 0;
          }
        }
      });

      if (!isVisible) {
        setVisible(false);
        return;
      }

      // Calculate DOM selection bounding rect
      const domSelection = window.getSelection();
      if (!domSelection || domSelection.rangeCount === 0) {
        setVisible(false);
        return;
      }

      const range = domSelection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      if (rect.width === 0 && rect.height === 0) {
        setVisible(false);
        return;
      }

      const menuWidth = menuRef.current?.offsetWidth || 240;
      const menuHeight = menuRef.current?.offsetHeight || 40;

      // Position horizontally centered above selection
      let left = rect.left + rect.width / 2 - menuWidth / 2;
      // Clamp within viewport
      left = Math.max(16, Math.min(window.innerWidth - menuWidth - 16, left));

      // Try positioning above selection; if off screen, position below
      let top = rect.top - menuHeight - offset;
      if (top < 10) {
        top = rect.bottom + offset;
      }

      setCoords({ top, left });
      setVisible(true);
    };

    const unregisterListener = editor.lexical.registerUpdateListener(() => {
      updatePosition();
    });

    const handleSelectionChange = () => {
      updatePosition();
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    window.addEventListener("resize", handleSelectionChange);
    window.addEventListener("scroll", handleSelectionChange, true);

    return () => {
      unregisterListener();
      document.removeEventListener("selectionchange", handleSelectionChange);
      window.removeEventListener("resize", handleSelectionChange);
      window.removeEventListener("scroll", handleSelectionChange, true);
    };
  }, [editor, shouldShow, offset]);

  if (!visible || !coords) {
    return null;
  }

  return createPortal(
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        zIndex: 50,
      }}
      className={cn(
        "flex items-center gap-1 p-1 rounded-lg border border-border bg-popover/95 text-popover-foreground shadow-xl backdrop-blur-md transition-all animate-in fade-in-0 zoom-in-95",
        className
      )}
      onMouseDown={(e) => {
        // Prevent losing editor focus when interacting with menu buttons
        e.preventDefault();
      }}
    >
      {showAskAI && typeof editor?.commands?.openAICommandBar === "function" && (
        <>
          <button
            type="button"
            onClick={() => editor.commands.openAICommandBar()}
            className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-md bg-primary/10 hover:bg-primary/20 text-primary transition-all mr-0.5"
            title="Ask AI (⌘K)"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask AI</span>
            <kbd className="text-[10px] font-mono opacity-60">⌘K</kbd>
          </button>
          <div className="w-[1px] h-4 bg-border/60 mx-0.5" />
        </>
      )}
      {children}
    </div>,
    document.body
  );
}
