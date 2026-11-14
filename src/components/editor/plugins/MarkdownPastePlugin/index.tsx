"use client";

import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $convertFromMarkdownString } from "@lexical/markdown";
import { $isCodeNode } from "@lexical/code";
import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  $insertNodes,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  PASTE_COMMAND,
} from "lexical";
import { NOTIQ_TRANSFORMERS } from "../../utils/markdownTransformers";

const MARKDOWN_PATTERNS: RegExp[] = [
  /^#{1,6}\s+\S/m, // Headings
  /^(?:\s*[-*+]\s+|\s*\d+\.\s+|\s*-\s+\[[ xX]\]\s+)/m, // Lists & task lists
  /^>\s+\S/m, // Blockquotes & callouts
  /^```/m, // Fenced code blocks
  /^\|.+\|\s*\n\|(?:\s*:?-+:?\s*\|)+/m, // Markdown tables
  /\$\$[^$\n]+?\$\$/, // Block equations
  /(?<!\$)\$(?!\s)[^$\n]*?\S\$/, // Inline equations
  /(\*\*[^*\n]+\*\*|\[[^\]\n]+\]\([^)\n]+\)|`[^`\n]+`)/, // Bold, links, inline code
];

/**
 * Returns true if plain clipboard text contains recognizable Markdown or math syntax.
 */
export function looksLikeMarkdown(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  return MARKDOWN_PATTERNS.some((pattern) => pattern.test(trimmed));
}

export default function MarkdownPastePlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      PASTE_COMMAND,
      (event) => {
        if (!editor.isEditable()) return false;
        if (!(event instanceof ClipboardEvent) || !event.clipboardData) {
          return false;
        }

        const { clipboardData } = event;
        if (clipboardData.files && clipboardData.files.length > 0) {
          return false;
        }

        // Preserve native Lexical or rich HTML pastes
        if (
          clipboardData.types.includes("application/x-lexical-editor") ||
          clipboardData.types.includes("text/html")
        ) {
          return false;
        }

        const plainText = clipboardData.getData("text/plain");
        if (!looksLikeMarkdown(plainText)) {
          return false;
        }

        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          return false;
        }

        const anchorParent = selection.anchor.getNode().getParent();
        if ($isCodeNode(selection.anchor.getNode()) || $isCodeNode(anchorParent)) {
          return false;
        }

        event.preventDefault();

        const root = $getRoot();
        const tempContainer = $createParagraphNode();
        root.append(tempContainer);
        try {
          $convertFromMarkdownString(plainText, NOTIQ_TRANSFORMERS, tempContainer, true);
          const nodesToInsert = tempContainer.getChildren();
          if (nodesToInsert.length > 0) {
            $insertNodes(nodesToInsert);
          }
        } finally {
          tempContainer.remove();
        }

        return true;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor]);

  return null;
}
