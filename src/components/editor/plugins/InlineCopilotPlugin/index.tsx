"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_CRITICAL,
  KEY_DOWN_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import { Sparkles, Loader2, Check, X } from "lucide-react";
import { cn } from "../../../../lib/utils";

export interface CaretCoordinates {
  x: number;
  y: number;
  height: number;
  maxWidth: number;
  isNextLine: boolean;
}

export interface InlineCopilotRenderProps {
  isEnabled: boolean;
  isLoading: boolean;
  suggestion: string | null;
  caretCoords: CaretCoordinates | null;
  accept: () => void;
  reject: () => void;
  toggleEnabled: () => void;
}

export interface InlineCopilotPluginProps {
  enabledDefault?: boolean;
  headless?: boolean;
  render?: (state: InlineCopilotRenderProps) => React.ReactNode;
  onStateChange?: (state: InlineCopilotRenderProps) => void;
}

/**
 * Pure helper function to compute safe, non-overflowing positioning for AI copilot ghost text.
 */
export function computeCopilotPositioning({
  caretRect,
  rootRect,
  paddingLeft,
  paddingRight,
  windowWidth,
  suggestionText,
  rightObstacleLeft,
}: {
  caretRect: { right: number; top: number; bottom: number; height: number };
  rootRect: { left: number; right: number; width: number };
  paddingLeft: number;
  paddingRight: number;
  windowWidth: number;
  suggestionText: string;
  rightObstacleLeft?: number;
}): CaretCoordinates {
  // Safe right boundary: bounded by editor text padding, window safe margin, and right obstacles
  const editorContentRight = rootRect.right - paddingRight;
  const windowSafeRight = windowWidth - 64; // At least 64px from viewport edge
  const effectiveObstacleRight =
    rightObstacleLeft && rightObstacleLeft > 0
      ? rightObstacleLeft - 16
      : windowSafeRight;

  const maxRight = Math.min(editorContentRight, windowSafeRight, effectiveObstacleRight);
  const availableWidthOnLine = maxRight - caretRect.right;

  // Approximate rendered text width: ~8.2px per character + 95px Tab badge + buffer
  const estimatedSuggestionWidth = suggestionText.length * 8.2 + 105;

  // If remaining width is too narrow (< 240px) OR suggestion won't fit on this line:
  const shouldWrapToNextLine =
    availableWidthOnLine < 240 || estimatedSuggestionWidth > availableWidthOnLine;

  if (shouldWrapToNextLine) {
    const nextLineStartX = rootRect.left + paddingLeft;
    const nextLineMaxWidth = Math.max(160, maxRight - nextLineStartX - 8);
    return {
      x: nextLineStartX,
      y: caretRect.bottom + 3,
      height: caretRect.height || 22,
      maxWidth: nextLineMaxWidth,
      isNextLine: true,
    };
  } else {
    return {
      x: caretRect.right,
      y: caretRect.top,
      height: caretRect.height || 22,
      maxWidth: Math.max(80, availableWidthOnLine - 8),
      isNextLine: false,
    };
  }
}

