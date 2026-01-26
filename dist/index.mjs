import {
  SpeechToTextPlugin_default
} from "./chunk-77UA6HYR.mjs";
import {
  CodeHighlightPlugin,
  LexicalAutoLinkPlugin,
  LinkWithMetaDataPlugin,
  nodes_default
} from "./chunk-4GFXER7R.mjs";
import {
  Progress,
  UploadProvider,
  useUpload
} from "./chunk-JXDPPUJI.mjs";
import {
  DynamicBlockPlugin,
  EquationsPlugin,
  InlineImagePlugin,
  StoryBuilderPlugin
} from "./chunk-DSFQHA7I.mjs";
import {
  PollPlugin
} from "./chunk-U47ABU5Z.mjs";
import {
  AutoEmbedPlugin,
  CollapsiblePlugin,
  FigmaPlugin,
  LayoutPlugin,
  TwitterPlugin,
  YouTubePlugin
} from "./chunk-AMMKBSST.mjs";
import "./chunk-5QSNIVIG.mjs";
import {
  INSERT_IMAGE_COMMAND,
  ImagesPlugin
} from "./chunk-LGG4IUIA.mjs";
import "./chunk-5BAKY5KN.mjs";
import {
  AIProvider,
  useAI
} from "./chunk-YUDCJRJM.mjs";
import {
  StepperPlugin
} from "./chunk-NZXC6FGU.mjs";
import "./chunk-GXYD4VZM.mjs";
import {
  CAN_USE_DOM,
  isCapitalize,
  isCenterAlign,
  isClearFormatting,
  isDecreaseFontSize,
  isFormatBulletList,
  isFormatCheckList,
  isFormatCode,
  isFormatHeading,
  isFormatNumberedList,
  isFormatParagraph,
  isFormatQuote,
  isIncreaseFontSize,
  isIndent,
  isInsertCodeBlock,
  isInsertLink,
  isJustifyAlign,
  isLeftAlign,
  isLowercase,
  isOutdent,
  isRightAlign,
  isStrikeThrough,
  isSubscript,
  isSuperscript,
  isUppercase
} from "./chunk-ZB5LZQKC.mjs";
import {
  clearFormatting,
  formatBulletList,
  formatCheckList,
  formatCode,
  formatHeading,
  formatNumberedList,
  formatParagraph,
  formatQuote,
  updateFontSize
} from "./chunk-PZSUSXQG.mjs";
import {
  DEFAULT_FONT_SIZE,
  MAX_ALLOWED_FONT_SIZE,
  MIN_ALLOWED_FONT_SIZE,
  ToolbarContext,
  blockTypeToBlockName,
  useToolbarState
} from "./chunk-7NZAPJ4G.mjs";
import {
  SharedHistoryContext,
  useSharedHistoryContext
} from "./chunk-4EXYCTGJ.mjs";
import "./chunk-N3WN46VL.mjs";
import "./chunk-QEIFVK5M.mjs";
import "./chunk-GZPNVR7L.mjs";
import {
  HintPlugin
} from "./chunk-G53GLEAY.mjs";
import "./chunk-YPHOEJ46.mjs";
import {
  sanitizeUrl
} from "./chunk-4VWFVWYP.mjs";
import "./chunk-HJPPNHYM.mjs";
import "./chunk-3JVFG7ER.mjs";
import "./chunk-4MEDW3T6.mjs";
import {
  Badge
} from "./chunk-FSM26655.mjs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "./chunk-3G37YKTV.mjs";
import "./chunk-POGRR73N.mjs";
import {
  Button
} from "./chunk-BIU7WTLX.mjs";
import {
  cn
} from "./chunk-YHPNOWFH.mjs";
import {
  React,
  __spreadProps,
  __spreadValues,
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/index.ts
init_react_shim();

// src/components/editor/index.tsx
init_react_shim();
import React3 from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";

// src/components/editor/themes/editor-theme.ts
init_react_shim();
var theme = {
  code: `
  bg-[#e1e1e1] dark:bg-[#1a1a1a] m-0  text-sm  
  overflow-auto relative pl-[52px]  p-3 font-mono group 
  rounded-sm  w-full h-fit block  line-code
  `,
  codeHighlight: {
    atrule: "PlaygroundEditorTheme__tokenAttr",
    attr: "PlaygroundEditorTheme__tokenAttr",
    boolean: "PlaygroundEditorTheme__tokenProperty",
    builtin: "PlaygroundEditorTheme__tokenSelector",
    cdata: "PlaygroundEditorTheme__tokenComment",
    char: "PlaygroundEditorTheme__tokenSelector",
    class: "PlaygroundEditorTheme__tokenFunction",
    "class-name": "PlaygroundEditorTheme__tokenFunction",
    comment: "PlaygroundEditorTheme__tokenComment",
    constant: "PlaygroundEditorTheme__tokenProperty",
    deleted: "PlaygroundEditorTheme__tokenProperty",
    doctype: "PlaygroundEditorTheme__tokenComment",
    entity: "PlaygroundEditorTheme__tokenOperator",
    function: "PlaygroundEditorTheme__tokenFunction",
    important: "PlaygroundEditorTheme__tokenVariable",
    inserted: "PlaygroundEditorTheme__tokenSelector",
    keyword: "PlaygroundEditorTheme__tokenAttr",
    namespace: "PlaygroundEditorTheme__tokenVariable",
    number: "PlaygroundEditorTheme__tokenProperty",
    operator: "PlaygroundEditorTheme__tokenOperator",
    prolog: "PlaygroundEditorTheme__tokenComment",
    property: "PlaygroundEditorTheme__tokenProperty",
    punctuation: "PlaygroundEditorTheme__tokenPunctuation",
    regex: "PlaygroundEditorTheme__tokenVariable",
    selector: "PlaygroundEditorTheme__tokenSelector",
    string: "PlaygroundEditorTheme__tokenSelector",
    symbol: "PlaygroundEditorTheme__tokenProperty",
    tag: "PlaygroundEditorTheme__tokenProperty",
    url: "PlaygroundEditorTheme__tokenOperator",
    variable: "PlaygroundEditorTheme__tokenVariable"
  },
  embedBlock: {
    base: "PlaygroundEditorTheme__embedBlock",
    focus: "PlaygroundEditorTheme__embedBlockFocus"
  },
  list: {
    checklist: "PlaygroundEditorTheme__checklist",
    listitem: "PlaygroundEditorTheme__listItem",
    listitemChecked: "PlaygroundEditorTheme__listItemChecked",
    listitemUnchecked: "PlaygroundEditorTheme__listItemUnchecked",
    nested: {
      listitem: "PlaygroundEditorTheme__nestedListItem"
    },
    olDepth: [
      "PlaygroundEditorTheme__ol1 ",
      "PlaygroundEditorTheme__ol2",
      "PlaygroundEditorTheme__ol3",
      "PlaygroundEditorTheme__ol4",
      "PlaygroundEditorTheme__ol5"
    ],
    ulDepth: [
      "PlaygroundEditorTheme__ul1",
      "PlaygroundEditorTheme__ul2",
      "PlaygroundEditorTheme__ul3",
      "PlaygroundEditorTheme__ul4",
      "PlaygroundEditorTheme__ul5"
    ],
    ul: "ul",
    ol: "ol"
  },
  paragraph: "leading-7",
  link: `underline cursor-pointer text-blue-600 after:content-['_\u2197']`,
  hr: "w-full h-1  border-input",
  table: "PlaygroundEditorTheme__table",
  tableCell: "PlaygroundEditorTheme__tableCell",
  tableCellActionButton: "PlaygroundEditorTheme__tableCellActionButton",
  tableCellActionButtonContainer: "PlaygroundEditorTheme__tableCellActionButtonContainer",
  tableCellHeader: "PlaygroundEditorTheme__tableCellHeader",
  tableCellResizer: "PlaygroundEditorTheme__tableCellResizer",
  tableCellSelected: "PlaygroundEditorTheme__tableCellSelected",
  tableRowStriping: "PlaygroundEditorTheme__tableRowStriping",
  tableScrollableWrapper: "PlaygroundEditorTheme__tableScrollableWrapper",
  tableSelected: "PlaygroundEditorTheme__tableSelected",
  tableSelection: "PlaygroundEditorTheme__tableSelection",
  layoutContainer: "grid gap-[10px] my-[10px] ",
  layoutItem: "px-2 py-[16px] border dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 border border-zinc-200 bg-white/90 shadow-md  rounded-sm",
  heading: {
    h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
    h2: "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
    h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
    h4: "scroll-m-20 text-xl font-semibold tracking-tight",
    h5: "text-lg font-bold",
    h6: "text-sm font-bold"
  },
  quote: "mt-6 border-l-[4px] pl-6 italic",
  text: {
    bold: "font-bold",
    capitalize: "capitalize",
    code: "inline-flex items-center rounded-sm border border-zinc-200 px-0.1 py-0  h-fit min-h-[20px] transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:border-zinc-800 dark:focus:ring-zinc-300 border-transparent bg-zinc-100 text-zinc-900 hover:bg-zinc-100/80 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-800/80",
    italic: "italic ",
    lowercase: "lowercase",
    strikethrough: "line-through",
    underline: "underline",
    underlineStrikethrough: "underline line-through",
    uppercase: "uppercase"
  }
};
var editor_theme_default = theme;

// src/components/editor/Core.tsx
init_react_shim();
import { useCallback as useCallback2, useEffect as useEffect7, useState as useState3 } from "react";
import { useLexicalEditable as useLexicalEditable2 } from "@lexical/react/useLexicalEditable";
import { useLexicalComposerContext as useLexicalComposerContext6 } from "@lexical/react/LexicalComposerContext";
import dynamic from "next/dynamic.js";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";

// src/components/editor/plugins/ShortcutsPlugin/index.tsx
init_react_shim();
import { TOGGLE_LINK_COMMAND } from "@lexical/link";
import {
  COMMAND_PRIORITY_NORMAL,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  INDENT_CONTENT_COMMAND,
  KEY_MODIFIER_COMMAND,
  OUTDENT_CONTENT_COMMAND
} from "lexical";
import { useEffect } from "react";
function ShortcutsPlugin({
  editor,
  setIsLinkEditMode
}) {
  const { toolbarState } = useToolbarState();
  useEffect(() => {
    const keyboardShortcutsHandler = (payload) => {
      const event = payload;
      if (isFormatParagraph(event)) {
        event.preventDefault();
        formatParagraph(editor);
      } else if (isFormatHeading(event)) {
        event.preventDefault();
        const { code } = event;
        const headingSize = `h${code[code.length - 1]}`;
        formatHeading(editor, toolbarState.blockType, headingSize);
      } else if (isFormatBulletList(event)) {
        event.preventDefault();
        formatBulletList(editor, toolbarState.blockType);
      } else if (isFormatNumberedList(event)) {
        event.preventDefault();
        formatNumberedList(editor, toolbarState.blockType);
      } else if (isFormatCheckList(event)) {
        event.preventDefault();
        formatCheckList(editor, toolbarState.blockType);
      } else if (isFormatCode(event)) {
        event.preventDefault();
        formatCode(editor, toolbarState.blockType);
      } else if (isFormatQuote(event)) {
        event.preventDefault();
        formatQuote(editor, toolbarState.blockType);
      } else if (isStrikeThrough(event)) {
        event.preventDefault();
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
      } else if (isLowercase(event)) {
        event.preventDefault();
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, "lowercase");
      } else if (isUppercase(event)) {
        event.preventDefault();
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, "uppercase");
      } else if (isCapitalize(event)) {
        event.preventDefault();
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, "capitalize");
      } else if (isIndent(event)) {
        event.preventDefault();
        editor.dispatchCommand(INDENT_CONTENT_COMMAND, void 0);
      } else if (isOutdent(event)) {
        event.preventDefault();
        editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, void 0);
      } else if (isCenterAlign(event)) {
        event.preventDefault();
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
      } else if (isLeftAlign(event)) {
        event.preventDefault();
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
      } else if (isRightAlign(event)) {
        event.preventDefault();
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
      } else if (isJustifyAlign(event)) {
        event.preventDefault();
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify");
      } else if (isSubscript(event)) {
        event.preventDefault();
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, "subscript");
      } else if (isSuperscript(event)) {
        event.preventDefault();
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, "superscript");
      } else if (isInsertCodeBlock(event)) {
        event.preventDefault();
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code");
      } else if (isIncreaseFontSize(event)) {
        event.preventDefault();
        updateFontSize(
          editor,
          1 /* increment */,
          toolbarState.fontSizeInputValue
        );
      } else if (isDecreaseFontSize(event)) {
        event.preventDefault();
        updateFontSize(
          editor,
          2 /* decrement */,
          toolbarState.fontSizeInputValue
        );
      } else if (isClearFormatting(event)) {
        event.preventDefault();
        clearFormatting(editor);
      } else if (isInsertLink(event)) {
        event.preventDefault();
        const url = toolbarState.isLink ? null : sanitizeUrl("https://");
        setIsLinkEditMode(!toolbarState.isLink);
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
      }
      return false;
    };
    return editor.registerCommand(
      KEY_MODIFIER_COMMAND,
      keyboardShortcutsHandler,
      COMMAND_PRIORITY_NORMAL
    );
  }, [
    editor,
    toolbarState.isLink,
    toolbarState.blockType,
    toolbarState.fontSizeInputValue,
    setIsLinkEditMode
  ]);
  return null;
}

