"use client";

import React, { JSX, useRef, useState, useCallback } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { DraggableBlockPlugin_EXPERIMENTAL } from "@lexical/react/LexicalDraggableBlockPlugin";
import {
  $getNearestNodeFromDOMNode,
  $createParagraphNode,
  $createTextNode,
  $isElementNode,
  type LexicalNode,
} from "lexical";
import {
  $createHeadingNode,
  $createQuoteNode,
} from "@lexical/rich-text";
import { $createCodeNode } from "@lexical/code";
import {
  $createListNode,
  $createListItemNode,
} from "@lexical/list";
import {
  $createLayoutContainerNode,
} from "../../nodes/LayoutNode/LayoutContainerNode";
import {
  $createLayoutItemNode,
} from "../../nodes/LayoutNode/LayoutItemNode";
import {
  GripVertical,
  Plus,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  List,
  ListOrdered,
  Columns2,
  Columns3,
  Copy,
  Trash2,
  Sparkles,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../../../ui/dropdown-menu";
import { OPEN_AI_COMMAND_BAR_COMMAND } from "../AICommandBarPlugin";
import { cn } from "../../../../lib/utils";

const DRAGGABLE_BLOCK_MENU_CLASSNAME = "draggable-block-menu";

export default function DraggableBlockPlugin({
  anchorElem = typeof document !== "undefined" ? document.body : undefined,
  className,
}: {
  anchorElem?: HTMLElement;
  className?: string;
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const targetLineRef = useRef<HTMLDivElement | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getTargetNode = useCallback((): LexicalNode | null => {
    if (!menuRef.current) return null;
    const rect = menuRef.current.getBoundingClientRect();
    // Locate the DOM element adjacent to the drag handle
    const targetElem = document.elementFromPoint(
      rect.right + 32,
      rect.top + rect.height / 2
    );
    if (!targetElem) return null;

    let targetNode: LexicalNode | null = null;
    editor.getEditorState().read(() => {
      const node = $getNearestNodeFromDOMNode(targetElem);
      if (node) {
        targetNode =
          node.getKey() === "root"
            ? node
            : $isElementNode(node)
            ? node
            : node.getTopLevelElement();
      }
    });

    return targetNode;
  }, [editor]);

  const handleInsertBelow = () => {
    editor.update(
      () => {
        const targetNode = getTargetNode();
        if (targetNode) {
          const p = $createParagraphNode();
          targetNode.insertAfter(p);
          p.select();
        }
      },
      { discrete: true }
    );
  };

  const handleTurnInto = (type: "h1" | "h2" | "h3" | "quote" | "code" | "bullet" | "number") => {
    editor.update(
      () => {
        const targetNode = getTargetNode();
        if (!targetNode || targetNode.getKey() === "root") return;

        let replacement: LexicalNode | null = null;
        switch (type) {
          case "h1":
            replacement = $createHeadingNode("h1");
            break;
          case "h2":
            replacement = $createHeadingNode("h2");
            break;
          case "h3":
            replacement = $createHeadingNode("h3");
            break;
          case "quote":
            replacement = $createQuoteNode();
            break;
          case "code":
            replacement = $createCodeNode();
            break;
          case "bullet": {
            const list = $createListNode("bullet");
            const item = $createListItemNode();
            list.append(item);
            replacement = list;
            break;
          }
          case "number": {
            const list = $createListNode("number");
            const item = $createListItemNode();
            list.append(item);
            replacement = list;
            break;
          }
        }

        if (replacement && $isElementNode(targetNode)) {
          const children = targetNode.getChildren();
          if ($isElementNode(replacement)) {
            replacement.append(...children);
          }
          targetNode.replace(replacement);
        }
      },
      { discrete: true }
    );
  };

  const handleSplitColumns = (columns: 2 | 3) => {
    editor.update(
      () => {
        const targetNode = getTargetNode();
        if (!targetNode || targetNode.getKey() === "root") return;

        const template = columns === 2 ? "1fr 1fr" : "1fr 1fr 1fr";
        const container = $createLayoutContainerNode(template);

        const col1 = $createLayoutItemNode();
        const col2 = $createLayoutItemNode();

        // Transfer current node into first column
        const cloned = targetNode;
        col1.append(cloned);
        col2.append($createParagraphNode());

        if (columns === 3) {
          const col3 = $createLayoutItemNode();
          col3.append($createParagraphNode());
          container.append(col1, col2, col3);
        } else {
          container.append(col1, col2);
        }

        targetNode.replace(container);
      },
      { discrete: true }
    );
  };

  const handleDuplicate = () => {
    editor.update(
      () => {
        const targetNode = getTargetNode();
        if (targetNode && targetNode.getKey() !== "root") {
          const p = $createParagraphNode();
          p.append($createTextNode(targetNode.getTextContent()));
          targetNode.insertAfter(p);
        }
      },
      { discrete: true }
    );
  };

  const handleDelete = () => {
    editor.update(
      () => {
        const targetNode = getTargetNode();
        if (targetNode && targetNode.getKey() !== "root") {
          targetNode.remove();
        }
      },
      { discrete: true }
    );
  };

  const handleAskAI = () => {
    editor.dispatchCommand(OPEN_AI_COMMAND_BAR_COMMAND, {
      initialPrompt: "",
      action: "ImproveWriting",
    });
  };

  const isOnMenu = (element: HTMLElement): boolean => {
    return !!element.closest(`.${DRAGGABLE_BLOCK_MENU_CLASSNAME}`);
  };

  if (!anchorElem) return null;

  return (
    <DraggableBlockPlugin_EXPERIMENTAL
      anchorElem={anchorElem}
      menuRef={menuRef}
      targetLineRef={targetLineRef}
      menuComponent={
        <div
          ref={menuRef}
          className={cn(
            "draggable-block-menu flex items-center gap-0.5 rounded-md border border-border/40 bg-background/90 text-muted-foreground shadow-sm backdrop-blur transition-all duration-150 group z-40 absolute top-0 left-0",
            className
          )}
        >
          {/* Quick Insert (+) Button */}
          <button
            type="button"
            onClick={handleInsertBelow}
            className="flex items-center justify-center w-5 h-5 rounded hover:bg-muted hover:text-foreground transition-colors"
            title="Insert block below"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          {/* Six-Dot Drag Handle & Context Menu Trigger */}
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center justify-center w-5 h-5 rounded cursor-grab active:cursor-grabbing hover:bg-muted hover:text-foreground transition-colors"
                title="Drag to move or click for block actions"
              >
                <GripVertical className="w-3.5 h-3.5" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="start"
              side="bottom"
              sideOffset={4}
              className="w-52 z-50 text-xs"
            >
              <DropdownMenuItem onClick={handleAskAI} className="gap-2 font-medium text-primary">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>Ask AI on block</span>
                <kbd className="ml-auto font-mono text-[10px] opacity-60">⌘K</kbd>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Turn Into Submenu */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-2">
                  <Heading1 className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Turn into</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-44 text-xs">
                  <DropdownMenuItem onClick={() => handleTurnInto("h1")} className="gap-2">
                    <Heading1 className="w-3.5 h-3.5" />
                    <span>Heading 1</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleTurnInto("h2")} className="gap-2">
                    <Heading2 className="w-3.5 h-3.5" />
                    <span>Heading 2</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleTurnInto("h3")} className="gap-2">
                    <Heading3 className="w-3.5 h-3.5" />
                    <span>Heading 3</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleTurnInto("bullet")} className="gap-2">
                    <List className="w-3.5 h-3.5" />
                    <span>Bullet List</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleTurnInto("number")} className="gap-2">
                    <ListOrdered className="w-3.5 h-3.5" />
                    <span>Numbered List</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleTurnInto("quote")} className="gap-2">
                    <Quote className="w-3.5 h-3.5" />
                    <span>Quote</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleTurnInto("code")} className="gap-2">
                    <Code className="w-3.5 h-3.5" />
                    <span>Code Block</span>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              {/* Multi-Column Layout Submenu */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-2">
                  <Columns2 className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Columns layout</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-40 text-xs">
                  <DropdownMenuItem onClick={() => handleSplitColumns(2)} className="gap-2">
                    <Columns2 className="w-3.5 h-3.5" />
                    <span>2 Columns</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSplitColumns(3)} className="gap-2">
                    <Columns3 className="w-3.5 h-3.5" />
                    <span>3 Columns</span>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleDuplicate} className="gap-2">
                <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Duplicate</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={handleDelete}
                className="gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <Trash2 className="w-3.5 h-3.5 text-destructive" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      }
      targetLineComponent={
        <div
          ref={targetLineRef}
          className="cursor-none h-[3px] rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-sm pointer-events-none absolute left-0 top-0 opacity-0 will-change-transform z-40"
        />
      }
      isOnMenu={isOnMenu}
    />
  );
}
