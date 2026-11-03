"use client";

import React, { useMemo } from "react";
import type { CollabUser } from "../../../providers/CollabContext";
import { cn } from "../../../../lib/utils";
import { Users } from "lucide-react";

export interface MentionItem {
  id: string | number;
  name: string;
  color: string;
  avatar?: string;
  description?: string;
  isSpecial?: boolean;
  isSelf?: boolean;
}

export function getMentionCandidates(
  users: CollabUser[],
  query: string
): MentionItem[] {
  const clean = query.trim().toLowerCase();

  const results: MentionItem[] = [];

  // Special @everyone / @all mention
  if (!clean || "everyone".includes(clean) || "all".includes(clean)) {
    results.push({
      id: "special-everyone",
      name: "everyone",
      color: "#8b5cf6",
      description: "Notify all collaborators",
      isSpecial: true,
    });
  }

  // Filter regular users from collab session
  for (const u of users) {
    if (!clean || u.name.toLowerCase().includes(clean)) {
      results.push({
        id: u.clientId,
        name: u.name,
        color: u.color,
        avatar: u.avatar,
        isSelf: u.isSelf,
      });
    }
  }

  return results;
}

interface MentionsAutocompleteProps {
  query: string;
  users: CollabUser[];
  selectedIndex?: number;
  onSelect: (item: MentionItem) => void;
  onHoverIndex?: (index: number) => void;
  className?: string;
}

export default function MentionsAutocomplete({
  query,
  users,
  selectedIndex = 0,
  onSelect,
  onHoverIndex,
  className,
}: MentionsAutocompleteProps) {
  const items = useMemo(() => getMentionCandidates(users, query), [users, query]);

  if (items.length === 0) return null;

  const safeIndex = Math.min(Math.max(0, selectedIndex), items.length - 1);

  return (
    <div
      role="listbox"
      aria-label="Mention options"
      className={cn(
        "absolute z-50 w-60 max-h-52 overflow-y-auto rounded-xl border border-border bg-popover/95 p-1 text-popover-foreground shadow-xl backdrop-blur-md text-xs",
        "animate-in fade-in-50 zoom-in-95 duration-100",
        className
      )}
    >
      <div className="px-2.5 py-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase flex items-center justify-between">
        <span>Mention in thread</span>
        <span className="text-[9px] font-mono opacity-70">↑↓ navigate ↵ select</span>
      </div>

      <div className="space-y-0.5 mt-0.5">
        {items.map((item, index) => {
          const isSelected = index === safeIndex;

          return (
            <button
              key={item.id}
              id={`mention-option-${index}`}
              role="option"
              aria-selected={isSelected}
              type="button"
              onMouseEnter={() => onHoverIndex?.(index)}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSelect(item);
              }}
              className={cn(
                "w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer group select-none",
                isSelected
                  ? "bg-accent text-accent-foreground ring-1 ring-primary/40 font-medium"
                  : "hover:bg-muted/70 text-foreground"
              )}
            >
              {item.isSpecial ? (
                <span className="h-5 w-5 rounded-full flex items-center justify-center bg-purple-600 text-white shrink-0 shadow-xs">
                  <Users className="h-3 w-3" />
                </span>
              ) : (
                <span
                  className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-xs"
                  style={{ backgroundColor: item.color }}
                >
                  {item.name.slice(0, 1).toUpperCase()}
                </span>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="truncate font-semibold text-foreground group-hover:text-primary">
                    @{item.name}
                  </span>
                  {item.isSelf && (
                    <span className="text-[10px] text-muted-foreground">(You)</span>
                  )}
                </div>
                {item.description && (
                  <p className="text-[10px] text-muted-foreground truncate">
                    {item.description}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