// src/components/editor/plugins/TabFocusPlugin/index.ts
init_react_shim();
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  $setSelection,
  FOCUS_COMMAND
} from "lexical";
import { useEffect as useEffect2 } from "react";
var COMMAND_PRIORITY_LOW = 1;
var TAB_TO_FOCUS_INTERVAL = 100;
var lastTabKeyDownTimestamp = 0;
var hasRegisteredKeyDownListener = false;
function registerKeyTimeStampTracker() {
  window.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Tab") {
        lastTabKeyDownTimestamp = event.timeStamp;
      }
    },
    true
  );
}
function TabFocusPlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect2(() => {
    if (!hasRegisteredKeyDownListener) {
      registerKeyTimeStampTracker();
      hasRegisteredKeyDownListener = true;
    }
    return editor.registerCommand(
      FOCUS_COMMAND,
      (event) => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          if (lastTabKeyDownTimestamp + TAB_TO_FOCUS_INTERVAL > event.timeStamp) {
            $setSelection(selection.clone());
          }
        }
        return false;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor]);
  return null;
}

// src/components/editor/plugins/TableCellResizer/index.tsx
init_react_shim();
import { useLexicalComposerContext as useLexicalComposerContext2 } from "@lexical/react/LexicalComposerContext";
import { useLexicalEditable } from "@lexical/react/useLexicalEditable";
import {
  $computeTableMapSkipCellCheck,
  $getTableNodeFromLexicalNodeOrThrow,
  $getTableRowIndexFromTableCellNode,
  $isTableCellNode,
  $isTableRowNode,
  getDOMCellFromTarget,
  getTableElement,
  TableNode
} from "@lexical/table";
import { calculateZoomLevel } from "@lexical/utils";
import { $getNearestNodeFromDOMNode, isHTMLElement } from "lexical";
import * as React2 from "react";
import {
  useCallback,
  useEffect as useEffect3,
  useMemo,
  useRef,
  useState
} from "react";
import { createPortal } from "react-dom";
var MIN_ROW_HEIGHT = 33;
var MIN_COLUMN_WIDTH = 92;
function TableCellResizer({ editor }) {
  const targetRef = useRef(null);
  const resizerRef = useRef(null);
  const tableRectRef = useRef(null);
  const mouseStartPosRef = useRef(null);
  const [mouseCurrentPos, updateMouseCurrentPos] = useState(null);
  const [activeCell, updateActiveCell] = useState(null);
  const [isMouseDown, updateIsMouseDown] = useState(false);
  const [draggingDirection, updateDraggingDirection] = useState(null);
  const resetState = useCallback(() => {
    updateActiveCell(null);
    targetRef.current = null;
    updateDraggingDirection(null);
    mouseStartPosRef.current = null;
    tableRectRef.current = null;
  }, []);
  const isMouseDownOnEvent = (event) => {
    return (event.buttons & 1) === 1;
  };
  useEffect3(() => {
    return editor.registerNodeTransform(TableNode, (tableNode) => {
      if (tableNode.getColWidths()) {
        return tableNode;
      }
      const numColumns = tableNode.getColumnCount();
      const columnWidth = MIN_COLUMN_WIDTH;
      tableNode.setColWidths(Array(numColumns).fill(columnWidth));
      return tableNode;
    });
  }, [editor]);
  useEffect3(() => {
    const onMouseMove = (event) => {
      const target = event.target;
      if (!isHTMLElement(target)) {
        return;
      }
      if (draggingDirection) {
        updateMouseCurrentPos({
          x: event.clientX,
          y: event.clientY
        });
        return;
      }
      updateIsMouseDown(isMouseDownOnEvent(event));
      if (resizerRef.current && resizerRef.current.contains(target)) {
        return;
      }
      if (targetRef.current !== target) {
        targetRef.current = target;
        const cell = getDOMCellFromTarget(target);
        if (cell && activeCell !== cell) {
          editor.getEditorState().read(
            () => {
              const tableCellNode = $getNearestNodeFromDOMNode(cell.elem);
              if (!tableCellNode) {
                throw new Error("TableCellResizer: Table cell node not found.");
              }
              const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);
              const tableElement = getTableElement(
                tableNode,
                editor.getElementByKey(tableNode.getKey())
              );
              if (!tableElement) {
                throw new Error("TableCellResizer: Table element not found.");
              }
              targetRef.current = target;
              tableRectRef.current = tableElement.getBoundingClientRect();
              updateActiveCell(cell);
            },
            { editor }
          );
        } else if (cell == null) {
          resetState();
        }
      }
    };
    const onMouseDown = () => {
      updateIsMouseDown(true);
    };
    const onMouseUp = () => {
      updateIsMouseDown(false);
    };
    const removeRootListener = editor.registerRootListener(
      (rootElement, prevRootElement) => {
        prevRootElement == null ? void 0 : prevRootElement.removeEventListener("mousemove", onMouseMove);
        prevRootElement == null ? void 0 : prevRootElement.removeEventListener("mousedown", onMouseDown);
        prevRootElement == null ? void 0 : prevRootElement.removeEventListener("mouseup", onMouseUp);
        rootElement == null ? void 0 : rootElement.addEventListener("mousemove", onMouseMove);
        rootElement == null ? void 0 : rootElement.addEventListener("mousedown", onMouseDown);
        rootElement == null ? void 0 : rootElement.addEventListener("mouseup", onMouseUp);
      }
    );
    return () => {
      removeRootListener();
    };
  }, [activeCell, draggingDirection, editor, resetState]);
  const isHeightChanging = (direction) => {
    if (direction === "bottom") {
      return true;
    }
    return false;
  };
  const updateRowHeight = useCallback(
    (heightChange) => {
      if (!activeCell) {
        throw new Error("TableCellResizer: Expected active cell.");
      }
      editor.update(
        () => {
          const tableCellNode = $getNearestNodeFromDOMNode(activeCell.elem);
          if (!$isTableCellNode(tableCellNode)) {
            throw new Error("TableCellResizer: Table cell node not found.");
          }
          const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);
          const tableRowIndex = $getTableRowIndexFromTableCellNode(tableCellNode) + tableCellNode.getRowSpan() - 1;
          const tableRows = tableNode.getChildren();
          if (tableRowIndex >= tableRows.length || tableRowIndex < 0) {
            throw new Error("Expected table cell to be inside of table row.");
          }
          const tableRow = tableRows[tableRowIndex];
          if (!$isTableRowNode(tableRow)) {
            throw new Error("Expected table row");
          }
          let height = tableRow.getHeight();
          if (height === void 0) {
            const rowCells = tableRow.getChildren();
            height = Math.min(
              ...rowCells.map(
                (cell) => {
                  var _a;
                  return (_a = getCellNodeHeight(cell, editor)) != null ? _a : Infinity;
                }
              )
            );
          }
          const newHeight = Math.max(height + heightChange, MIN_ROW_HEIGHT);
          tableRow.setHeight(newHeight);
        },
        { tag: "skip-scroll-into-view" }
      );
    },
    [activeCell, editor]
  );
  const getCellNodeHeight = (cell, activeEditor) => {
    const domCellNode = activeEditor.getElementByKey(cell.getKey());
    return domCellNode == null ? void 0 : domCellNode.clientHeight;
  };
  const getCellColumnIndex = (tableCellNode, tableMap) => {
    for (let row = 0; row < tableMap.length; row++) {
      for (let column = 0; column < tableMap[row].length; column++) {
        if (tableMap[row][column].cell === tableCellNode) {
          return column;
        }
      }
    }
  };
  const updateColumnWidth = useCallback(
    (widthChange) => {
      if (!activeCell) {
        throw new Error("TableCellResizer: Expected active cell.");
      }
      editor.update(
        () => {
          const tableCellNode = $getNearestNodeFromDOMNode(activeCell.elem);
          if (!$isTableCellNode(tableCellNode)) {
            throw new Error("TableCellResizer: Table cell node not found.");
          }
          const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);
          const [tableMap] = $computeTableMapSkipCellCheck(
            tableNode,
            null,
            null
          );
          const columnIndex = getCellColumnIndex(tableCellNode, tableMap);
          if (columnIndex === void 0) {
            throw new Error("TableCellResizer: Table column not found.");
          }
          const colWidths = tableNode.getColWidths();
          if (!colWidths) {
            return;
          }
          const width = colWidths[columnIndex];
          if (width === void 0) {
            return;
          }
          const newColWidths = [...colWidths];
          const newWidth = Math.max(width + widthChange, MIN_COLUMN_WIDTH);
          newColWidths[columnIndex] = newWidth;
          tableNode.setColWidths(newColWidths);
        },
        { tag: "skip-scroll-into-view" }
      );
    },
    [activeCell, editor]
  );
  const mouseUpHandler = useCallback(
    (direction) => {
      const handler = (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!activeCell) {
          throw new Error("TableCellResizer: Expected active cell.");
        }
        if (mouseStartPosRef.current) {
          const { x, y } = mouseStartPosRef.current;
          if (activeCell === null) {
            return;
          }
          const zoom = calculateZoomLevel(event.target);
          if (isHeightChanging(direction)) {
            const heightChange = (event.clientY - y) / zoom;
            updateRowHeight(heightChange);
          } else {
            const widthChange = (event.clientX - x) / zoom;
            updateColumnWidth(widthChange);
          }
          resetState();
          document.removeEventListener("mouseup", handler);
        }
      };
      return handler;
    },
    [activeCell, resetState, updateColumnWidth, updateRowHeight]
  );
  const toggleResize = useCallback(
    (direction) => (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!activeCell) {
        throw new Error("TableCellResizer: Expected active cell.");
      }
      mouseStartPosRef.current = {
        x: event.clientX,
        y: event.clientY
      };
      updateMouseCurrentPos(mouseStartPosRef.current);
      updateDraggingDirection(direction);
      document.addEventListener("mouseup", mouseUpHandler(direction));
    },
    [activeCell, mouseUpHandler]
  );
  const getResizers = useCallback(() => {
    if (activeCell) {
      const { height, width, top, left } = activeCell.elem.getBoundingClientRect();
      const zoom = calculateZoomLevel(activeCell.elem);
      const zoneWidth = 10;
      const styles = {
        bottom: {
          backgroundColor: "none",
          "zIndex": "10",
          cursor: "row-resize",
          height: `${zoneWidth}px`,
          left: `${window.pageXOffset + left}px`,
          top: `${window.pageYOffset + top + height - zoneWidth / 2}px`,
          width: `${width}px`
        },
        right: {
          backgroundColor: "none",
          "zIndex": "10",
          cursor: "col-resize",
          height: `${height}px`,
          left: `${window.pageXOffset + left + width - zoneWidth / 2}px`,
          top: `${window.pageYOffset + top}px`,
          width: `${zoneWidth}px`
        }
      };
      const tableRect = tableRectRef.current;
      if (draggingDirection && mouseCurrentPos && tableRect) {
        if (isHeightChanging(draggingDirection)) {
          styles[draggingDirection].left = `${window.pageXOffset + tableRect.left}px`;
          styles[draggingDirection].top = `${window.pageYOffset + mouseCurrentPos.y / zoom}px`;
          styles[draggingDirection].height = "3px";
          styles[draggingDirection].width = `${tableRect.width}px`;
        } else {
          styles[draggingDirection].top = `${window.pageYOffset + tableRect.top}px`;
          styles[draggingDirection].left = `${window.pageXOffset + mouseCurrentPos.x / zoom}px`;
          styles[draggingDirection].width = "3px";
          styles[draggingDirection].height = `${tableRect.height}px`;
        }
        styles[draggingDirection].backgroundColor = "#adf";
      }
      return styles;
    }
    return {
      bottom: null,
      left: null,
      right: null,
      top: null
    };
  }, [activeCell, draggingDirection, mouseCurrentPos]);
  const resizerStyles = getResizers();
  return /* @__PURE__ */ React2.createElement("div", { ref: resizerRef }, activeCell != null && !isMouseDown && /* @__PURE__ */ React2.createElement(React2.Fragment, null, /* @__PURE__ */ React2.createElement(
    "div",
    {
      className: " absolute TableCellResizer__ui",
      style: resizerStyles.right || void 0,
      onMouseDown: toggleResize("right")
    }
  ), /* @__PURE__ */ React2.createElement(
    "div",
    {
      className: "absolute  TableCellResizer__ui",
      style: resizerStyles.bottom || void 0,
      onMouseDown: toggleResize("bottom")
    }
  )));
}
function TableCellResizerPlugin() {
  const [editor] = useLexicalComposerContext2();
  const isEditable = useLexicalEditable();
  const [mounted, setMounted] = useState(false);
  useEffect3(() => {
    setMounted(true);
  }, []);
  const portal = useMemo(() => {
    if (!mounted || !isEditable) return null;
    return createPortal(/* @__PURE__ */ React2.createElement(TableCellResizer, { editor }), document.body);
  }, [mounted, isEditable, editor]);
  return portal;
}

