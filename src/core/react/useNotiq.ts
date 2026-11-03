"use client";

import { useEffect, useState, useRef, useSyncExternalStore } from "react";
import type { NotiqEditor, NotiqEditorOptions } from "../types";
import { createNotiqEditor } from "../editor";

/**
 * useNotiq hook initializes a NotiqEditor instance and binds it to the React lifecycle.
 * Automatically synchronizes with editor transaction & selection events so that
 * reactive methods like `editor.isActive()` and `editor.isFocused` re-render the calling UI.
 *
 * @example
 * ```tsx
 * const editor = useNotiq({
 *   extensions: [StarterKit],
 *   content: "# Welcome to Notiq",
 *   onUpdate: ({ editor }) => console.log(editor.getMarkdown()),
 * });
 * ```
 */
export function useNotiq(
  options: NotiqEditorOptions = {},
  deps: React.DependencyList = []
): NotiqEditor | null {
  const [editor, setEditor] = useState<NotiqEditor | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const instance = createNotiqEditor(optionsRef.current);
    setEditor(instance);

    return () => {
      instance.destroy();
      setEditor(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  // Re-render subscription to keep React UI in sync with format & selection changes
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!editor) return;

    const unlistenTransaction = editor.on("transaction", () => {
      setTick((t) => (t + 1) % 1_000_000);
    });

    const unlistenSelection = editor.on("selectionUpdate", () => {
      setTick((t) => (t + 1) % 1_000_000);
    });

    const unlistenFocus = editor.on("focus", () => {
      setTick((t) => (t + 1) % 1_000_000);
    });

    const unlistenBlur = editor.on("blur", () => {
      setTick((t) => (t + 1) % 1_000_000);
    });

    return () => {
      unlistenTransaction();
      unlistenSelection();
      unlistenFocus();
      unlistenBlur();
    };
  }, [editor]);

  return editor;
}
