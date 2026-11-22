import { $createCodeNode } from "@lexical/code";
import {
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { INSERT_HORIZONTAL_RULE_COMMAND } from "@lexical/react/LexicalHorizontalRuleNode";
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  useBasicTypeaheadTriggerMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { INSERT_TABLE_COMMAND } from "@lexical/table";
import {
  $createParagraphNode,
  $getSelection,
  $insertNodes,
  $isRangeSelection,
  createEditor,
  LexicalEditor,
  TextNode,
} from "lexical";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as React from "react";
import * as ReactDOM from "react-dom";
import {
  Code2,
  Columns2,
  Columns3,
  Columns4,
  ImageIcon,
  ImagePlayIcon,
  ListCheck,
  Pilcrow,
  QuoteIcon,
  SquarePenIcon,
  StepForward,
  Heading1,
  Heading2,
  Heading3,
  Minus,
  List,
  ListOrdered,
  Table,
  SigmaIcon,
  GitBranch,
  Zap,
  Sparkles,
  Music,
  Paperclip,
  Lightbulb,
  Printer,
  FileText,
  FileDown,
  FileUp,
  FileJson,
  Kanban,
  Table2,
} from "lucide-react";
import { Figma, Twitter, Youtube } from "../../../ui/icons/brand-icons";

import { INSERT_COLLAPSIBLE_COMMAND } from "../CollapsiblePlugin";
import { cn } from "../../../../lib/utils";
import { INSERT_LAYOUT_COMMAND } from "../LayoutPlugin";
import { INSERT_POLL_COMMAND } from "../PollPlugin";
import {
  EXPORT_MARKDOWN_COMMAND,
  EXPORT_PDF_COMMAND,
  EXPORT_HTML_COMMAND,
  EXPORT_JSON_COMMAND,
  EXPORT_DOCX_COMMAND,
  OPEN_IMPORT_EXPORT_MODAL_COMMAND,
} from "../ExportPlugin";
import { INSERT_HINT_COMMAND } from "../../nodes/Hint";
import useModal from "../../../ui/models/use-model";
import { SHORTCUTS } from "../ShortcutsPlugin/shortcuts";
import { Skeleton } from "../../../ui/skeleton";
import { ImagePayload } from "../../nodes/ImageNode";
import { INSERT_IMAGE_COMMAND } from "../ImagesPlugin";
import { AutoEmbedDialog, FigmaEmbedConfig, TwitterEmbedConfig, YoutubeEmbedConfig } from "../AutoEmbedPlugin";
import { initialEditorState, INSERT_STEPPER_COMMAND } from "../../nodes/Stepper";
import { InsertInlineImageDialog } from "../InlineImagePlugin";
import { InsertEquationDialog } from "../EquationsPlugin";
import { INSERT_STORY_BUILDER_COMMAND } from "../StoryBuilderPlugin";
import { createDefaultDynamicBlock, INSERT_DYNAMIC_BLOCK_COMMAND } from "../DynamicBlockPlugin";
import { $createDatabaseNode } from "../../nodes/DatabaseNode";

const InsertGif = React.lazy(() => import("../../../ui/models/insert-gif"));
const InsertImageDialog = React.lazy(() =>
  import("../../../ui/models/insert-image").then((module) => ({
    default: module.InsertImageDialog,
  }))
);
const AIDialog = React.lazy(() => import("../../../ui/ai/AIDialog"));
const InsertAudioDialog = React.lazy(() => import("../../../ui/models/insert-audio"));
const InsertFileDialog = React.lazy(() => import("../../../ui/models/insert-file"));

export type CommandCategory = "ai" | "basic" | "media" | "layout" | "embeds" | "export";

export const CATEGORY_CONFIG: Record<
  CommandCategory,
  { label: string; badgeClasses: string }
> = {
  ai: {
    label: "AI Actions",
    badgeClasses: "text-purple-600 dark:text-purple-400 bg-purple-500/10",
  },
  basic: {
    label: "Basic Blocks",
    badgeClasses: "text-zinc-600 dark:text-zinc-400 bg-zinc-500/10",
  },
  media: {
    label: "Media & Content",
    badgeClasses: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
  },
  layout: {
    label: "Layout & Structure",
    badgeClasses: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
  },
  embeds: {
    label: "Embeds & Social",
    badgeClasses: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
  },
  export: {
    label: "Publishing & Export",
    badgeClasses: "text-cyan-600 dark:text-cyan-400 bg-cyan-500/10",
  },
};

export class ComponentPickerOption extends MenuOption {
  title: string;
  icon?: React.JSX.Element;
  keywords: Array<string>;
  keyboardShortcut?: string;
  onSelect: (queryString: string) => void;
  desc?: string;
  category: CommandCategory;

  constructor(
    title: string,
    options: {
      icon?: React.JSX.Element;
      keywords?: Array<string>;
      keyboardShortcut?: string;
      onSelect: (queryString: string) => void;
      desc?: string;
      category?: CommandCategory;
    }
  ) {
    super(title);
    this.title = title;
    this.keywords = options.keywords || [];
    this.icon = options.icon;
    this.keyboardShortcut = options.keyboardShortcut;
    this.onSelect = options.onSelect.bind(this);
    this.desc = options.desc;
    this.category = options.category || "basic";
  }
}

function getDynamicOptions(editor: LexicalEditor, queryString: string): ComponentPickerOption[] {
  const options: Array<ComponentPickerOption> = [];

  if (queryString == null) {
    return options;
  }

  const tableMatch = queryString.match(/^([1-9]\d?)(?:x([1-9]\d?)?)?$/);

  if (tableMatch !== null) {
    const rows = tableMatch[1];
    const colOptions = tableMatch[2]
      ? [tableMatch[2]]
      : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(String);

    options.push(
      ...colOptions.map(
        (columns) =>
          new ComponentPickerOption(`${rows}x${columns} Table`, {
            icon: <Table className="h-4 w-4" />,
            keywords: ["table"],
            category: "media",
            desc: `Insert a ${rows} rows by ${columns} columns table`,
            onSelect: () =>
              editor.dispatchCommand(INSERT_TABLE_COMMAND, { columns, rows }),
          })
      )
    );
  }

  return options;
}

function getBaseOptions(
  editor: LexicalEditor,
  showModal: (
    title?: string | null,
    description?: string | null,
    getContent?: (onClose: () => void) => React.JSX.Element,
    isDilog?: boolean
  ) => void
): ComponentPickerOption[] {
  return [
    // 1. AI Actions
    new ComponentPickerOption("Ask AI Assistant", {
      icon: <Sparkles className="h-4 w-4 text-violet-500" />,
      keywords: ["ai", "assistant", "generate", "write", "gpt", "gemini", "smart", "summarize", "prompt"],
      desc: "Generate content, outline, brainstorm, or write with AI",
      keyboardShortcut: "⌘K",
      category: "ai",
      onSelect: () => {
        import("../AICommandBarPlugin").then(({ OPEN_AI_COMMAND_BAR_COMMAND }) => {
          editor.dispatchCommand(OPEN_AI_COMMAND_BAR_COMMAND, undefined);
        });
      },
    }),

    // 2. Basic Blocks
    new ComponentPickerOption("Text", {
      icon: <Pilcrow className="h-4 w-4" />,
      keywords: ["normal", "paragraph", "p", "text"],
      desc: "Plain text writing block",
      category: "basic",
      onSelect: () =>
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createParagraphNode());
          }
        }),
    }),
    ...([1, 2, 3] as const).map(
      (n) =>
        new ComponentPickerOption(`Heading ${n}`, {
          icon:
            n === 1 ? (
              <Heading1 className="h-4 w-4" />
            ) : n === 2 ? (
              <Heading2 className="h-4 w-4" />
            ) : (
              <Heading3 className="h-4 w-4" />
            ),
          keywords: ["heading", "header", `h${n}`, `heading ${n}`],
          category: "basic" as CommandCategory,
          keyboardShortcut:
            n === 1
              ? SHORTCUTS.HEADING1
              : n === 2
                ? SHORTCUTS.HEADING2
                : SHORTCUTS.HEADING3,
          onSelect: () =>
            editor.update(() => {
              const selection = $getSelection();
              if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createHeadingNode(`h${n}`));
              }
            }),
          desc:
            n === 1
              ? "Large section heading"
              : n === 2
                ? "Medium section heading"
                : "Small section heading",
        })
    ),
    new ComponentPickerOption("Bulleted List", {
      icon: <List className="h-4 w-4" />,
      keywords: ["bulleted list", "unordered list", "ul", "bullets"],
      desc: "Create a list with bullet points",
      category: "basic",
      keyboardShortcut: SHORTCUTS.BULLET_LIST,
      onSelect: () =>
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined),
    }),
    new ComponentPickerOption("Numbered List", {
      icon: <ListOrdered className="h-4 w-4" />,
      keywords: ["numbered list", "ordered list", "ol", "numbers"],
      desc: "Create a sequential numbered list",
      category: "basic",
      keyboardShortcut: SHORTCUTS.NUMBERED_LIST,
      onSelect: () =>
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined),
    }),
    new ComponentPickerOption("Check List", {
      icon: <ListCheck className="h-4 w-4" />,
      keywords: ["check list", "todo list", "task", "checkbox"],
      desc: "Track tasks with a to-do checklist",
      category: "basic",
      keyboardShortcut: SHORTCUTS.CHECK_LIST,
      onSelect: () =>
        editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined),
    }),
    new ComponentPickerOption("Quote", {
      icon: <QuoteIcon className="h-4 w-4" />,
      keywords: ["block quote", "quote", "citation"],
      desc: "Capture a prominent quote or excerpt",
      category: "basic",
      keyboardShortcut: SHORTCUTS.QUOTE,
      onSelect: () =>
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createQuoteNode());
          }
        }),
    }),
    new ComponentPickerOption("Divider", {
      icon: <Minus className="h-4 w-4" />,
      keywords: ["horizontal rule", "divider", "hr", "separator", "line"],
      desc: "Visually separate content sections",
      category: "basic",
      keyboardShortcut: "---",
      onSelect: () =>
        editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined),
    }),

    // 3. Media & Content
    new ComponentPickerOption("Code Block", {
      icon: <Code2 className="h-4 w-4" />,
      keywords: ["javascript", "python", "js", "ts", "codeblock", "code", "syntax"],
      desc: "Syntax highlighted code snippet with line numbers",
      category: "media",
      keyboardShortcut: SHORTCUTS.CODE_BLOCK,
      onSelect: () =>
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            if (selection.isCollapsed()) {
              $setBlocksType(selection, () => $createCodeNode());
            } else {
              const textContent = selection.getTextContent();
              const codeNode = $createCodeNode();
              selection.insertNodes([codeNode]);
              selection.insertRawText(textContent);
            }
          }
        }),
    }),
    new ComponentPickerOption("Table", {
      icon: <Table className="h-4 w-4" />,
      keywords: ["table", "grid", "spreadsheet", "rows", "columns"],
      desc: "Customizable table with cell actions",
      category: "media",
      keyboardShortcut: "/table",
      onSelect: () =>
        editor.dispatchCommand(INSERT_TABLE_COMMAND, {
          rows: "4",
          columns: "4",
        }),
    }),
    new ComponentPickerOption("Callout", {
      icon: <Lightbulb className="h-4 w-4 text-emerald-500" />,
      keywords: [
        "callout",
        "hint",
        "note",
        "tip",
        "info",
        "admonition",
        "alert",
        "warning",
        "important",
        "caution",
      ],
      desc: "Notion-style callout box with icon and style picker",
      category: "media",
      keyboardShortcut: "/callout",
      onSelect: () => editor.dispatchCommand(INSERT_HINT_COMMAND, "tip"),
    }),
    new ComponentPickerOption("Image", {
      icon: <ImageIcon className="h-4 w-4" />,
      keywords: ["image", "photo", "picture", "file", "img", "upload"],
      desc: "Upload or embed an image with caption",
      category: "media",
      onSelect: () =>
        showModal(
          "Insert Image",
          "Please select an image to upload.",
          (onClose) => (
            <React.Suspense
              fallback={<Skeleton className="mx-2 w-[350px] h-[350px]" />}
            >
              <InsertImageDialog activeEditor={editor} onClose={onClose} />
            </React.Suspense>
          ),
          true
        ),
    }),
    new ComponentPickerOption("Inline Image", {
      icon: <ImageIcon className="h-4 w-4" />,
      keywords: ["image", "inline", "photo", "picture", "img"],
      desc: "Insert an inline image into text",
      category: "media",
      onSelect: () =>
        showModal(
          "Insert Image",
          "Please select an image to upload.",
          (onClose) => (
            <React.Suspense
              fallback={<Skeleton className="mx-2 w-[350px] h-[350px]" />}
            >
              <InsertInlineImageDialog
                activeEditor={editor}
                onClose={onClose}
              />
            </React.Suspense>
          ),
          true
        ),
    }),
    new ComponentPickerOption("Audio Player", {
      icon: <Music className="h-4 w-4 text-cyan-500" />,
      keywords: ["audio", "music", "sound", "podcast", "mp3", "track", "voice"],
      desc: "Embed an audio player, podcast, or sound track",
      category: "media",
      onSelect: () =>
        showModal(
          "Insert Audio",
          "Embed an audio file or stream",
          (onClose) => (
            <React.Suspense
              fallback={<Skeleton className="mx-2 w-[350px] h-[250px]" />}
            >
              <InsertAudioDialog activeEditor={editor} onClose={onClose} />
            </React.Suspense>
          ),
          true
        ),
    }),
    new ComponentPickerOption("Attach File", {
      icon: <Paperclip className="h-4 w-4 text-emerald-500" />,
      keywords: ["file", "attachment", "doc", "pdf", "zip", "upload", "download"],
      desc: "Embed a downloadable document attachment card",
      category: "media",
      onSelect: () =>
        showModal(
          "Attach File",
          "Upload or link a document",
          (onClose) => (
            <React.Suspense
              fallback={<Skeleton className="mx-2 w-[350px] h-[250px]" />}
            >
              <InsertFileDialog activeEditor={editor} onClose={onClose} />
            </React.Suspense>
          ),
          true
        ),
    }),
    new ComponentPickerOption("Equation", {
      icon: <SigmaIcon className="w-4 h-4" />,
      keywords: ["equation", "latex", "math", "formula"],
      desc: "Mathematical equations using LaTeX syntax",
      category: "media",
      keyboardShortcut: "$$",
      onSelect: () =>
        showModal(
          "Insert Equation",
          "Insert mathematical equations using LaTeX syntax.",
          (onClose) => (
            <React.Suspense
              fallback={<Skeleton className="mx-2 w-[350px] h-[350px]" />}
            >
              <InsertEquationDialog
                activeEditor={editor}
                onClose={onClose}
              />
            </React.Suspense>
          ),
          true
        ),
    }),
    new ComponentPickerOption("Gifs", {
      icon: <ImagePlayIcon className="h-4 w-4" />,
      keywords: ["gif", "gifs", "videos", "short video", "animation"],
      desc: "Search and insert animated GIFs",
      category: "media",
      onSelect: () => {
        showModal(
          "Insert GIF",
          "Please select a GIF to upload.",
          (onClose) => (
            <React.Suspense
              fallback={<Skeleton className="mx-2 w-[400px] h-[400px]" />}
            >
              <InsertGif
                insertGifOnClick={(payload: ImagePayload) => {
                  editor.dispatchCommand(INSERT_IMAGE_COMMAND, payload);
                }}
                onClose={onClose}
              />
            </React.Suspense>
          ),
          true
        );
      },
    }),
    new ComponentPickerOption("Poll", {
      icon: <SquarePenIcon className="h-4 w-4" />,
      keywords: ["poll", "vote", "survey", "choice"],
      desc: "Interactive community voting poll",
      category: "media",
      onSelect: () =>
        editor.dispatchCommand(INSERT_POLL_COMMAND, "Type the Question"),
    }),
    new ComponentPickerOption("Database Table", {
      icon: <Table2 className="h-4 w-4" />,
      keywords: ["database", "table", "tasks", "tracker", "notion"],
      desc: "Sortable & filterable task database",
      category: "layout",
      onSelect: () =>
        editor.update(() => {
          $insertNodes([$createDatabaseNode({ view: "table" })]);
        }),
    }),
    new ComponentPickerOption("Kanban Board", {
      icon: <Kanban className="h-4 w-4" />,
      keywords: ["kanban", "board", "columns", "workflow", "cards"],
      desc: "Drag-and-drop Kanban task board",
      category: "layout",
      onSelect: () =>
        editor.update(() => {
          $insertNodes([$createDatabaseNode({ view: "kanban" })]);
        }),
    }),

    // 4. Layout & Structure
    new ComponentPickerOption("2 columns", {
      icon: <Columns2 className="h-4 w-4" />,
      keywords: ["columns", "flex", "row", "layout", "grid", "2columns", "two columns"],
      desc: "Split your content into 2 equal columns",
      category: "layout",
      onSelect: () => editor.dispatchCommand(INSERT_LAYOUT_COMMAND, "1fr 1fr"),
    }),
    new ComponentPickerOption("3 columns", {
      icon: <Columns3 className="h-4 w-4" />,
      keywords: ["3columns", "3", "flex", "row", "layout", "grid", "three columns"],
      desc: "Split your content into 3 equal columns",
      category: "layout",
      onSelect: () =>
        editor.dispatchCommand(INSERT_LAYOUT_COMMAND, "1fr 1fr 1fr"),
    }),
    new ComponentPickerOption("4 columns", {
      icon: <Columns4 className="h-4 w-4" />,
      keywords: ["4columns", "4", "flex", "row", "layout", "grid", "four columns"],
      desc: "Split your content into 4 equal columns",
      category: "layout",
      onSelect: () =>
        editor.dispatchCommand(INSERT_LAYOUT_COMMAND, "1fr 1fr 1fr 1fr"),
    }),
    new ComponentPickerOption("Collapsible", {
      icon: <StepForward className="h-4 w-4" />,
      keywords: ["collapse", "collapsible", "toggle", "accordion"],
      desc: "Expandable/collapsible toggle section",
      category: "layout",
      onSelect: () =>
        editor.dispatchCommand(INSERT_COLLAPSIBLE_COMMAND, undefined),
    }),
    new ComponentPickerOption("Stepper", {
      icon: (
        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <g fill="none" fillRule="evenodd">
            <path d="m12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036q-.016-.004-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z" />
            <path
              fill="currentColor"
              d="M5 6a3 3 0 0 1 6 0v2a3 3 0 0 1-6 0zm3-1a1 1 0 0 0-1 1v2a1 1 0 0 0 2 0V6a1 1 0 0 0-1-1m9.707-.707a1 1 0 0 0-1.414 0L13.465 7.12a1 1 0 0 0 1.414 1.415L16 7.414V20a1 1 0 1 0 2 0V7.414l1.121 1.122a1 1 0 1 0 1.415-1.415zM5 15a3 3 0 0 1 5.995-.176l.005.186c0 .408-.039.799-.107 1.171c-.264 1.433-.964 2.58-1.57 3.352c-.307.39-.598.694-.815.904c-.124.12-.25.238-.385.345a1 1 0 0 1-1.34-1.479L7.118 19l.224-.228A7 7 0 0 0 7.971 18A3 3 0 0 1 5 15m3-1a1 1 0 1 0 0 2a1 1 0 0 0 0-2"
            />
          </g>
        </svg>
      ),
      keywords: ["stepper", "step", "lines", "routes", "docs", "number", "workflow", "process"],
      desc: "Numbered step-by-step documentation workflow",
      category: "layout",
      onSelect: () => {
        const newEditor = createEditor();
        const parsedEditorState = newEditor.parseEditorState(
          JSON.stringify(initialEditorState)
        );
        newEditor.setEditorState(parsedEditorState);
        const newStep = {
          id: 0,
          title: `New step 0`,
          content: newEditor,
        };
        editor.dispatchCommand(INSERT_STEPPER_COMMAND, [newStep]);
      },
    }),

    // 5. Embeds & Social
    new ComponentPickerOption("YouTube", {
      icon: <Youtube className="h-4 w-4" />,
      keywords: ["Youtube", "youtube", "video", "stream", "media"],
      desc: "Embed responsive YouTube videos",
      category: "embeds",
      onSelect: () => {
        showModal(
          "YouTube Video",
          "Insert a URL to embed a live preview. Works with YouTube",
          (onClose) => (
            <AutoEmbedDialog
              embedConfig={YoutubeEmbedConfig}
              onClose={onClose}
            />
          ),
          true
        );
      },
    }),
    new ComponentPickerOption("Figma", {
      icon: <Figma className="h-4 w-4" />,
      keywords: ["figma", "figma.com", "ui", "design", "prototype"],
      desc: "Embed interactive Figma design preview",
      category: "embeds",
      onSelect: () => {
        showModal(
          "Figma",
          "Insert a URL to embed a live preview. Works with Figma",
          (onClose) => (
            <AutoEmbedDialog
              embedConfig={FigmaEmbedConfig}
              onClose={onClose}
            />
          ),
          true
        );
      },
    }),
    new ComponentPickerOption("Twitter / X", {
      icon: <Twitter className="h-4 w-4" />,
      keywords: ["Twitter", "tweet", "x", "twitter", "post"],
      desc: "Embed live tweet post",
      category: "embeds",
      onSelect: () => {
        showModal(
          "Twitter / X Post",
          "Insert a URL to embed a live preview. Works with Twitter",
          (onClose) => (
            <AutoEmbedDialog
              embedConfig={TwitterEmbedConfig}
              onClose={onClose}
            />
          ),
          true
        );
      },
    }),
    new ComponentPickerOption("Interactive Story", {
      icon: <GitBranch className="h-4 w-4" />,
      keywords: ["story", "interactive", "branching", "narrative", "choose", "adventure"],
      desc: "Create branching narratives with reader choices",
      category: "embeds",
      onSelect: () =>
        editor.dispatchCommand(INSERT_STORY_BUILDER_COMMAND, {
          nodes: [],
          currentNodeId: "",
          title: "Interactive Story",
        }),
    }),
    new ComponentPickerOption("Dynamic Block", {
      icon: <Zap className="h-4 w-4" />,
      keywords: ["dynamic", "interactive", "content", "block", "trigger", "animation", "responsive"],
      desc: "Create interactive content that responds to user actions",
      category: "embeds",
      onSelect: () => editor.dispatchCommand(INSERT_DYNAMIC_BLOCK_COMMAND, createDefaultDynamicBlock()),
    }),

    // 6. Publishing & Export
    new ComponentPickerOption("Import / Export Hub", {
      icon: <FileDown className="h-4 w-4 text-primary" />,
      keywords: ["export", "import", "hub", "share", "backup", "markdown", "pdf", "html", "json"],
      desc: "Open unified Document Import & Export Hub",
      category: "export",
      onSelect: () =>
        editor.dispatchCommand(OPEN_IMPORT_EXPORT_MODAL_COMMAND, { defaultTab: "export" }),
    }),
    new ComponentPickerOption("Import Document", {
      icon: <FileUp className="h-4 w-4 text-emerald-500" />,
      keywords: ["import", "upload", "load", "markdown", "html", "json", "open"],
      desc: "Import Markdown, HTML, JSON, or Plain text",
      category: "export",
      onSelect: () =>
        editor.dispatchCommand(OPEN_IMPORT_EXPORT_MODAL_COMMAND, { defaultTab: "import" }),
    }),
    new ComponentPickerOption("Export to PDF", {
      icon: <Printer className="h-4 w-4 text-red-500" />,
      keywords: ["export", "pdf", "print", "save", "document"],
      desc: "Export document as print-ready PDF",
      category: "export",
      onSelect: () => editor.dispatchCommand(EXPORT_PDF_COMMAND, undefined),
    }),
    new ComponentPickerOption("Export to Markdown", {
      icon: <FileText className="h-4 w-4 text-blue-500" />,
      keywords: ["export", "markdown", "md", "github"],
      desc: "Export document as clean Markdown (.md)",
      category: "export",
      onSelect: () => editor.dispatchCommand(EXPORT_MARKDOWN_COMMAND, undefined),
    }),
    new ComponentPickerOption("Export to HTML", {
      icon: <Code2 className="h-4 w-4 text-orange-500" />,
      keywords: ["export", "html", "web", "download"],
      desc: "Export document as standalone styled HTML",
      category: "export",
      onSelect: () => editor.dispatchCommand(EXPORT_HTML_COMMAND, undefined),
    }),
    new ComponentPickerOption("Export to Word (.docx)", {
      icon: <FileText className="h-4 w-4 text-indigo-500" />,
      keywords: ["export", "docx", "word", "microsoft", "document"],
      desc: "Export document as Microsoft Word (.docx)",
      category: "export",
      onSelect: () => editor.dispatchCommand(EXPORT_DOCX_COMMAND, undefined),
    }),
    new ComponentPickerOption("Export JSON State", {
      icon: <FileJson className="h-4 w-4 text-emerald-600" />,
      keywords: ["export", "json", "backup", "state", "lexical"],
      desc: "Export full document state snapshot for backup",
      category: "export",
      onSelect: () => editor.dispatchCommand(EXPORT_JSON_COMMAND, undefined),
    }),
  ];
}