export default function InlineCopilotPlugin({
  enabledDefault = true,
  headless = false,
  render,
  onStateChange,
}: InlineCopilotPluginProps) {
  const [editor] = useLexicalComposerContext();
  const [isEnabled, setIsEnabled] = useState<boolean>(enabledDefault);

  useEffect(() => {
    const saved = localStorage.getItem("notiq_copilot_enabled");
    if (saved !== null) {
      setIsEnabled(saved === "true");
    }
  }, []);

  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [caretCoords, setCaretCoords] = useState<CaretCoordinates | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const activePromptRef = useRef<string>("");
  const isEnabledRef = useRef(isEnabled);
  isEnabledRef.current = isEnabled;

  const clearSuggestion = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setSuggestion(null);
    setIsLoading(false);
    setCaretCoords(null);
  }, []);

  const toggleEnabled = () => {
    setIsEnabled((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("notiq_copilot_enabled", String(next));
      }
      if (!next) clearSuggestion();
      return next;
    });
  };

  const getRightObstacleLeft = useCallback((): number | undefined => {
    if (typeof window === "undefined") return undefined;
    let obstacleLeft = window.innerWidth - 64;

    // Check for fixed floating analytics toggle or sidebars
    const fixedElements = document.querySelectorAll<HTMLElement>(
      '[data-comments-sidebar="true"], [data-version-drawer="true"], .fixed.right-4, aside'
    );
    fixedElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.left > 0 && rect.left < obstacleLeft) {
        obstacleLeft = rect.left;
      }
    });

    return obstacleLeft;
  }, []);

  const calculateCurrentCaretCoords = useCallback(
    (cleanText: string): CaretCoordinates | null => {
      if (typeof window === "undefined") return null;

      const domSelection = window.getSelection();
      if (!domSelection || domSelection.rangeCount === 0) return null;

      const range = domSelection.getRangeAt(0);
      const caretRect = range.getBoundingClientRect();
      if (!caretRect || caretRect.top <= 0) return null;

      const rootElement = editor.getRootElement();
      if (!rootElement) return null;

      const rootRect = rootElement.getBoundingClientRect();
      const style = window.getComputedStyle(rootElement);
      const paddingLeft = parseFloat(style.paddingLeft) || 16;
      const paddingRight = parseFloat(style.paddingRight) || 16;

      const rightObstacle = getRightObstacleLeft();

      return computeCopilotPositioning({
        caretRect: {
          right: caretRect.right,
          top: caretRect.top,
          bottom: caretRect.bottom,
          height: caretRect.height,
        },
        rootRect: {
          left: rootRect.left,
          right: rootRect.right,
          width: rootRect.width,
        },
        paddingLeft,
        paddingRight,
        windowWidth: window.innerWidth,
        suggestionText: cleanText,
        rightObstacleLeft: rightObstacle,
      });
    },
    [editor, getRightObstacleLeft]
  );

  // Fetch completion from AI endpoint
  const fetchCompletion = useCallback(
    async (textBeforeCursor: string) => {
      if (!isEnabledRef.current || !textBeforeCursor || textBeforeCursor.length < 12) {
        return;
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsLoading(true);
      activePromptRef.current = textBeforeCursor;

      try {
        const savedProvider =
          typeof window !== "undefined"
            ? localStorage.getItem("notiq_ai_provider")
            : undefined;
        const savedKey =
          typeof window !== "undefined"
            ? localStorage.getItem("notiq_ai_api_key")
            : undefined;

        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            action: "autoComplete",
            prompt: textBeforeCursor.slice(-150),
            modelProvider:
              savedProvider && savedProvider !== "auto" ? savedProvider : undefined,
            apiKey: savedKey || undefined,
          }),
        });

        if (!res.ok) {
          setIsLoading(false);
          return;
        }

        const completionText = await res.text();
        if (controller.signal.aborted) return;

        // Clean up suggestion
        let clean = completionText.trim();
        // Remove markdown wrappers or quotes if AI added any
        clean = clean.replace(/^["'`]+|["'`]+$/g, "");

        if (clean && clean.length > 3) {
          // Add leading space if needed
          if (
            !textBeforeCursor.endsWith(" ") &&
            !clean.startsWith(" ") &&
            !clean.startsWith(",") &&
            !clean.startsWith(".")
          ) {
            clean = " " + clean;
          }

          editor.getEditorState().read(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection) && selection.isCollapsed()) {
              const coords = calculateCurrentCaretCoords(clean);
              if (coords) {
                setSuggestion(clean);
                setCaretCoords(coords);
                return;
              }
            }
            clearSuggestion();
          });
        } else {
          clearSuggestion();
        }
      } catch {
        if (!controller.signal.aborted) {
          clearSuggestion();
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    },
    [clearSuggestion, calculateCurrentCaretCoords, editor]
  );

  // Monitor editor typing and pause detection
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState, dirtyElements, dirtyLeaves }) => {
      if (!isEnabledRef.current) return;

      // If user is actively typing, clear previous ghost text
      if (dirtyElements.size > 0 || dirtyLeaves.size > 0) {
        clearSuggestion();
      }

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        if (!isEnabledRef.current) return;

        editorState.read(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
            clearSuggestion();
            return;
          }

          const node = selection.anchor.getNode();
          const offset = selection.anchor.offset;
          const textContent = node.getTextContent();
          const textBeforeCursor = textContent.slice(0, offset).trim();

          // Only suggest if user has typed at least 2 words
          if (textBeforeCursor.length < 12 || !/\s/.test(textBeforeCursor)) {
            clearSuggestion();
            return;
          }

          fetchCompletion(textBeforeCursor);
        });
      }, 750); // 750ms pause debounce
    });
  }, [editor, clearSuggestion, fetchCompletion]);

  // Reposition or dismiss ghost text when window or editor scrolls / resizes
  useEffect(() => {
    if (!suggestion) return;

    const handleReposition = () => {
      editor.getEditorState().read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection) && selection.isCollapsed()) {
          const coords = calculateCurrentCaretCoords(suggestion);
          if (coords) {
            setCaretCoords(coords);
            return;
          }
        }
        clearSuggestion();
      });
    };

    window.addEventListener("scroll", handleReposition, { passive: true });
    window.addEventListener("resize", handleReposition, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleReposition);
      window.removeEventListener("resize", handleReposition);
    };
  }, [suggestion, editor, clearSuggestion, calculateCurrentCaretCoords]);

  const acceptSuggestion = useCallback(() => {
    if (!suggestion) return;
    const textToInsert = suggestion;
    clearSuggestion();

    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.insertText(textToInsert);
      }
    });
  }, [editor, suggestion, clearSuggestion]);

  // Handle Tab to accept and Esc to dismiss
  useEffect(() => {
    return editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event: KeyboardEvent) => {
        // Alt + C toggles Copilot
        if (event.altKey && event.key.toLowerCase() === "c") {
          event.preventDefault();
          toggleEnabled();
          return true;
        }

        // Tab accepts completion
        if (event.key === "Tab" && suggestion) {
          event.preventDefault();
          event.stopPropagation();
          acceptSuggestion();
          return true;
        }

        // Escape dismisses suggestion
        if (event.key === "Escape" && suggestion) {
          event.preventDefault();
          clearSuggestion();
          return true;
        }

        // Backspace or printable keys dismiss stale suggestion
        if (suggestion && event.key !== "Shift" && event.key !== "Control" && event.key !== "Alt") {
          clearSuggestion();
        }

        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor, suggestion, clearSuggestion, acceptSuggestion, toggleEnabled]);

  // Dismiss on selection click
  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        if (suggestion) {
          clearSuggestion();
        }
        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor, suggestion, clearSuggestion, acceptSuggestion, toggleEnabled]);

  const copilotState: InlineCopilotRenderProps = {
    isEnabled,
    isLoading,
    suggestion,
    caretCoords,
    accept: acceptSuggestion,
    reject: clearSuggestion,
    toggleEnabled,
  };

  useEffect(() => {
    onStateChange?.(copilotState);
  }, [isEnabled, isLoading, suggestion, caretCoords]);

  if (render) {
    return <>{render(copilotState)}</>;
  }

  if (headless) {
    return null;
  }

  return (
    <>
      {/* Floating Ghost Suggestion Overlay */}
      {suggestion && caretCoords && isEnabled && (
        <div
          style={{
            position: "fixed",
            left: `${caretCoords.x}px`,
            top: `${caretCoords.y}px`,
            maxWidth: `${caretCoords.maxWidth}px`,
            lineHeight: `${caretCoords.height}px`,
            zIndex: 45,
            pointerEvents: "none",
          }}
          className={cn(
            "inline-flex items-center text-muted-foreground/60 dark:text-muted-foreground/50 select-none font-normal animate-in fade-in-50 duration-150 overflow-hidden",
            caretCoords.isNextLine &&
              "py-0.5 px-1.5 rounded-md bg-muted/20 border border-border/40 backdrop-blur-xs shadow-xs"
          )}
        >
          {caretCoords.isNextLine && (
            <span className="text-[10px] not-italic text-muted-foreground/50 font-mono select-none mr-1.5 shrink-0">
              ↵
            </span>
          )}
          <span className="truncate min-w-0 flex-1 italic whitespace-pre">
            {caretCoords.isNextLine
              ? suggestion.trimStart()
              : suggestion.startsWith(" ")
                ? "\u00A0" + suggestion.slice(1)
                : suggestion}
          </span>
          <span className="inline-flex items-center gap-1 ml-2 not-italic pointer-events-auto shrink-0">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
                acceptSuggestion();
              }}
              title="Accept suggestion (Tab)"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-violet-600 hover:bg-violet-500 text-white shadow-xs transition-colors cursor-pointer"
            >
              <Check className="w-3 h-3" />
              <span>Accept</span>
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
                clearSuggestion();
              }}
              title="Reject suggestion (Esc)"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-background/95 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 border border-border/80 shadow-xs transition-colors cursor-pointer"
            >
              <X className="w-3 h-3" />
              <span>Reject</span>
            </button>
          </span>
        </div>
      )}

      {/* Floating Copilot Status Pill (Bottom right of editor) */}
      <div className="fixed bottom-4 right-4 z-40 hidden sm:flex items-center gap-1.5 animate-in fade-in duration-300">
        <button
          type="button"
          onClick={toggleEnabled}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all shadow-sm border backdrop-blur-md",
            isEnabled
              ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 hover:bg-purple-500/20"
              : "bg-muted/70 text-muted-foreground border-border/60 hover:bg-muted"
          )}
          title={`AI Copilot (${isEnabled ? "Active" : "Paused"}). Press Alt+C to toggle.`}
          aria-label="Toggle AI Ghost Text Copilot"
        >
          {isLoading ? (
            <Loader2 className="w-3 h-3 animate-spin text-purple-500" />
          ) : (
            <Sparkles className={cn("w-3 h-3", isEnabled && "text-purple-500")} />
          )}
          <span>{isEnabled ? "Copilot on" : "Copilot off"}</span>
          <kbd className="text-[9px] font-mono opacity-60 bg-background/60 px-1 rounded">Alt+C</kbd>
        </button>
      </div>
    </>
  );
}
