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
import { Calendar, User } from "lucide-react";
import { $createMentionNode, type MentionKind } from "../../nodes/MentionNode";
import { useOptionalCollab } from "../../../providers/CollabContext";
import { cn } from "../../../../lib/utils";

class MentionOption extends MenuOption {
  name: string;
  kind: MentionKind;
  subtitle?: string;
  color?: string;
  avatar?: string;
  insertText?: string;

  constructor(params: {
    name: string;
    kind: MentionKind;
    subtitle?: string;
    color?: string;
    avatar?: string;
    insertText?: string;
  }) {
    super(`${params.kind}:${params.name}`);
    this.name = params.name;
    this.kind = params.kind;
    this.subtitle = params.subtitle;
    this.color = params.color;
    this.avatar = params.avatar;
    this.insertText = params.insertText;
  }
}

export function formatSmartDateLabel(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getSmartDateOptions(): Array<{
  keyword: string;
  label: string;
  formatted: string;
}> {
  return [
    { keyword: "today", label: "Today", formatted: formatSmartDateLabel(0) },
    {
      keyword: "tomorrow",
      label: "Tomorrow",
      formatted: formatSmartDateLabel(1),
    },
    {
      keyword: "yesterday",
      label: "Yesterday",
      formatted: formatSmartDateLabel(-1),
    },
  ];
}

export default function MentionsPlugin() {
  const [editor] = useLexicalComposerContext();
  const collab = useOptionalCollab();
  const [queryString, setQueryString] = useState<string | null>(null);

  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch("@", {
    minLength: 0,
  });

  const options = useMemo(() => {
    const query = (queryString ?? "").trim().toLowerCase();
    const list: MentionOption[] = [];

    // 1. Live collaborators from CollabContext
    const users = collab?.users ?? [];
    for (const user of users) {
      if (
        !query ||
        user.name.toLowerCase().includes(query)
      ) {
        list.push(
          new MentionOption({
            name: user.name,
            kind: "user",
            subtitle: user.isSelf ? "You" : "Collaborator",
            color: user.color,
            avatar: user.avatar,
          })
        );
      }
    }

    // 2. Smart date chips (@today, @tomorrow, @yesterday)
    for (const d of getSmartDateOptions()) {
      if (
        !query ||
        d.keyword.includes(query) ||
        d.formatted.toLowerCase().includes(query)
      ) {
        list.push(
          new MentionOption({
            name: d.label,
            kind: "date",
            subtitle: d.formatted,
            insertText: `📅 ${d.formatted}`,
          })
        );
      }
    }

    return list.slice(0, 8);
  }, [collab?.users, queryString]);

  const onSelectOption = useCallback(
    (
      selectedOption: MentionOption,
      nodeToReplace: TextNode | null,
      closeMenu: () => void
    ) => {
      editor.update(() => {
        const mentionNode = $createMentionNode(
          selectedOption.insertText || selectedOption.name,
          {
            kind: selectedOption.kind,
            text:
              selectedOption.kind === "date"
                ? selectedOption.insertText
                : `@${selectedOption.name}`,
          }
        );

        if (nodeToReplace) {
          nodeToReplace.replace(mentionNode);
        }
        const spaceNode = $createTextNode(" ");
        mentionNode.insertAfter(spaceNode);
        spaceNode.select();
        closeMenu();
      });
    },
    [editor]
  );

  return (
    <LexicalTypeaheadMenuPlugin<MentionOption>
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      triggerFn={checkForTriggerMatch}
      options={options}
      menuRenderFn={(
        anchorElementRef,
        { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }
      ) => {
        if (!anchorElementRef.current || options.length === 0) {
          return null;
        }

        return ReactDOM.createPortal(
          <div className="z-50 w-64 rounded-xl border border-border/80 bg-popover/95 p-1.5 text-popover-foreground shadow-xl backdrop-blur-xl">
            <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Mention or Date
            </div>
            <ul className="max-h-60 overflow-y-auto space-y-0.5">
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
                        {option.kind === "date" ? (
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                            <Calendar className="h-3.5 w-3.5" />
                          </span>
                        ) : (
                          <span
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                            style={{
                              backgroundColor: option.color || "#3b82f6",
                            }}
                          >
                            {option.avatar &&
                            !option.avatar.startsWith("http") &&
                            !option.avatar.startsWith("data:") ? (
                              option.avatar
                            ) : (
                              <User className="h-3.5 w-3.5" />
                            )}
                          </span>
                        )}
                        <span className="truncate font-medium">
                          {option.name}
                        </span>
                      </span>
                      {option.subtitle && (
                        <span className="shrink-0 text-[10px] text-muted-foreground">
                          {option.subtitle}
                        </span>
                      )}
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
