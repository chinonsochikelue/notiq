"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createParagraphNode,
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  $parseSerializedNode,
  COMMAND_PRIORITY_CRITICAL,
  createCommand,
  KEY_DOWN_COMMAND,
  type LexicalCommand,
  type LexicalNode,
  type SerializedLexicalNode,
} from "lexical";
import {
  Sparkles,
  Loader2,
  Check,
  X,
  RotateCcw,
  CornerDownLeft,
  ChevronRight,
  Wand2,
  Languages,
  FileText,
  ListChecks,
  Lightbulb,
  Table2,
  PenLine,
  MessageSquare,
  GitCompareArrows,
  Square,
  SlidersHorizontal,
  Brain,
  Globe,
  Image as ImageIcon,
  Shapes,
} from "lucide-react";
import {
  buildDiffHunks,
  computeWordDiff,
  resolveDiffHunks,
  type DiffHunkStatus,
} from "../../utils/diffUtils";
import { useAI } from "../../../providers/AIContext";
import {
  WRITING_STYLE_PRESETS,
  type WritingStylePresetId,
} from "../../../../hooks/instructions-messages";
import editorNodes from "../../nodes";
import {
  extractSurroundingContext,
  hydrateSerializedAINodes,
  serializeMarkdownToNodes,
  stripAIStyleFromSubtree,
} from "../../utils/aiStream";
import { cn } from "../../../../lib/utils";

export const OPEN_AI_COMMAND_BAR_COMMAND: LexicalCommand<{
  initialPrompt?: string;
  action?: string;
} | void> = createCommand("OPEN_AI_COMMAND_BAR_COMMAND");

type AIPhase = "closed" | "prompt" | "streaming" | "review";

export interface ResearchSource {
  title: string;
  url: string;
}

/**
 * Splits `<thinking>...</thinking>` reasoning blocks and `<!--SOURCES:[...]-->`
 * metadata out of a streaming AI response so they never pollute the editor canvas.
 */
export function extractThinkingAndSources(raw: string): {
  thinking: string;
  sources: ResearchSource[];
  content: string;
} {
  let text = raw;
  let thinking = "";
  const sources: ResearchSource[] = [];

  const closedThinkMatch = text.match(/<thinking>([\s\S]*?)<\/thinking>/i);
  if (closedThinkMatch) {
    thinking = closedThinkMatch[1].trim();
    text = text.replace(/<thinking>[\s\S]*?<\/thinking>\s*/i, "");
  } else {
    const openIdx = text.search(/<thinking>/i);
    if (openIdx !== -1) {
      thinking = text.slice(openIdx + "<thinking>".length).trim();
      text = text.slice(0, openIdx);
    }
  }

  const sourcesMatch = text.match(/<!--SOURCES:([\s\S]*?)-->/);
  if (sourcesMatch) {
    try {
      const parsed = JSON.parse(sourcesMatch[1]);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (item && typeof item.url === "string" && typeof item.title === "string") {
            sources.push({ title: item.title, url: item.url });
          }
        }
      }
    } catch {
      // Ignore malformed/partial sources JSON while streaming
    }
    text = text.replace(/\n?<!--SOURCES:[\s\S]*?-->/g, "");
  } else {
    const partialIdx = text.indexOf("<!--SOURCES:");
    if (partialIdx !== -1) {
      text = text.slice(0, partialIdx);
    }
  }

  return {
    thinking,
    sources,
    content: text.trimStart(),
  };
}

interface AIPreset {
  id: string;
  action: string;
  label: string;
  keywords: string[];
  prompt?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  hasSubmenu?: "tone" | "language";
  think?: boolean;
  research?: boolean;
}

const SELECTION_PRESETS: AIPreset[] = [
  {
    id: "improve",
    action: "ImproveWriting",
    label: "Improve writing",
    keywords: ["improve", "polish", "rewrite", "better"],
    icon: Wand2,
  },
  {
    id: "grammar",
    action: "FixSpellingGrammar",
    label: "Fix grammar & spelling",
    keywords: ["fix", "grammar", "spelling", "proofread"],
    icon: Check,
  },
  {
    id: "shorter",
    action: "MakeShort",
    label: "Make shorter",
    keywords: ["shorter", "concise", "trim", "condense"],
    icon: Sparkles,
  },
  {
    id: "longer",
    action: "MakeLong",
    label: "Make longer",
    keywords: ["longer", "expand", "elaborate", "detail"],
    icon: Sparkles,
  },
  {
    id: "simplify",
    action: "SimplifyLanguage",
    label: "Simplify language",
    keywords: ["simplify", "clear", "easy", "plain"],
    icon: SlidersHorizontal,
  },
  {
    id: "explain",
    action: "default",
    label: "Explain",
    keywords: ["explain", "clarify", "what", "meaning"],
    prompt: "Explain the selected text clearly with key takeaways.",
    icon: MessageSquare,
  },
  {
    id: "tone",
    action: "Tone",
    label: "Change tone",
    keywords: ["tone", "professional", "casual", "friendly", "academic"],
    icon: Wand2,
    hasSubmenu: "tone",
  },
  {
    id: "translate",
    action: "Translate",
    label: "Translate",
    keywords: ["translate", "language", "spanish", "french", "german"],
    icon: Languages,
    hasSubmenu: "language",
  },
];

