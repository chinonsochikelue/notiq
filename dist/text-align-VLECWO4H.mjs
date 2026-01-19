import {
  DropDown
} from "./chunk-EGMI62PP.mjs";
import "./chunk-KJ6AJ44Q.mjs";
import "./chunk-64Z3FI7T.mjs";
import {
  SHORTCUTS
} from "./chunk-ZB5LZQKC.mjs";
import "./chunk-WDG7J2DY.mjs";
import "./chunk-BIU7WTLX.mjs";
import "./chunk-YHPNOWFH.mjs";
import {
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/components/ui/drop-downs/text-align.tsx
init_react_shim();
import React, { useMemo } from "react";
import {
  FORMAT_ELEMENT_COMMAND,
  INDENT_CONTENT_COMMAND,
  OUTDENT_CONTENT_COMMAND
} from "lexical";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  AlignJustify,
  OutdentIcon,
  Indent
} from "lucide-react";
function textAlign({
  editor,
  value,
  isRTL,
  disabled = false
}) {
  const ELEMENT_FORMAT_OPTIONS = useMemo(
    () => ({
      center: {
        icon: /* @__PURE__ */ React.createElement(AlignCenter, { className: "w-4 h-4" }),
        func: () => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
        },
        shortcuts: SHORTCUTS.CENTER_ALIGN,
        label: "Center Align"
      },
      end: {
        icon: /* @__PURE__ */ React.createElement(AlignRight, { className: "w-4 h-4" }),
        func: () => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "end");
        },
        shortcuts: SHORTCUTS.LEFT_ALIGN,
        label: "End Align"
      },
      justify: {
        icon: /* @__PURE__ */ React.createElement(AlignJustify, { className: "w-4 h-4" }),
        func: () => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify");
        },
        shortcuts: SHORTCUTS.JUSTIFY_ALIGN,
        label: "Justify Align"
      },
      left: {
        icon: /* @__PURE__ */ React.createElement(AlignLeft, { className: "w-4 h-4" }),
        func: () => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
        },
        shortcuts: SHORTCUTS.LEFT_ALIGN,
        label: "Left Align"
      },
      right: {
        icon: /* @__PURE__ */ React.createElement(AlignRight, { className: "w-4 h-4" }),
        func: () => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
        },
        shortcuts: SHORTCUTS.RIGHT_ALIGN,
        label: "Right Align"
      },
      start: {
        icon: /* @__PURE__ */ React.createElement(AlignLeft, { className: "w-4 h-4" }),
        func: () => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "start");
        },
        label: "Start Align"
      },
      Outdent: {
        icon: /* @__PURE__ */ React.createElement(OutdentIcon, { className: "w-4 h-4" }),
        func: () => {
          editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, void 0);
        },
        label: "Outdent"
      },
      func: {
        icon: /* @__PURE__ */ React.createElement(Indent, { className: "w-4 h-4" }),
        func: () => {
          editor.dispatchCommand(INDENT_CONTENT_COMMAND, void 0);
        },
        label: "Indent"
      }
    }),
    [editor]
  );
  return /* @__PURE__ */ React.createElement(
    DropDown,
    {
      values: Object.values(ELEMENT_FORMAT_OPTIONS),
      TriggerClassName: { width: "120px", border: "none" },
      PopoverContentClassName: { width: "220px" },
      className: "cursor-pointer",
      TriggerLabel: /* @__PURE__ */ React.createElement(React.Fragment, null, value ? ELEMENT_FORMAT_OPTIONS[value].icon : ELEMENT_FORMAT_OPTIONS["left"].icon, value || "left"),
      disabled
    }
  );
}
export {
  textAlign as default
};
