"use client";
import { Youtube } from '../../../ui/icons/brand-icons';

import React, { useEffect, useState, useMemo, lazy, Suspense, useCallback, useRef } from "react";
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Undo2,
  Redo2,
  Heading1,
  Heading2,
  Heading3,
  Type,
  List,
  ListOrdered,
  Link as LinkIcon,
  Code,
  Quote,
  CheckSquare,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Mic,
  Plus,
  Image,
  FileAudio,
  FileText,
  Table,
  SquarePenIcon,
  DraftingCompassIcon,
  AlertCircle,
  FlipHorizontal2,
  Columns2,
    ChevronDown,
  Palette,
  Sparkles,
  Eraser,
  MessageSquarePlus,
  ArrowDownUp,
} from "lucide-react";
import { cn } from "../../../../lib/utils";
import { TOGGLE_LINK_COMMAND } from "@lexical/link";
import { sanitizeUrl } from "../../utils/url";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_CHECK_LIST_COMMAND,
} from "@lexical/list";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { $setBlocksType, $patchStyleText } from "@lexical/selection";
import { INSERT_HORIZONTAL_RULE_COMMAND } from "@lexical/react/LexicalHorizontalRuleNode";
import { INSERT_LAYOUT_COMMAND } from "../LayoutPlugin";
import { INSERT_HINT_COMMAND } from "../../nodes/Hint";
import { INSERT_EXCALIDRAW_COMMAND } from "../ExcalidrawPlugin";
import { SPEECH_TO_TEXT_COMMAND, SUPPORT_SPEECH_RECOGNITION } from "../SpeechToTextPlugin";
import { INSERT_COMMENT_COMMAND } from "../CommentsPlugin";
import { ToolbarConfig } from "../../index";
import useModal from "../../../ui/models/use-model";
import { Skeleton } from "../../../ui/skeleton";
import { AutoEmbedDialog, YoutubeEmbedConfig } from "../AutoEmbedPlugin";

// Lazy-loaded modal dialogs
const InsertImageDialog = lazy(() =>
  import("../../../ui/models/insert-image").then((m) => ({ default: m.InsertImageDialog }))
);
const InsertAudioDialog = lazy(() =>
  import("../../../ui/models/insert-audio").then((m) => ({ default: m.InsertAudioDialog }))
);
const InsertFileDialog = lazy(() =>
  import("../../../ui/models/insert-file").then((m) => ({ default: m.InsertFileDialog }))
);
const InsertTableBody = lazy(() =>
  import("../../../ui/models/insert-table").then((m) => ({ default: m.InsertTable }))
);
const InsertPoll = lazy(() =>
  import("../../../ui/models/insert-poll").then((m) => ({ default: m.InsertPoll }))
);

type MobileTab = "format" | "insert" | "style";

const TEXT_COLORS = [
  { label: "Default", color: "inherit", bg: "bg-foreground" },
  { label: "Blue", color: "#2563eb", bg: "bg-blue-600" },
  { label: "Purple", color: "#7c3aed", bg: "bg-purple-600" },
  { label: "Emerald", color: "#059669", bg: "bg-emerald-600" },
  { label: "Amber", color: "#d97706", bg: "bg-amber-600" },
  { label: "Rose", color: "#e11d48", bg: "bg-rose-600" },
];

const HIGHLIGHT_COLORS = [
  { label: "None", color: "transparent", border: "border-border" },
  { label: "Yellow", color: "#fef08a", bg: "bg-yellow-200" },
  { label: "Green", color: "#bbf7d0", bg: "bg-green-200" },
  { label: "Blue", color: "#bfdbfe", bg: "bg-blue-200" },
  { label: "Pink", color: "#fbcfe8", bg: "bg-pink-200" },
  { label: "Orange", color: "#fed7aa", bg: "bg-orange-200" },
];