// src/components/editor/Core.tsx
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";

// src/components/editor/plugins/DragDropPastePlugin/index.tsx
init_react_shim();
import { useLexicalComposerContext as useLexicalComposerContext3 } from "@lexical/react/LexicalComposerContext";
import { DRAG_DROP_PASTE } from "@lexical/rich-text";
import { isMimeType, mediaFileReader } from "@lexical/utils";
import { COMMAND_PRIORITY_LOW as COMMAND_PRIORITY_LOW2 } from "lexical";
import { useEffect as useEffect4 } from "react";
var ACCEPTABLE_IMAGE_TYPES = [
  "image/",
  "image/heic",
  "image/heif",
  "image/gif",
  "image/webp"
];
function DragDropPaste() {
  const [editor] = useLexicalComposerContext3();
  useEffect4(() => {
    return editor.registerCommand(
      DRAG_DROP_PASTE,
      (files) => {
        (async () => {
          const filesResult = await mediaFileReader(
            files,
            [ACCEPTABLE_IMAGE_TYPES].flatMap((x) => x)
          );
          for (const { file, result } of filesResult) {
            if (isMimeType(file, ACCEPTABLE_IMAGE_TYPES)) {
              editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                altText: file.name,
                src: result
              });
            }
          }
        })();
        return true;
      },
      COMMAND_PRIORITY_LOW2
    );
  }, [editor]);
  return null;
}