const CURSOR_PRESETS: AIPreset[] = [
  {
    id: "continue",
    action: "autoComplete",
    label: "Continue writing",
    keywords: ["continue", "write", "complete", "next"],
    icon: PenLine,
  },
  {
    id: "research-write",
    action: "default",
    label: "Research & write",
    keywords: ["research", "search", "web", "sources", "facts", "investigate"],
    prompt: "Research this topic and write a well-structured, fact-grounded section with key takeaways.",
    icon: Globe,
    think: true,
    research: true,
  },
  {
    id: "draw-diagram",
    action: "default",
    label: "Draw diagram (Excalidraw)",
    keywords: ["diagram", "flowchart", "architecture", "draw", "excalidraw", "chart"],
    prompt: "Draw an interactive Excalidraw architecture or workflow diagram for this topic.",
    icon: Shapes,
    think: true,
  },
  {
    id: "add-visuals",
    action: "default",
    label: "Insert images & visuals",
    keywords: ["image", "inline", "visual", "picture", "illustration"],
    prompt: "Create a visual overview with both a block image and an inline image for this topic.",
    icon: ImageIcon,
    think: true,
  },
  {
    id: "summary",
    action: "Summarize",
    label: "Add a summary",
    keywords: ["summary", "summarize", "tldr", "recap"],
    prompt: "Summarize the document into crisp, structured key points.",
    icon: FileText,
  },
  {
    id: "md-sample",
    action: "default",
    label: "Generate Markdown sample",
    keywords: ["markdown", "sample", "demo", "template", "mdx"],
    prompt:
      "Generate a rich Markdown showcase with headings, a blockquote, a task list, a code block, inline math $E = mc^2$, and a comparison table.",
    icon: Sparkles,
  },
  {
    id: "outline",
    action: "Steps",
    label: "Write an outline",
    keywords: ["outline", "steps", "roadmap", "structure"],
    prompt: "Create a structured step-by-step outline for this topic.",
    icon: ListChecks,
  },
  {
    id: "brainstorm",
    action: "default",
    label: "Brainstorm ideas",
    keywords: ["brainstorm", "ideas", "creative", "suggest"],
    prompt: "Brainstorm 5 creative, actionable ideas related to this document.",
    icon: Lightbulb,
  },
  {
    id: "table",
    action: "default",
    label: "Create comparison table",
    keywords: ["table", "compare", "comparison", "matrix"],
    prompt: "Create a clean Markdown comparison table summarizing the key options.",
    icon: Table2,
  },
];

const TONES = ["Professional", "Casual", "Direct", "Academic", "Friendly"];
const LANGUAGES = ["Spanish", "French", "German", "Japanese", "Chinese", "Arabic"];

export interface AICommandBarRenderProps {
  phase: AIPhase;
  coords: { top: number; left: number } | null;
  prompt: string;
  setPrompt: (value: string) => void;
  followUpPrompt: string;
  setFollowUpPrompt: (value: string) => void;
  selectedText: string;
  streamedText: string;
  thinking: string;
  sources: ResearchSource[];
  content: string;
  thinkEnabled: boolean;
  setThinkEnabled: (value: boolean) => void;
  researchEnabled: boolean;
  setResearchEnabled: (value: boolean) => void;
  activeLabel: string;
  errorMsg: string | null;
  presets: AIPreset[];
  open: (payload?: { initialPrompt?: string; action?: string }) => void;
  close: () => void;
  runAction: (
    action: string,
    contextText: string,
    customQuestion?: string,
    label?: string,
    options?: { think?: boolean; research?: boolean }
  ) => Promise<void>;
  executePreset: (preset: AIPreset) => void;
  accept: () => void;
  discard: () => void;
  retry: () => void;
  stopStreaming: () => void;
}

export interface AICommandBarPluginProps {
  headless?: boolean;
  apiEndpoint?: string;
  render?: (state: AICommandBarRenderProps) => React.ReactNode;
  onStateChange?: (state: AICommandBarRenderProps) => void;
}

