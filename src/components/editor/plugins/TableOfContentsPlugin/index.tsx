"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isHeadingNode, type HeadingTagType } from "@lexical/rich-text";
import { $getRoot, type EditorState, type NodeKey } from "lexical";
import { ListTree, X } from "lucide-react";
import { cn } from "../../../../lib/utils";

export interface HeadingEntry {
  key: NodeKey;
  text: string;
  tag: HeadingTagType;
  level: number;
}

export interface UseTableOfContentsOptions {
  /** Maximum heading depth to include (1 = H1 only, 3 = H1-H3, 6 = all). Default: 3 */
  maxLevel?: number;
}

export interface UseTableOfContentsResult {
  headings: HeadingEntry[];
  activeKey: NodeKey | null;
  scrollToHeading: (key: NodeKey) => void;
}

function parseHeadingLevel(tag: HeadingTagType): number {
  const parsed = Number(tag.slice(1));
  return Number.isFinite(parsed) ? parsed : 1;
}

export function extractHeadingsFromEditorState(
  editorState: EditorState,
  maxLevel = 3
): HeadingEntry[] {
  const entries: HeadingEntry[] = [];
  editorState.read(() => {
    const root = $getRoot();
    for (const child of root.getChildren()) {
      if ($isHeadingNode(child)) {
        const tag = child.getTag();
        const level = parseHeadingLevel(tag);
        const text = child.getTextContent().trim();
        if (level <= maxLevel && text.length > 0) {
          entries.push({
            key: child.getKey(),
            text,
            tag,
            level,
          });
        }
      }
    }
  });
  return entries;
}

function headingsEqual(a: HeadingEntry[], b: HeadingEntry[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (
      a[i].key !== b[i].key ||
      a[i].text !== b[i].text ||
      a[i].tag !== b[i].tag
    ) {
      return false;
    }
  }
  return true;
}

/**
 * Headless hook that tracks document headings (`H1`-`H3` by default),
 * highlights the active section via scroll-spy, and scrolls smoothly to headings.
 */
export function useTableOfContents(
  options: UseTableOfContentsOptions = {}
): UseTableOfContentsResult {
  const { maxLevel = 3 } = options;
  const [editor] = useLexicalComposerContext();
  const [headings, setHeadings] = useState<HeadingEntry[]>(() =>
    extractHeadingsFromEditorState(editor.getEditorState(), maxLevel)
  );
  const [activeKey, setActiveKey] = useState<NodeKey | null>(
    () => headings[0]?.key ?? null
  );

  // Sync headings on Lexical state updates
  useEffect(() => {
    const sync = (state: EditorState) => {
      const next = extractHeadingsFromEditorState(state, maxLevel);
      setHeadings((prev) => (headingsEqual(prev, next) ? prev : next));
    };
    sync(editor.getEditorState());
    return editor.registerUpdateListener(({ editorState }) => {
      sync(editorState);
    });
  }, [editor, maxLevel]);

  // Scroll-spy: pick the last heading whose top is at or above the viewport threshold
  useEffect(() => {
    if (typeof window === "undefined" || headings.length === 0) {
      setActiveKey(null);
      return;
    }

    const updateActiveHeading = () => {
      const threshold = 140;
      let currentActive: NodeKey | null = headings[0]?.key ?? null;

      for (const heading of headings) {
        const el = editor.getElementByKey(heading.key);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= threshold) {
          currentActive = heading.key;
        } else {
          break;
        }
      }

      setActiveKey(currentActive);
    };

    updateActiveHeading();
    window.addEventListener("scroll", updateActiveHeading, { passive: true });
    window.addEventListener("resize", updateActiveHeading, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateActiveHeading);
      window.removeEventListener("resize", updateActiveHeading);
    };
  }, [editor, headings]);

  const scrollToHeading = useCallback(
    (key: NodeKey) => {
      const el = editor.getElementByKey(key);
      if (!el) return;
      setActiveKey(key);
      if (typeof el.scrollIntoView === "function") {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    },
    [editor]
  );

  return useMemo(
    () => ({ headings, activeKey, scrollToHeading }),
    [headings, activeKey, scrollToHeading]
  );
}

export interface TableOfContentsPluginProps extends UseTableOfContentsOptions {
  /** Minimum number of headings before showing the default UI. Default: 2 */
  minHeadings?: number;
  className?: string;
  /** Optional headless render prop for custom outline UI */
  children?: (state: UseTableOfContentsResult) => React.ReactNode;
}

export default function TableOfContentsPlugin({
  maxLevel = 3,
  minHeadings = 2,
  className,
  children,
}: TableOfContentsPluginProps) {
  const toc = useTableOfContents({ maxLevel });
  const [isOpen, setIsOpen] = useState(false);

  if (children) {
    return <>{children(toc)}</>;
  }

  if (toc.headings.length < minHeadings) {
    return null;
  }

  const minLevel = Math.min(...toc.headings.map((h) => h.level));

  return (
    <aside
      aria-label="Table of contents"
      className={cn(
        "fixed right-4 top-24 z-30 hidden lg:flex flex-col items-end gap-2",
        className
      )}
    >
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open document outline"
          title="Document outline"
          className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/85 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur-md transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
        >
          <ListTree className="h-3.5 w-3.5" />
          <span>Outline</span>
          <span className="rounded-full bg-muted px-1.5 py-0.2 text-[10px] font-mono">
            {toc.headings.length}
          </span>
        </button>
      ) : (
        <div className="w-60 max-h-[65vh] flex flex-col rounded-xl border border-border/70 bg-background/95 p-3 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-border/50 pb-2 mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <ListTree className="h-3.5 w-3.5 text-primary" />
              <span>On this page</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close document outline"
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <nav className="overflow-y-auto no-scrollbar space-y-0.5 pr-1">
            {toc.headings.map((heading) => {
              const isActive = toc.activeKey === heading.key;
              const indent = Math.max(0, heading.level - minLevel);
              return (
                <button
                  key={heading.key}
                  type="button"
                  onClick={() => toc.scrollToHeading(heading.key)}
                  style={{ paddingLeft: `${0.5 + indent * 0.75}rem` }}
                  className={cn(
                    "w-full text-left rounded-md py-1 pr-2 text-xs transition-colors truncate cursor-pointer border-l-2",
                    isActive
                      ? "border-primary bg-primary/10 font-medium text-foreground"
                      : "border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                  title={heading.text}
                >
                  {heading.text}
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </aside>
  );
}