// src/components/editor/plugins/DraggableBlockPlugin/index.tsx
init_react_shim();
import { DraggableBlockPlugin_EXPERIMENTAL } from "@lexical/react/LexicalDraggableBlockPlugin";
import { useRef as useRef2 } from "react";
var DRAGGABLE_BLOCK_MENU_CLASSNAME = "draggable-block-menu";
function DraggableBlockPlugin({
  anchorElem = document.body,
  className
}) {
  const menuRef = useRef2(null);
  const targetLineRef = useRef2(null);
  const isOnMenu = (element) => {
    return !!element.closest(`.${DRAGGABLE_BLOCK_MENU_CLASSNAME}`);
  };
  return /* @__PURE__ */ React.createElement(
    DraggableBlockPlugin_EXPERIMENTAL,
    {
      anchorElem,
      menuRef,
      targetLineRef,
      menuComponent: /* @__PURE__ */ React.createElement("div", { ref: menuRef, className: cn("draggable-block-menu  transition-all  z-50 absolute top-0 left-0", className) }, /* @__PURE__ */ React.createElement(
        "svg",
        {
          xmlns: "http://www.w3.org/2000/svg",
          className: "w-4 cursor-move rounded-sm h-4 z-50",
          "data-name": "Layer 1",
          viewBox: "0 0 24 24",
          fill: "currentColor"
        },
        /* @__PURE__ */ React.createElement("path", { stroke: "currentColor", d: "M8.5 10a2 2 0 1 0 2 2 2 2 0 0 0-2-2Zm0 7a2 2 0 1 0 2 2 2 2 0 0 0-2-2Zm7-10a2 2 0 1 0-2-2 2 2 0 0 0 2 2Zm-7-4a2 2 0 1 0 2 2 2 2 0 0 0-2-2Zm7 14a2 2 0 1 0 2 2 2 2 0 0 0-2-2Zm0-7a2 2 0 1 0 2 2 2 2 0 0 0-2-2Z" })
      )),
      targetLineComponent: /* @__PURE__ */ React.createElement(
        "div",
        {
          ref: targetLineRef,
          className: "cursor-none bg-sky-600 h-1 absolute left-0 top-0 opacity-0 will-change-transform"
        }
      ),
      isOnMenu
    }
  );
}

// src/components/editor/Core.tsx
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { ClickableLinkPlugin } from "@lexical/react/LexicalClickableLinkPlugin";

// src/components/editor/lexical-on-change.tsx
init_react_shim();
import { useLexicalComposerContext as useLexicalComposerContext4 } from "@lexical/react/LexicalComposerContext";

// src/components/editor/utils/useLayoutEffect.ts
init_react_shim();
import { useEffect as useEffect5, useLayoutEffect } from "react";
var useLayoutEffectImpl = CAN_USE_DOM ? useLayoutEffect : useEffect5;
var useLayoutEffect_default = useLayoutEffectImpl;

// src/components/editor/utils/setNodePlaceholderFromSelection/setNodePlaceholderFromSelection.ts
init_react_shim();
import { $getSelection as $getSelection2, $isRangeSelection as $isRangeSelection2 } from "lexical";

// src/components/editor/utils/setNodePlaceholderFromSelection/setPlaceholderOnSelection.ts
init_react_shim();

// src/components/editor/utils/getAllLexicalChildren.ts
init_react_shim();
import { $getNodeByKey, $getRoot } from "lexical";
var getAllLexicalChildren = (editor) => {
  const childrenKeys = editor.getEditorState().read(() => $getRoot().getChildrenKeys());
  return childrenKeys.map((key) => ({
    key,
    node: $getNodeByKey(key),
    htmlElement: editor.getElementByKey(key)
  }));
};

// src/components/editor/utils/setNodePlaceholderFromSelection/getNodePlaceholder.ts
init_react_shim();
import { $isParagraphNode } from "lexical";
import { $isHeadingNode, $isQuoteNode } from "@lexical/rich-text";
import { $isListItemNode } from "@lexical/list";
var getNodePlaceholder = (lexicalNode) => {
  let placeholder;
  if ($isHeadingNode(lexicalNode)) {
    const tag = lexicalNode.getTag();
    placeholder = "Heading";
    switch (tag) {
      case "h1": {
        placeholder += " 1";
        break;
      }
      case "h2": {
        placeholder += " 2";
        break;
      }
      case "h3": {
        placeholder += " 3";
        break;
      }
      case "h4": {
        placeholder += " 4";
        break;
      }
      case "h5": {
        placeholder += "5";
        break;
      }
      case "h6": {
        placeholder += "6";
        break;
      }
    }
  }
  if ($isListItemNode(lexicalNode)) {
    placeholder = "list";
  }
  if ($isQuoteNode(lexicalNode)) {
    placeholder = "Quote";
  }
  if ($isParagraphNode(lexicalNode)) {
    placeholder = "Press '/' for command";
  }
  return placeholder;
};

// src/components/editor/utils/setNodePlaceholderFromSelection/setPlaceholderOnSelection.ts
var PLACEHOLDER_CLASS_NAME = "node-placeholder";
var isHtmlHeadingElement = (el) => {
  return el instanceof HTMLHeadingElement;
};
var setPlaceholderOnSelection = ({
  selection,
  editor
}) => {
  const children = getAllLexicalChildren(editor);
  const removePlaceholderClass = (element) => {
    if (!element) return;
    if (element.classList.contains(PLACEHOLDER_CLASS_NAME)) {
      element.classList.remove(PLACEHOLDER_CLASS_NAME);
      element.removeAttribute("data-placeholder");
    }
    Array.from(element.children).forEach((child) => {
      if (child instanceof HTMLElement) {
        removePlaceholderClass(child);
      }
    });
  };
  children.forEach(({ htmlElement, node }) => {
    if (!htmlElement) {
      return;
    }
    if (isHtmlHeadingElement(htmlElement)) {
      return;
    }
    const classList = htmlElement.classList;
    if (node.__type === "collapsible-container") {
      removePlaceholderClass(htmlElement);
      return;
    }
    if (node.__type === "table") {
      removePlaceholderClass(htmlElement);
      return;
    }
    if (node.__type === "layout-container") {
      removePlaceholderClass(htmlElement);
    }
    if (classList.length && classList.contains(PLACEHOLDER_CLASS_NAME)) {
      classList.remove(PLACEHOLDER_CLASS_NAME);
      htmlElement.removeAttribute("data-placeholder");
    }
  });
  if (children.length === 1 && children[0].htmlElement && !isHtmlHeadingElement(children[0].htmlElement)) {
    return;
  }
  const anchor = selection.anchor;
  const placeholder = getNodePlaceholder(anchor.getNode());
  if (placeholder) {
    const selectedHtmlElement = editor.getElementByKey(anchor.key);
    selectedHtmlElement == null ? void 0 : selectedHtmlElement.classList.add(PLACEHOLDER_CLASS_NAME);
    selectedHtmlElement == null ? void 0 : selectedHtmlElement.setAttribute("data-placeholder", placeholder);
  }
};

// src/components/editor/utils/setNodePlaceholderFromSelection/setNodePlaceholderFromSelection.ts
var setNodePlaceholderFromSelection = (editor) => {
  editor.getEditorState().read(() => {
    const selection = $getSelection2();
    if (!$isRangeSelection2(selection)) {
      return;
    }
    setPlaceholderOnSelection({ selection, editor });
  });
};

// src/components/editor/lexical-on-change.tsx
function LexicalOnChangePlugin() {
  const [editor] = useLexicalComposerContext4();
  useLayoutEffect_default(() => {
    const unregisterListener = editor.registerUpdateListener(
      ({ editorState, dirtyElements, dirtyLeaves, prevEditorState, tags }) => {
        if (dirtyElements.size === 0 && dirtyLeaves.size === 0 || tags.has("history-merge") || prevEditorState.isEmpty()) {
          return;
        }
        setNodePlaceholderFromSelection(editor);
      }
    );
    return () => {
      unregisterListener();
    };
  }, [editor]);
  return /* @__PURE__ */ React.createElement(React.Fragment, null);
}

