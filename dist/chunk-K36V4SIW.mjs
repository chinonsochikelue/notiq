import {
  DropDown
} from "./chunk-EGMI62PP.mjs";
import {
  formatBulletList,
  formatCheckList,
  formatCode,
  formatHeading,
  formatNumberedList,
  formatParagraph,
  formatQuote
} from "./chunk-PZSUSXQG.mjs";
import {
  React,
  __spreadProps,
  __spreadValues,
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/components/ui/drop-downs/block-format.tsx
init_react_shim();
import { useMemo } from "react";
import {
  Pilcrow,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  List,
  ListTodo,
  ListOrdered,
  Braces,
  Quote
} from "lucide-react";
function BlockFormatDropDown({
  editor,
  blockType,
  disabled = false,
  style,
  ShowChevronsUpDown = true,
  side,
  sideOffset
}) {
  const Blocks = useMemo(
    () => ({
      paragraph: {
        icon: /* @__PURE__ */ React.createElement(Pilcrow, { className: "size-4" }),
        label: "paragraph",
        desc: "Just start writing plain text.",
        func: () => formatParagraph(editor)
      },
      h1: {
        icon: /* @__PURE__ */ React.createElement(Heading1, { className: "size-4" }),
        desc: "Heading 1 for main titles.",
        label: "Heading 1",
        func: () => formatHeading(editor, blockType, "h1")
      },
      h2: {
        icon: /* @__PURE__ */ React.createElement(Heading2, { className: "size-4" }),
        desc: "Heading 2 for major sections.",
        label: "Heading 2",
        func: () => formatHeading(editor, blockType, "h2")
      },
      h3: {
        icon: /* @__PURE__ */ React.createElement(Heading3, { className: "size-4" }),
        desc: "Heading 3 for sub-sections.",
        label: "Heading 3",
        func: () => formatHeading(editor, blockType, "h3")
      },
      h4: {
        icon: /* @__PURE__ */ React.createElement(Heading4, { className: "size-4" }),
        desc: "Heading 4 for minor sections.",
        label: "Heading 4",
        func: () => formatHeading(editor, blockType, "h4")
      },
      h5: {
        icon: /* @__PURE__ */ React.createElement(Heading5, { className: "size-4" }),
        desc: "Heading 5 for small headings.",
        label: "Heading 5",
        func: () => formatHeading(editor, blockType, "h5")
      },
      h6: {
        icon: /* @__PURE__ */ React.createElement(Heading6, { className: "size-4" }),
        desc: "Heading 6 for tiny headings.",
        label: "Heading 6",
        func: () => formatHeading(editor, blockType, "h6")
      },
      bullet: {
        icon: /* @__PURE__ */ React.createElement(List, { className: "size-4" }),
        desc: "Bullet list for unordered items.",
        label: "Bullet List",
        func: () => formatBulletList(editor, blockType)
      },
      check: {
        icon: /* @__PURE__ */ React.createElement(ListTodo, { className: "size-4" }),
        desc: "Checklist for tasks or to-dos.",
        label: "check box",
        func: () => formatCheckList(editor, blockType)
      },
      number: {
        icon: /* @__PURE__ */ React.createElement(ListOrdered, { className: "size-4" }),
        desc: "Numbered list for ordered items.",
        label: "Numbered list",
        func: () => formatNumberedList(editor, blockType)
      },
      code: {
        icon: /* @__PURE__ */ React.createElement(Braces, { className: "size-4" }),
        desc: "Code block for snippets.",
        label: "Code",
        func: () => formatCode(editor, blockType)
      },
      quote: {
        icon: /* @__PURE__ */ React.createElement(Quote, { className: "size-4" }),
        desc: "Blockquote for quotations.",
        label: "Blockquote",
        func: () => formatQuote(editor, blockType)
      }
    }),
    [editor]
  );
  const currentBlock = Blocks[blockType] || Blocks.paragraph;
  return /* @__PURE__ */ React.createElement(
    DropDown,
    {
      TriggerClassName: __spreadProps(__spreadValues({}, style), { width: "100%" }),
      disabled,
      side,
      sideOffset,
      className: "h-7 min-w-[29px] w-[29px] px-2 border-none cursor-pointer dark:bg-zinc-850  hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800",
      TriggerLabel: /* @__PURE__ */ React.createElement(React.Fragment, null, currentBlock.icon, /* @__PURE__ */ React.createElement("span", { className: "max-sm:hidden" }, currentBlock.label)),
      ShowChevronsUpDown,
      values: Object.values(Blocks)
    }
  );
}

export {
  BlockFormatDropDown
};