export interface SlashCommandRenderProps {
  isOpen: boolean;
  anchorElement: HTMLElement | null;
  options: ComponentPickerOption[];
  selectedIndex: number | null;
  queryString: string | null;
  selectOptionAndCleanUp: (option: ComponentPickerOption) => void;
  setHighlightedIndex: (index: number) => void;
}

export interface SlashCommandPluginProps {
  /** When true, suppresses the default React/Tailwind portal UI. */
  headless?: boolean;
  /** Custom renderer for the slash command menu. Receives full menu state & actions. */
  render?: (state: SlashCommandRenderProps) => React.ReactNode;
  /** Callback fired when the menu state changes (useful for external headless UIs). */
  onStateChange?: (state: SlashCommandRenderProps) => void;
}

export default function SlashCommand({
  headless = false,
  render,
  onStateChange,
}: SlashCommandPluginProps = {}): React.JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [Modal, showModal] = useModal();
  const [queryString, setQueryString] = useState<string | null>(null);
  const activeItemRef = useRef<HTMLDivElement | null>(null);
  const latestStateRef = useRef<SlashCommandRenderProps>({
    isOpen: false,
    anchorElement: null,
    options: [],
    selectedIndex: null,
    queryString: null,
    selectOptionAndCleanUp: () => {},
    setHighlightedIndex: () => {},
  });

  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch("/", {
    minLength: 0,
  });

  const options = useMemo(() => {
    const baseOptions = getBaseOptions(editor, showModal);

    if (!queryString) {
      return baseOptions;
    }

    const regex = new RegExp(queryString, "i");

    return [
      ...getDynamicOptions(editor, queryString),
      ...baseOptions.filter(
        (option) =>
          regex.test(option.title) ||
          regex.test(option.category) ||
          option.keywords.some((keyword) => regex.test(keyword))
      ),
    ];
  }, [editor, queryString, showModal]);

  const onSelectOption = useCallback(
    (
      selectedOption: ComponentPickerOption,
      nodeToRemove: TextNode | null,
      closeMenu: () => void,
      matchingString: string
    ) => {
      editor.update(() => {
        nodeToRemove?.remove();
        selectedOption.onSelect(matchingString);
        closeMenu();
      });
    },
    [editor]
  );

  React.useEffect(() => {
    if (!onStateChange) return;
    if (queryString === null) {
      const closedState: SlashCommandRenderProps = {
        ...latestStateRef.current,
        isOpen: false,
        anchorElement: null,
        queryString: null,
        selectedIndex: null,
      };
      latestStateRef.current = closedState;
      onStateChange(closedState);
    } else {
      onStateChange(latestStateRef.current);
    }
  }, [onStateChange, queryString, options]);

  return (
    <>
      <LexicalTypeaheadMenuPlugin<ComponentPickerOption>
        onQueryChange={setQueryString}
        onSelectOption={onSelectOption}
        triggerFn={checkForTriggerMatch}
        options={options}
        anchorClassName="z-[9999] pointer-events-auto"
        menuRenderFn={(
          anchorElementRef,
          { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }
        ) => {
          const isOpen = Boolean(anchorElementRef.current && options.length > 0);
          latestStateRef.current = {
            isOpen,
            anchorElement: anchorElementRef.current,
            options,
            selectedIndex,
            queryString,
            selectOptionAndCleanUp,
            setHighlightedIndex,
          };

          if (!anchorElementRef.current || !options.length) {
            return null;
          }

          if (render) {
            const custom = render(latestStateRef.current);
            return custom != null
              ? ReactDOM.createPortal(<>{custom}</>, anchorElementRef.current)
              : null;
          }

          if (headless) {
            return null;
          }

          let lastCategory = "";

          return ReactDOM.createPortal(
            <div
              id="slash-command-menu"
              className="z-[100] relative max-w-[360px] w-80 sm:w-[360px] max-h-[420px] rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 text-zinc-900 dark:text-zinc-100 shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col animate-in fade-in-0 zoom-in-95 duration-100"
            >
              {/* Header / Search indicator */}
              <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-zinc-200/70 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-900/60 select-none">
                <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="font-mono px-1.5 py-0.5 rounded bg-zinc-200/70 dark:bg-zinc-800 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                    /
                  </span>
                  <span className="font-medium">
                    {queryString ? `Filter: "${queryString}"` : "Commands & Blocks"}
                  </span>
                </div>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                  {options.length} {options.length === 1 ? "option" : "options"}
                </span>
              </div>

              {/* Scrollable Command List */}
              <div
                className="max-h-[360px] overflow-y-auto p-1.5 overscroll-contain"
                role="listbox"
                aria-label="Slash commands"
              >
                {options.map((option, i: number) => {
                  const showCategoryHeader = option.category !== lastCategory;
                  lastCategory = option.category;
                  const isSelected = selectedIndex === i;
                  const catConfig = CATEGORY_CONFIG[option.category];

                  return (
                    <React.Fragment key={option.key}>
                      {showCategoryHeader && (
                        <div className="px-2.5 pt-3 pb-1 first:pt-1 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider select-none flex items-center justify-between">
                          <span>{catConfig?.label || option.category}</span>
                        </div>
                      )}
                      <div
                        ref={(el) => {
                          if (isSelected) {
                            activeItemRef.current = el;
                            el?.scrollIntoView({ block: "nearest" });
                          }
                        }}
                        role="option"
                        aria-selected={isSelected}
                        className={cn(
                          "group flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition-all cursor-pointer select-none",
                          isSelected
                            ? "bg-zinc-100 dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-50 font-medium shadow-2xs"
                            : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300"
                        )}
                        onClick={() => {
                          setHighlightedIndex(i);
                          selectOptionAndCleanUp(option);
                        }}
                        onMouseEnter={() => {
                          setHighlightedIndex(i);
                        }}
                      >
                        <div
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-300 transition-colors",
                            isSelected &&
                              "border-primary/40 bg-primary/10 text-primary dark:text-primary-foreground",
                            option.category === "ai" &&
                              "border-purple-300 dark:border-purple-800/50 bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400"
                          )}
                        >
                          {option.icon}
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate text-sm">{option.title}</span>
                            {option.keyboardShortcut && (
                              <span className="shrink-0 text-[10px] font-mono px-1.5 py-0.5 rounded border border-zinc-200/60 dark:border-zinc-800 bg-zinc-100/60 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400">
                                {option.keyboardShortcut}
                              </span>
                            )}
                          </div>
                          {option.desc && (
                            <span className="truncate text-xs text-zinc-500 dark:text-zinc-400 font-normal">
                              {option.desc}
                            </span>
                          )}
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>,
            anchorElementRef.current
          );
        }}
      />
      {!headless && Modal}
    </>
  );
}