// src/components/editor/Core.tsx
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Lightbulb, Quote } from "lucide-react";

// src/components/editor/plugins/ContentAnalyticsPlugin/index.tsx
init_react_shim();
import { useLexicalComposerContext as useLexicalComposerContext5 } from "@lexical/react/LexicalComposerContext";
import { $getRoot as $getRoot2 } from "lexical";
import { useEffect as useEffect6, useState as useState2 } from "react";
import { $isHeadingNode as $isHeadingNode2 } from "@lexical/rich-text";
import { $isListNode } from "@lexical/list";
import { $isCodeNode } from "@lexical/code";
import { Clock, Eye, BarChart3, Target, BookOpen, TrendingUp, Zap, ChevronLeft, ChevronRight } from "lucide-react";
function calculateReadabilityScore(avgWordsPerSentence, avgSyllablesPerWord) {
  const score = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;
  return Math.max(0, Math.min(100, score));
}
function calculateEngagementScore(metrics, structure) {
  let score = 50;
  if (metrics.wordCount >= 500 && metrics.wordCount <= 2e3) {
    score += 15;
  } else if (metrics.wordCount > 2e3) {
    score += 10;
  }
  if (structure.structureScore > 70) score += 10;
  if (metrics.imageCount > 0) score += 5;
  if (metrics.listCount > 0) score += 5;
  if (metrics.codeBlockCount > 0) score += 3;
  if (metrics.readabilityScore > 60) score += 10;
  if (metrics.linkCount > 0 && metrics.linkCount <= 10) score += 5;
  return Math.max(0, Math.min(100, score));
}
function estimateSyllables(word) {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  const vowels = "aeiouy";
  let syllables = 0;
  let previousWasVowel = false;
  for (let i = 0; i < word.length; i++) {
    const isVowel = vowels.includes(word[i]);
    if (isVowel && !previousWasVowel) {
      syllables++;
    }
    previousWasVowel = isVowel;
  }
  if (word.endsWith("e")) syllables--;
  return Math.max(1, syllables);
}
function ContentAnalyticsPlugin() {
  const [editor] = useLexicalComposerContext5();
  const [metrics, setMetrics] = useState2({
    wordCount: 0,
    readingTime: 0,
    paragraphCount: 0,
    headingCount: 0,
    listCount: 0,
    codeBlockCount: 0,
    imageCount: 0,
    linkCount: 0,
    sentenceCount: 0,
    avgWordsPerSentence: 0,
    readabilityScore: 0,
    engagementScore: 0
  });
  const [structure, setStructure] = useState2({
    h1Count: 0,
    h2Count: 0,
    h3Count: 0,
    hasIntroduction: false,
    hasConclusion: false,
    structureScore: 0
  });
  const [isVisible, setIsVisible] = useState2(false);
  const [isPanelHidden, setIsPanelHidden] = useState2(false);
  useEffect6(() => {
    const updateMetrics = () => {
      editor.read(() => {
        const root = $getRoot2();
        const textContent = root.getTextContent();
        const words = textContent.trim().split(/\s+/).filter((word) => word.length > 0);
        const wordCount = words.length;
        const readingTime = Math.ceil(wordCount / 200);
        let paragraphCount = 0;
        let headingCount = 0;
        let listCount = 0;
        let codeBlockCount = 0;
        let imageCount = 0;
        let linkCount = 0;
        let h1Count = 0;
        let h2Count = 0;
        let h3Count = 0;
        const children = root.getChildren();
        children.forEach((child) => {
          if ($isHeadingNode2(child)) {
            headingCount++;
            const tag = child.getTag();
            if (tag === "h1") h1Count++;
            else if (tag === "h2") h2Count++;
            else if (tag === "h3") h3Count++;
          } else if ($isListNode(child)) {
            listCount++;
          } else if ($isCodeNode(child)) {
            codeBlockCount++;
          } else if (child.getType() === "paragraph") {
            paragraphCount++;
          }
          const countInNode = (node) => {
            if (node.getType() === "image" || node.getType() === "inline-image") {
              imageCount++;
            }
            if (node.getType() === "link") {
              linkCount++;
            }
            if (node.getChildren) {
              node.getChildren().forEach(countInNode);
            }
          };
          countInNode(child);
        });
        const sentences = textContent.split(/[.!?]+/).filter((s) => s.trim().length > 0);
        const sentenceCount = sentences.length;
        const avgWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0;
        const totalSyllables = words.reduce((sum, word) => sum + estimateSyllables(word), 0);
        const avgSyllablesPerWord = wordCount > 0 ? totalSyllables / wordCount : 0;
        const readabilityScore = calculateReadabilityScore(avgWordsPerSentence, avgSyllablesPerWord);
        const hasIntroduction = paragraphCount > 0;
        const hasConclusion = paragraphCount > 2;
        let structureScore = 0;
        if (h1Count === 1) structureScore += 20;
        if (h2Count >= 2) structureScore += 20;
        if (hasIntroduction) structureScore += 15;
        if (hasConclusion) structureScore += 15;
        if (listCount > 0) structureScore += 10;
        if (imageCount > 0) structureScore += 10;
        if (linkCount > 0 && linkCount <= 10) structureScore += 10;
        const newStructure = {
          h1Count,
          h2Count,
          h3Count,
          hasIntroduction,
          hasConclusion,
          structureScore
        };
        const newMetrics = {
          wordCount,
          readingTime,
          paragraphCount,
          headingCount,
          listCount,
          codeBlockCount,
          imageCount,
          linkCount,
          sentenceCount,
          avgWordsPerSentence,
          readabilityScore,
          engagementScore: calculateEngagementScore(
            {
              wordCount,
              readingTime,
              paragraphCount,
              headingCount,
              listCount,
              codeBlockCount,
              imageCount,
              linkCount,
              sentenceCount,
              avgWordsPerSentence,
              readabilityScore,
              engagementScore: 0
            },
            newStructure
          )
        };
        setMetrics(newMetrics);
        setStructure(newStructure);
      });
    };
    const unregister = editor.registerUpdateListener(() => {
      updateMetrics();
    });
    updateMetrics();
    return unregister;
  }, [editor]);
  useEffect6(() => {
    setIsVisible(metrics.wordCount > 10);
  }, [metrics.wordCount]);
  if (!isVisible) return null;
  const getReadabilityLabel = (score) => {
    if (score >= 90) return { label: "Very Easy", color: "bg-green-500" };
    if (score >= 80) return { label: "Easy", color: "bg-green-400" };
    if (score >= 70) return { label: "Fairly Easy", color: "bg-yellow-400" };
    if (score >= 60) return { label: "Standard", color: "bg-yellow-500" };
    if (score >= 50) return { label: "Fairly Difficult", color: "bg-orange-400" };
    if (score >= 30) return { label: "Difficult", color: "bg-red-400" };
    return { label: "Very Difficult", color: "bg-red-500" };
  };
  const getEngagementLabel = (score) => {
    if (score >= 80) return { label: "Excellent", color: "text-green-600" };
    if (score >= 60) return { label: "Good", color: "text-yellow-600" };
    if (score >= 40) return { label: "Fair", color: "text-orange-600" };
    return { label: "Needs Work", color: "text-red-600" };
  };
  const readability = getReadabilityLabel(metrics.readabilityScore);
  const engagement = getEngagementLabel(metrics.engagementScore);
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      className: cn(
        "fixed top-20 right-4 z-50 transition-transform duration-300 ease-in-out",
        isPanelHidden ? "translate-x-full" : "translate-x-0"
      )
    },
    /* @__PURE__ */ React.createElement(
      Button,
      {
        variant: "outline",
        size: "sm",
        onClick: () => setIsPanelHidden(!isPanelHidden),
        className: cn(
          "absolute top-4 -left-10 z-10 h-8 w-8 p-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm shadow-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800",
          isPanelHidden && "-left-8"
        )
      },
      isPanelHidden ? /* @__PURE__ */ React.createElement(ChevronLeft, { className: "w-4 h-4" }) : /* @__PURE__ */ React.createElement(ChevronRight, { className: "w-4 h-4" })
    ),
    /* @__PURE__ */ React.createElement("div", { className: "w-80 space-y-4" }, /* @__PURE__ */ React.createElement(Card, { className: "bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm shadow-lg border border-zinc-200 dark:border-zinc-700" }, /* @__PURE__ */ React.createElement(CardHeader, { className: "pb-3" }, /* @__PURE__ */ React.createElement(CardTitle, { className: "flex items-center justify-between text-sm font-medium" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(BarChart3, { className: "w-4 h-4" }), "Content Analytics"))), /* @__PURE__ */ React.createElement(CardContent, { className: "space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(Clock, { className: "w-4 h-4 text-blue-500" }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "text-lg font-semibold" }, metrics.readingTime, "m"), /* @__PURE__ */ React.createElement("div", { className: "text-xs text-muted-foreground" }, "Reading time"))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(BookOpen, { className: "w-4 h-4 text-green-500" }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "text-lg font-semibold" }, metrics.wordCount), /* @__PURE__ */ React.createElement("div", { className: "text-xs text-muted-foreground" }, "Words")))), /* @__PURE__ */ React.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(TrendingUp, { className: "w-4 h-4 text-purple-500" }), /* @__PURE__ */ React.createElement("span", { className: "text-sm font-medium" }, "Engagement")), /* @__PURE__ */ React.createElement(Badge, { variant: "outline", className: engagement.color }, engagement.label)), /* @__PURE__ */ React.createElement(Progress, { value: metrics.engagementScore, className: "h-2" }), /* @__PURE__ */ React.createElement("div", { className: "text-xs text-muted-foreground" }, metrics.engagementScore, "/100")), /* @__PURE__ */ React.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(Eye, { className: "w-4 h-4 text-indigo-500" }), /* @__PURE__ */ React.createElement("span", { className: "text-sm font-medium" }, "Readability")), /* @__PURE__ */ React.createElement(Badge, { variant: "outline", className: cn("text-white", readability.color) }, readability.label)), /* @__PURE__ */ React.createElement(Progress, { value: metrics.readabilityScore, className: "h-2" }), /* @__PURE__ */ React.createElement("div", { className: "text-xs text-muted-foreground" }, Math.round(metrics.readabilityScore), "/100 Flesch Score")))), /* @__PURE__ */ React.createElement(Card, { className: "bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm shadow-lg border border-zinc-200 dark:border-zinc-700" }, /* @__PURE__ */ React.createElement(CardHeader, { className: "pb-3" }, /* @__PURE__ */ React.createElement(CardTitle, { className: "flex items-center gap-2 text-sm font-medium" }, /* @__PURE__ */ React.createElement(Target, { className: "w-4 h-4" }), "Content Structure")), /* @__PURE__ */ React.createElement(CardContent, { className: "space-y-3" }, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-3 text-xs" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between" }, /* @__PURE__ */ React.createElement("span", { className: "text-muted-foreground" }, "H1 Headers:"), /* @__PURE__ */ React.createElement("span", { className: structure.h1Count === 1 ? "text-green-600" : "text-orange-600" }, structure.h1Count)), /* @__PURE__ */ React.createElement("div", { className: "flex justify-between" }, /* @__PURE__ */ React.createElement("span", { className: "text-muted-foreground" }, "H2 Headers:"), /* @__PURE__ */ React.createElement("span", { className: structure.h2Count >= 2 ? "text-green-600" : "text-orange-600" }, structure.h2Count)), /* @__PURE__ */ React.createElement("div", { className: "flex justify-between" }, /* @__PURE__ */ React.createElement("span", { className: "text-muted-foreground" }, "Paragraphs:"), /* @__PURE__ */ React.createElement("span", null, metrics.paragraphCount)), /* @__PURE__ */ React.createElement("div", { className: "flex justify-between" }, /* @__PURE__ */ React.createElement("span", { className: "text-muted-foreground" }, "Lists:"), /* @__PURE__ */ React.createElement("span", null, metrics.listCount)), /* @__PURE__ */ React.createElement("div", { className: "flex justify-between" }, /* @__PURE__ */ React.createElement("span", { className: "text-muted-foreground" }, "Images:"), /* @__PURE__ */ React.createElement("span", null, metrics.imageCount)), /* @__PURE__ */ React.createElement("div", { className: "flex justify-between" }, /* @__PURE__ */ React.createElement("span", { className: "text-muted-foreground" }, "Links:"), /* @__PURE__ */ React.createElement(
      "span",
      {
        className: metrics.linkCount > 0 && metrics.linkCount <= 10 ? "text-green-600" : "text-orange-600"
      },
      metrics.linkCount
    ))), /* @__PURE__ */ React.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("span", { className: "text-sm font-medium" }, "Structure Score"), /* @__PURE__ */ React.createElement("span", { className: "text-sm" }, structure.structureScore, "/100")), /* @__PURE__ */ React.createElement(Progress, { value: structure.structureScore, className: "h-2" })))), metrics.engagementScore < 70 && /* @__PURE__ */ React.createElement(Card, { className: "bg-amber-50/95 dark:bg-amber-900/20 backdrop-blur-sm shadow-lg border border-amber-200 dark:border-amber-800" }, /* @__PURE__ */ React.createElement(CardHeader, { className: "pb-2" }, /* @__PURE__ */ React.createElement(CardTitle, { className: "flex items-center gap-2 text-sm font-medium text-amber-800 dark:text-amber-200" }, /* @__PURE__ */ React.createElement(Zap, { className: "w-4 h-4" }), "Quick Tips")), /* @__PURE__ */ React.createElement(CardContent, { className: "space-y-2" }, /* @__PURE__ */ React.createElement("div", { className: "text-xs text-amber-700 dark:text-amber-300 space-y-1" }, structure.h1Count !== 1 && /* @__PURE__ */ React.createElement("div", null, "\u2022 Use exactly one H1 header for your main title"), structure.h2Count < 2 && /* @__PURE__ */ React.createElement("div", null, "\u2022 Add more H2 headers to break up your content"), metrics.imageCount === 0 && /* @__PURE__ */ React.createElement("div", null, "\u2022 Add images to make your content more engaging"), metrics.listCount === 0 && /* @__PURE__ */ React.createElement("div", null, "\u2022 Use bullet points or numbered lists for better readability"), metrics.wordCount < 300 && /* @__PURE__ */ React.createElement("div", null, "\u2022 Consider expanding your content (aim for 500+ words)"), metrics.readabilityScore < 50 && /* @__PURE__ */ React.createElement("div", null, "\u2022 Try shorter sentences for better readability")))))
  );
}

