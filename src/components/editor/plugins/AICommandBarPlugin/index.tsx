"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  $createTextNode,
  COMMAND_PRIORITY_CRITICAL,
  createCommand,
  KEY_DOWN_COMMAND,
  type LexicalCommand,
} from "lexical";
import {
  Sparkles,
  Loader2,
  Check,
  X,
  RotateCcw,
  CornerDownLeft,
  ChevronDown,
  Wand2,
  Languages,
  ArrowDownToLine,
} from "lucide-react";
import { Button } from "../../../ui/button";
import { computeWordDiff, type DiffPart } from "../../utils/diffUtils";
import { cn } from "../../../../lib/utils";

export const OPEN_AI_COMMAND_BAR_COMMAND: LexicalCommand<{
  initialPrompt?: string;
  action?: string;
} | void> = createCommand("OPEN_AI_COMMAND_BAR_COMMAND");

const QUICK_ACTIONS = [
  { id: "ImproveWriting", label: "Improve Writing", icon: Wand2 },
  { id: "FixSpellingGrammar", label: "Fix Grammar & Spelling", icon: Check },
  { id: "MakeShort", label: "Make Shorter", icon: Sparkles },
  { id: "MakeLong", label: "Make Longer", icon: Sparkles },
  { id: "SimplifyLanguage", label: "Simplify", icon: Sparkles },
];

const TONES = ["Professional", "Casual", "Direct", "Academic", "Friendly"];
const LANGUAGES = ["Spanish", "French", "German", "Japanese", "Chinese", "Arabic"];

