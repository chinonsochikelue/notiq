"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import * as ReactDOM from "react-dom";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  useBasicTypeaheadTriggerMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { $isHeadingNode } from "@lexical/rich-text";
import {
  $createTextNode,
  $getRoot,
  type EditorState,
  type LexicalNode,
  type TextNode,
} from "lexical";
import { ChevronDown, ChevronRight, FileText, Hash, Link2, Plus } from "lucide-react";
import {
  $createPageLinkNode,
  $isPageLinkNode,
  type PageLinkKind,
} from "../../nodes/PageLinkNode";
import { cn } from "../../../../lib/utils";

export interface PageLinkReference {
  target: string;
  label: string;
  kind: PageLinkKind;
}

export interface WorkspacePageSuggestion {
  target: string;
  label: string;
  subtitle?: string;
}

const DEFAULT_WORKSPACE_PAGES: WorkspacePageSuggestion[] = [
  {
    target: "/collaboration",
    label: "Live Collaboration Room",
    subtitle: "Workspace",
  },
  {
    target: "/",
    label: "Notiq Playground",
    subtitle: "Workspace",
  },
  {
    target: "/framework",
    label: "Notiq Framework Demo",
    subtitle: "Docs",
  },
];

class PageLinkOption extends MenuOption {
  target: string;
  label: string;
  kind: PageLinkKind;
  subtitle?: string;
  isCreate?: boolean;

  constructor(params: {
    target: string;
    label: string;
    kind: PageLinkKind;
    subtitle?: string;
    isCreate?: boolean;
  }) {
    super(`${params.kind}:${params.target}:${params.label}`);
    this.target = params.target;
    this.label = params.label;
    this.kind = params.kind;
    this.subtitle = params.subtitle;
    this.isCreate = params.isCreate;
  }
}

function collectNodesRecursively(
  node: LexicalNode,
  visit: (n: LexicalNode) => void
) {
  visit(node);
  if ("getChildren" in node && typeof node.getChildren === "function") {
    const children = (node as { getChildren: () => LexicalNode[] }).getChildren();
    for (const child of children) {
      collectNodesRecursively(child, visit);
    }
  }
}

export function extractPageLinksFromEditorState(
  editorState: EditorState
): PageLinkReference[] {
  const seen = new Set<string>();
  const links: PageLinkReference[] = [];

  editorState.read(() => {
    const root = $getRoot();
    collectNodesRecursively(root, (node) => {
      if ($isPageLinkNode(node)) {
        const dedupeKey = `${node.__kind}:${node.__target}:${node.__label}`;
        if (!seen.has(dedupeKey)) {
          seen.add(dedupeKey);
          links.push({
            target: node.__target,
            label: node.__label,
            kind: node.__kind,
          });
        }
      }
    });
  });

  return links;
}

export function extractHeadingsForLinking(
  editorState: EditorState
): Array<{ key: string; text: string; tag: string }> {
  const items: Array<{ key: string; text: string; tag: string }> = [];
  editorState.read(() => {
    const root = $getRoot();
    for (const child of root.getChildren()) {
      if ($isHeadingNode(child)) {
        const text = child.getTextContent().trim();
        if (text) {
          items.push({
            key: child.getKey(),
            text,
            tag: child.getTag().toUpperCase(),
          });
        }
      }
    }
  });
  return items;
}

function slugifyPageTitle(title: string): string {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug ? `/collaboration?room=${slug}` : "/collaboration";
}

