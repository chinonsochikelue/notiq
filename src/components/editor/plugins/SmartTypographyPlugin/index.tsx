"use client";

import { useEffect, useRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isCodeNode } from "@lexical/code";
import {
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_HIGH,
  KEY_BACKSPACE_COMMAND,
  TextNode,
} from "lexical";

interface TypographyRule {
  pattern: RegExp;
  replacement: string;
}

const TYPOGRAPHY_RULES: TypographyRule[] = [
  // Chained arrows & comparisons
  { pattern: /≤>$/, replacement: "⇔" },
  { pattern: /<⇒$/, replacement: "⇔" },
  { pattern: /←>$/, replacement: "↔" },
  { pattern: /<=>$/, replacement: "⇔" },
  { pattern: /<->$/, replacement: "↔" },

  // Arrows
  { pattern: /=>$/, replacement: "⇒" },
  { pattern: /->$/, replacement: "→" },
  { pattern: /<-$/, replacement: "←" },

  // Math & comparisons
  { pattern: /<=$/, replacement: "≤" },
  { pattern: />=$/, replacement: "≥" },
  { pattern: /!=$/, replacement: "≠" },
  { pattern: /~=$/, replacement: "≈" },
  { pattern: /\+-$/, replacement: "±" },

  // Punctuation & symbols (skipping start-of-line --- so HR markdown still works)
  { pattern: /(?<=[^\s\-–]\s*)–-$/, replacement: "—" },
  { pattern: /(?<=[^\s\-–]\s*)--$/, replacement: "–" },
  { pattern: /\.\.\.$/, replacement: "…" },
  { pattern: /\([cC]\)$/, replacement: "©" },
  { pattern: /\([rR]\)$/, replacement: "®" },
  { pattern: /\((?:tm|TM)\)$/, replacement: "™" },
];

export interface SmartTypographyResult {
  text: string;
  offset: number;
  original: string;
  replacement: string;
}

export interface LastTypographyReplacement {
  nodeKey: string;
  endOffset: number;
  original: string;
  replacement: string;
}

/**
 * Checks the text immediately before `cursorOffset` for a smart typography
 * sequence and returns the updated text + adjusted cursor offset, or null.
 */
export function applySmartTypography(
  text: string,
  cursorOffset: number
): SmartTypographyResult | null {
  if (cursorOffset <= 0 || cursorOffset > text.length) return null;

  const beforeCursor = text.slice(0, cursorOffset);
  const afterCursor = text.slice(cursorOffset);

  for (const { pattern, replacement } of TYPOGRAPHY_RULES) {
    const match = beforeCursor.match(pattern);
    if (match) {
      const original = match[0];
      const prefix = beforeCursor.slice(0, beforeCursor.length - original.length);
      const nextText = prefix + replacement + afterCursor;
      const nextOffset = prefix.length + replacement.length;
      return { text: nextText, offset: nextOffset, original, replacement };
    }
  }

  return null;
}

/**
 * Reverts a previously applied smart typography replacement when the user
 * presses Backspace immediately after the replacement.
 */
export function revertSmartTypography(
  text: string,
  cursorOffset: number,
  original: string,
  replacement: string
): { text: string; offset: number } | null {
  if (cursorOffset < replacement.length || cursorOffset > text.length) {
    return null;
  }
  const start = cursorOffset - replacement.length;
  if (text.slice(start, cursorOffset) !== replacement) {
    return null;
  }
  const nextText = text.slice(0, start) + original + text.slice(cursorOffset);
  return {
    text: nextText,
    offset: start + original.length,
  };
}

export default function SmartTypographyPlugin(): null {
  const [editor] = useLexicalComposerContext();
  const lastReplacementRef = useRef<LastTypographyReplacement | null>(null);
  const skipNextTransformRef = useRef(false);

  useEffect(() => {
    const unregisterTransform = editor.registerNodeTransform(TextNode, (node) => {
      if (!editor.isEditable()) return;
      if (skipNextTransformRef.current) {
        skipNextTransformRef.current = false;
        return;
      }
      if (node.hasFormat("code")) return;

      const parent = node.getParent();
      if ($isCodeNode(parent)) return;

      const selection = $getSelection();
      if (
        !$isRangeSelection(selection) ||
        !selection.isCollapsed() ||
        selection.anchor.key !== node.getKey()
      ) {
        return;
      }

      const result = applySmartTypography(
        node.getTextContent(),
        selection.anchor.offset
      );
      if (!result) {
        lastReplacementRef.current = null;
        return;
      }

      lastReplacementRef.current = {
        nodeKey: node.getKey(),
        endOffset: result.offset,
        original: result.original,
        replacement: result.replacement,
      };
      node.setTextContent(result.text);
      node.select(result.offset, result.offset);
    });

    const unregisterBackspace = editor.registerCommand(
      KEY_BACKSPACE_COMMAND,
      (event) => {
        const last = lastReplacementRef.current;
        if (!last || !editor.isEditable()) return false;

        const selection = $getSelection();
        if (
          !$isRangeSelection(selection) ||
          !selection.isCollapsed() ||
          selection.anchor.key !== last.nodeKey ||
          selection.anchor.offset !== last.endOffset
        ) {
          lastReplacementRef.current = null;
          return false;
        }

        const node = $getNodeByKey(last.nodeKey);
        if (!$isTextNode(node)) {
          lastReplacementRef.current = null;
          return false;
        }

        const reverted = revertSmartTypography(
          node.getTextContent(),
          selection.anchor.offset,
          last.original,
          last.replacement
        );
        if (!reverted) {
          lastReplacementRef.current = null;
          return false;
        }

        event?.preventDefault();
        lastReplacementRef.current = null;
        skipNextTransformRef.current = true;
        node.setTextContent(reverted.text);
        node.select(reverted.offset, reverted.offset);
        return true;
      },
      COMMAND_PRIORITY_HIGH
    );

    return () => {
      unregisterTransform();
      unregisterBackspace();
    };
  }, [editor]);

  return null;
}
