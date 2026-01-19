"use client";
import {
  sanitizeUrl
} from "./chunk-4VWFVWYP.mjs";
import {
  cn
} from "./chunk-YHPNOWFH.mjs";
import {
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/components/editor/plugins/ToolbarPlugin/MobileToolbar.tsx
init_react_shim();
import React, { useEffect, useState } from "react";
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND
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
  List,
  ListOrdered,
  Link as LinkIcon,
  Code,
  Quote,
  CheckSquare
} from "lucide-react";
import { TOGGLE_LINK_COMMAND } from "@lexical/link";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_CHECK_LIST_COMMAND
} from "@lexical/list";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
function MobileToolbar({
  editor,
  activeEditor,
  toolbarState,
  setIsLinkEditMode,
  isVisible,
  toolbarConfig
}) {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [bottomOffset, setBottomOffset] = useState(0);
  useEffect(() => {
    const visualViewport = window.visualViewport;
    const handleResize = () => {
      if (!visualViewport) return;
      const windowHeight = window.innerHeight;
      const viewportHeight = visualViewport.height;
      const offsetTop = visualViewport.offsetTop;
      const viewportBottom = offsetTop + viewportHeight;
      const diff = windowHeight - viewportBottom;
      setBottomOffset(Math.max(0, diff));
      setIsKeyboardOpen(viewportHeight < windowHeight * 0.85);
    };
    if (visualViewport) {
      visualViewport.addEventListener("resize", handleResize);
      visualViewport.addEventListener("scroll", handleResize);
      handleResize();
    }
    return () => {
      if (visualViewport) {
        visualViewport.removeEventListener("resize", handleResize);
        visualViewport.removeEventListener("scroll", handleResize);
      }
    };
  }, []);
  const ToolbarButton = ({
    onClick,
    isActive,
    icon: Icon,
    label
  }) => /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: (e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      },
      className: cn(
        "flex items-center justify-center min-w-[36px] h-9 rounded-xl transition-all duration-200 active:scale-95 touch-manipulation",
        isActive ? cn("bg-blue-600 text-white shadow-md shadow-blue-500/20", toolbarConfig == null ? void 0 : toolbarConfig.activeItemClassName) : cn("bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800", toolbarConfig == null ? void 0 : toolbarConfig.mobileItemClassName)
      ),
      "aria-label": label
    },
    /* @__PURE__ */ React.createElement(Icon, { className: "w-5 h-5 stroke-[2.5]" })
  );
  const formatHeading = (headingLevel) => {
    activeEditor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(headingLevel));
      }
    });
  };
  const formatQuote = () => {
    activeEditor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode());
      }
    });
  };
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      className: cn(
        "fixed left-0 w-full z-50 md:hidden transition-all duration-300 ease-out",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
      ),
      style: {
        bottom: `${bottomOffset}px`
      }
    },
    /* @__PURE__ */ React.createElement(
      "div",
      {
        className: cn(
          "w-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-800/50 pointer-events-auto",
          "pb-[env(safe-area-inset-bottom)]",
          toolbarConfig == null ? void 0 : toolbarConfig.mobileClassName
        ),
        onMouseDown: (e) => {
          if (e.target instanceof Element && e.target.tagName !== "INPUT") {
            e.preventDefault();
          }
        }
      },
      /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5 px-3 py-2 overflow-x-auto no-scrollbar scroll-smooth w-full" }, /* @__PURE__ */ React.createElement(
        ToolbarButton,
        {
          onClick: () => activeEditor.dispatchCommand(UNDO_COMMAND, void 0),
          icon: Undo2,
          label: "Undo",
          isActive: false
        }
      ), /* @__PURE__ */ React.createElement(
        ToolbarButton,
        {
          onClick: () => activeEditor.dispatchCommand(REDO_COMMAND, void 0),
          icon: Redo2,
          label: "Redo",
          isActive: false
        }
      ), /* @__PURE__ */ React.createElement("div", { className: "w-px h-6 bg-gray-200 dark:bg-gray-800 mx-1 flex-shrink-0" }), /* @__PURE__ */ React.createElement(
        ToolbarButton,
        {
          onClick: () => activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold"),
          isActive: toolbarState.isBold,
          icon: Bold,
          label: "Bold"
        }
      ), /* @__PURE__ */ React.createElement(
        ToolbarButton,
        {
          onClick: () => activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic"),
          isActive: toolbarState.isItalic,
          icon: Italic,
          label: "Italic"
        }
      ), /* @__PURE__ */ React.createElement(
        ToolbarButton,
        {
          onClick: () => activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline"),
          isActive: toolbarState.isUnderline,
          icon: Underline,
          label: "Underline"
        }
      ), /* @__PURE__ */ React.createElement(
        ToolbarButton,
        {
          onClick: () => activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough"),
          isActive: toolbarState.isStrikethrough,
          icon: Strikethrough,
          label: "Strikethrough"
        }
      ), /* @__PURE__ */ React.createElement("div", { className: "w-px h-6 bg-gray-200 dark:bg-gray-800 mx-1 flex-shrink-0" }), /* @__PURE__ */ React.createElement(
        ToolbarButton,
        {
          onClick: () => formatHeading("h1"),
          isActive: toolbarState.blockType === "h1",
          icon: Heading1,
          label: "Heading 1"
        }
      ), /* @__PURE__ */ React.createElement(
        ToolbarButton,
        {
          onClick: () => formatHeading("h2"),
          isActive: toolbarState.blockType === "h2",
          icon: Heading2,
          label: "Heading 2"
        }
      ), /* @__PURE__ */ React.createElement("div", { className: "w-px h-6 bg-gray-200 dark:bg-gray-800 mx-1 flex-shrink-0" }), /* @__PURE__ */ React.createElement(
        ToolbarButton,
        {
          onClick: () => activeEditor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, void 0),
          isActive: toolbarState.blockType === "bullet",
          icon: List,
          label: "Bullet List"
        }
      ), /* @__PURE__ */ React.createElement(
        ToolbarButton,
        {
          onClick: () => activeEditor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, void 0),
          isActive: toolbarState.blockType === "number",
          icon: ListOrdered,
          label: "Numbered List"
        }
      ), /* @__PURE__ */ React.createElement(
        ToolbarButton,
        {
          onClick: () => activeEditor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, void 0),
          isActive: toolbarState.blockType === "check",
          icon: CheckSquare,
          label: "Check List"
        }
      ), /* @__PURE__ */ React.createElement("div", { className: "w-px h-6 bg-gray-200 dark:bg-gray-800 mx-1 flex-shrink-0" }), /* @__PURE__ */ React.createElement(
        ToolbarButton,
        {
          onClick: () => formatQuote(),
          isActive: toolbarState.blockType === "quote",
          icon: Quote,
          label: "Quote"
        }
      ), /* @__PURE__ */ React.createElement(
        ToolbarButton,
        {
          onClick: () => activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "code"),
          isActive: toolbarState.isCode,
          icon: Code,
          label: "Code"
        }
      ), /* @__PURE__ */ React.createElement(
        ToolbarButton,
        {
          onClick: () => {
            if (!toolbarState.isLink) {
              setIsLinkEditMode(true);
              activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeUrl("https://"));
            } else {
              setIsLinkEditMode(false);
              activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
            }
          },
          isActive: toolbarState.isLink,
          icon: LinkIcon,
          label: "Link"
        }
      ))
    )
  );
}
export {
  MobileToolbar as default
};
