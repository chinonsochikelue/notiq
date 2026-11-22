"use client";

import React, { useEffect, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot, type EditorState } from "lexical";
import { cn } from "../../../../lib/utils";

export interface TextStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  readingTimeMinutes: number;
  remaining: number | null;
  isOverLimit: boolean;
}

export function computeTextStats(
  text: string,
  maxCharacters?: number
): TextStats {
  const normalized = text.trim();
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s+/g, "").length;
  const words = normalized ? normalized.split(/\s+/).length : 0;
  const readingTimeMinutes = words === 0 ? 0 : Math.max(1, Math.ceil(words / 200));

  const hasLimit = typeof maxCharacters === "number" && maxCharacters > 0;
  const remaining = hasLimit ? maxCharacters - characters : null;
  const isOverLimit = hasLimit ? characters > maxCharacters : false;

  return {
    characters,
    charactersNoSpaces,
    words,
    readingTimeMinutes,
    remaining,
    isOverLimit,
  };
}

export function extractEditorTextStats(
  editorState: EditorState,
  maxCharacters?: number
): TextStats {
  let rawText = "";
  editorState.read(() => {
    rawText = $getRoot().getTextContent();
  });
  return computeTextStats(rawText, maxCharacters);
}

/**
 * Headless hook that tracks live word count, character count, and reading time
 * for the active Lexical editor.
 */
export function useCharacterCount(maxCharacters?: number): TextStats {
  const [editor] = useLexicalComposerContext();
  const [stats, setStats] = useState<TextStats>(() =>
    extractEditorTextStats(editor.getEditorState(), maxCharacters)
  );

  useEffect(() => {
    setStats(extractEditorTextStats(editor.getEditorState(), maxCharacters));
    return editor.registerUpdateListener(({ editorState }) => {
      setStats(extractEditorTextStats(editorState, maxCharacters));
    });
  }, [editor, maxCharacters]);

  return stats;
}

export default function CharacterCountPlugin({
  maxCharacters,
  showStatusBar = true,
  className,
}: {
  maxCharacters?: number;
  showStatusBar?: boolean;
  className?: string;
}) {
  const stats = useCharacterCount(maxCharacters);

  if (!showStatusBar) {
    return null;
  }

  return (
    <div
      aria-label="Document statistics"
      className={cn(
        "mt-3 flex items-center justify-end gap-2.5 px-2 text-[11px] font-medium text-muted-foreground select-none",
        stats.isOverLimit && "text-destructive",
        className
      )}
    >
      <span>
        {stats.words} {stats.words === 1 ? "word" : "words"}
      </span>
      <span aria-hidden="true">·</span>
      <span>
        {stats.characters}
        {typeof maxCharacters === "number" ? ` / ${maxCharacters}` : ""} chars
      </span>
      {stats.readingTimeMinutes > 0 && (
        <>
          <span aria-hidden="true">·</span>
          <span>~{stats.readingTimeMinutes} min read</span>
        </>
      )}
    </div>
  );
}