// src/components/editor/Core.tsx
var SlashCommand = dynamic(() => import("./SlashCommand-FHEWHFZU.mjs"), { ssr: false });
var ToolbarPlugin = dynamic(() => import("./ToolbarPlugin-2VP7FDWD.mjs"), {
  ssr: false,
  loading: () => /* @__PURE__ */ React.createElement("div", { className: "hidden md:block w-full flex justify-center p-4" })
});
var ExportPlugin = dynamic(() => import("./ExportPlugin-V2RLM63S.mjs"), { ssr: false });
var TemplatePlugin = dynamic(() => import("./TemplatePlugin-ZD3QEVTI.mjs"), { ssr: false });
var ExcalidrawPlugin = dynamic(() => import("./ExcalidrawPlugin-HC2L43YG.mjs"), {
  ssr: false
});
var FloatingLinkEditorPlugin = dynamic(() => import("./FloatingLinkEditorPlugin-TRTCMSP4.mjs"), {
  ssr: false
});
var TableCellActionMenuPlugin = dynamic(() => import("./TableCellActionMenuPlugin-PGK2K3VG.mjs"), {
  ssr: false
});
var TableHoverActionsPlugin = dynamic(() => import("./TableHoverActionsPlugin-GJVE6VRW.mjs"), {
  ssr: false
});
var CodeActionMenuPlugin = dynamic(() => import("./CodeActionMenuPlugin-EINOY4U4.mjs"), { ssr: false });
var FloatingTextFormatToolbarPlugin = dynamic(
  () => import("./FloatingTextFormatToolbarPlugin-ENECEZSX.mjs"),
  { ssr: false }
);
var QUOTES = [
  { text: "The best way to predict the future is to invent it.", author: "Alan Kay" },
  { text: "Do not wait to strike till the iron is hot, but make it hot by striking.", author: "William Butler Yeats" },
  { text: "Creativity is intelligence having fun.", author: "Albert Einstein" },
  { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
  { text: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Success is not the key to happiness. Happiness is the key to success.", author: "Albert Schweitzer" },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "What we think, we become.", author: "Buddha" },
  { text: "The journey of a thousand miles begins with one step.", author: "Lao Tzu" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
  { text: "Life is what happens to you while you're busy making other plans.", author: "John Lennon" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" }
];
function useRotatingQuote() {
  const [quote, setQuote] = useState3(null);
  const [isAnimating, setIsAnimating] = useState3(false);
  const loadNewQuote = useCallback2(() => {
    setIsAnimating(true);
    setTimeout(() => {
      const newQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
      setQuote(newQuote);
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "editorQuote",
          JSON.stringify(__spreadProps(__spreadValues({}, newQuote), { timestamp: Date.now() }))
        );
      }
      setIsAnimating(false);
    }, 300);
  }, []);
  useEffect7(() => {
    const loadInitialQuote = () => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("editorQuote");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            const isRecent = Date.now() - parsed.timestamp < 3 * 60 * 60 * 1e3;
            if (isRecent && parsed.text && parsed.author) {
              setQuote({ text: parsed.text, author: parsed.author });
              return;
            }
          } catch (e) {
          }
        }
      }
      const newQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
      setQuote(newQuote);
    };
    loadInitialQuote();
    const interval = setInterval(loadNewQuote, 3 * 60 * 60 * 1e3);
    return () => clearInterval(interval);
  }, [loadNewQuote]);
  return { quote, isAnimating, loadNewQuote };
}
function EnhancedPlaceholder({ quote, isAnimating, onRefresh }) {
  if (!quote) {
    return /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 flex items-center justify-center" }, /* @__PURE__ */ React.createElement(
      motion.div,
      {
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
        className: "flex items-center gap-3 text-gray-400"
      },
      /* @__PURE__ */ React.createElement(Sparkles, { className: "h-6 w-6 animate-pulse" }),
      /* @__PURE__ */ React.createElement("span", { className: "text-lg italic" }, "Loading inspiration...")
    ));
  }
  return /* @__PURE__ */ React.createElement("div", { className: "absolute md:-mt-26 -mt-56 inset-0 pointer-events-none select-none overflow-hidden" }, /* @__PURE__ */ React.createElement(
    motion.div,
    {
      className: "relative h-full w-full",
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.5 }
    },
    /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 opacity-[0.02] dark:opacity-[0.05]" }, /* @__PURE__ */ React.createElement("div", { className: "absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full blur-3xl" }), /* @__PURE__ */ React.createElement("div", { className: "absolute top-3/4 right-1/4 w-24 h-24 bg-gradient-to-br from-pink-400 to-orange-600 rounded-full blur-2xl" })),
    /* @__PURE__ */ React.createElement("div", { className: "relative z-10 h-full flex flex-col justify-center px-4 md:px-12" }, /* @__PURE__ */ React.createElement(AnimatePresence, { mode: "wait" }, !isAnimating && /* @__PURE__ */ React.createElement(
      motion.div,
      {
        key: quote.text,
        initial: { opacity: 0, y: 20, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -20, scale: 0.95 },
        transition: {
          duration: 0.6,
          ease: [0.4, 0, 0.2, 1]
        },
        className: "max-w-4xl"
      },
      /* @__PURE__ */ React.createElement(
        motion.div,
        {
          className: "flex items-center gap-3 mb-6",
          initial: { opacity: 0, x: -20 },
          animate: { opacity: 1, x: 0 },
          transition: { delay: 0.2 }
        },
        /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement(Quote, { className: "h-8 w-8 text-blue-400/60 dark:text-blue-300/40" }), /* @__PURE__ */ React.createElement(
          motion.div,
          {
            className: "absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full",
            animate: { scale: [1, 1.2, 1] },
            transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }
        )),
        /* @__PURE__ */ React.createElement("div", { className: "h-px flex-1 bg-gradient-to-r from-gray-300 to-transparent dark:from-gray-600" })
      ),
      /* @__PURE__ */ React.createElement(
        motion.blockquote,
        {
          className: "text-2xl md:text-4xl lg:text-5xl font-light italic leading-relaxed text-gray-400 dark:text-gray-500 mb-6",
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { delay: 0.3, duration: 0.8 }
        },
        '"',
        quote.text,
        '"'
      ),
      /* @__PURE__ */ React.createElement(
        motion.div,
        {
          className: "flex items-center gap-3",
          initial: { opacity: 0, x: 20 },
          animate: { opacity: 1, x: 0 },
          transition: { delay: 0.5 }
        },
        /* @__PURE__ */ React.createElement("div", { className: "h-px flex-1 bg-gradient-to-l from-gray-300 to-transparent dark:from-gray-600" }),
        /* @__PURE__ */ React.createElement("cite", { className: "text-lg md:text-xl text-gray-500 dark:text-gray-400 font-medium not-italic" }, quote.author),
        /* @__PURE__ */ React.createElement(Lightbulb, { className: "h-5 w-5 text-amber-400/60 dark:text-amber-300/40" })
      ),
      /* @__PURE__ */ React.createElement(
        motion.button,
        {
          onClick: onRefresh,
          className: "mt-8 pointer-events-auto text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 flex items-center hidden md:flex gap-2 group",
          whileHover: { scale: 1.05 },
          whileTap: { scale: 0.95 },
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { delay: 0.8 }
        },
        /* @__PURE__ */ React.createElement(Sparkles, { className: "h-4 w-4 group-hover:animate-spin transition-transform" }),
        /* @__PURE__ */ React.createElement("span", null, "Click for new inspiration")
      )
    )), isAnimating && /* @__PURE__ */ React.createElement(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        className: "flex items-center justify-center"
      },
      /* @__PURE__ */ React.createElement(
        motion.div,
        {
          animate: { rotate: 360 },
          transition: { duration: 1, repeat: Infinity, ease: "linear" }
        },
        /* @__PURE__ */ React.createElement(Sparkles, { className: "h-8 w-8 text-blue-400" })
      ),
      /* @__PURE__ */ React.createElement("span", { className: "ml-3 text-xl text-gray-400 italic" }, "Finding inspiration...")
    ))
  ));
}
function Core({
  toolbarConfig
}) {
  const { historyState } = useSharedHistoryContext();
  const { quote, isAnimating, loadNewQuote } = useRotatingQuote();
  const isEditable = useLexicalEditable2();
  const [floatingAnchorElem, setFloatingAnchorElem] = useState3(null);
  const [editor] = useLexicalComposerContext6();
  const [activeEditor, setActiveEditor] = useState3(editor);
  const [isLinkEditMode, setIsLinkEditMode] = useState3(false);
  const [hasContent, setHasContent] = useState3(false);
  const onRef = useCallback2((_floatingAnchorElem) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  }, []);
  useEffect7(() => {
    const unregister = editor.registerTextContentListener((textContent) => {
      setHasContent(textContent.trim().length > 0);
    });
    return unregister;
  }, [editor]);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, isEditable && /* @__PURE__ */ React.createElement(
    ToolbarPlugin,
    {
      editor,
      activeEditor,
      setActiveEditor,
      setIsLinkEditMode,
      toolbarConfig
    }
  ), isEditable && /* @__PURE__ */ React.createElement(ContentAnalyticsPlugin, null), /* @__PURE__ */ React.createElement("div", { className: cn(
    "flex justify-center w-full min-h-screen transition-all duration-300",
    "dark:md:from-gray-900/50 dark:md:to-gray-800/30",
    "pt-20 md:pt-10"
  ) }, /* @__PURE__ */ React.createElement(
    motion.div,
    {
      className: cn(
        "relative w-full max-w-5xl transition-all duration-500",
        "prose prose-lg dark:prose-invert lg:prose-xl leading-relaxed",
        "md:rounded-2xl md:shadow-2xl md:shadow-black/5",
        "md:dark:shadow-black/20",
        "bg-white dark:bg-gray-900",
        "md:border md:border-gray-200/50 dark:md:border-gray-800/50"
      )
    },
    /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 rounded-2xl overflow-hidden pointer-events-none" }, /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30 dark:from-blue-900/10 dark:to-purple-900/10" }), /* @__PURE__ */ React.createElement("div", { className: "absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700" })),
    /* @__PURE__ */ React.createElement(
      RichTextPlugin,
      {
        contentEditable: /* @__PURE__ */ React.createElement("div", { ref: onRef, className: "relative" }, /* @__PURE__ */ React.createElement(
          ContentEditable,
          {
            id: "lexical-editor",
            autoFocus: true,
            className: cn(
              "editor-content relative z-20 outline-none",
              "px-4 md:px-12 py-8 md:py-16",
              "min-h-[80vh] md:min-h-[70vh]",
              "focus:outline-none focus:ring-0",
              "text-foreground selection:bg-blue-100 dark:selection:bg-blue-900/30",
              "font-['Inter',_system-ui,_sans-serif] antialiased",
              "leading-relaxed tracking-wide",
              "transition-all duration-200 ease-in-out",
              "rounded-2xl"
            )
          }
        )),
        placeholder: !hasContent ? /* @__PURE__ */ React.createElement(
          EnhancedPlaceholder,
          {
            quote,
            isAnimating,
            onRefresh: loadNewQuote
          }
        ) : null,
        ErrorBoundary: LexicalErrorBoundary
      }
    ),
    /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 rounded-2xl ring-0 ring-blue-500/0 transition-all duration-300 pointer-events-none focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:ring-offset-2 focus-within:ring-offset-white dark:focus-within:ring-offset-gray-900" }),
    /* @__PURE__ */ React.createElement(AutoFocusPlugin, { defaultSelection: "rootStart" }),
    /* @__PURE__ */ React.createElement(ClearEditorPlugin, null),
    /* @__PURE__ */ React.createElement(ShortcutsPlugin, { editor: activeEditor, setIsLinkEditMode }),
    /* @__PURE__ */ React.createElement(LexicalOnChangePlugin, null),
    /* @__PURE__ */ React.createElement(LinkPlugin, null),
    /* @__PURE__ */ React.createElement(HorizontalRulePlugin, null),
    /* @__PURE__ */ React.createElement(TabFocusPlugin, null),
    /* @__PURE__ */ React.createElement(PollPlugin, null),
    /* @__PURE__ */ React.createElement(ExcalidrawPlugin, null),
    /* @__PURE__ */ React.createElement(FigmaPlugin, null),
    /* @__PURE__ */ React.createElement(EquationsPlugin, null),
    /* @__PURE__ */ React.createElement(SpeechToTextPlugin_default, null),
    /* @__PURE__ */ React.createElement(TableCellResizerPlugin, null),
    /* @__PURE__ */ React.createElement(LayoutPlugin, null),
    /* @__PURE__ */ React.createElement(CollapsiblePlugin, null),
    /* @__PURE__ */ React.createElement(CodeHighlightPlugin, null),
    /* @__PURE__ */ React.createElement(DragDropPaste, null),
    /* @__PURE__ */ React.createElement(TabIndentationPlugin, { maxIndent: 7 }),
    /* @__PURE__ */ React.createElement(LexicalAutoLinkPlugin, null),
    /* @__PURE__ */ React.createElement(LinkWithMetaDataPlugin, null),
    /* @__PURE__ */ React.createElement(ListPlugin, null),
    /* @__PURE__ */ React.createElement(LinkPlugin, null),
    /* @__PURE__ */ React.createElement(StepperPlugin, null),
    /* @__PURE__ */ React.createElement(TwitterPlugin, null),
    /* @__PURE__ */ React.createElement(CheckListPlugin, null),
    /* @__PURE__ */ React.createElement(ImagesPlugin, null),
    /* @__PURE__ */ React.createElement(InlineImagePlugin, null),
    /* @__PURE__ */ React.createElement(AutoEmbedPlugin, null),
    /* @__PURE__ */ React.createElement(HintPlugin, null),
    /* @__PURE__ */ React.createElement(YouTubePlugin, null),
    /* @__PURE__ */ React.createElement(StoryBuilderPlugin, null),
    /* @__PURE__ */ React.createElement(DynamicBlockPlugin, null),
    /* @__PURE__ */ React.createElement(HistoryPlugin, { externalHistoryState: historyState }),
    /* @__PURE__ */ React.createElement(ExportPlugin, null),
    /* @__PURE__ */ React.createElement(TemplatePlugin, null),
    /* @__PURE__ */ React.createElement(MarkdownShortcutPlugin, null),
    /* @__PURE__ */ React.createElement(ClickableLinkPlugin, { disabled: isEditable }),
    /* @__PURE__ */ React.createElement(TablePlugin, { hasCellMerge: true, hasCellBackgroundColor: true, hasHorizontalScroll: true }),
    floatingAnchorElem && isEditable && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(DraggableBlockPlugin, { anchorElem: floatingAnchorElem }), /* @__PURE__ */ React.createElement(
      FloatingLinkEditorPlugin,
      {
        anchorElem: floatingAnchorElem,
        isLinkEditMode,
        setIsLinkEditMode
      }
    ), /* @__PURE__ */ React.createElement(FloatingTextFormatToolbarPlugin, { setIsLinkEditMode, anchorElem: floatingAnchorElem }), /* @__PURE__ */ React.createElement(TableCellActionMenuPlugin, { anchorElem: floatingAnchorElem, cellMerge: true }), /* @__PURE__ */ React.createElement(CodeActionMenuPlugin, { anchorElem: floatingAnchorElem }), /* @__PURE__ */ React.createElement(TableHoverActionsPlugin, { anchorElem: floatingAnchorElem })),
    isEditable && /* @__PURE__ */ React.createElement(SlashCommand, null)
  )));
}

