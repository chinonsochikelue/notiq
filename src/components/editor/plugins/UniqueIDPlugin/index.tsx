"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot, type LexicalEditor, type NodeKey } from "lexical";
import { useEffect } from "react";

const blockIdRegistry = new WeakMap<LexicalEditor, Map<NodeKey, string>>();

function getRegistry(editor: LexicalEditor): Map<NodeKey, string> {
  let map = blockIdRegistry.get(editor);
  if (!map) {
    map = new Map<NodeKey, string>();
    blockIdRegistry.set(editor, map);
  }
  return map;
}

export function generateBlockId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `blk_${crypto.randomUUID().slice(0, 8)}`;
  }
  return `blk_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

/**
 * Retrieve (or lazily assign) a persistent block ID for a given Lexical NodeKey
 * within the specified editor instance.
 */
export function getOrAssignBlockId(
  editor: LexicalEditor,
  nodeKey: NodeKey
): string {
  const map = getRegistry(editor);
  let id = map.get(nodeKey);
  if (!id) {
    id = generateBlockId();
    map.set(nodeKey, id);
  }
  return id;
}

export function getBlockId(
  editor: LexicalEditor,
  nodeKey: NodeKey
): string | undefined {
  return getRegistry(editor).get(nodeKey);
}

/**
 * Assigns stable `data-notiq-block-id` attributes to all top-level blocks in the
 * Lexical root so external consumers (comments, anchor links, RAG indexers) can
 * reliably reference individual blocks across edits.
 */
export default function UniqueIDPlugin({
  attributeName = "data-notiq-block-id",
}: {
  attributeName?: string;
} = {}): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const syncBlockIds = () => {
      const topKeys: NodeKey[] = [];
      editor.getEditorState().read(() => {
        const root = $getRoot();
        for (const child of root.getChildren()) {
          topKeys.push(child.getKey());
        }
      });

      for (const key of topKeys) {
        const dom = editor.getElementByKey(key);
        if (dom) {
          const existing = dom.getAttribute(attributeName);
          const id = existing || getOrAssignBlockId(editor, key);
          if (!existing) {
            dom.setAttribute(attributeName, id);
          } else {
            getRegistry(editor).set(key, existing);
          }
        }
      }
    };

    syncBlockIds();
    return editor.registerUpdateListener(() => {
      syncBlockIds();
    });
  }, [editor, attributeName]);

  return null;
}
