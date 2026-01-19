import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut
} from "./chunk-KJ6AJ44Q.mjs";
import {
  INSERT_DYNAMIC_BLOCK_COMMAND,
  INSERT_STORY_BUILDER_COMMAND,
  InsertEquationDialog,
  InsertInlineImageDialog,
  createDefaultDynamicBlock
} from "./chunk-WJRHXI2C.mjs";
import {
  INSERT_POLL_COMMAND
} from "./chunk-U47ABU5Z.mjs";
import {
  AutoEmbedDialog,
  FigmaEmbedConfig,
  INSERT_COLLAPSIBLE_COMMAND,
  INSERT_LAYOUT_COMMAND,
  TwitterEmbedConfig,
  YoutubeEmbedConfig
} from "./chunk-AMMKBSST.mjs";
import {
  useModal
} from "./chunk-5QSNIVIG.mjs";
import {
  INSERT_IMAGE_COMMAND
} from "./chunk-LGG4IUIA.mjs";
import {
  INSERT_STEPPER_COMMAND,
  initialEditorState
} from "./chunk-6RNZQOH2.mjs";
import {
  SHORTCUTS
} from "./chunk-ZB5LZQKC.mjs";
import {
  Skeleton
} from "./chunk-QEIFVK5M.mjs";
import {
  INSERT_HINT_COMMAND
} from "./chunk-G53GLEAY.mjs";
import {
  cn
} from "./chunk-YHPNOWFH.mjs";
import {
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/components/editor/plugins/SlashCommand/index.tsx
init_react_shim();
import { $createCodeNode } from "@lexical/code";
import {
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND
} from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { INSERT_HORIZONTAL_RULE_COMMAND } from "@lexical/react/LexicalHorizontalRuleNode";
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  useBasicTypeaheadTriggerMatch
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { INSERT_TABLE_COMMAND } from "@lexical/table";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  createEditor
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
  Twitter,
  Youtube,
  Figma,
  Heading1,
  Heading2,
  Heading3,
  Minus,
  List,
  ListOrdered,
  Table,
  SigmaIcon,
  GitBranch,
  Zap
} from "lucide-react";
var InsertGif = React.lazy(() => import("./insert-gif-SAIDYURE.mjs"));
var InsertImageDialog = React.lazy(
  () => import("./insert-image-U3RJN3OW.mjs").then((module) => ({
    default: module.InsertImageDialog
  }))
);
var ComponentPickerOption = class extends MenuOption {
  constructor(title, options) {
    super(title);
    this.title = title;
    this.keywords = options.keywords || [];
    this.icon = options.icon;
    this.keyboardShortcut = options.keyboardShortcut;
    this.onSelect = options.onSelect.bind(this);
    this.desc = options.desc;
  }
};
function getDynamicOptions(editor, queryString) {
  const options = [];
  if (queryString == null) {
    return options;
  }
  const tableMatch = queryString.match(/^([1-9]\d?)(?:x([1-9]\d?)?)?$/);
  if (tableMatch !== null) {
    const rows = tableMatch[1];
    const colOptions = tableMatch[2] ? [tableMatch[2]] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(String);
    options.push(
      ...colOptions.map(
        (columns) => new ComponentPickerOption(`${rows}x${columns} Table`, {
          icon: /* @__PURE__ */ React.createElement("i", { className: "icon table" }),
          keywords: ["table"],
          onSelect: () => editor.dispatchCommand(INSERT_TABLE_COMMAND, { columns, rows })
        })
      )
    );
  }
  return options;
}
function getBaseOptions(editor, showModal) {
  return [
    new ComponentPickerOption("Paragraph", {
      icon: /* @__PURE__ */ React.createElement(Pilcrow, { className: "w-9 h-9 max-sm:h-5 max-sm:w-5" }),
      keywords: ["normal", "paragraph", "p", "text"],
      onSelect: () => editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createParagraphNode());
        }
      }),
      desc: "Just start writing with plain text"
    }),
    ...[1, 2, 3].map(
      (n) => new ComponentPickerOption(`Heading ${n}`, {
        icon: n === 1 ? /* @__PURE__ */ React.createElement(Heading1, { className: "w-9 h-9 max-sm:h-5 max-sm:w-5" }) : n === 2 ? /* @__PURE__ */ React.createElement(Heading2, { className: "w-9 h-9 max-sm:h-5 max-sm:w-5" }) : /* @__PURE__ */ React.createElement(Heading3, { className: "w-9 h-9 max-sm:h-5 max-sm:w-5" }),
        keywords: ["heading", "header", `h${n}`],
        keyboardShortcut: n === 1 ? SHORTCUTS.HEADING1 : n === 2 ? SHORTCUTS.HEADING2 : SHORTCUTS.HEADING3,
        onSelect: () => editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createHeadingNode(`h${n}`));
          }
        }),
        desc: `${n == 1 ? "Big section heading" : n == 2 ? "Meduim section heading." : "Small section heading"}`
      })
    ),
    new ComponentPickerOption("Table", {
      icon: /* @__PURE__ */ React.createElement(Table, { className: "w-9 h-9 max-sm:h-5 max-sm:w-5" }),
      keywords: ["table", "grid", "spreadsheet", "rows", "columns"],
      desc: "Add simple table content to your blog.",
      onSelect: () => editor.dispatchCommand(INSERT_TABLE_COMMAND, {
        rows: "4",
        columns: "4"
      })
    }),
    new ComponentPickerOption("Hint", {
      icon: /* @__PURE__ */ React.createElement(OctagonX, { className: "w-9 h-9 max-sm:h-5 max-sm:w-5" }),
      keywords: [
        "Hint",
        "note",
        "info",
        "alert",
        "alert",
        "success",
        "warning",
        "error"
      ],
      desc: "Add a hint to your content.",
      onSelect: () => editor.dispatchCommand(INSERT_HINT_COMMAND, "hint")
    }),
    new ComponentPickerOption("Numbered List", {
      icon: /* @__PURE__ */ React.createElement(ListOrdered, { className: "w-9 h-9 max-sm:h-5 max-sm:w-5" }),
      keywords: ["numbered list", "ordered list", "ol"],
      desc: "Create list with number",
      keyboardShortcut: SHORTCUTS.NUMBERED_LIST,
      onSelect: () => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, void 0)
    }),
    new ComponentPickerOption("Bulleted List", {
      icon: /* @__PURE__ */ React.createElement(List, { className: "w-9 h-9 max-sm:h-5 max-sm:w-5" }),
      keywords: ["bulleted list", "unordered list", "ul"],
      desc: "Create list with Bulleted",
      keyboardShortcut: SHORTCUTS.BULLET_LIST,
      onSelect: () => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, void 0)
    }),
    new ComponentPickerOption("Check List", {
      icon: /* @__PURE__ */ React.createElement(ListCheck, { className: "w-9 h-9 max-sm:h-5 max-sm:w-5" }),
      keywords: ["check list", "todo list"],
      desc: "Track tasks with to-do list.",
      keyboardShortcut: SHORTCUTS.CHECK_LIST,
      onSelect: () => editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, void 0)
    }),
    new ComponentPickerOption("Quote", {
      icon: /* @__PURE__ */ React.createElement(QuoteIcon, { className: "w-9 h-9 max-sm:h-5 max-sm:w-5" }),
      keywords: ["block quote"],
      desc: "Capture Quote",
      keyboardShortcut: SHORTCUTS.QUOTE,
      onSelect: () => editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createQuoteNode());
        }
      })
    }),
    new ComponentPickerOption("Poll", {
      icon: /* @__PURE__ */ React.createElement(SquarePenIcon, { className: "w-9 h-9 max-sm:h-5 max-sm:w-5" }),
      keywords: ["poll", "vote", "survey"],
      desc: "Add poll to take people votes.",
      onSelect: () => editor.dispatchCommand(INSERT_POLL_COMMAND, "Type the Question")
    }),
    new ComponentPickerOption("Code", {
      icon: /* @__PURE__ */ React.createElement(Code2, { className: "w-9 h-9 max-sm:h-5 max-sm:w-5" }),
      keywords: ["javascript", "python", "js", "codeblock"],
      desc: "Add block of code.",
      keyboardShortcut: SHORTCUTS.CODE_BLOCK,
      onSelect: () => editor.update(() => {
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
      })
    }),
    new ComponentPickerOption("Divider", {
      icon: /* @__PURE__ */ React.createElement(Minus, { className: "w-9 h-9 max-sm:h-5 max-sm:w-5" }),
      keywords: ["horizontal rule", "divider", "hr"],
      desc: "Visually divide blocks",
      onSelect: () => editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, void 0)
    }),
    new ComponentPickerOption("Youtube", {
      icon: /* @__PURE__ */ React.createElement(Youtube, { className: "w-9 h-9 max-sm:h-5 max-sm:w-5" }),
      keywords: ["Youtube", "youtube", "video"],
      desc: "Embedded YouTube videos ",
      onSelect: () => {
        showModal(
          "Youtube",
          "Insert a URL to embed a live preview. Works with YouTube",
          (onClose) => /* @__PURE__ */ React.createElement(
            AutoEmbedDialog,
            {
              embedConfig: YoutubeEmbedConfig,
              onClose
            }
          ),
          true
        );
      }
    }),
    new ComponentPickerOption("Figma", {
      icon: /* @__PURE__ */ React.createElement(Figma, { className: "w-9 h-9 max-sm:h-5 max-sm:w-5" }),
      keywords: ["figma", "figma.com", "ui"],
      desc: "Embedded Figma File ",
      onSelect: () => {
        showModal(
          "Figma",
          "Insert a URL to embed a live preview. Works with Figma",
          (onClose) => /* @__PURE__ */ React.createElement(
            AutoEmbedDialog,
            {
              embedConfig: FigmaEmbedConfig,
              onClose
            }
          ),
          true
        );
      }
    }),
    new ComponentPickerOption("Twitter", {
      icon: /* @__PURE__ */ React.createElement(Twitter, { className: "w-9 h-9 max-sm:h-5 max-sm:w-5" }),
      keywords: ["Twitter", "tweet", "x", "twitter"],
      desc: "Embedded Tweets ",
      onSelect: () => {
        showModal(
          "Twitter tweet",
          "Insert a URL to embed a live preview. Works with Twitter",
          (onClose) => /* @__PURE__ */ React.createElement(
            AutoEmbedDialog,
            {
              embedConfig: TwitterEmbedConfig,
              onClose
            }
          ),
          true
        );
      }
    }),
    new ComponentPickerOption("Image", {
      icon: /* @__PURE__ */ React.createElement(ImageIcon, { className: "w-9 h-9 max-sm:h-5 max-sm:w-5" }),
      keywords: ["image", "photo", "picture", "file", "img"],
      desc: "Upload or embed with a link",
      onSelect: () => showModal(
        "Insert Image",
        "Please select an image to upload.",
        (onClose) => /* @__PURE__ */ React.createElement(
          React.Suspense,
          {
            fallback: /* @__PURE__ */ React.createElement(Skeleton, { className: "mx-2 w-[350px] h-[350px]" })
          },
          /* @__PURE__ */ React.createElement(InsertImageDialog, { activeEditor: editor, onClose })
        ),
        true
      )
    }),
    new ComponentPickerOption("Inline Image", {
      icon: /* @__PURE__ */ React.createElement(ImageIcon, { className: "w-9 h-9 max-sm:h-5 max-sm:w-5" }),
      keywords: ["image", "photo", "picture", "file", "img"],
      desc: "Upload or embed with a link",
      onSelect: () => showModal(
        "Insert Image",
        "Please select an image to upload.",
        (onClose) => /* @__PURE__ */ React.createElement(
          React.Suspense,
          {
            fallback: /* @__PURE__ */ React.createElement(Skeleton, { className: "mx-2 w-[350px] h-[350px]" })
          },
          /* @__PURE__ */ React.createElement(
            InsertInlineImageDialog,
            {
              activeEditor: editor,
              onClose
            }
          )
        ),
        true
      )
    }),
    new ComponentPickerOption("Equation", {
      icon: /* @__PURE__ */ React.createElement(SigmaIcon, { className: "w-4 h-4" }),
      keywords: ["equation", "latex", "math"],
      onSelect: () => showModal(
        "Insert Equation",
        "Insert mathematical equations using LaTeX syntax.",
        (onClose) => /* @__PURE__ */ React.createElement(
          React.Suspense,
          {
            fallback: /* @__PURE__ */ React.createElement(Skeleton, { className: "mx-2 w-[350px] h-[350px]" })
          },
          /* @__PURE__ */ React.createElement(
            InsertEquationDialog,
            {
              activeEditor: editor,
              onClose
            }
          )
        ),
        true
      )
    }),
    new ComponentPickerOption("Collapsible", {
      icon: /* @__PURE__ */ React.createElement(StepForward, { className: "w-9 h-9 max-sm:h-5 max-sm:w-5" }),
      keywords: ["collapse", "collapsible", "toggle"],
      desc: "Toggles can hide and show content inside.",
      onSelect: () => editor.dispatchCommand(INSERT_COLLAPSIBLE_COMMAND, void 0)
    }),
    new ComponentPickerOption("2 columns", {
      icon: /* @__PURE__ */ React.createElement(Columns2, { className: "w-9 h-9 max-sm:h-5 max-sm:w-5" }),
      keywords: ["columns", "flex", "row", "layout", "grid"],
      desc: "Dvide your content into 2 container.",
      onSelect: () => editor.dispatchCommand(INSERT_LAYOUT_COMMAND, "1fr 1fr")
    }),
    new ComponentPickerOption("3 columns", {
      icon: /* @__PURE__ */ React.createElement(Columns3, { className: "w-9 h-9 max-sm:h-5 max-sm:w-5" }),
      keywords: ["3columns", "3", "flex", "row", "layout", "grid"],
      desc: "Dvide your content into 3 container.",
      onSelect: () => editor.dispatchCommand(INSERT_LAYOUT_COMMAND, "1fr 1fr 1fr")
    }),
    new ComponentPickerOption("Stepper", {
      icon: /* @__PURE__ */ React.createElement("svg", { className: "w-9 h-9 max-sm:h-5 max-sm:w-5", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24" }, /* @__PURE__ */ React.createElement("g", { fill: "none", fillRule: "evenodd" }, /* @__PURE__ */ React.createElement("path", { d: "m12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036q-.016-.004-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z" }), /* @__PURE__ */ React.createElement("path", { fill: "currentColor", d: "M5 6a3 3 0 0 1 6 0v2a3 3 0 0 1-6 0zm3-1a1 1 0 0 0-1 1v2a1 1 0 0 0 2 0V6a1 1 0 0 0-1-1m9.707-.707a1 1 0 0 0-1.414 0L13.465 7.12a1 1 0 0 0 1.414 1.415L16 7.414V20a1 1 0 1 0 2 0V7.414l1.121 1.122a1 1 0 1 0 1.415-1.415zM5 15a3 3 0 0 1 5.995-.176l.005.186c0 .408-.039.799-.107 1.171c-.264 1.433-.964 2.58-1.57 3.352c-.307.39-.598.694-.815.904c-.124.12-.25.238-.385.345a1 1 0 0 1-1.34-1.479L7.118 19l.224-.228A7 7 0 0 0 7.971 18A3 3 0 0 1 5 15m3-1a1 1 0 1 0 0 2a1 1 0 0 0 0-2" }))),
      keywords: ["stpper", "step", "lines", "routes", "docs", "number"],
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
          content: newEditor
        };
        editor.dispatchCommand(INSERT_STEPPER_COMMAND, [newStep]);
      }
    }),
    new ComponentPickerOption("Gifs", {
      icon: /* @__PURE__ */ React.createElement(ImagePlayIcon, { className: "w-9 h-9 max-sm:h-5 max-sm:w-5" }),
      keywords: ["gif", "gifs", "videos", "short video"],
      desc: "Insert a GIF video",
      onSelect: () => {
        showModal(
          "Insert GIF",
          "Please select a GIF to upload.",
          (onClose) => /* @__PURE__ */ React.createElement(
            React.Suspense,
            {
              fallback: /* @__PURE__ */ React.createElement(Skeleton, { className: "mx-2 w-[400px] h-[400px]" })
            },
            /* @__PURE__ */ React.createElement(
              InsertGif,
              {
                insertGifOnClick: (payload) => {
                  editor.dispatchCommand(INSERT_IMAGE_COMMAND, payload);
                },
                onClose
              }
            )
          ),
          true
        );
      }
    }),
    new ComponentPickerOption("Interactive Story", {
      icon: /* @__PURE__ */ React.createElement(GitBranch, { className: "w-9 h-9 max-sm:h-5 max-sm:w-5" }),
      keywords: ["story", "interactive", "branching", "narrative", "choose", "adventure"],
      desc: "Create branching narratives with reader choices",
      onSelect: () => editor.dispatchCommand(INSERT_STORY_BUILDER_COMMAND, {
        nodes: [],
        currentNodeId: "",
        title: "Interactive Story"
      })
    }),
    new ComponentPickerOption("Dynamic Block", {
      icon: /* @__PURE__ */ React.createElement(Zap, { className: "w-9 h-9 max-sm:h-5 max-sm:w-5" }),
      keywords: ["dynamic", "interactive", "content", "block", "trigger", "animation", "responsive"],
      desc: "Create interactive content that responds to user actions",
      onSelect: () => editor.dispatchCommand(INSERT_DYNAMIC_BLOCK_COMMAND, createDefaultDynamicBlock())
    }),
    new ComponentPickerOption("4 columns", {
      icon: /* @__PURE__ */ React.createElement(Columns4, { className: "w-9 h-9 max-sm:h-5 max-sm:w-5" }),
      keywords: ["4columns", "4", "flex", "row", "layout", "grid"],
      desc: "Dvide your content into 4 container.",
      onSelect: () => editor.dispatchCommand(INSERT_LAYOUT_COMMAND, "1fr 1fr 1fr 1fr")
    })
  ];
}
function SlashCommand() {
  const [editor] = useLexicalComposerContext();
  const [Modal, showModal] = useModal();
  const [queryString, setQueryString] = useState(null);
  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch("/", {
    minLength: 0
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
        (option) => regex.test(option.title) || option.keywords.some((keyword) => regex.test(keyword))
      )
    ];
  }, [editor, queryString]);
  const onSelectOption = useCallback(
    (selectedOption, nodeToRemove, closeMenu, matchingString) => {
      editor.update(() => {
        nodeToRemove == null ? void 0 : nodeToRemove.remove();
        selectedOption.onSelect(matchingString);
        closeMenu();
      });
    },
    [editor, showModal]
  );
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
    LexicalTypeaheadMenuPlugin,
    {
      onQueryChange: setQueryString,
      onSelectOption,
      triggerFn: checkForTriggerMatch,
      options,
      menuRenderFn: (anchorElementRef, { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }) => anchorElementRef.current && options.length ? ReactDOM.createPortal(
        /* @__PURE__ */ React.createElement(
          "div",
          {
            id: "toolbar",
            className: "overflow-x-hidden z-[100] relative max-w-[300px] max-sm:w-[200px] w-[300px] max-h-[300px] h-fit border rounded-sm bg-white/80 dark:bg-[#020b19]/95 shadow-sm shadow-muted-foreground/20"
          },
          /* @__PURE__ */ React.createElement(Command, null, /* @__PURE__ */ React.createElement(CommandInput, { placeholder: "Type a command" }), /* @__PURE__ */ React.createElement(CommandList, null, /* @__PURE__ */ React.createElement(CommandEmpty, null, "No results found."), options.map((option, i) => /* @__PURE__ */ React.createElement(
            CommandItem,
            {
              ref: option.ref,
              className: cn(
                selectedIndex === i ? "bg-gray-200 dark:bg-gray-700" : "hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer rounded-sm gap-x-2 relative h-full border-0 transition-colors items-start"
              ),
              onSelect: () => {
                setHighlightedIndex(i);
                selectOptionAndCleanUp(option);
              },
              onMouseEnter: () => {
                setHighlightedIndex(i);
              },
              key: option.key
            },
            /* @__PURE__ */ React.createElement("div", { className: "p-4 h-full  bg-gray-400/60  dark:bg-gray-300/10 rounded-sm" }, option.icon),
            /* @__PURE__ */ React.createElement("div", { className: "flex flex-row justify-between items-center" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-center items-start flex-col" }, /* @__PURE__ */ React.createElement("div", null, option.title), /* @__PURE__ */ React.createElement("span", { className: "text-sm text-muted-foreground break-words" }, option.desc)), option.keyboardShortcut && /* @__PURE__ */ React.createElement(CommandShortcut, { className: "absolute top-1 right-2" }, option.keyboardShortcut))
          ))))
        ),
        anchorElementRef.current
      ) : null
    }
  ), Modal);
}

export {
  SlashCommand
};
