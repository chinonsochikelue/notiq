"use client";

import React, { useCallback, useMemo, useState } from "react";
import * as ReactDOM from "react-dom";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  useBasicTypeaheadTriggerMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { $createTextNode, type TextNode } from "lexical";
import emojiList from "../../../../utils/emoji-list";
import { cn } from "../../../../lib/utils";

export interface EmojiCandidate {
  emoji: string;
  description: string;
  aliases: string[];
  tags: string[];
}

export function searchEmojis(query: string, limit: number = 24): EmojiCandidate[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return (emojiList as EmojiCandidate[]).slice(0, limit);
  }

  const startsWithMatches: EmojiCandidate[] = [];
  const includesMatches: EmojiCandidate[] = [];

  for (const item of emojiList as EmojiCandidate[]) {
    const aliasMatch = item.aliases?.some((a) => a.toLowerCase().startsWith(q));
    if (aliasMatch) {
      startsWithMatches.push(item);
      continue;
    }

    const inAlias = item.aliases?.some((a) => a.toLowerCase().includes(q));
    const inTag = item.tags?.some((t) => t.toLowerCase().includes(q));
    const inDesc = item.description?.toLowerCase().includes(q);
    if (inAlias || inTag || inDesc) {
      includesMatches.push(item);
    }

    if (startsWithMatches.length + includesMatches.length >= limit * 2) {
      break;
    }
  }

  return [...startsWithMatches, ...includesMatches].slice(0, limit);
}

class EmojiOption extends MenuOption {
  emoji: string;
  alias: string;
  description: string;

  constructor(candidate: EmojiCandidate) {
    const primaryAlias = candidate.aliases?.[0] ?? candidate.description;
    super(`${primaryAlias}:${candidate.emoji}`);
    this.emoji = candidate.emoji;
    this.alias = primaryAlias;
    this.description = candidate.description;
  }
}

export default function EmojiPickerPlugin() {
  const [editor] = useLexicalComposerContext();
  const [queryString, setQueryString] = useState<string | null>(null);

  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch(":", {
    minLength: 1,
  });

  const options = useMemo(() => {
    const matches = searchEmojis(queryString ?? "", 24);
    return matches.map((m) => new EmojiOption(m));
  }, [queryString]);

  const onSelectOption = useCallback(
    (
      selectedOption: EmojiOption,
      nodeToReplace: TextNode | null,
      closeMenu: () => void
    ) => {
      editor.update(() => {
        const textNode = $createTextNode(selectedOption.emoji);
        if (nodeToReplace) {
          nodeToReplace.replace(textNode);
        }
        textNode.select();
        closeMenu();
      });
    },
    [editor]
  );

  return (
    <LexicalTypeaheadMenuPlugin<EmojiOption>
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      triggerFn={checkForTriggerMatch}
      options={options}
      anchorClassName="z-[9999] pointer-events-auto"
      menuRenderFn={(
        anchorElementRef,
        { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }
      ) => {
        if (!anchorElementRef.current || options.length === 0) {
          return null;
        }

        return ReactDOM.createPortal(
          <div className="z-[100] relative w-64 rounded-xl border border-border/80 bg-popover/95 text-popover-foreground shadow-xl backdrop-blur-xl overflow-hidden flex flex-col pointer-events-auto">
            <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/40 select-none">
              Emoji
            </div>
            <ul
              className="max-h-52 overflow-y-auto overscroll-contain space-y-0.5 p-1.5"
              role="listbox"
              aria-label="Emoji options"
            >
              {options.map((option, index) => {
                const isSelected = selectedIndex === index;
                return (
                  <li key={option.key}>
                    <button
                      type="button"
                      ref={option.setRefElement}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        selectOptionAndCleanUp(option);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors cursor-pointer",
                        isSelected
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-muted/60"
                      )}
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <span className="text-base leading-none shrink-0">
                          {option.emoji}
                        </span>
                        <span className="truncate font-medium font-mono">
                          :{option.alias}:
                        </span>
                      </span>
                      <span className="truncate text-[10px] text-muted-foreground max-w-[90px]">
                        {option.description}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>,
          anchorElementRef.current
        );
      }}
    />
  );
}