// src/components/editor/index.tsx
function Editor({
  isEditable = false,
  content,
  aiConfig,
  uploadConfig,
  toolbarConfig
}) {
  const initialConfig = {
    namespace: "Bloger editor",
    theme: editor_theme_default,
    editorState: typeof content === "string" ? content : void 0,
    // typeof content === "string" ? content : JSON.stringify(content),
    nodes: [...nodes_default],
    onError: (error) => {
      throw error;
    },
    editable: isEditable
  };
  console.log("Editor content:", content);
  return /* @__PURE__ */ React3.createElement(LexicalComposer, { initialConfig }, /* @__PURE__ */ React3.createElement(AIProvider, { config: aiConfig }, /* @__PURE__ */ React3.createElement(UploadProvider, { config: uploadConfig }, /* @__PURE__ */ React3.createElement(SharedHistoryContext, null, /* @__PURE__ */ React3.createElement(ToolbarContext, null, /* @__PURE__ */ React3.createElement(Core, { toolbarConfig }))))));
}

// src/styles/tailwind-plugin.ts
init_react_shim();

// node_modules/.pnpm/tailwindcss@4.1.13/node_modules/tailwindcss/dist/plugin.mjs
init_react_shim();
function g(i, n) {
  return { handler: i, config: n };
}
g.withOptions = function(i, n = () => ({})) {
  function t(o) {
    return { handler: i(o), config: n(o) };
  }
  return t.__isOptionsFunction = true, t;
};
var u = g;

