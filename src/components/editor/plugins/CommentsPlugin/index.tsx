"use client";

import React, { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  createCommand,
  LexicalCommand,
} from "lexical";
import { useComments } from "../../../providers/CommentsContext";
import NewCommentDialog from "./NewCommentDialog";
import CommentsSidebar from "./CommentsSidebar";

export const INSERT_COMMENT_COMMAND: LexicalCommand<void> = createCommand(
  "INSERT_COMMENT_COMMAND"
);

export function findDOMElementForQuote(
  root: HTMLElement,
  quote: string
): HTMLElement | null {
  const clean = quote.trim().toLowerCase();
  if (!clean) return null;

  // 1. Walk text nodes first for direct match
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const text = node.textContent?.toLowerCase() || "";
    if (text.includes(clean)) {
      return (node.parentElement as HTMLElement) || null;
    }
  }

  // 2. Search block candidates if quote spans across elements
  const blockCandidates = root.querySelectorAll(
    "p, h1, h2, h3, h4, h5, h6, li, blockquote, td, th"
  );
  for (const el of Array.from(blockCandidates)) {
    const text = el.textContent?.toLowerCase() || "";
    if (text.includes(clean)) {
      return el as HTMLElement;
    }
  }

  // 3. Fallback: match prefix if long quote
  if (clean.length > 25) {
    const prefix = clean.slice(0, 25);
    for (const el of Array.from(blockCandidates)) {
      if (el.textContent?.toLowerCase().includes(prefix)) {
        return el as HTMLElement;
      }
    }
  }

  return null;
}

export default function CommentsPlugin(): React.JSX.Element {
  const [editor] = useLexicalComposerContext();
  const { setDraftComment } = useComments();

  // Listen for jump-to-quote events and highlight matched in-document context
  useEffect(() => {
    const handleJump = (e: Event) => {
      const customEvent = e as CustomEvent<{ quote: string; threadId: string }>;
      const quote = customEvent.detail?.quote;
      if (!quote) return;

      const root = editor.getRootElement();
      if (!root) return;

      const target = findDOMElementForQuote(root, quote);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });

        target.classList.remove("notiq-pulse-highlight");
        // Trigger browser reflow to restart animation reliably
        void target.offsetWidth;
        target.classList.add("notiq-pulse-highlight");

        setTimeout(() => {
          target.classList.remove("notiq-pulse-highlight");
        }, 2600);
      }
    };

    window.addEventListener("notiq:jump-to-quote", handleJump);
    return () => window.removeEventListener("notiq:jump-to-quote", handleJump);
  }, [editor]);

  useEffect(() => {
    return editor.registerCommand(
      INSERT_COMMENT_COMMAND,
      () => {
        editor.getEditorState().read(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const quote = selection.getTextContent();
            if (quote.trim()) {
              setDraftComment({
                quote: quote.trim(),
                isOpen: true,
              });
            }
          }
        });
        return true;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor, setDraftComment]);

  // Keyboard shortcut Ctrl+Alt+M (Google Docs standard for comment)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.altKey && (e.key === "m" || e.key === "M")) {
        e.preventDefault();
        editor.dispatchCommand(INSERT_COMMENT_COMMAND, undefined);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editor]);

  return (
    <>
      <NewCommentDialog />
      <CommentsSidebar />
    </>
  );
}
