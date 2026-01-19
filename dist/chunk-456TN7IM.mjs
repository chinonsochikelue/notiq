import {
  DropDown
} from "./chunk-EGMI62PP.mjs";
import {
  SHORTCUTS
} from "./chunk-ZB5LZQKC.mjs";
import {
  clearFormatting
} from "./chunk-PZSUSXQG.mjs";
import {
  __spreadProps,
  __spreadValues,
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/components/ui/drop-downs/text-format.tsx
init_react_shim();
import { FORMAT_TEXT_COMMAND } from "lexical";
import {
  CaseSensitive,
  CaseUpper,
  HighlighterIcon,
  LucideRemoveFormatting,
  Strikethrough,
  Subscript,
  Superscript,
  Trash
} from "lucide-react";
import React, { useMemo } from "react";
function TextFormat({
  disabled = false,
  editor,
  toolbarState,
  style,
  ShowChevronsUpDown,
  side,
  sideOffset
}) {
  const items = useMemo(
    () => [
      {
        label: "Lowercase",
        icon: /* @__PURE__ */ React.createElement(CaseSensitive, { className: "w-4 h-4" }),
        func: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "lowercase"),
        shortcuts: SHORTCUTS.LOWERCASE,
        selected: toolbarState.isLowercase
      },
      {
        label: "Uppercase",
        icon: /* @__PURE__ */ React.createElement(CaseUpper, { className: "w-4 h-4" }),
        func: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "uppercase"),
        shortcuts: SHORTCUTS.UPPERCASE,
        selected: toolbarState.isUppercase
      },
      {
        label: "Strikethrough",
        icon: /* @__PURE__ */ React.createElement(Strikethrough, { className: "w-4 h-4" }),
        func: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough"),
        shortcuts: SHORTCUTS.STRIKETHROUGH,
        selected: toolbarState.isStrikethrough
      },
      {
        label: "Subscript",
        icon: /* @__PURE__ */ React.createElement(Subscript, { className: "w-4 h-4" }),
        func: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "subscript"),
        shortcuts: SHORTCUTS.SUBSCRIPT,
        selected: toolbarState.isSubscript
      },
      {
        label: "Superscript",
        icon: /* @__PURE__ */ React.createElement(Superscript, { className: "w-4 h-4" }),
        func: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "superscript"),
        shortcuts: SHORTCUTS.SUPERSCRIPT,
        selected: toolbarState.isSuperscript
      },
      {
        label: "Highlight",
        icon: /* @__PURE__ */ React.createElement(HighlighterIcon, { className: "w-4 h-4" }),
        func: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "highlight"),
        selected: toolbarState.isHighlight
      },
      {
        label: "Clear Formatting",
        icon: /* @__PURE__ */ React.createElement(Trash, { className: "w-4 h-4" }),
        func: () => clearFormatting(editor),
        shortcuts: SHORTCUTS.CLEAR_FORMATTING,
        selected: false
      }
    ],
    [editor, toolbarState]
  );
  return /* @__PURE__ */ React.createElement(
    DropDown,
    {
      PopoverContentClassName: { width: "100%" },
      TriggerClassName: __spreadProps(__spreadValues({}, style), { width: "100%", border: "none" }),
      disabled,
      sideOffset,
      side,
      className: "cursor-pointer",
      ShowChevronsUpDown,
      TriggerLabel: /* @__PURE__ */ React.createElement(LucideRemoveFormatting, null),
      values: items
    }
  );
}

export {
  TextFormat
};