// src/styles/tailwind-plugin.ts
var notiqPlugin = u(function({ addBase, theme: theme2 }) {
  addBase({
    ":root": {
      "--background": "oklch(1 0 0)",
      "--foreground": "oklch(0.145 0 0)",
      "--card": "oklch(1 0 0)",
      "--card-foreground": "oklch(0.145 0 0)",
      "--popover": "oklch(1 0 0)",
      "--popover-foreground": "oklch(0.145 0 0)",
      "--primary": "oklch(0.205 0 0)",
      "--primary-foreground": "oklch(0.985 0 0)",
      "--secondary": "oklch(0.97 0 0)",
      "--secondary-foreground": "oklch(0.205 0 0)",
      "--muted": "oklch(0.97 0 0)",
      "--muted-foreground": "oklch(0.556 0 0)",
      "--accent": "oklch(0.97 0 0)",
      "--accent-foreground": "oklch(0.205 0 0)",
      "--destructive": "oklch(0.577 0.245 27.325)",
      "--destructive-foreground": "oklch(0.577 0.245 27.325)",
      "--border": "oklch(0.922 0 0)",
      "--input": "oklch(0.922 0 0)",
      "--ring": "oklch(0.708 0 0)",
      "--radius": "0.625rem",
      "--font-gray": "#9b9a97",
      "--font-brown": "#64473a",
      "--font-orange": "#d9730d",
      "--font-yellow": "#dfab01",
      "--font-green": "#0f7b6c",
      "--font-blue": "#0b6e99",
      "--font-purple": "#6940a5",
      "--font-pink": "#ad1a72",
      "--font-red": "#e03e3e",
      "--background-gray": "#ebeced",
      "--background-brown": "#e9e5e3",
      "--background-orange": "#faebdd",
      "--background-yellow": "#fbf3db",
      "--background-green": "#ddedea",
      "--background-blue": "#ddedea",
      "--background-purple": "#eae4f2",
      "--background-pink": "#f4dfeb",
      "--background-red": "#fbe4e4"
    },
    ".dark": {
      "--background": "oklch(0.145 0 0)",
      "--foreground": "oklch(0.985 0 0)",
      "--card": "oklch(0.145 0 0)",
      "--card-foreground": "oklch(0.985 0 0)",
      "--popover": "oklch(0.145 0 0)",
      "--popover-foreground": "oklch(0.985 0 0)",
      "--primary": "oklch(0.985 0 0)",
      "--primary-foreground": "oklch(0.205 0 0)",
      "--secondary": "oklch(0.269 0 0)",
      "--secondary-foreground": "oklch(0.985 0 0)",
      "--muted": "oklch(0.269 0 0)",
      "--muted-foreground": "oklch(0.708 0 0)",
      "--accent": "oklch(0.269 0 0)",
      "--accent-foreground:": "oklch(0.985 0 0)",
      "--destructive": "oklch(0.396 0.141 25.723)",
      "--destructive-foreground": "oklch(0.637 0.237 25.331)",
      "--border": "oklch(0.269 0 0)",
      "--input": "oklch(0.269 0 0)",
      "--ring": "oklch(0.439 0 0)",
      "--font-gray": "#9b9a97",
      "--font-brown": "#937264",
      "--font-orange": "#ffa344",
      "--font-yellow": "#ffdc49",
      "--font-green": "#4dab9a",
      "--font-blue": "#529cca",
      "--font-purple": "#9a6dd7",
      "--font-pink": "#e255a1",
      "--font-red": "#ff7369",
      "--background-gray": "#454b4e",
      "--background-brown": "#434040",
      "--background-orange": "#594a3a",
      "--background-yellow": "#59563b",
      "--background-green": "#354c4b",
      "--background-blue": "#364954",
      "--background-purple": "#443f57",
      "--background-pink": "#533b4c",
      "--background-red": "#594141"
    }
  });
}, {
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)"
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)"
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)"
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)"
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)"
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)"
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)"
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      }
    }
  }
});
export {
  AIProvider,
  DEFAULT_FONT_SIZE,
  Editor,
  MAX_ALLOWED_FONT_SIZE,
  MIN_ALLOWED_FONT_SIZE,
  SharedHistoryContext,
  ToolbarContext,
  UploadProvider,
  blockTypeToBlockName,
  notiqPlugin,
  useAI,
  useSharedHistoryContext,
  useToolbarState,
  useUpload
};
