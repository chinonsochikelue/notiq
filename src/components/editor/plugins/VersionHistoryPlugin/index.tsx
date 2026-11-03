"use client";

import React, { useEffect, useRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useVersionHistory, type DocumentVersion } from "../../../providers/VersionHistoryContext";
import VersionHistoryDrawer from "./VersionHistoryDrawer";
import NameVersionModal from "./NameVersionModal";

export default function VersionHistoryPlugin(): React.JSX.Element {
  const [editor] = useLexicalComposerContext();
  const { versions, createCheckpoint, toggleDrawer } = useVersionHistory();

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedJsonRef = useRef<string>("");

  // Handle document restore event
  useEffect(() => {
    const handleRestore = (e: Event) => {
      const customEvent = e as CustomEvent<DocumentVersion>;
      const version = customEvent.detail;
      if (!version?.editorState) return;

      try {
        const rawJson =
          typeof version.editorState === "string"
            ? version.editorState
            : JSON.stringify(version.editorState);

        const parsedState = editor.parseEditorState(rawJson);
        editor.setEditorState(parsedState);

        // Record a restore checkpoint
        createCheckpoint(`Restored to: ${version.title}`, version.editorState, false);
      } catch (err) {
        console.error("[Notiq VersionHistory] Failed to restore editor state:", err);
      }
    };

    window.addEventListener("notiq:restore-version", handleRestore);
    return () => window.removeEventListener("notiq:restore-version", handleRestore);
  }, [editor, createCheckpoint]);

  // Initial checkpoint on mount if history is empty
  useEffect(() => {
    const timer = setTimeout(() => {
      if (versions.length === 0) {
        editor.getEditorState().read(() => {
          const json = editor.getEditorState().toJSON();
          if (json?.root?.children?.length > 0) {
            lastSavedJsonRef.current = JSON.stringify(json);
            createCheckpoint("Initial Document State", json, false);
          }
        });
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [editor, versions.length, createCheckpoint]);

  // Debounced auto-checkpointing on continuous editing
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState, dirtyElements, dirtyLeaves }) => {
      if (dirtyElements.size === 0 && dirtyLeaves.size === 0) return;

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        editorState.read(() => {
          const json = editorState.toJSON();
          const str = JSON.stringify(json);
          // Only create checkpoint if content meaningfully changed
          if (str !== lastSavedJsonRef.current) {
            lastSavedJsonRef.current = str;
            createCheckpoint(undefined, json, false);
          }
        });
      }, 45000); // 45 seconds of inactivity
    });
  }, [editor, createCheckpoint]);

  // Keyboard shortcut Ctrl+Shift+H to toggle version history drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "H" || e.key === "h")) {
        e.preventDefault();
        toggleDrawer();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleDrawer]);

  return (
    <>
      <VersionHistoryDrawer />
      <NameVersionModal />
    </>
  );
}