export default function MobileToolbar({
  editor,
  activeEditor,
  toolbarState,
  setIsLinkEditMode,
  isVisible,
  toolbarConfig,
}: {
  editor: any;
  activeEditor: any;
  toolbarState: any;
  setIsLinkEditMode: (mode: boolean) => void;
  isVisible: boolean;
  toolbarConfig?: ToolbarConfig;
}) {
  const [activeTab, setActiveTab] = useState<MobileTab>("format");
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [bottomOffset, setBottomOffset] = useState(0);
  const [isSpeechActive, setIsSpeechActive] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [insertCategory, setInsertCategory] = useState<"all" | "media" | "blocks">("all");
  const [modal, showModal] = useModal();
  const targetEditor = activeEditor || editor;

  // Auto-expand dock when editor receives focus or virtual keyboard opens
  useEffect(() => {
    if (isVisible || isKeyboardOpen) {
      setIsExpanded(true);
    }
  }, [isVisible, isKeyboardOpen]);

  // Scroll affordance refs
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Check scroll container overflow for affordance hint gradients
  const checkScrollAffordance = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    checkScrollAffordance();
  }, [activeTab, checkScrollAffordance]);

  // Position cleanly above on-screen keyboard using visualViewport
  useEffect(() => {
    const visualViewport = window.visualViewport;
    if (!visualViewport) return;

    const handleResize = () => {
      const windowHeight = window.innerHeight;
      const viewportHeight = visualViewport.height;
      const offsetTop = visualViewport.offsetTop;

      const viewportBottom = offsetTop + viewportHeight;
      const diff = windowHeight - viewportBottom;

      // Safely clamp offset to avoid overflowing on dynamic mobile browser chrome
      setBottomOffset(Math.max(0, Math.min(diff, windowHeight * 0.55)));
      const keyboardIsOpen = viewportHeight < windowHeight * 0.82;
      setIsKeyboardOpen(keyboardIsOpen);

      if (keyboardIsOpen) {
        setIsExpanded(true);
      }
    };

    visualViewport.addEventListener("resize", handleResize);
    visualViewport.addEventListener("scroll", handleResize);
    handleResize();

    return () => {
      visualViewport.removeEventListener("resize", handleResize);
      visualViewport.removeEventListener("scroll", handleResize);
    };
  }, []);

  const handleOpenDock = useCallback(
    (e?: React.MouseEvent | React.TouchEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      setIsExpanded(true);
      try {
        targetEditor.focus();
      } catch {}
    },
    [targetEditor]
  );

  const handleCloseDock = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsExpanded(false);
  }, []);

  const shouldShow = isExpanded;

  const formatHeading = (level: "h1" | "h2" | "h3") => {
    targetEditor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(level));
      }
    });
  };

  const formatQuote = () => {
    targetEditor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode());
      }
    });
  };

  const applyColor = (color: string) => {
    targetEditor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, { color: color === "inherit" ? "" : color });
      }
    });
  };

  const applyHighlight = (bgColor: string) => {
    targetEditor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, {
          "background-color": bgColor === "transparent" ? "" : bgColor,
        });
      }
    });
  };

  const toggleSpeech = () => {
    if (!SUPPORT_SPEECH_RECOGNITION) return;
    const next = !isSpeechActive;
    setIsSpeechActive(next);
    targetEditor.dispatchCommand(SPEECH_TO_TEXT_COMMAND, next);
  };

  const handleInsertLink = () => {
    if (!toolbarState.isLink) {
      setIsLinkEditMode(true);
      targetEditor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeUrl("https://"));
    } else {
      setIsLinkEditMode(false);
      targetEditor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  };

  const INSERT_BLOCKS = useMemo(
    () => [
      {
        id: "image",
        category: "media",
        label: "Image",
        desc: "Upload photo or web URL",
        icon: Image,
        color: "text-blue-500 bg-blue-500/10 dark:bg-blue-500/20",
        action: () => {
          showModal(
            "Insert Image",
            "Upload an image from your device or paste a URL.",
            (onClose) => (
              <Suspense fallback={<Skeleton className="w-full h-48 rounded-xl" />}>
                <InsertImageDialog activeEditor={targetEditor} onClose={onClose} />
              </Suspense>
            ),
            true
          );
        },
      },
      {
        id: "audio",
        category: "media",
        label: "Audio Track",
        desc: "Interactive player with speed controls",
        icon: FileAudio,
        color: "text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20",
        action: () => {
          showModal(
            "Insert Audio Player",
            "Attach an audio clip, voice memo, or music track.",
            (onClose) => (
              <Suspense fallback={<Skeleton className="w-full h-48 rounded-xl" />}>
                <InsertAudioDialog activeEditor={targetEditor} onClose={onClose} />
              </Suspense>
            ),
            true
          );
        },
      },
      {
        id: "file",
        category: "media",
        label: "Document File",
        desc: "PDF, Word, Excel, ZIP or code file",
        icon: FileText,
        color: "text-amber-500 bg-amber-500/10 dark:bg-amber-500/20",
        action: () => {
          showModal(
            "Attach Document",
            "Upload a document or document archive to download.",
            (onClose) => (
              <Suspense fallback={<Skeleton className="w-full h-48 rounded-xl" />}>
                <InsertFileDialog activeEditor={targetEditor} onClose={onClose} />
              </Suspense>
            ),
            true
          );
        },
      },
      {
        id: "youtube",
        category: "media",
        label: "YouTube Video",
        desc: "Embed streaming video player",
        icon: Youtube,
        color: "text-red-500 bg-red-500/10 dark:bg-red-500/20",
        action: () => {
          showModal(
            "Embed YouTube Video",
            "Paste a YouTube video URL to embed it in the page.",
            (onClose) => (
              <AutoEmbedDialog embedConfig={YoutubeEmbedConfig} onClose={onClose} />
            ),
            true
          );
        },
      },
      {
        id: "table",
        category: "blocks",
        label: "Data Table",
        desc: "Configurable rows and columns",
        icon: Table,
        color: "text-purple-500 bg-purple-500/10 dark:bg-purple-500/20",
        action: () => {
          showModal(
            "Insert Table",
            "Choose rows and columns for your data table.",
            (onClose) => (
              <Suspense fallback={<Skeleton className="w-full h-32 rounded-xl" />}>
                <InsertTableBody activeEditor={targetEditor} onClose={onClose} />
              </Suspense>
            ),
            true
          );
        },
      },
      {
        id: "poll",
        category: "blocks",
        label: "Voting Poll",
        desc: "Interactive multi-choice question",
        icon: SquarePenIcon,
        color: "text-rose-500 bg-rose-500/10 dark:bg-rose-500/20",
        action: () => {
          showModal(
            "Create Poll",
            "Add a voting poll with customizable choices.",
            (onClose) => (
              <Suspense fallback={<Skeleton className="w-full h-32 rounded-xl" />}>
                <InsertPoll activeEditor={targetEditor} onClose={onClose} />
              </Suspense>
            ),
            true
          );
        },
      },
      {
        id: "excalidraw",
        category: "blocks",
        label: "Sketch Canvas",
        desc: "Hand-drawn diagram and whiteboard",
        icon: DraftingCompassIcon,
        color: "text-orange-500 bg-orange-500/10 dark:bg-orange-500/20",
        action: () => {
          targetEditor.dispatchCommand(INSERT_EXCALIDRAW_COMMAND, undefined);
        },
      },
      {
        id: "hint",
        category: "blocks",
        label: "Callout Card",
        desc: "Colored highlight note or tip",
        icon: AlertCircle,
        color: "text-indigo-500 bg-indigo-500/10 dark:bg-indigo-500/20",
        action: () => {
          targetEditor.dispatchCommand(INSERT_HINT_COMMAND, "info");
        },
      },
      {
        id: "columns",
        category: "blocks",
        label: "2 Columns",
        desc: "Side-by-side content container",
        icon: Columns2,
        color: "text-teal-500 bg-teal-500/10 dark:bg-teal-500/20",
        action: () => {
          targetEditor.dispatchCommand(INSERT_LAYOUT_COMMAND, "1fr 1fr");
        },
      },
      {
        id: "hr",
        category: "blocks",
        label: "Divider",
        desc: "Clean horizontal separator line",
        icon: FlipHorizontal2,
        color: "text-slate-500 bg-slate-500/10 dark:bg-slate-500/20",
        action: () => {
          targetEditor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined);
        },
      },
    ],
    [targetEditor, showModal]
  );

  const filteredBlocks = useMemo(() => {
    if (insertCategory === "all") return INSERT_BLOCKS;
    return INSERT_BLOCKS.filter((b) => b.category === insertCategory);
  }, [INSERT_BLOCKS, insertCategory]);

  return (
    <>
      {modal}

      {/* Floating Pill FAB when toolbar is minimized on mobile */}
      {!shouldShow && (
        <div className="fixed bottom-5 right-4 z-40 md:hidden animate-in fade-in zoom-in-95 duration-200">
          <button
            type="button"
            onClick={handleOpenDock}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-primary-foreground shadow-2xl shadow-primary/40 text-xs font-semibold active:scale-95 transition-all touch-manipulation border border-primary/20 backdrop-blur-md cursor-pointer"
            aria-label="Open formatting dock"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>Format & Insert</span>
          </button>
        </div>
      )}

      {/* Main Mobile Dock Toolbar */}
      <div
        className={cn(
          "fixed left-0 right-0 w-full z-50 md:hidden transition-transform duration-300 ease-out",
          shouldShow ? "translate-y-0" : "translate-y-[120%] pointer-events-none"
        )}
        style={{
          bottom: `${bottomOffset}px`,
        }}
      >
        <div
          className={cn(
            "w-full bg-background/95 dark:bg-zinc-950/95 backdrop-blur-2xl border-t border-border/80 shadow-2xl pointer-events-auto rounded-t-2xl",
            "pb-[max(0.5rem,env(safe-area-inset-bottom))]",
            toolbarConfig?.mobileClassName
          )}
          onMouseDown={(e) => {
            if (e.target instanceof Element && e.target.tagName !== "INPUT") {
              e.preventDefault();
            }
          }}
        >
          {/* Subtle Pull/Drag Handle */}
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/25" />
          </div>

          {/* Top Control Bar: Mode Tabs, Dictation, and Dismiss */}
          <div className="flex items-center justify-between px-3 pb-1.5 border-b border-border/50 text-xs">
            <div className="flex items-center gap-1 bg-muted/50 p-0.5 rounded-xl border border-border/40">
              <button
                type="button"
                onClick={() => setActiveTab("format")}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all text-xs touch-manipulation",
                  activeTab === "format"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Type className="w-3.5 h-3.5" />
                <span>Format</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("insert")}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all text-xs touch-manipulation",
                  activeTab === "insert"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Insert</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("style")}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all text-xs touch-manipulation",
                  activeTab === "style"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Style</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              {SUPPORT_SPEECH_RECOGNITION && (
                <button
                  type="button"
                  onClick={toggleSpeech}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-all touch-manipulation",
                    isSpeechActive
                      ? "bg-rose-500 text-white animate-pulse"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                  title="Speech to Text"
                  aria-label="Toggle voice typing"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isSpeechActive ? "Listening..." : "Dictate"}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleCloseDock}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted active:scale-95 transition-colors touch-manipulation cursor-pointer"
                aria-label="Dismiss mobile toolbar"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tab 1: Format Mode Strip with Scroll Affordance Hints */}
          {activeTab === "format" && (
            <div className="relative w-full">
              {/* Left scroll affordance gradient */}
              <div
                className={cn(
                  "pointer-events-none absolute left-0 top-0 bottom-0 w-5 bg-gradient-to-r from-background to-transparent z-10 transition-opacity duration-200",
                  canScrollLeft ? "opacity-100" : "opacity-0"
                )}
              />

              {/* Right scroll affordance gradient */}
              <div
                className={cn(
                  "pointer-events-none absolute right-0 top-0 bottom-0 w-5 bg-gradient-to-l from-background to-transparent z-10 transition-opacity duration-200",
                  canScrollRight ? "opacity-100" : "opacity-0"
                )}
              />

              <div
                ref={scrollContainerRef}
                onScroll={checkScrollAffordance}
                className="flex items-center gap-1.5 px-3 py-2 overflow-x-auto no-scrollbar scroll-smooth w-full"
              >
                {/* Undo / Redo */}
                <button
                  type="button"
                  disabled={!toolbarState.canUndo}
                  onClick={(e) => {
                    e.preventDefault();
                    targetEditor.dispatchCommand(UNDO_COMMAND, undefined);
                  }}
                  className={cn(
                    "flex items-center justify-center min-w-[36px] h-9 rounded-xl transition-all touch-manipulation",
                    toolbarState.canUndo
                      ? "text-foreground hover:bg-muted active:scale-95"
                      : "text-muted-foreground/30 cursor-not-allowed"
                  )}
                  aria-label="Undo"
                >
                  <Undo2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  disabled={!toolbarState.canRedo}
                  onClick={(e) => {
                    e.preventDefault();
                    targetEditor.dispatchCommand(REDO_COMMAND, undefined);
                  }}
                  className={cn(
                    "flex items-center justify-center min-w-[36px] h-9 rounded-xl transition-all touch-manipulation",
                    toolbarState.canRedo
                      ? "text-foreground hover:bg-muted active:scale-95"
                      : "text-muted-foreground/30 cursor-not-allowed"
                  )}
                  aria-label="Redo"
                >
                  <Redo2 className="w-4 h-4" />
                </button>

                <div className="w-px h-5 bg-border/60 mx-0.5 flex-shrink-0" />

                {/* Inline Formatting */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    targetEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
                  }}
                  className={cn(
                    "flex items-center justify-center min-w-[36px] h-9 rounded-xl transition-all active:scale-95 touch-manipulation",
                    toolbarState.isBold
                      ? "bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                  aria-label="Bold"
                >
                  <Bold className="w-4 h-4 stroke-[2.5]" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    targetEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
                  }}
                  className={cn(
                    "flex items-center justify-center min-w-[36px] h-9 rounded-xl transition-all active:scale-95 touch-manipulation",
                    toolbarState.isItalic
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                  aria-label="Italic"
                >
                  <Italic className="w-4 h-4 stroke-[2.5]" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    targetEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
                  }}
                  className={cn(
                    "flex items-center justify-center min-w-[36px] h-9 rounded-xl transition-all active:scale-95 touch-manipulation",
                    toolbarState.isUnderline
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                  aria-label="Underline"
                >
                  <Underline className="w-4 h-4 stroke-[2.5]" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    targetEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
                  }}
                  className={cn(
                    "flex items-center justify-center min-w-[36px] h-9 rounded-xl transition-all active:scale-95 touch-manipulation",
                    toolbarState.isStrikethrough
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                  aria-label="Strikethrough"
                >
                  <Strikethrough className="w-4 h-4 stroke-[2.5]" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    targetEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "code");
                  }}
                  className={cn(
                    "flex items-center justify-center min-w-[36px] h-9 rounded-xl transition-all active:scale-95 touch-manipulation font-mono",
                    toolbarState.isCode
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                  aria-label="Inline Code"
                >
                  <Code className="w-4 h-4 stroke-[2.5]" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleInsertLink();
                  }}
                  className={cn(
                    "flex items-center justify-center min-w-[36px] h-9 rounded-xl transition-all active:scale-95 touch-manipulation",
                    toolbarState.isLink
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                  aria-label="Link"
                >
                  <LinkIcon className="w-4 h-4 stroke-[2.5]" />
                </button>

                <div className="w-px h-5 bg-border/60 mx-0.5 flex-shrink-0" />

                {/* Headings */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    formatHeading("h1");
                  }}
                  className={cn(
                    "flex items-center justify-center min-w-[36px] h-9 rounded-xl transition-all active:scale-95 touch-manipulation",
                    toolbarState.blockType === "h1"
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 font-bold"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                  aria-label="Heading 1"
                >
                  <Heading1 className="w-4 h-4 stroke-[2.5]" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    formatHeading("h2");
                  }}
                  className={cn(
                    "flex items-center justify-center min-w-[36px] h-9 rounded-xl transition-all active:scale-95 touch-manipulation",
                    toolbarState.blockType === "h2"
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 font-bold"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                  aria-label="Heading 2"
                >
                  <Heading2 className="w-4 h-4 stroke-[2.5]" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    formatHeading("h3");
                  }}
                  className={cn(
                    "flex items-center justify-center min-w-[36px] h-9 rounded-xl transition-all active:scale-95 touch-manipulation",
                    toolbarState.blockType === "h3"
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 font-bold"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                  aria-label="Heading 3"
                >
                  <Heading3 className="w-4 h-4 stroke-[2.5]" />
                </button>

                <div className="w-px h-5 bg-border/60 mx-0.5 flex-shrink-0" />

                {/* Lists & Quote */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    targetEditor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
                  }}
                  className={cn(
                    "flex items-center justify-center min-w-[36px] h-9 rounded-xl transition-all active:scale-95 touch-manipulation",
                    toolbarState.blockType === "bullet"
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                  aria-label="Bullet list"
                >
                  <List className="w-4 h-4 stroke-[2.5]" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    targetEditor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
                  }}
                  className={cn(
                    "flex items-center justify-center min-w-[36px] h-9 rounded-xl transition-all active:scale-95 touch-manipulation",
                    toolbarState.blockType === "number"
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                  aria-label="Numbered list"
                >
                  <ListOrdered className="w-4 h-4 stroke-[2.5]" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    targetEditor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
                  }}
                  className={cn(
                    "flex items-center justify-center min-w-[36px] h-9 rounded-xl transition-all active:scale-95 touch-manipulation",
                    toolbarState.blockType === "check"
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                  aria-label="Checklist"
                >
                  <CheckSquare className="w-4 h-4 stroke-[2.5]" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    formatQuote();
                  }}
                  className={cn(
                    "flex items-center justify-center min-w-[36px] h-9 rounded-xl transition-all active:scale-95 touch-manipulation",
                    toolbarState.blockType === "quote"
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                  aria-label="Quote"
                >
                  <Quote className="w-4 h-4 stroke-[2.5]" />
                </button>

                <div className="w-px h-5 bg-border/60 mx-0.5 flex-shrink-0" />

                {/* Alignment */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    targetEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
                  }}
                  className={cn(
                    "flex items-center justify-center min-w-[36px] h-9 rounded-xl transition-all active:scale-95 touch-manipulation",
                    toolbarState.elementFormat === "left"
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                  aria-label="Align left"
                >
                  <AlignLeft className="w-4 h-4 stroke-[2.5]" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    targetEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
                  }}
                  className={cn(
                    "flex items-center justify-center min-w-[36px] h-9 rounded-xl transition-all active:scale-95 touch-manipulation",
                    toolbarState.elementFormat === "center"
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                  aria-label="Align center"
                >
                  <AlignCenter className="w-4 h-4 stroke-[2.5]" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    targetEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
                  }}
                  className={cn(
                    "flex items-center justify-center min-w-[36px] h-9 rounded-xl transition-all active:scale-95 touch-manipulation",
                    toolbarState.elementFormat === "right"
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                  aria-label="Align right"
                >
                  <AlignRight className="w-4 h-4 stroke-[2.5]" />
                </button>

                <div className="w-px h-5 bg-border/60 mx-0.5 flex-shrink-0" />

                {/* Inline Comment action */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    targetEditor.dispatchCommand(INSERT_COMMENT_COMMAND, undefined);
                  }}
                  className="flex items-center justify-center min-w-[36px] h-9 rounded-xl text-muted-foreground hover:bg-muted active:scale-95 transition-all touch-manipulation"
                  aria-label="Add inline comment"
                >
                  <MessageSquarePlus className="w-4 h-4" />
                </button>

                {/* Import & Export Hub action */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    if (typeof window !== "undefined") {
                      window.dispatchEvent(
                        new CustomEvent("notiq:open-import-export", {
                          detail: { defaultTab: "export" },
                        })
                      );
                    }
                  }}
                  className="flex items-center justify-center min-w-[36px] h-9 rounded-xl text-muted-foreground hover:bg-muted active:scale-95 transition-all touch-manipulation"
                  aria-label="Import & Export document"
                  title="Import / Export"
                >
                  <ArrowDownUp className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Insert Drawer with Category Filters & Touch Cards */}
          {activeTab === "insert" && (
            <div className="px-3 py-2 space-y-2.5">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 pb-1 overflow-x-auto no-scrollbar">
                {(["all", "media", "blocks"] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setInsertCategory(cat)}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium capitalize transition-all touch-manipulation",
                      insertCategory === cat
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted/60 text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {cat === "all" ? "All Blocks" : cat === "media" ? "Media & Files" : "Rich Blocks"}
                  </button>
                ))}
              </div>

              {/* Grid of Blocks */}
              <div className="grid grid-cols-2 gap-2 max-h-[42dvh] overflow-y-auto pr-0.5">
                {filteredBlocks.map((block) => {
                  const Icon = block.icon;
                  return (
                    <button
                      key={block.id}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        block.action();
                      }}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl bg-card hover:bg-muted/70 active:scale-97 transition-all touch-manipulation border border-border/50 text-left shadow-sm"
                    >
                      <div className={cn("flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0", block.color)}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-foreground truncate">
                          {block.label}
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate leading-tight mt-0.5">
                          {block.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 3: Style Mode (Text Color & Background Highlighter) */}
          {activeTab === "style" && (
            <div className="px-3 py-2.5 space-y-3">
              {/* Text Colors */}
              <div>
                <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Text Color
                </div>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                  {TEXT_COLORS.map((tc) => (
                    <button
                      key={tc.label}
                      type="button"
                      onClick={() => applyColor(tc.color)}
                      className="flex flex-col items-center gap-1 min-w-[44px] py-1 rounded-lg hover:bg-muted active:scale-95 transition-all touch-manipulation"
                    >
                      <span
                        className={cn("w-6 h-6 rounded-full border border-border/60 shadow-sm flex items-center justify-center", tc.bg)}
                      />
                      <span className="text-[10px] text-muted-foreground font-medium">{tc.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Highlighter Background Colors */}
              <div>
                <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Highlight Background
                </div>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                  {HIGHLIGHT_COLORS.map((hc) => (
                    <button
                      key={hc.label}
                      type="button"
                      onClick={() => applyHighlight(hc.color)}
                      className="flex flex-col items-center gap-1 min-w-[44px] py-1 rounded-lg hover:bg-muted active:scale-95 transition-all touch-manipulation"
                    >
                      <span
                        className={cn("w-6 h-6 rounded-lg border shadow-sm flex items-center justify-center", hc.bg || "bg-transparent", hc.border)}
                      >
                        {hc.color === "transparent" && <Eraser className="w-3 h-3 text-muted-foreground" />}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium">{hc.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
