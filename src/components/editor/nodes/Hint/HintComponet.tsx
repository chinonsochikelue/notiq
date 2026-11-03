"use client";
import { $getNodeByKey, LexicalEditor, NodeKey } from "lexical";
import React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { cva } from "class-variance-authority";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { LexicalNestedComposer } from "@lexical/react/LexicalNestedComposer";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import {
  Lightbulb,
  AlertTriangle,
  Info,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { $isHintNode, HintType } from ".";

const hintVariants = cva(
  "hint p-3.5 sm:p-4 my-3 flex flex-row items-start relative gap-3 rounded-xl border transition-all duration-200 w-full shadow-xs mx-auto max-w-3xl",
  {
    variants: {
      variant: {
        default:
          "border-border/70 bg-muted/40 text-foreground",
        success:
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200",
        error:
          "border-red-500/30 bg-red-500/10 text-red-950 dark:text-red-200",
        warning:
          "border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-200",
        info:
          "border-blue-500/30 bg-blue-500/10 text-blue-950 dark:text-blue-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export default function HintComponent({
  type,
  captionEditor,
  nodeKey,
}: {
  type: HintType;
  captionEditor: LexicalEditor;
  nodeKey: NodeKey;
}) {
  const [editor] = useLexicalComposerContext();

  const variantMap: Record<string, "default" | "success" | "error" | "warning" | "info"> = {
    hint: "success",
    warning: "warning",
    info: "info",
    error: "error",
    success: "success",
  };

  const variant = variantMap[type] || "default";

  const variantOrder: HintType[] = [
    "success",
    "warning",
    "info",
    "error",
    "hint",
  ];

  function handleIcon(t: string) {
    switch (t) {
      case "hint":
        return <Lightbulb className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />;
      case "info":
        return <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />;
      case "success":
      default:
        return <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />;
    }
  }

  function handleVariantChange() {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isHintNode(node)) {
        const currentVariant = node.__variant;
        const currentIndex = variantOrder.indexOf(currentVariant);
        const nextIndex = (currentIndex + 1) % variantOrder.length;
        const nextVariant = variantOrder[nextIndex];

        node.setVariant(nextVariant);
      }
    });
  }

  return (
    <div className={hintVariants({ variant })}>
      <button
        type="button"
        disabled={!editor.isEditable()}
        onClick={handleVariantChange}
        title="Click to cycle callout style"
        className="cursor-pointer transition-transform hover:scale-110 active:scale-95 disabled:cursor-default"
      >
        {handleIcon(type)}
      </button>

      <div className="relative flex-1 min-w-0">
        <LexicalNestedComposer initialEditor={captionEditor}>
          <HistoryPlugin />
          <PlainTextPlugin
            contentEditable={
              <ContentEditable
                className="
                  w-full border-0 resize-none cursor-text
                  block relative outline-none select-text
                  whitespace-pre-wrap break-words text-sm sm:text-base leading-relaxed
                "
                aria-placeholder="Write hint caption"
                placeholder={<div className="text-muted-foreground/60 text-sm pointer-events-none">Write hint caption...</div>}
                contentEditable={editor.isEditable()}
              />
            }
            placeholder={
              <div
                className="
                  text-sm sm:text-base text-muted-foreground/60 overflow-hidden absolute top-0 left-0
                  select-none whitespace-nowrap text-ellipsis pointer-events-none
                "
              >
                Write a callout note...
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </LexicalNestedComposer>
      </div>
    </div>
  );
}
