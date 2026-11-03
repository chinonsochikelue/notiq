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
  $isRangeSelection,
  createEditor,
  LexicalEditor,
  TextNode,
} from "lexical";
import { useCallback, useMemo, useState } from "react";
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
  OctagonX,
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
  OPEN_IMPORT_EXPORT_MODAL_COMMAND,
} from "../ExportPlugin";
import { Printer, FileText, FileDown, FileUp, FileJson } from "lucide-react";
import { INSERT_HINT_COMMAND } from "../../nodes/Hint";
import useModal from "../../../ui/models/use-model";
import {
  Command,
  CommandItem,
  CommandList,
  CommandInput,
  CommandEmpty,
  CommandShortcut,
} from "../../../ui/command";
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
const InsertGif = React.lazy(() => import("../../../ui/models/insert-gif"));
const InsertImageDialog = React.lazy(() =>
  import("../../../ui/models/insert-image").then((module) => ({
    default: module.InsertImageDialog,
  }))
);
const AIDialog = React.lazy(() => import("../../../ui/ai/AIDialog"));
const InsertAudioDialog = React.lazy(() => import("../../../ui/models/insert-audio"));
const InsertFileDialog = React.lazy(() => import("../../../ui/models/insert-file"));
class ComponentPickerOption extends MenuOption {
  // What shows up in the editor
  title: string;
  // Icon for display
  icon?: React.JSX.Element;
  // For extra searching.
  keywords: Array<string>;
  // TBD
  keyboardShortcut?: string;
  // What happens when you select this option?
  onSelect: (queryString: string) => void;
  desc?: string;
  constructor(
    title: string,
    options: {
      icon?: React.JSX.Element;
      keywords?: Array<string>;
      keyboardShortcut?: string;
      onSelect: (queryString: string) => void;
      desc?: string;
    }
  ) {
    super(title);
    this.title = title;
    this.keywords = options.keywords || [];
    this.icon = options.icon;
    this.keyboardShortcut = options.keyboardShortcut;
    this.onSelect = options.onSelect.bind(this);
    this.desc = options.desc; // Add this line
  }
}

