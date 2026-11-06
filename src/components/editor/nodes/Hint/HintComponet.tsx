"use client";
import React, { useState } from "react";
import { $getNodeByKey, LexicalEditor, NodeKey, ParagraphNode, TextNode } from "lexical";
import { LinkNode } from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { LexicalNestedComposer } from "@lexical/react/LexicalNestedComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import {
  Lightbulb,
  AlertTriangle,
  Info,
  Sparkles,
  ShieldAlert,
  Bookmark,
  Trash2,
  Check,
  RotateCcw,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../../../ui/popover";
import { $isHintNode, HintType } from ".";

export interface CalloutVariantConfig {
  id: HintType;
  label: string;
  githubTag: string;
  defaultIcon: React.ReactNode;
  cardClasses: string;
  iconClasses: string;
  pillClasses: string;
  dotColor: string;
}

export const CALLOUT_VARIANTS: Record<string, CalloutVariantConfig> = {
  tip: {
    id: "tip",
    label: "Tip",
    githubTag: "TIP",
    defaultIcon: <Lightbulb className="h-5 w-5" />,
    cardClasses:
      "border-emerald-200/90 dark:border-emerald-800/40 border-l-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-100",
    iconClasses: "text-emerald-600 dark:text-emerald-400",
    pillClasses: "bg-emerald-100/90 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300",
    dotColor: "bg-emerald-500",
  },
  note: {
    id: "note",
    label: "Note",
    githubTag: "NOTE",
    defaultIcon: <Info className="h-5 w-5" />,
    cardClasses:
      "border-sky-200/90 dark:border-sky-800/40 border-l-sky-500 bg-sky-50/70 dark:bg-sky-950/20 text-sky-950 dark:text-sky-100",
    iconClasses: "text-sky-600 dark:text-sky-400",
    pillClasses: "bg-sky-100/90 dark:bg-sky-900/40 text-sky-800 dark:text-sky-300",
    dotColor: "bg-sky-500",
  },
  important: {
    id: "important",
    label: "Important",
    githubTag: "IMPORTANT",
    defaultIcon: <Sparkles className="h-5 w-5" />,
    cardClasses:
      "border-purple-200/90 dark:border-purple-800/40 border-l-purple-500 bg-purple-50/70 dark:bg-purple-950/20 text-purple-950 dark:text-purple-100",
    iconClasses: "text-purple-600 dark:text-purple-400",
    pillClasses: "bg-purple-100/90 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300",
    dotColor: "bg-purple-500",
  },
  warning: {
    id: "warning",
    label: "Warning",
    githubTag: "WARNING",
    defaultIcon: <AlertTriangle className="h-5 w-5" />,
    cardClasses:
      "border-amber-200/90 dark:border-amber-800/40 border-l-amber-500 bg-amber-50/70 dark:bg-amber-950/20 text-amber-950 dark:text-amber-100",
    iconClasses: "text-amber-600 dark:text-amber-400",
    pillClasses: "bg-amber-100/90 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300",
    dotColor: "bg-amber-500",
  },
  caution: {
    id: "caution",
    label: "Caution",
    githubTag: "CAUTION",
    defaultIcon: <ShieldAlert className="h-5 w-5" />,
    cardClasses:
      "border-rose-200/90 dark:border-rose-800/40 border-l-rose-500 bg-rose-50/70 dark:bg-rose-950/20 text-rose-950 dark:text-rose-100",
    iconClasses: "text-rose-600 dark:text-rose-400",
    pillClasses: "bg-rose-100/90 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300",
    dotColor: "bg-rose-500",
  },
  neutral: {
    id: "neutral",
    label: "Callout",
    githubTag: "NOTE",
    defaultIcon: <Bookmark className="h-5 w-5" />,
    cardClasses:
      "border-slate-200 dark:border-slate-800 border-l-slate-400 dark:border-l-slate-600 bg-slate-50/80 dark:bg-slate-900/40 text-slate-900 dark:text-slate-100",
    iconClasses: "text-slate-600 dark:text-slate-400",
    pillClasses: "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300",
    dotColor: "bg-slate-400",
  },
};

const VARIANT_KEY_MAP: Record<string, string> = {
  hint: "tip",
  tip: "tip",
  success: "tip",
  note: "note",
  info: "note",
  important: "important",
  warning: "warning",
  caution: "caution",
  error: "caution",
  neutral: "neutral",
};

const EMOJI_PRESETS = [
  "💡", "ℹ️", "✨", "⚠️", "🛑", "📌",
  "🔥", "🚀", "🎯", "⚡", "📝", "💬",
  "✅", "❓", "🔍", "🎉", "🌟", "🔒",
];

