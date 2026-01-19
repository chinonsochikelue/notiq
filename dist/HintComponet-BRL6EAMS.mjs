"use client";
import {
  $isHintNode
} from "./chunk-G53GLEAY.mjs";
import {
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/components/editor/nodes/Hint/HintComponet.tsx
init_react_shim();
import { $getNodeByKey } from "lexical";
import React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { cva } from "class-variance-authority";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { LexicalNestedComposer } from "@lexical/react/LexicalNestedComposer";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
var hintVariants = cva(
  "hint p-4 max-sm:p-2 transition-colors   my-2 flex flex-row max-sm:flex-col items-start relative   justify-between rounded-md straight-corners:rounded-none w-full text-destructive-foreground  shadow-xl mx-auto max-w-3xl",
  {
    variants: {
      variant: {
        default: "border border-border/20 dark:bg-black bg-white text-foreground",
        success: "dark:bg-green-500/20 bg-green-500/70 dark:shadow-green-800/10 shadow-green-500/30 border-green-500/40 decoration-primary/60",
        error: "destructive  border-destructive  dark:shadow-red-800/20 shadow-red-500/30 bg-destructive ",
        warning: "bg-yellow-500/50 dark:shadow-yellow-500/10 shadow-yellow-500/20   border-yellow-500/40",
        info: "bg-blue-500/50 shadow-blue-500/10  bg-blue-700/70  shadow-blue-700/20   border-blue-500/40"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function HintComponent({
  type,
  captionEditor,
  nodeKey
}) {
  const [editor] = useLexicalComposerContext();
  const variantMap = {
    hint: "success",
    warning: "warning",
    info: "info",
    error: "error",
    success: "success"
  };
  const variant = variantMap[type] || "default";
  const variantOrder = [
    "success",
    "warning",
    "info",
    "error",
    "hint"
  ];
  function handleIcon(type2) {
    switch (type2) {
      case "hint":
        return /* @__PURE__ */ React.createElement(
          "svg",
          {
            xmlns: "http://www.w3.org/2000/svg",
            width: "1.5em",
            height: "1.5em",
            viewBox: "0 0 36 36"
          },
          /* @__PURE__ */ React.createElement(
            "path",
            {
              fill: "currentColor",
              d: "M18 2a16 16 0 1 0 16 16A16 16 0 0 0 18 2m0 30a14 14 0 1 1 14-14a14 14 0 0 1-14 14",
              className: "clr-i-outline clr-i-outline-path-1"
            }
          ),
          /* @__PURE__ */ React.createElement(
            "path",
            {
              fill: "currentColor",
              d: "M28 12.1a1 1 0 0 0-1.41 0l-11.1 11.05l-6-6A1 1 0 0 0 8 18.53L15.49 26L28 13.52a1 1 0 0 0 0-1.42",
              className: "clr-i-outline clr-i-outline-path-2"
            }
          ),
          /* @__PURE__ */ React.createElement("path", { fill: "none", d: "M0 0h36v36H0z" })
        );
      case "warning":
        return /* @__PURE__ */ React.createElement(
          "svg",
          {
            xmlns: "http://www.w3.org/2000/svg",
            width: "1.5em",
            height: "1.5em",
            viewBox: "0 0 24 24"
          },
          /* @__PURE__ */ React.createElement(
            "path",
            {
              fill: "currentColor",
              d: "M4.126 20q-.234 0-.414-.111t-.28-.293q-.108-.179-.12-.387q-.01-.209.118-.421L11.3 5.212q.128-.212.308-.308T12 4.808t.391.096t.308.308l7.871 13.576q.128.212.117.42q-.01.21-.12.388q-.1.182-.28.293t-.413.111zm.324-1h15.1L12 6zM12 17.616q.262 0 .439-.177t.176-.439t-.177-.438t-.438-.178t-.438.177t-.177.439t.177.439t.438.177m0-2.231q.214 0 .357-.144t.143-.356v-4q0-.213-.144-.357t-.357-.143t-.356.143t-.143.357v4q0 .212.144.356t.357.144M12 12.5"
            }
          )
        );
      case "info":
        return /* @__PURE__ */ React.createElement(
          "svg",
          {
            xmlns: "http://www.w3.org/2000/svg",
            width: "1.5em",
            height: "1.5em",
            viewBox: "0 0 24 24"
          },
          /* @__PURE__ */ React.createElement("g", { fill: "none", stroke: "currentColor", strokeLinejoin: "round" }, /* @__PURE__ */ React.createElement(
            "circle",
            {
              cx: "12",
              cy: "12",
              r: "9",
              strokeLinecap: "round",
              strokeWidth: "1.5"
            }
          ), /* @__PURE__ */ React.createElement("path", { strokeWidth: "2.25", d: "M12 8h.01v.01H12z" }), /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeWidth: "1.5", d: "M12 12v4" }))
        );
      case "error":
        return /* @__PURE__ */ React.createElement(
          "svg",
          {
            xmlns: "http://www.w3.org/2000/svg",
            width: "1.5em",
            height: "1.5em",
            viewBox: "0 0 512 512"
          },
          /* @__PURE__ */ React.createElement(
            "path",
            {
              fill: "currentColor",
              fillRule: "evenodd",
              d: "M256 42.667c117.803 0 213.334 95.53 213.334 213.333S373.803 469.334 256 469.334S42.667 373.803 42.667 256S138.197 42.667 256 42.667m0 42.667c-94.1 0-170.666 76.565-170.666 170.666c0 94.102 76.565 170.667 170.666 170.667c94.102 0 170.667-76.565 170.667-170.667c0-94.101-76.565-170.666-170.667-170.666m48.918 91.584l30.165 30.165L286.166 256l48.917 48.918l-30.165 30.165L256 286.166l-48.917 48.917l-30.165-30.165L225.835 256l-48.917-48.917l30.165-30.165L256 225.835z"
            }
          )
        );
      case "success":
        return /* @__PURE__ */ React.createElement(
          "svg",
          {
            xmlns: "http://www.w3.org/2000/svg",
            width: "1.5em",
            height: "1.5em",
            viewBox: "0 0 36 36"
          },
          /* @__PURE__ */ React.createElement(
            "path",
            {
              fill: "currentColor",
              d: "M18 2a16 16 0 1 0 16 16A16 16 0 0 0 18 2m0 30a14 14 0 1 1 14-14a14 14 0 0 1-14 14",
              className: "clr-i-outline clr-i-outline-path-1"
            }
          ),
          /* @__PURE__ */ React.createElement(
            "path",
            {
              fill: "currentColor",
              d: "M28 12.1a1 1 0 0 0-1.41 0l-11.1 11.05l-6-6A1 1 0 0 0 8 18.53L15.49 26L28 13.52a1 1 0 0 0 0-1.42",
              className: "clr-i-outline clr-i-outline-path-2"
            }
          ),
          /* @__PURE__ */ React.createElement("path", { fill: "none", d: "M0 0h36v36H0z" })
        );
    }
  }
  function handleVariantChange() {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isHintNode(node)) {
        const currentVariant = node.__variant;
        const currentIndex = variantOrder.indexOf(currentVariant);
        const nextIndex = (currentIndex + 1) % variantOrder.length;
        const nextVariant = variantOrder[nextIndex];
        node.setVariant(nextVariant);
      }
    });
  }
  return /* @__PURE__ */ React.createElement("div", { className: hintVariants({ variant }) }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      disabled: !editor.isEditable(),
      onClick: handleVariantChange,
      className: "cursor-pointer max-sm:mb-1 ml-2"
    },
    handleIcon(variant)
  ), /* @__PURE__ */ React.createElement(LexicalNestedComposer, { initialEditor: captionEditor }, /* @__PURE__ */ React.createElement(HistoryPlugin, null), /* @__PURE__ */ React.createElement(
    PlainTextPlugin,
    {
      contentEditable: /* @__PURE__ */ React.createElement(
        ContentEditable,
        {
          className: "\r\n                    flex-1 ml-3\r\n                    border-0 resize-none cursor-text\r\n                    block  relative outline-none   select-text\r\n                    whitespace-pre-wrap break-words\r\n                ",
          "aria-placeholder": "Write hint caption",
          contentEditable: editor.isEditable(),
          "aria-disabled": true,
          placeholder: /* @__PURE__ */ React.createElement(
            "div",
            {
              className: "  \r\n                    text-base text-[#999] overflow-hidden absolute top-[17px] left-[55px]  \r\n                    select-none text-nowrap inline-block text-ellipsis pointer-events-none\r\n                  "
            },
            "Write your note"
          )
        }
      ),
      ErrorBoundary: LexicalErrorBoundary
    }
  )));
}
export {
  HintComponent as default
};