export default function AICommandBarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  const [prompt, setPrompt] = useState("");
  const [selectedText, setSelectedText] = useState("");
  const [streamedText, setStreamedText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const [showToneMenu, setShowToneMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const openBar = useCallback(
    (payload?: { initialPrompt?: string; action?: string } | void) => {
      let targetText = "";

      editor.getEditorState().read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          targetText = selection.getTextContent();
        }
      });

      // Calculate anchor coords based on current selection
      const domSelection = window.getSelection();
      let top = 120;
      let left = window.innerWidth / 2 - 280;

      if (domSelection && domSelection.rangeCount > 0) {
        const rect = domSelection.getRangeAt(0).getBoundingClientRect();
        if (rect.width > 0 || rect.height > 0) {
          left = Math.max(20, Math.min(window.innerWidth - 580, rect.left + rect.width / 2 - 280));
          top = rect.bottom + 12;
          if (top + 280 > window.innerHeight) {
            top = Math.max(20, rect.top - 280);
          }
        }
      }

      setCoords({ top, left });
      setSelectedText(targetText);
      setPrompt(payload?.initialPrompt || "");
      setStreamedText("");
      setIsGenerating(false);
      setActiveAction(payload?.action || null);
      setIsOpen(true);

      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);

      if (payload?.action) {
        runAction(payload.action, targetText, payload.initialPrompt);
      }
    },
    [editor]
  );

  const closeBar = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsOpen(false);
    setCoords(null);
    setPrompt("");
    setSelectedText("");
    setStreamedText("");
    setIsGenerating(false);
    setActiveAction(null);
    setShowToneMenu(false);
    setShowLangMenu(false);
  }, []);

  const runAction = async (action: string, contextText: string, customQuestion?: string) => {
    setIsGenerating(true);
    setStreamedText("");
    setActiveAction(action);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          context: contextText || "",
          userQuestion: customQuestion || prompt,
        }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to contact AI service");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setStreamedText(accumulated);
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("[Notiq AI Command Bar Error]:", err);
        setStreamedText("An error occurred while generating response.");
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleAccept = () => {
    if (!streamedText) return;

    editor.update(
      () => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          selection.insertRawText(streamedText);
        } else {
          // If no active selection, append or insert at caret
          const root = editor.getRootElement();
          if (root) {
            const p = $createParagraphNode();
            p.append($createTextNode(streamedText));
            // append to selection or root
            selection?.insertNodes([p]);
          }
        }
      },
      { discrete: true }
    );

    closeBar();
  };

  const handleInsertBelow = () => {
    if (!streamedText) return;

    editor.update(
      () => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const anchor = selection.anchor.getNode();
          const topElement =
            anchor.getKey() === "root"
              ? anchor
              : anchor.getTopLevelElementOrThrow();

          const p = $createParagraphNode();
          p.append($createTextNode(streamedText));
          topElement.insertAfter(p);
          p.select();
        }
      },
      { discrete: true }
    );

    closeBar();
  };

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    return editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event: KeyboardEvent) => {
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
          event.preventDefault();
          if (isOpen) {
            closeBar();
          } else {
            openBar();
          }
          return true;
        }

        if (event.key === "Escape" && isOpen) {
          event.preventDefault();
          closeBar();
          return true;
        }

        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor, isOpen, openBar, closeBar]);

  // Command registration
  useEffect(() => {
    return editor.registerCommand(
      OPEN_AI_COMMAND_BAR_COMMAND,
      (payload) => {
        openBar(payload || undefined);
        return true;
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor, openBar]);

  if (!isOpen || !coords) return null;

  const diffParts: DiffPart[] =
    selectedText && streamedText
      ? computeWordDiff(selectedText, streamedText)
      : [];

  return createPortal(
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        zIndex: 60,
      }}
      className="w-[560px] max-w-[calc(100vw-32px)] rounded-xl border border-border/80 bg-popover/95 text-popover-foreground shadow-2xl backdrop-blur-xl animate-in fade-in-0 zoom-in-95 duration-150 overflow-hidden"
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Top Input Bar */}
      <div className="flex items-center gap-2 p-3 border-b border-border/60 bg-muted/20">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 text-primary shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (prompt.trim()) {
                runAction("default", selectedText, prompt);
              }
            } else if (e.key === "Escape") {
              closeBar();
            }
          }}
          placeholder={
            selectedText
              ? `Ask AI to edit selection ("${selectedText.slice(0, 24)}...")...`
              : "Ask AI to write, generate, or continue..."
          }
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
        />

        {isGenerating ? (
          <Button size="sm" variant="ghost" disabled className="h-8 px-2 text-xs">
            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
            Generating...
          </Button>
        ) : (
          <Button
            size="sm"
            variant="default"
            disabled={!prompt.trim() && !activeAction}
            onClick={() => runAction("default", selectedText, prompt)}
            className="h-8 px-3 text-xs font-medium"
          >
            <span>Submit</span>
            <CornerDownLeft className="w-3 h-3 ml-1.5 opacity-60" />
          </Button>
        )}

        <Button
          size="sm"
          variant="ghost"
          onClick={closeBar}
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Streamed Result & Diff View */}
      {streamedText && (
        <div className="p-4 border-b border-border/60 max-h-[300px] overflow-y-auto space-y-3 bg-background/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {selectedText ? "Diff Preview (Original vs. AI)" : "AI Output"}
            </span>
            {isGenerating && (
              <span className="text-xs text-primary flex items-center gap-1 font-medium">
                <Loader2 className="w-3 h-3 animate-spin" />
                Streaming response...
              </span>
            )}
          </div>

          {selectedText ? (
            <div className="text-sm leading-relaxed p-3 rounded-lg border border-border/50 bg-muted/30 font-sans">
              {diffParts.map((part, index) => {
                if (part.type === "removed") {
                  return (
                    <span
                      key={index}
                      className="bg-red-500/15 text-red-600 dark:text-red-400 line-through rounded px-1 py-0.5 mx-0.5"
                    >
                      {part.text}
                    </span>
                  );
                }
                if (part.type === "added") {
                  return (
                    <span
                      key={index}
                      className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-medium rounded px-1 py-0.5 mx-0.5"
                    >
                      {part.text}
                    </span>
                  );
                }
                return <span key={index}>{part.text}</span>;
              })}
            </div>
          ) : (
            <div className="text-sm leading-relaxed p-3 rounded-lg border border-border/50 bg-muted/30 font-sans whitespace-pre-wrap">
              {streamedText}
            </div>
          )}

          {/* Action Resolution Buttons */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="default"
                onClick={handleAccept}
                className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs px-3"
              >
                <Check className="w-3.5 h-3.5 mr-1" />
                <span>Replace Selection</span>
                <kbd className="ml-1.5 px-1 py-0.2 bg-emerald-700/60 rounded text-[10px]">
                  ↵
                </kbd>
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={handleInsertBelow}
                className="h-8 text-xs font-medium px-3"
              >
                <ArrowDownToLine className="w-3.5 h-3.5 mr-1.5" />
                Insert Below
              </Button>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  runAction(activeAction || "default", selectedText, prompt)
                }
                className="h-8 text-xs text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Retry
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={closeBar}
                className="h-8 text-xs text-muted-foreground hover:text-destructive"
              >
                Discard
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Action Pills & Submenus */}
      <div className="p-3 bg-muted/10 space-y-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => runAction(action.id, selectedText)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border border-border/60 bg-background/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
              >
                <Icon className="w-3.5 h-3.5 text-primary" />
                <span>{action.label}</span>
              </button>
            );
          })}

          {/* Tone Submenu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowToneMenu(!showToneMenu);
                setShowLangMenu(false);
              }}
              className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-md border border-border/60 bg-background/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
            >
              <span>Change Tone</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>
            {showToneMenu && (
              <div className="absolute left-0 bottom-full mb-1 w-36 rounded-lg border border-border bg-popover shadow-xl py-1 z-50 animate-in fade-in-0 zoom-in-95">
                {TONES.map((tone) => (
                  <button
                    key={tone}
                    onClick={() => {
                      setShowToneMenu(false);
                      runAction(
                        "default",
                        selectedText,
                        `Rewrite the text in a ${tone.toLowerCase()} tone.`
                      );
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-popover-foreground hover:bg-muted transition-colors"
                  >
                    {tone}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Translate Submenu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowLangMenu(!showLangMenu);
                setShowToneMenu(false);
              }}
              className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-md border border-border/60 bg-background/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
            >
              <Languages className="w-3 h-3 text-primary" />
              <span>Translate</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>
            {showLangMenu && (
              <div className="absolute left-0 bottom-full mb-1 w-36 rounded-lg border border-border bg-popover shadow-xl py-1 z-50 animate-in fade-in-0 zoom-in-95">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setShowLangMenu(false);
                      runAction(
                        "default",
                        selectedText,
                        `Translate the text accurately into ${lang}.`
                      );
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-popover-foreground hover:bg-muted transition-colors"
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