const NESTED_NODES = [ParagraphNode, TextNode, LinkNode];

export default function HintComponent({
  type = "tip",
  emoji,
  captionEditor,
  nodeKey,
}: {
  type: HintType;
  emoji?: string;
  captionEditor: LexicalEditor;
  nodeKey: NodeKey;
}) {
  const [editor] = useLexicalComposerContext();
  const [isPopoverOpen, setPopoverOpen] = useState(false);

  const normalizedKey = VARIANT_KEY_MAP[type] || "tip";
  const config = CALLOUT_VARIANTS[normalizedKey] || CALLOUT_VARIANTS.tip;

  function handleSelectVariant(newVariant: HintType) {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isHintNode(node)) {
        node.setVariant(newVariant);
      }
    });
    setPopoverOpen(false);
  }

  function handleSelectEmoji(newEmoji: string) {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isHintNode(node)) {
        node.setEmoji(newEmoji);
      }
    });
    setPopoverOpen(false);
  }

  function handleResetEmoji() {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isHintNode(node)) {
        node.setEmoji(undefined);
      }
    });
    setPopoverOpen(false);
  }

  function handleDelete() {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (node) {
        node.remove();
      }
    });
  }

  return (
    <div
      className={`group/callout relative p-4 my-3 flex flex-row items-start gap-3 rounded-xl border border-l-4 transition-all duration-200 w-full shadow-xs mx-auto max-w-3xl ${config.cardClasses}`}
    >
      {/* Notion-style Icon & Emoji Popover Trigger */}
      <Popover open={isPopoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={!editor.isEditable()}
            title="Click to customize callout icon or style"
            className="cursor-pointer shrink-0 mt-0.5 p-1 -m-1 rounded-lg transition-all hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 disabled:cursor-default"
          >
            {emoji ? (
              <span className="text-xl leading-none select-none">{emoji}</span>
            ) : (
              <span className={config.iconClasses}>{config.defaultIcon}</span>
            )}
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={8}
          className="w-72 p-3 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 text-xs"
        >
          <div className="space-y-3">
            {/* Callout Variant Types */}
            <div>
              <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                Callout Style
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.values(CALLOUT_VARIANTS).map((v) => {
                  const isSelected = normalizedKey === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => handleSelectVariant(v.id)}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                        isSelected
                          ? "bg-zinc-100 dark:bg-zinc-800 font-medium text-zinc-900 dark:text-zinc-100"
                          : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${v.dotColor} shrink-0`} />
                      <span className="flex-1 truncate">{v.label}</span>
                      {isSelected && <Check className="h-3 w-3 shrink-0 opacity-70" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Emoji Presets */}
            <div>
              <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                Icon / Emoji
              </div>
              <div className="grid grid-cols-6 gap-1 p-1 bg-zinc-50 dark:bg-zinc-800/40 rounded-lg border border-zinc-200/60 dark:border-zinc-800/60">
                {EMOJI_PRESETS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => handleSelectEmoji(em)}
                    className="h-8 w-8 flex items-center justify-center text-base rounded hover:bg-white dark:hover:bg-zinc-700 hover:shadow-xs transition-transform hover:scale-110 active:scale-95"
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset Icon */}
            {emoji && (
              <div className="pt-1 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={handleResetEmoji}
                  className="w-full flex items-center justify-center gap-1.5 py-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Use default icon</span>
                </button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Nested Rich Text Editor */}
      <div className="relative flex-1 min-w-0">
        <LexicalNestedComposer initialEditor={captionEditor} initialNodes={NESTED_NODES}>
          <HistoryPlugin />
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="w-full border-0 resize-none cursor-text block relative outline-none select-text whitespace-pre-wrap break-words text-sm sm:text-[15px] leading-relaxed"
                aria-placeholder="Write a callout note..."
                placeholder={
                  <div className="text-sm sm:text-[15px] text-zinc-400/80 dark:text-zinc-500/80 overflow-hidden absolute top-0 left-0 select-none whitespace-nowrap text-ellipsis pointer-events-none">
                    Write a callout note...
                  </div>
                }
              />
            }
            placeholder={null}
            ErrorBoundary={LexicalErrorBoundary}
          />
        </LexicalNestedComposer>
      </div>

      {/* Hover Action Pill: Style Label & Delete Button */}
      {editor.isEditable() && (
        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover/callout:opacity-100 transition-opacity duration-150">
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${config.pillClasses}`}>
            {config.label}
          </span>
          <button
            type="button"
            onClick={handleDelete}
            title="Delete callout"
            className="p-1 rounded-md text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
