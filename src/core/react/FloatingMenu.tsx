"use client";

import React, { useEffect, useState, useRef, useContext } from "react";
import { createPortal } from "react-dom";
import type { NotiqEditor } from "../types";
import { NotiqContext } from "./context";
import { $getSelection, $isRangeSelection, $isElementNode } from "lexical";
import { cn } from "../../lib/utils";

export interface FloatingMenuProps {
  editor?: NotiqEditor | null;
  className?: string;
  children: React.ReactNode;
  shouldShow?: (props: { editor: NotiqEditor }) => boolean;
  offset?: number;
}

export function FloatingMenu({
  editor: propEditor,
  className,
  children,
  shouldShow,
  offset = 8,
}: FloatingMenuProps) {
  const context = useContext(NotiqContext);
  const editor = propEditor || context.editor;
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!editor) return;

    const updatePosition = () => {
      let isVisible = false;
      let targetElementKey: string | null = null;

      editor.lexical.getEditorState().read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection) && selection.isCollapsed()) {
          const anchorNode = selection.anchor.getNode();
          const element =
            anchorNode.getKey() === "root"
              ? null
              : $isElementNode(anchorNode)
              ? anchorNode
              : anchorNode.getTopLevelElement();

          if (element) {
            const text = element.getTextContent().trim();
            if (shouldShow) {
              isVisible = shouldShow({ editor });
            } else {
              // Default: show on completely empty blocks
              isVisible = text.length === 0;
            }

            if (isVisible) {
              targetElementKey = element.getKey();
            }
          }
        }
      });

      if (!isVisible || !targetElementKey) {
        setVisible(false);
        return;
      }

      const domElement = editor.lexical.getElementByKey(targetElementKey);
      if (!domElement) {
        setVisible(false);
        return;
      }

      const rect = domElement.getBoundingClientRect();
      const menuWidth = menuRef.current?.offsetWidth || 36;
      const menuHeight = menuRef.current?.offsetHeight || 36;

      // Position to the left of the line, or slightly inside if against edge
      let left = rect.left - menuWidth - offset;
      if (left < 8) {
        left = rect.left + offset;
      }

      const top = rect.top + (rect.height - menuHeight) / 2;

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
        "flex items-center gap-1 p-1 rounded-md border border-border bg-popover/90 text-popover-foreground shadow-md backdrop-blur transition-all animate-in fade-in-0 duration-150",
        className
      )}
      onMouseDown={(e) => {
        // Prevent stealing focus from the editor line
        e.preventDefault();
      }}
    >
      {children}
    </div>,
    document.body
  );
}