function getDynamicOptions(editor: LexicalEditor, queryString: string) {
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
            icon: <i className="icon table" />,
            keywords: ["table"],
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
) {
  return [
    new ComponentPickerOption("Ask AI Assistant", {
      icon: <Sparkles className="h-4 w-4 text-purple-500" />,
      keywords: ["ai", "assistant", "generate", "write", "gpt", "gemini", "smart", "summarize", "prompt"],
      desc: "Generate content, outline, brainstorm, or write with AI",
      onSelect: () =>
        showModal(
          "Notiq AI Assistant",
          "Ask AI to write, generate, expand, or format content directly into your document.",
          (onClose) => (
            <React.Suspense fallback={<Skeleton className="mx-2 w-[400px] h-[300px]" />}>
              <AIDialog editor={editor} onClose={onClose} />
            </React.Suspense>
          ),
          true
        ),
    }),
    new ComponentPickerOption("Paragraph", {
      icon: <Pilcrow className="h-4 w-4" />,
      keywords: ["normal", "paragraph", "p", "text"],
      onSelect: () =>
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createParagraphNode());
          }
        }),
      desc: "Just start writing with plain text",
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
          keywords: ["heading", "header", `h${n}`],
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
          desc: `${n == 1
            ? "Big section heading"
            : n == 2
              ? "Meduim section heading."
              : "Small section heading"
            }`,
        })
    ),
    new ComponentPickerOption("Table", {
      icon: <Table className="h-4 w-4" />,
      keywords: ["table", "grid", "spreadsheet", "rows", "columns"],
      desc: "Add simple table content to your blog.",
      onSelect: () =>
        editor.dispatchCommand(INSERT_TABLE_COMMAND, {
          rows: "4",
          columns: "4",
        }),
    }),
    new ComponentPickerOption("Hint", {
      icon: <OctagonX className="h-4 w-4" />,
      keywords: [
        "Hint",
        "note",
        "info",
        "alert",
        "alert",
        "success",
        "warning",
        "error",
      ],
      desc: "Add a hint to your content.",
      onSelect: () => editor.dispatchCommand(INSERT_HINT_COMMAND, "hint"),
    }),
    new ComponentPickerOption("Numbered List", {
      icon: <ListOrdered className="h-4 w-4" />,
      keywords: ["numbered list", "ordered list", "ol"],
      desc: "Create list with number",
      keyboardShortcut: SHORTCUTS.NUMBERED_LIST,

      onSelect: () =>
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined),
    }),
    new ComponentPickerOption("Bulleted List", {
      icon: <List className="h-4 w-4" />,
      keywords: ["bulleted list", "unordered list", "ul"],
      desc: "Create list with Bulleted",
      keyboardShortcut: SHORTCUTS.BULLET_LIST,

      onSelect: () =>
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined),
    }),
    new ComponentPickerOption("Check List", {
      icon: <ListCheck className="h-4 w-4" />,
      keywords: ["check list", "todo list"],
      desc: "Track tasks with to-do list.",
      keyboardShortcut: SHORTCUTS.CHECK_LIST,

      onSelect: () =>
        editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined),
    }),
    new ComponentPickerOption("Quote", {
      icon: <QuoteIcon className="h-4 w-4" />,
      keywords: ["block quote"],
      desc: "Capture Quote",
      keyboardShortcut: SHORTCUTS.QUOTE,

      onSelect: () =>
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createQuoteNode());
          }
        }),
    }),
    new ComponentPickerOption("Poll", {
      icon: <SquarePenIcon className="h-4 w-4" />,
      keywords: ["poll", "vote", "survey"],
      desc: "Add poll to take people votes.",
      onSelect: () =>
        editor.dispatchCommand(INSERT_POLL_COMMAND, "Type the Question"),
    }),
    new ComponentPickerOption("Code", {
      icon: <Code2 className="h-4 w-4" />,
      keywords: ["javascript", "python", "js", "codeblock"],
      desc: "Add block of code.",
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
    new ComponentPickerOption("Divider", {
      icon: <Minus className="h-4 w-4" />,
      keywords: ["horizontal rule", "divider", "hr"],
      desc: "Visually divide blocks",

      onSelect: () =>
        editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined),
    }),
    new ComponentPickerOption("Youtube", {
      icon: <Youtube className="h-4 w-4" />,
      keywords: ["Youtube", "youtube", "video"],
      desc: "Embedded YouTube videos ",

      onSelect: () => {
        showModal(
          "Youtube",
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
      keywords: ["figma", "figma.com", "ui"],
      desc: "Embedded Figma File ",

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
    new ComponentPickerOption("Twitter", {
      icon: <Twitter className="h-4 w-4" />,
      keywords: ["Twitter", "tweet", "x", "twitter"],
      desc: "Embedded Tweets ",

      onSelect: () => {
        showModal(
          "Twitter tweet",
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
    new ComponentPickerOption("Image", {
      icon: <ImageIcon className="h-4 w-4" />,
      keywords: ["image", "photo", "picture", "file", "img"],
      desc: "Upload or embed with a link",

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
      keywords: ["image", "photo", "picture", "file", "img"],
      desc: "Upload or embed with a link",

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
      desc: "Embed a downloadable document card",
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

    new ComponentPickerOption('Equation', {
      icon: <SigmaIcon className="w-4 h-4" />,
      keywords: ['equation', 'latex', 'math'],
      onSelect: () =>
        showModal(
          'Insert Equation',
          'Insert mathematical equations using LaTeX syntax.',
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

    new ComponentPickerOption("Collapsible", {
      icon: <StepForward className="h-4 w-4" />,
      keywords: ["collapse", "collapsible", "toggle"],
      desc: "Toggles can hide and show content inside.",
      onSelect: () =>
        editor.dispatchCommand(INSERT_COLLAPSIBLE_COMMAND, undefined),
    }),
    new ComponentPickerOption("2 columns", {
      icon: <Columns2 className="h-4 w-4" />,
      keywords: ["columns", "flex", "row", "layout", "grid"],
      desc: "Divide your content into 2 columns.",
      onSelect: () => editor.dispatchCommand(INSERT_LAYOUT_COMMAND, "1fr 1fr"),
    }),
    new ComponentPickerOption("3 columns", {
      icon: <Columns3 className="h-4 w-4" />,
      keywords: ["3columns", "3", "flex", "row", "layout", "grid"],
      desc: "Divide your content into 3 columns.",
      onSelect: () =>
        editor.dispatchCommand(INSERT_LAYOUT_COMMAND, "1fr 1fr 1fr"),
    }),
    new ComponentPickerOption("Stepper", {
      icon: <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none" fillRule="evenodd"><path d="m12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036q-.016-.004-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z"></path><path fill="currentColor" d="M5 6a3 3 0 0 1 6 0v2a3 3 0 0 1-6 0zm3-1a1 1 0 0 0-1 1v2a1 1 0 0 0 2 0V6a1 1 0 0 0-1-1m9.707-.707a1 1 0 0 0-1.414 0L13.465 7.12a1 1 0 0 0 1.414 1.415L16 7.414V20a1 1 0 1 0 2 0V7.414l1.121 1.122a1 1 0 1 0 1.415-1.415zM5 15a3 3 0 0 1 5.995-.176l.005.186c0 .408-.039.799-.107 1.171c-.264 1.433-.964 2.58-1.57 3.352c-.307.39-.598.694-.815.904c-.124.12-.25.238-.385.345a1 1 0 0 1-1.34-1.479L7.118 19l.224-.228A7 7 0 0 0 7.971 18A3 3 0 0 1 5 15m3-1a1 1 0 1 0 0 2a1 1 0 0 0 0-2"></path></g></svg>,
      keywords: ["stepper", "step", "lines", "routes", "docs", "number"],
      desc: "Stepper with descriptions for each step.",
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
        editor.dispatchCommand(INSERT_STEPPER_COMMAND, [newStep])

      }
    }),
    new ComponentPickerOption("Gifs", {
      icon: <ImagePlayIcon className="h-4 w-4" />,
      keywords: ["gif", "gifs", "videos", "short video"],
      desc: "Insert a GIF video",
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

    new ComponentPickerOption("Interactive Story", {
      icon: <GitBranch className="h-4 w-4" />,
      keywords: ["story", "interactive", "branching", "narrative", "choose", "adventure"],
      desc: "Create branching narratives with reader choices",
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
      onSelect: () => editor.dispatchCommand(INSERT_DYNAMIC_BLOCK_COMMAND, createDefaultDynamicBlock()),
    }),

    new ComponentPickerOption("4 columns", {
      icon: <Columns4 className="h-4 w-4" />,
      keywords: ["4columns", "4", "flex", "row", "layout", "grid"],
      desc: "Divide your content into 4 columns.",
      onSelect: () =>
        editor.dispatchCommand(INSERT_LAYOUT_COMMAND, "1fr 1fr 1fr 1fr"),
    }),

    new ComponentPickerOption("Import / Export Hub", {
      icon: <FileDown className="h-4 w-4 text-primary" />,
      keywords: ["export", "import", "hub", "share", "backup", "markdown", "pdf", "html", "json"],
      desc: "Open unified Document Import & Export Hub",
      onSelect: () =>
        editor.dispatchCommand(OPEN_IMPORT_EXPORT_MODAL_COMMAND, { defaultTab: "export" }),
    }),

    new ComponentPickerOption("Import Document", {
      icon: <FileUp className="h-4 w-4 text-emerald-500" />,
      keywords: ["import", "upload", "load", "markdown", "html", "json", "open"],
      desc: "Import Markdown, HTML, JSON, or Plain text",
      onSelect: () =>
        editor.dispatchCommand(OPEN_IMPORT_EXPORT_MODAL_COMMAND, { defaultTab: "import" }),
    }),

    new ComponentPickerOption("Export to PDF", {
      icon: <Printer className="h-4 w-4 text-red-500" />,
      keywords: ["export", "pdf", "print", "save", "document"],
      desc: "Export document as print-ready PDF",
      onSelect: () => editor.dispatchCommand(EXPORT_PDF_COMMAND, undefined),
    }),

    new ComponentPickerOption("Export to Markdown", {
      icon: <FileText className="h-4 w-4 text-blue-500" />,
      keywords: ["export", "markdown", "md", "github"],
      desc: "Export document as clean Markdown (.md)",
      onSelect: () => editor.dispatchCommand(EXPORT_MARKDOWN_COMMAND, undefined),
    }),

    new ComponentPickerOption("Export to HTML", {
      icon: <Code2 className="h-4 w-4 text-orange-500" />,
      keywords: ["export", "html", "web", "download"],
      desc: "Export document as standalone styled HTML",
      onSelect: () => editor.dispatchCommand(EXPORT_HTML_COMMAND, undefined),
    }),

    new ComponentPickerOption("Export JSON State", {
      icon: <FileJson className="h-4 w-4 text-emerald-600" />,
      keywords: ["export", "json", "backup", "state", "lexical"],
      desc: "Export full document state snapshot for backup",
      onSelect: () => editor.dispatchCommand(EXPORT_JSON_COMMAND, undefined),
    }),
  ];
}

export default function SlashCommand(): React.JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [Modal, showModal] = useModal();
  const [queryString, setQueryString] = useState<string | null>(null);

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
          option.keywords.some((keyword) => regex.test(keyword))
      ),
    ];
  }, [editor, queryString]);

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
    [editor, showModal]
  );

  return (
    <>
      <LexicalTypeaheadMenuPlugin<ComponentPickerOption>
        onQueryChange={setQueryString}
        onSelectOption={onSelectOption}
        triggerFn={checkForTriggerMatch}
        options={options}
        menuRenderFn={(
          anchorElementRef,
          { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }
        ) =>
          anchorElementRef.current && options.length
            ? ReactDOM.createPortal(
              <div
                id={"toolbar"}
                className="z-[100] relative max-w-[340px] w-80 max-h-[360px] rounded-xl border border-border/80 bg-popover/95 text-popover-foreground shadow-xl backdrop-blur-md overflow-hidden animate-in fade-in-0 zoom-in-95"
              >
                <Command className="border-0 bg-transparent">
                  <CommandInput placeholder="Type a command or search..." className="border-b border-border/60 text-sm" />
                  <CommandList className="max-h-[300px] overflow-y-auto p-1.5">
                    <CommandEmpty className="py-6 text-center text-xs text-muted-foreground">No matching commands found.</CommandEmpty>

                    {options.map((option, i: number) => (
                      <CommandItem
                        ref={option.ref as React.Ref<HTMLDivElement>}
                        className={cn(
                          "group flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors cursor-pointer select-none",
                          selectedIndex === i
                            ? "bg-accent text-accent-foreground font-medium"
                            : "hover:bg-accent/60 text-foreground"
                        )}
                        onSelect={() => {
                          setHighlightedIndex(i);
                          selectOptionAndCleanUp(option);
                        }}
                        onMouseEnter={() => {
                          setHighlightedIndex(i);
                        }}
                        key={option.key}
                      >
                        <div className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/60 text-foreground transition-colors",
                          selectedIndex === i && "border-primary/40 bg-primary/10 text-primary"
                        )}>
                          {option.icon}
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate text-sm">{option.title}</span>
                            {option.keyboardShortcut && (
                              <CommandShortcut className="text-[11px] font-mono tracking-widest text-muted-foreground/80">
                                {option.keyboardShortcut}
                              </CommandShortcut>
                            )}
                          </div>
                          {option.desc && (
                            <span className="truncate text-xs text-muted-foreground">
                              {option.desc}
                            </span>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandList>
                </Command>
              </div>,
              anchorElementRef.current
            )
            : null
        }
      />
      {Modal}
    </>
  );
}
