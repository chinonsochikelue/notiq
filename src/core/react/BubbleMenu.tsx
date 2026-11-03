"use client";

import React, { useEffect, useState, useRef, useContext } from "react";
import { createPortal } from "react-dom";
import type { NotiqEditor } from "../types";
import { NotiqContext } from "./context";
import { $getSelection, $isRangeSelection } from "lexical";
import { cn } from "../../lib/utils";

export interface BubbleMenuProps {
  editor?: NotiqEditor | null;
  className?: string;
  children: React.ReactNode;
  shouldShow?: (props: { editor: NotiqEditor }) => boolean;
  offset?: number;
}

export function BubbleMenu({
  editor: propEditor,
  className,
  children,
  shouldShow,
  offset = 8,
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
      {children}
    </div>,
    document.body
  );
}