export default function AICommandBarPlugin({
  headless = false,
  apiEndpoint: propApiEndpoint,
  render,
  onStateChange,
}: AICommandBarPluginProps = {}) {
  const [editor] = useLexicalComposerContext();
  const {
    apiEndpoint: contextApiEndpoint,
    writingStyle: configWritingStyle,
    styleGuide: configStyleGuide,
  } = useAI();
  const apiEndpoint = propApiEndpoint || contextApiEndpoint;

  const [writingStyle, setWritingStyle] = useState<WritingStylePresetId>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("notiq_ai_writing_style");
      if (saved && saved in WRITING_STYLE_PRESETS) {
        return saved as WritingStylePresetId;
      }
    }
    return (configWritingStyle && configWritingStyle in WRITING_STYLE_PRESETS
      ? configWritingStyle
      : "balanced") as WritingStylePresetId;
  });
  const [customStyleGuide, setCustomStyleGuide] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("notiq_ai_style_guide") || configStyleGuide || "";
    }
    return configStyleGuide || "";
  });
  const [showStyleEditor, setShowStyleEditor] = useState(false);

  const [phase, setPhase] = useState<AIPhase>("closed");
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const [prompt, setPrompt] = useState("");
  const [followUpPrompt, setFollowUpPrompt] = useState("");
  const [selectedText, setSelectedText] = useState("");
  const [streamedText, setStreamedText] = useState("");
  const [showDiff, setShowDiff] = useState(false);
  const [hunkDecisions, setHunkDecisions] = useState<Record<string, DiffHunkStatus>>({});
  const [thinkEnabled, setThinkEnabled] = useState(true);
  const [researchEnabled, setResearchEnabled] = useState(false);
  const [showTrace, setShowTrace] = useState(false);
  const [activeLabel, setActiveLabel] = useState("Writing...");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [activeSubmenu, setActiveSubmenu] = useState<"tone" | "language" | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const followUpRef = useRef<HTMLInputElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Track generated nodes and anchor snapshot in the editor
  const generatedKeysRef = useRef<string[]>([]);
  const anchorAfterKeyRef = useRef<string | null>(null);
  const replacedBlockSnapshotRef = useRef<{
    replacedEmpty: boolean;
    originalText: string;
    originalNodes: SerializedLexicalNode[];
  } | null>(null);
  const lastRequestRef = useRef<{
    action: string;
    context: string;
    question?: string;
    label?: string;
  } | null>(null);

  const presets = useMemo(
    () => (selectedText.trim().length > 0 ? SELECTION_PRESETS : CURSOR_PRESETS),
    [selectedText]
  );

  const parsedStream = useMemo(
    () => extractThinkingAndSources(streamedText),
    [streamedText]
  );

  const canShowDiff =
    phase === "review" &&
    selectedText.trim().length > 0 &&
    parsedStream.content.trim().length > 0;

  const diffParts = useMemo(() => {
    if (!canShowDiff || !showDiff) return [];
    return computeWordDiff(selectedText, parsedStream.content);
  }, [canShowDiff, showDiff, selectedText, parsedStream.content]);

  const diffHunks = useMemo(() => buildDiffHunks(diffParts), [diffParts]);

  const filteredPresets = useMemo(() => {
    const q = prompt.trim().toLowerCase();
    if (!q) return presets;
    return presets.filter(
      (p) =>
        p.label.toLowerCase().includes(q) ||
        p.keywords.some((kw) => kw.includes(q))
    );
  }, [presets, prompt]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [prompt, phase]);

  const wordCount = useMemo(() => {
    const trimmed = streamedText.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  }, [streamedText]);

  const scrollLastGeneratedIntoView = useCallback(() => {
    const keys = generatedKeysRef.current;
    if (keys.length === 0) return;
    const el = editor.getElementByKey(keys[keys.length - 1]);
    if (el) {
      const rect = el.getBoundingClientRect();
      if (rect.bottom > window.innerHeight - 110 || rect.top < 80) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [editor]);

  const applyStreamedMarkdownToEditor = useCallback(
    (markdown: string, showCaret: boolean) => {
      const serialized = serializeMarkdownToNodes(markdown, editorNodes);

      editor.update(
        () => {
          const root = $getRoot();
          const newNodes = hydrateSerializedAINodes(serialized, { showCaret });
          const existingKeys = generatedKeysRef.current;

          if (existingKeys.length > 0) {
            const firstExisting = $getNodeByKey(existingKeys[0]);
            if (firstExisting && firstExisting.isAttached()) {
              const insertIndex = firstExisting.getIndexWithinParent();
              for (const key of existingKeys) {
                const oldNode = $getNodeByKey(key);
                if (oldNode && oldNode.isAttached()) {
                  oldNode.remove();
                }
              }
              root.splice(insertIndex, 0, newNodes);
              generatedKeysRef.current = newNodes.map((n) => n.getKey());
              return;
            }
          }

          // First insertion into document
          const anchorKey = anchorAfterKeyRef.current;
          const anchorNode = anchorKey ? $getNodeByKey(anchorKey) : null;

          if (anchorNode && anchorNode.isAttached()) {
            const isEmptyAnchor =
              replacedBlockSnapshotRef.current?.replacedEmpty &&
              anchorNode.getTextContent().trim() === "";
            const anchorIndex = anchorNode.getIndexWithinParent();
            if (isEmptyAnchor) {
              anchorNode.remove();
              root.splice(anchorIndex, 0, newNodes);
            } else {
              root.splice(anchorIndex + 1, 0, newNodes);
            }
          } else {
            root.append(...newNodes);
          }

          generatedKeysRef.current = newNodes.map((n) => n.getKey());
        },
        { discrete: true, tag: "notiq-ai-stream" }
      );
    },
    [editor]
  );

  const handleHunkDecision = useCallback(
    (hunkId: string, status: DiffHunkStatus) => {
      setHunkDecisions((prev) => {
        const next = { ...prev, [hunkId]: status };
        const resolved = resolveDiffHunks(diffHunks, next);
        applyStreamedMarkdownToEditor(resolved, false);
        return next;
      });
    },
    [applyStreamedMarkdownToEditor, diffHunks]
  );

  const handleBulkHunkDecision = useCallback(
    (status: "accepted" | "rejected") => {
      const next: Record<string, DiffHunkStatus> = {};
      for (const hunk of diffHunks) {
        if (hunk.type !== "unchanged") {
          next[hunk.id] = status;
        }
      }
      setHunkDecisions(next);
      const resolved = resolveDiffHunks(diffHunks, next);
      applyStreamedMarkdownToEditor(resolved, false);
    },
    [applyStreamedMarkdownToEditor, diffHunks]
  );

  const captureAnchorFromSelection = useCallback(() => {
    let targetText = "";
    let docContext = "";

    editor.getEditorState().read(() => {
      const root = $getRoot();
      docContext = root.getTextContent();

      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        targetText = selection.getTextContent();
        const anchorNode = selection.anchor.getNode();
        const topElement =
          anchorNode.getKey() === "root"
            ? root.getLastChild()
            : anchorNode.getTopLevelElementOrThrow();

        if (topElement) {
          anchorAfterKeyRef.current = topElement.getKey();
          const isEmpty = topElement.getTextContent().trim() === "";
          replacedBlockSnapshotRef.current = {
            replacedEmpty: isEmpty,
            originalText: targetText,
            originalNodes: [topElement.exportJSON()],
          };
        } else {
          anchorAfterKeyRef.current = null;
          replacedBlockSnapshotRef.current = null;
        }
      } else {
        const last = root.getLastChild();
        anchorAfterKeyRef.current = last ? last.getKey() : null;
        replacedBlockSnapshotRef.current = last
          ? {
              replacedEmpty: last.getTextContent().trim() === "",
              originalText: "",
              originalNodes: [last.exportJSON()],
            }
          : null;
      }
    });

    return { targetText, docContext };
  }, [editor]);

  const resetSessionState = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    generatedKeysRef.current = [];
    anchorAfterKeyRef.current = null;
    replacedBlockSnapshotRef.current = null;
    setPhase("closed");
    setCoords(null);
    setPrompt("");
    setFollowUpPrompt("");
    setSelectedText("");
    setStreamedText("");
    setShowDiff(false);
    setShowTrace(false);
    setErrorMsg(null);
    setActiveSubmenu(null);
  }, []);

  const handleDiscard = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    const keys = [...generatedKeysRef.current];
    const snapshot = replacedBlockSnapshotRef.current;

    if (keys.length > 0) {
      editor.update(
        () => {
          const firstNode = $getNodeByKey(keys[0]);
          if (firstNode && snapshot?.replacedEmpty && snapshot.originalNodes.length > 0) {
            try {
              const restored = $parseSerializedNode(snapshot.originalNodes[0]);
              firstNode.insertBefore(restored);
            } catch {
              firstNode.insertBefore($createParagraphNode());
            }
          }
          for (const key of keys) {
            const node = $getNodeByKey(key);
            if (node) node.remove();
          }
        },
        { discrete: true }
      );
    }

    resetSessionState();
    editor.focus();
  }, [editor, resetSessionState]);

  const handleAccept = useCallback(() => {
    const keys = [...generatedKeysRef.current];
    if (keys.length > 0) {
      editor.update(
        () => {
          for (const key of keys) {
            const node = $getNodeByKey(key);
            if (node) {
              stripAIStyleFromSubtree(node);
            }
          }
          const last = $getNodeByKey(keys[keys.length - 1]);
          if (last && "selectEnd" in last && typeof (last as any).selectEnd === "function") {
            (last as any).selectEnd();
          }
        },
        { discrete: true }
      );
    }
    resetSessionState();
    editor.focus();
  }, [editor, resetSessionState]);

  const runAction = useCallback(
    async (
      action: string,
      contextText: string,
      customQuestion?: string,
      label?: string,
      options?: { think?: boolean; research?: boolean }
    ) => {
      const useThink = options?.think ?? thinkEnabled;
      const useResearch = options?.research ?? researchEnabled;
      setErrorMsg(null);
      setActiveSubmenu(null);
      setActiveLabel(
        label || (useResearch ? "Researching & writing..." : useThink ? "Thinking & writing..." : "Writing...")
      );
      setPhase("streaming");
      setStreamedText("");
      setShowDiff(false);
      setHunkDecisions({});
      setShowTrace(false);
    setShowTrace(false);
      lastRequestRef.current = {
        action,
        context: contextText,
        question: customQuestion,
        label,
      };

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      let accumulated = "";
      let renderTimer: ReturnType<typeof setTimeout> | null = null;

      const scheduleRender = (final = false) => {
        if (final) {
          if (renderTimer !== null) {
            clearTimeout(renderTimer);
            renderTimer = null;
          }
          const parsed = extractThinkingAndSources(accumulated);
          if (parsed.content.trim()) {
            applyStreamedMarkdownToEditor(parsed.content, false);
            scrollLastGeneratedIntoView();
          }
          return;
        }
        if (renderTimer !== null) return;
        renderTimer = setTimeout(() => {
          renderTimer = null;
          if (!controller.signal.aborted) {
            const parsed = extractThinkingAndSources(accumulated);
            if (parsed.content.trim()) {
              applyStreamedMarkdownToEditor(parsed.content, true);
              scrollLastGeneratedIntoView();
            }
          }
        }, 80);
      };

      try {
        const savedProvider =
          typeof window !== "undefined"
            ? localStorage.getItem("notiq_ai_provider")
            : undefined;
        const savedKey =
          typeof window !== "undefined"
            ? localStorage.getItem("notiq_ai_api_key")
            : undefined;

        const response = await fetch(apiEndpoint || "/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            context: contextText || "",
            prompt: customQuestion || contextText || "",
            userQuestion: customQuestion || "",
            writingStyle,
            styleGuide: customStyleGuide.trim() || undefined,
            think: useThink,
            research: useResearch,
            modelProvider:
              savedProvider && savedProvider !== "auto" ? savedProvider : undefined,
            apiKey: savedKey?.trim() || undefined,
          }),
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          const errText = await response.text().catch(() => "");
          throw new Error(errText || `AI service returned ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;
          setStreamedText(accumulated);
          scheduleRender(false);
        }

        scheduleRender(true);
        setPhase("review");
      } catch (err: any) {
        if (err?.name === "AbortError") {
          // User stopped mid-stream: finalize what we have so they can Accept or Discard
          if (accumulated.trim()) {
            applyStreamedMarkdownToEditor(accumulated, false);
            setPhase("review");
          } else {
            handleDiscard();
          }
          return;
        }
        console.error("[Notiq AI Command Bar Error]:", err);
        setErrorMsg(err?.message || "Failed to contact AI service.");
        if (accumulated.trim()) {
          applyStreamedMarkdownToEditor(accumulated, false);
          setPhase("review");
        } else {
          setPhase("prompt");
        }
      } finally {
        abortControllerRef.current = null;
      }
    },
    [
      apiEndpoint,
      applyStreamedMarkdownToEditor,
      handleDiscard,
      scrollLastGeneratedIntoView,
    ]
  );

  const handleStopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const handleRetry = useCallback(() => {
    const last = lastRequestRef.current;
    if (!last) return;
    runAction(last.action, last.context, last.question, last.label);
  }, [runAction]);

  const openBar = useCallback(
    (payload?: { initialPrompt?: string; action?: string } | void) => {
      // Reset any prior unaccepted session cleanly
      if (generatedKeysRef.current.length > 0) {
        handleAccept();
      }

      const { targetText, docContext } = captureAnchorFromSelection();

      const domSelection = window.getSelection();
      let top = 140;
      let left = Math.max(20, window.innerWidth / 2 - 260);

      if (domSelection && domSelection.rangeCount > 0) {
        const rect = domSelection.getRangeAt(0).getBoundingClientRect();
        if (rect.width > 0 || rect.height > 0) {
          left = Math.max(
            16,
            Math.min(window.innerWidth - 540, rect.left)
          );
          top = rect.bottom + 10;
          if (top + 320 > window.innerHeight) {
            top = Math.max(20, rect.top - 300);
          }
        }
      }

      setCoords({ top, left });
      setSelectedText(targetText);
      setPrompt(payload?.initialPrompt || "");
      setStreamedText("");
    setShowDiff(false);
    setShowTrace(false);
      setErrorMsg(null);
      setActiveSubmenu(null);
      setPhase("prompt");

      setTimeout(() => {
        inputRef.current?.focus();
      }, 40);

      if (payload?.action) {
        runAction(
          payload.action,
          targetText || docContext,
          payload.initialPrompt,
          payload.action
        );
      }
    },
    [captureAnchorFromSelection, handleAccept, runAction]
  );

  // Keyboard shortcuts: Cmd/Ctrl+K, Esc, Cmd+Enter
  useEffect(() => {
    return editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event: KeyboardEvent) => {
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
          event.preventDefault();
          if (phase === "closed") {
            openBar();
          } else if (phase === "prompt") {
            resetSessionState();
          }
          return true;
        }

        if (event.key === "Escape") {
          if (phase === "streaming") {
            event.preventDefault();
            handleStopStreaming();
            return true;
          }
          if (phase === "prompt") {
            event.preventDefault();
            resetSessionState();
            return true;
          }
          if (phase === "review") {
            event.preventDefault();
            handleDiscard();
            return true;
          }
        }

        if ((event.metaKey || event.ctrlKey) && event.key === "Enter" && phase === "review") {
          event.preventDefault();
          handleAccept();
          return true;
        }

        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [
    editor,
    phase,
    openBar,
    resetSessionState,
    handleStopStreaming,
    handleDiscard,
    handleAccept,
  ]);

  // Global Esc listener while focus is inside floating UI inputs
  useEffect(() => {
    if (phase === "closed") return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (phase === "streaming") handleStopStreaming();
        else if (phase === "review") handleDiscard();
        else resetSessionState();
      } else if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && phase === "review") {
        e.preventDefault();
        handleAccept();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [phase, handleStopStreaming, handleDiscard, handleAccept, resetSessionState]);

  useEffect(() => {
    return editor.registerCommand(
      OPEN_AI_COMMAND_BAR_COMMAND,
      (payload) => {
        openBar(payload);
        return true;
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor, openBar]);

  // Click outside in prompt phase closes the popover
  useEffect(() => {
    if (phase !== "prompt") return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        resetSessionState();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [phase, resetSessionState]);

  const executePreset = (preset: AIPreset) => {
    if (preset.hasSubmenu) {
      setActiveSubmenu(activeSubmenu === preset.hasSubmenu ? null : preset.hasSubmenu);
      return;
    }

    let docContext = selectedText;
    if (!docContext) {
      docContext = extractSurroundingContext(editor);
    }

    runAction(
      preset.action,
      docContext,
      preset.prompt,
      `${preset.label}...`,
      { think: preset.think, research: preset.research }
    );
  };

  const handlePromptSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = prompt.trim();

    if (!trimmed && filteredPresets[highlightedIndex]) {
      executePreset(filteredPresets[highlightedIndex]);
      return;
    }

    if (trimmed) {
      let docContext = selectedText;
      if (!docContext) {
        docContext = extractSurroundingContext(editor);
      }
      runAction("default", docContext, trimmed, "Writing...");
    }
  };

  const handlePromptKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      if (filteredPresets.length > 0) {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % filteredPresets.length);
      }
    } else if (e.key === "ArrowUp") {
      if (filteredPresets.length > 0) {
        e.preventDefault();
        setHighlightedIndex(
          (prev) => (prev - 1 + filteredPresets.length) % filteredPresets.length
        );
      }
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      // If user typed a matching query and highlighted a preset, or typed a custom prompt:
      const trimmed = prompt.trim();
      if (!trimmed && filteredPresets[highlightedIndex]) {
        executePreset(filteredPresets[highlightedIndex]);
      } else {
        handlePromptSubmit();
      }
    }
  };

  const handleFollowUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = followUpPrompt.trim();
    if (!trimmed) return;
    setFollowUpPrompt("");
    runAction("default", streamedText || selectedText, trimmed, "Refining...");
  };

  const commandBarState: AICommandBarRenderProps = {
    phase,
    coords,
    prompt,
    setPrompt,
    followUpPrompt,
    setFollowUpPrompt,
    selectedText,
    streamedText,
    thinking: parsedStream.thinking,
    sources: parsedStream.sources,
    content: parsedStream.content,
    thinkEnabled,
    setThinkEnabled,
    researchEnabled,
    setResearchEnabled,
    activeLabel,
    errorMsg,
    presets,
    open: openBar,
    close: resetSessionState,
    runAction,
    executePreset,
    accept: handleAccept,
    discard: handleDiscard,
    retry: handleRetry,
    stopStreaming: handleStopStreaming,
  };

  useEffect(() => {
    onStateChange?.(commandBarState);
  }, [
    phase,
    coords,
    prompt,
    followUpPrompt,
    selectedText,
    streamedText,
    thinkEnabled,
    researchEnabled,
    activeLabel,
    errorMsg,
  ]);

  if (render) {
    return <>{render(commandBarState)}</>;
  }

  if (headless || phase === "closed" || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <>
      {/* 1. Floating Prompt Popover (Prompt Phase) */}
      {phase === "prompt" && coords && (
        <div
          ref={containerRef}
          style={{
            top: `${coords.top}px`,
            left: `${coords.left}px`,
          }}
          className="fixed z-50 w-[520px] max-w-[calc(100vw-2rem)] rounded-2xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl shadow-2xl shadow-violet-500/10 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Prompt Input Row */}
          <form
            onSubmit={handlePromptSubmit}
            className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-zinc-100 dark:border-zinc-800/80"
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handlePromptKeyDown}
              placeholder={
                selectedText
                  ? "Ask AI to edit selection..."
                  : "Ask AI anything..."
              }
              className="flex-1 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none"
            />
            {prompt.trim() ? (
              <button
                type="submit"
                className="inline-flex items-center gap-1 rounded-lg bg-violet-600 hover:bg-violet-500 px-2.5 py-1 text-xs font-medium text-white shadow-sm transition-colors"
              >
                <span>Ask</span>
                <CornerDownLeft className="h-3 w-3" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400">
                ⌘K
              </kbd>
            )}
          </form>

          {/* Think & Research Mode Toggles */}
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-900/40 text-[11px]">
            <button
              type="button"
              onClick={() => setThinkEnabled((v) => !v)}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-medium transition-colors ${
                thinkEnabled
                  ? "bg-violet-600/15 text-violet-700 dark:text-violet-300 border border-violet-500/30"
                  : "text-zinc-500 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 border border-transparent"
              }`}
              title="Reason step-by-step before writing"
            >
              <Brain className="h-3 w-3" />
              <span>Think</span>
            </button>
            <button
              type="button"
              onClick={() => setResearchEnabled((v) => !v)}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-medium transition-colors ${
                researchEnabled
                  ? "bg-sky-600/15 text-sky-700 dark:text-sky-300 border border-sky-500/30"
                  : "text-zinc-500 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 border border-transparent"
              }`}
              title="Search & cite live web sources while writing"
            >
              <Globe className="h-3 w-3" />
              <span>Research</span>
            </button>
            <span className="ml-auto text-[10px] text-zinc-400 hidden sm:inline">
              Images · Inline visuals · Excalidraw diagrams
            </span>
          </div>

          {/* Error Banner if previous call failed */}
          {errorMsg && (
            <div className="px-3.5 py-2 text-xs text-rose-600 dark:text-rose-400 bg-rose-50/80 dark:bg-rose-950/30 border-b border-rose-200/60 dark:border-rose-900/50">
              {errorMsg}
            </div>
          )}

          {/* Filtered Presets List (auto-collapses cleanly when no presets match) */}
          {filteredPresets.length > 0 && (
            <div className="max-h-72 overflow-y-auto p-1.5 space-y-0.5">
              {filteredPresets.map((preset, idx) => {
                const Icon = preset.icon;
                const isActive = idx === highlightedIndex;
                return (
                  <div key={preset.id}>
                    <button
                      type="button"
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      onClick={() => executePreset(preset)}
                      className={cn(
                        "w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-[13px] transition-colors text-left",
                        isActive
                          ? "bg-violet-500/10 text-violet-950 dark:text-violet-100"
                          : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/80 dark:hover:bg-zinc-900/80"
                      )}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon
                          className={cn(
                            "h-4 w-4",
                            isActive
                              ? "text-violet-600 dark:text-violet-400"
                              : "text-zinc-400 dark:text-zinc-500"
                          )}
                        />
                        <span className="font-medium">{preset.label}</span>
                      </span>
                      {preset.hasSubmenu && (
                        <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
                      )}
                    </button>

                    {/* Inline Tone / Language Pills */}
                    {preset.hasSubmenu === "tone" && activeSubmenu === "tone" && (
                      <div className="flex flex-wrap gap-1.5 px-3 py-2 ml-6">
                        {TONES.map((tone) => (
                          <button
                            key={tone}
                            type="button"
                            onClick={() =>
                              runAction(
                                "Tone",
                                selectedText,
                                `Rewrite in a ${tone} tone.`,
                                `Applying ${tone} tone...`
                              )
                            }
                            className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:border-violet-400 hover:bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-200 transition-colors"
                          >
                            {tone}
                          </button>
                        ))}
                      </div>
                    )}

                    {preset.hasSubmenu === "language" && activeSubmenu === "language" && (
                      <div className="flex flex-wrap gap-1.5 px-3 py-2 ml-6">
                        {LANGUAGES.map((lang) => (
                          <button
                            key={lang}
                            type="button"
                            onClick={() =>
                              runAction(
                                "Translate",
                                selectedText,
                                `Translate to ${lang}.`,
                                `Translating to ${lang}...`
                              )
                            }
                            className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:border-violet-400 hover:bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-200 transition-colors"
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Writing Style & Custom Voice Footer */}
          <div className="border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-900/50 px-3 py-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                <span className="text-[11px] font-medium text-zinc-400 mr-1 shrink-0">
                  Voice:
                </span>
                {(Object.keys(WRITING_STYLE_PRESETS) as WritingStylePresetId[]).map(
                  (styleKey) => {
                    const active = writingStyle === styleKey;
                    return (
                      <button
                        key={styleKey}
                        type="button"
                        onClick={() => {
                          setWritingStyle(styleKey);
                          if (typeof window !== "undefined") {
                            localStorage.setItem("notiq_ai_writing_style", styleKey);
                          }
                        }}
                        className={cn(
                          "rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors shrink-0",
                          active
                            ? "bg-violet-600 text-white shadow-sm"
                            : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-zinc-800"
                        )}
                      >
                        {WRITING_STYLE_PRESETS[styleKey].label}
                      </button>
                    );
                  }
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowStyleEditor((v) => !v)}
                className={cn(
                  "text-[11px] font-medium px-2 py-0.5 rounded-md transition-colors shrink-0",
                  customStyleGuide.trim() || showStyleEditor
                    ? "text-violet-600 dark:text-violet-400 bg-violet-500/10"
                    : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                )}
                title="Train AI with custom style rules"
              >
                {showStyleEditor ? "Done" : customStyleGuide.trim() ? "Rules ✓" : "+ Rules"}
              </button>
            </div>

            {showStyleEditor && (
              <div className="mt-1.5 pb-1">
                <input
                  type="text"
                  value={customStyleGuide}
                  onChange={(e) => {
                    setCustomStyleGuide(e.target.value);
                    if (typeof window !== "undefined") {
                      localStorage.setItem("notiq_ai_style_guide", e.target.value);
                    }
                  }}
                  placeholder="Custom voice rules (e.g. active voice, concise, no jargon)..."
                  className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-2.5 py-1 text-xs text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:border-violet-400"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Floating Streaming Status Pill: "Thinking & writing... | Stop [Esc]" */}
      {phase === "streaming" && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2 max-w-[calc(100vw-2rem)]">
          {parsedStream.thinking && (
            <div className="w-[min(34rem,calc(100vw-2rem))] max-h-32 overflow-y-auto rounded-2xl border border-violet-200/80 dark:border-violet-800/60 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl px-3.5 py-2.5 text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-300 shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-150">
              <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                <Brain className="h-3 w-3 animate-pulse" />
                <span>AI Thinking</span>
              </div>
              <div className="whitespace-pre-wrap">{parsedStream.thinking}</div>
            </div>
          )}

          <div className="flex items-center gap-3 rounded-full border border-violet-200/80 dark:border-violet-800/60 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl px-4 py-2 shadow-xl shadow-violet-500/15 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-200">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-600 dark:text-violet-400" />
              <span>{activeLabel}</span>
              {wordCount > 0 && (
                <span className="text-[11px] text-zinc-400 tabular-nums">
                  {wordCount}w
                </span>
              )}
            </div>
            <div className="h-3.5 w-px bg-zinc-200 dark:bg-zinc-800" />
            <button
              type="button"
              onClick={handleStopStreaming}
              className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-200 transition-colors"
            >
              <Square className="h-2.5 w-2.5 fill-current" />
              <span>Stop</span>
              <kbd className="rounded bg-white/80 dark:bg-zinc-900 px-1 py-0.5 text-[10px] text-zinc-400 border border-zinc-200/80 dark:border-zinc-700">
                Esc
              </kbd>
            </button>
          </div>
        </div>
      )}

      {/* 3. Post-Stream Review Bar: Accept / Follow-up / Diff / Retry / Discard */}
      {phase === "review" && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2 max-w-[calc(100vw-2rem)]">
          {showTrace && (parsedStream.thinking || parsedStream.sources.length > 0) && (
            <div className="w-[min(40rem,calc(100vw-2rem))] max-h-52 overflow-y-auto rounded-2xl border border-violet-200/90 dark:border-violet-800/70 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl p-3 text-xs leading-relaxed shadow-2xl shadow-violet-500/15 animate-in fade-in slide-in-from-bottom-2 duration-150 space-y-2.5">
              {parsedStream.thinking && (
                <div>
                  <div className="mb-1 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                    <span className="inline-flex items-center gap-1">
                      <Brain className="h-3 w-3" />
                      AI Reasoning
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowTrace(false)}
                      className="rounded px-1.5 py-0.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
                    >
                      Hide
                    </button>
                  </div>
                  <div className="whitespace-pre-wrap text-zinc-600 dark:text-zinc-300">
                    {parsedStream.thinking}
                  </div>
                </div>
              )}
              {parsedStream.sources.length > 0 && (
                <div>
                  <div className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                    <Globe className="h-3 w-3" />
                    Research Sources ({parsedStream.sources.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {parsedStream.sources.map((src, i) => (
                      <a
                        key={i}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[11px] font-medium text-sky-700 dark:text-sky-300 hover:bg-sky-500/20 transition-colors"
                      >
                        <span className="truncate max-w-[14rem]">{src.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {showDiff && diffHunks.length > 0 && (
            <div className="w-[min(40rem,calc(100vw-2rem))] max-h-56 overflow-y-auto rounded-2xl border border-violet-200/90 dark:border-violet-800/70 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl p-3 text-xs leading-relaxed shadow-2xl shadow-violet-500/15 animate-in fade-in slide-in-from-bottom-2 duration-150">
              <div className="mb-2 flex items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                <span>Inline Diff (Click ✓ / ✕ per hunk)</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleBulkHunkDecision("accepted")}
                    className="rounded px-1.5 py-0.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                  >
                    Accept All
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBulkHunkDecision("rejected")}
                    className="rounded px-1.5 py-0.5 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
                  >
                    Reject All
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDiff(false)}
                    className="rounded px-1.5 py-0.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
                  >
                    Hide
                  </button>
                </div>
              </div>
              <div className="whitespace-pre-wrap break-words text-zinc-700 dark:text-zinc-200">
                {diffHunks.map((hunk) => {
                  if (hunk.type === "unchanged") {
                    return <span key={hunk.id}>{hunk.originalText}</span>;
                  }

                  const status = hunkDecisions[hunk.id] ?? hunk.status;
                  const isRejected = status === "rejected";
                  const isAccepted = status === "accepted";

                  return (
                    <span
                      key={hunk.id}
                      className={`group inline-flex flex-wrap items-baseline gap-0.5 rounded px-1 py-0.5 mx-0.5 border transition-colors ${
                        isAccepted
                          ? "border-emerald-500/40 bg-emerald-500/10"
                          : isRejected
                          ? "border-zinc-300/60 dark:border-zinc-700/60 bg-zinc-100/70 dark:bg-zinc-800/50 opacity-75"
                          : "border-violet-500/25 bg-violet-500/5"
                      }`}
                    >
                      {hunk.originalText && (
                        <del
                          className={`rounded px-0.5 ${
                            isRejected
                              ? "no-underline text-zinc-700 dark:text-zinc-200"
                              : "bg-rose-500/15 text-rose-600 dark:text-rose-400 line-through"
                          }`}
                        >
                          {hunk.originalText}
                        </del>
                      )}
                      {hunk.updatedText && (
                        <ins
                          className={`rounded px-0.5 no-underline ${
                            isRejected
                              ? "line-through text-zinc-400"
                              : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                          }`}
                        >
                          {hunk.updatedText}
                        </ins>
                      )}
                      <span className="inline-flex items-center gap-0.5 ml-1">
                        <button
                          type="button"
                          onClick={() => handleHunkDecision(hunk.id, "accepted")}
                          aria-label={`Accept change ${hunk.index + 1}`}
                          title="Accept hunk"
                          className={`rounded px-1 text-[10px] font-bold transition-colors ${
                            isAccepted
                              ? "bg-emerald-600 text-white"
                              : "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                          }`}
                        >
                          ✓
                        </button>
                        <button
                          type="button"
                          onClick={() => handleHunkDecision(hunk.id, "rejected")}
                          aria-label={`Reject change ${hunk.index + 1}`}
                          title="Reject hunk"
                          className={`rounded px-1 text-[10px] font-bold transition-colors ${
                            isRejected
                              ? "bg-rose-600 text-white"
                              : "text-rose-600 dark:text-rose-400 hover:bg-rose-500/20"
                          }`}
                        >
                          ✕
                        </button>
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-violet-200/90 dark:border-violet-800/70 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl p-1.5 pl-3 shadow-2xl shadow-violet-500/15 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <Sparkles className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400 shrink-0" />

            <form onSubmit={handleFollowUpSubmit} className="flex items-center">
              <input
                ref={followUpRef}
                type="text"
                value={followUpPrompt}
                onChange={(e) => setFollowUpPrompt(e.target.value)}
                placeholder="Refine (e.g. shorter, add table)..."
                className="w-44 sm:w-56 bg-transparent text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none"
              />
            </form>

            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />

            {(parsedStream.thinking || parsedStream.sources.length > 0) && (
              <button
                type="button"
                onClick={() => setShowTrace((prev) => !prev)}
                className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  showTrace
                    ? "bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300"
                    : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`}
                title="View AI thinking & research sources"
              >
                <Brain className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">
                  {parsedStream.sources.length > 0
                    ? `Sources (${parsedStream.sources.length})`
                    : "Thoughts"}
                </span>
              </button>
            )}

            {canShowDiff && (
              <button
                type="button"
                onClick={() => setShowDiff((prev) => !prev)}
                className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  showDiff
                    ? "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300"
                    : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`}
                title="Compare original vs. AI rewrite"
              >
                <GitCompareArrows className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Diff</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              title="Regenerate"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Retry</span>
            </button>

            <button
              type="button"
              onClick={handleDiscard}
              className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors"
              title="Discard (Esc)"
            >
              <X className="h-3.5 w-3.5" />
              <span>Discard</span>
            </button>

            <button
              type="button"
              onClick={handleAccept}
              className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors"
              title="Accept (⌘Enter)"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Accept</span>
            </button>
          </div>
        </div>
      )}
    </>,
    document.body
  );
}