export function PageBacklinksFooter({
  links,
}: {
  links: PageLinkReference[];
}) {
  const [expanded, setExpanded] = useState(false);

  if (links.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 border-t border-border/60 pt-3 px-1">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        {expanded ? (
          <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5" />
        )}
        <Link2 className="h-3.5 w-3.5" />
        <span>
          Page Links & Backlinks ({links.length})
        </span>
      </button>

      {expanded && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {links.map((link) => (
            <button
              key={`${link.kind}:${link.target}:${link.label}`}
              type="button"
              onClick={() => {
                if (link.kind === "heading") {
                  const headings = Array.from(
                    document.querySelectorAll("h1, h2, h3, h4, h5, h6")
                  );
                  const match = headings.find(
                    (el) =>
                      el.textContent?.trim().toLowerCase() ===
                      link.label.toLowerCase()
                  );
                  match?.scrollIntoView({ behavior: "smooth", block: "center" });
                } else if (typeof window !== "undefined") {
                  const event = new CustomEvent("notiq:navigate-page", {
                    detail: link,
                    cancelable: true,
                  });
                  const notCancelled = window.dispatchEvent(event);
                  if (notCancelled && link.target.startsWith("/")) {
                    window.location.assign(link.target);
                  }
                }
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-border/80 bg-muted/40 px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              {link.kind === "heading" ? (
                <Hash className="h-3 w-3 text-indigo-500" />
              ) : (
                <FileText className="h-3 w-3 text-indigo-500" />
              )}
              <span>{link.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PageLinksPlugin({
  pages = DEFAULT_WORKSPACE_PAGES,
  showBacklinksFooter = true,
}: {
  pages?: WorkspacePageSuggestion[];
  showBacklinksFooter?: boolean;
}) {
  const [editor] = useLexicalComposerContext();
  const [queryString, setQueryString] = useState<string | null>(null);
  const [headings, setHeadings] = useState<
    Array<{ key: string; text: string; tag: string }>
  >([]);
  const [backlinks, setBacklinks] = useState<PageLinkReference[]>([]);

  useEffect(() => {
    const syncFromState = (state: EditorState) => {
      setHeadings(extractHeadingsForLinking(state));
      if (showBacklinksFooter) {
        setBacklinks(extractPageLinksFromEditorState(state));
      }
    };

    syncFromState(editor.getEditorState());
    return editor.registerUpdateListener(({ editorState }) => {
      syncFromState(editorState);
    });
  }, [editor, showBacklinksFooter]);

  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch("[[", {
    minLength: 0,
  });

  const options = useMemo(() => {
    const query = (queryString ?? "").trim().toLowerCase();
    const list: PageLinkOption[] = [];

    for (const h of headings) {
      if (!query || h.text.toLowerCase().includes(query)) {
        list.push(
          new PageLinkOption({
            target: `#${h.key}`,
            label: h.text,
            kind: "heading",
            subtitle: h.tag,
          })
        );
      }
    }

    for (const p of pages) {
      if (!query || p.label.toLowerCase().includes(query)) {
        list.push(
          new PageLinkOption({
            target: p.target,
            label: p.label,
            kind: "page",
            subtitle: p.subtitle ?? "Page",
          })
        );
      }
    }

    const trimmed = (queryString ?? "").trim();
    if (
      trimmed &&
      !list.some((opt) => opt.label.toLowerCase() === trimmed.toLowerCase())
    ) {
      list.push(
        new PageLinkOption({
          target: slugifyPageTitle(trimmed),
          label: trimmed,
          kind: "page",
          subtitle: "New page",
          isCreate: true,
        })
      );
    }

    return list.slice(0, 30);
  }, [headings, pages, queryString]);

  const onSelectOption = useCallback(
    (
      selectedOption: PageLinkOption,
      nodeToReplace: TextNode | null,
      closeMenu: () => void
    ) => {
      editor.update(() => {
        const linkNode = $createPageLinkNode({
          target: selectedOption.target,
          label: selectedOption.label,
          kind: selectedOption.kind,
        });
        if (nodeToReplace) {
          nodeToReplace.replace(linkNode);
        }
        const spaceNode = $createTextNode(" ");
        linkNode.insertAfter(spaceNode);
        spaceNode.select();
        closeMenu();
      });
    },
    [editor]
  );

  return (
    <>
      <LexicalTypeaheadMenuPlugin<PageLinkOption>
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
                Link Page or Heading
              </div>
              <ul
                className="max-h-52 overflow-y-auto overscroll-contain space-y-0.5 p-1.5"
                role="listbox"
                aria-label="Page link options"
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
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                            {option.isCreate ? (
                              <Plus className="h-3.5 w-3.5" />
                            ) : option.kind === "heading" ? (
                              <Hash className="h-3.5 w-3.5" />
                            ) : (
                              <FileText className="h-3.5 w-3.5" />
                            )}
                          </span>
                          <span className="truncate font-medium">
                            {option.label}
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
      {showBacklinksFooter && <PageBacklinksFooter links={backlinks} />}
    </>
  );
}
