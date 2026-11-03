import { Extension } from "../extension";
import {
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  ParagraphNode,
  TextFormatType,
} from "lexical";
import {
  HeadingNode,
  QuoteNode,
  $createHeadingNode,
  $createQuoteNode,
} from "@lexical/rich-text";
import {
  ListNode,
  ListItemNode,
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_CHECK_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";
import { CodeNode, CodeHighlightNode, $createCodeNode } from "@lexical/code";
import { $setBlocksType } from "@lexical/selection";

function ensureRangeSelection() {
  let selection = $getSelection();
  if (!$isRangeSelection(selection)) {
    const root = $getRoot();
    let first = root.getFirstChild();
    if (!first) {
      first = $createParagraphNode();
      root.append(first);
    }
    if (typeof (first as any).selectStart === "function") {
      (first as any).selectStart();
    } else if (typeof (first as any).select === "function") {
      (first as any).select();
    }
    selection = $getSelection();
  }
  return $isRangeSelection(selection) ? selection : null;
}

function applyFormat(format: TextFormatType): boolean {
  const selection = ensureRangeSelection();
  if (selection) {
    selection.formatText(format);
    return true;
  }
  return false;
}

// 1. Bold Extension
export const Bold = Extension.create({
  name: "bold",
  addCommands: () => ({
    toggleBold: () => () => applyFormat("bold"),
  }),
  addKeyboardShortcuts: ({ editor }) => ({
    "Mod-b": () => editor.commands.toggleBold(),
  }),
});

// 2. Italic Extension
export const Italic = Extension.create({
  name: "italic",
  addCommands: () => ({
    toggleItalic: () => () => applyFormat("italic"),
  }),
  addKeyboardShortcuts: ({ editor }) => ({
    "Mod-i": () => editor.commands.toggleItalic(),
  }),
});

// 3. Underline Extension
export const Underline = Extension.create({
  name: "underline",
  addCommands: () => ({
    toggleUnderline: () => () => applyFormat("underline"),
  }),
  addKeyboardShortcuts: ({ editor }) => ({
    "Mod-u": () => editor.commands.toggleUnderline(),
  }),
});

// 4. Strike Extension
export const Strike = Extension.create({
  name: "strike",
  addCommands: () => ({
    toggleStrike: () => () => applyFormat("strikethrough"),
  }),
});

// 5. Code Extension (Inline code)
export const Code = Extension.create({
  name: "code",
  addCommands: () => ({
    toggleCode: () => () => applyFormat("code"),
  }),
});

// 6. Paragraph Extension
export const Paragraph = Extension.create({
  name: "paragraph",
  nodes: () => [ParagraphNode],
  addCommands: () => ({
    setParagraph: () => () => {
      const selection = ensureRangeSelection();
      if (selection) {
        $setBlocksType(selection, () => $createParagraphNode());
        return true;
      }
      return false;
    },
  }),
});

// 7. Heading Extension
export interface HeadingOptions {
  levels: number[];
}

export const Heading = Extension.create<HeadingOptions>({
  name: "heading",
  defaultOptions: {
    levels: [1, 2, 3],
  },
  nodes: () => [HeadingNode],
  addCommands: () => ({
    setHeading: ({ level = 1 }: { level?: 1 | 2 | 3 }) => () => {
      const selection = ensureRangeSelection();
      if (selection) {
        $setBlocksType(selection, () => $createHeadingNode(`h${level}` as any));
        return true;
      }
      return false;
    },
    toggleHeading: ({ level = 1 }: { level?: 1 | 2 | 3 }) => ({ editor }) => {
      if (editor.isActive("heading", { level })) {
        return editor.commands.setParagraph();
      }
      return editor.commands.setHeading({ level });
    },
  }),
});

// 8. Blockquote Extension
export const Blockquote = Extension.create({
  name: "blockquote",
  nodes: () => [QuoteNode],
  addCommands: () => ({
    toggleBlockquote: () => ({ editor }) => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        if (editor.isActive("quote")) {
          $setBlocksType(selection, () => $createParagraphNode());
        } else {
          $setBlocksType(selection, () => $createQuoteNode());
        }
        return true;
      }
      return false;
    },
  }),
});

// 9. BulletList Extension
export const BulletList = Extension.create({
  name: "bulletList",
  nodes: () => [ListNode, ListItemNode],
  addCommands: () => ({
    toggleBulletList: () => ({ editor, lexical }) => {
      if (editor.isActive("bulletList")) {
        lexical.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
      } else {
        lexical.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
      }
      return true;
    },
  }),
});

// 10. OrderedList Extension
export const OrderedList = Extension.create({
  name: "orderedList",
  nodes: () => [ListNode, ListItemNode],
  addCommands: () => ({
    toggleOrderedList: () => ({ editor, lexical }) => {
      if (editor.isActive("orderedList")) {
        lexical.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
      } else {
        lexical.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
      }
      return true;
    },
  }),
});

// 11. CheckList Extension
export const CheckList = Extension.create({
  name: "checkList",
  nodes: () => [ListNode, ListItemNode],
  addCommands: () => ({
    toggleCheckList: () => ({ editor, lexical }) => {
      if (editor.isActive("checkList")) {
        lexical.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
      } else {
        lexical.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
      }
      return true;
    },
  }),
});

// 12. CodeBlock Extension (with syntax highlighting)
export interface CodeBlockOptions {
  defaultLanguage: string;
}

export const CodeBlock = Extension.create<CodeBlockOptions>({
  name: "codeBlock",
  defaultOptions: {
    defaultLanguage: "javascript",
  },
  nodes: () => [CodeNode, CodeHighlightNode],
  addCommands: ({ options }) => ({
    setCodeBlock: ({ language }: { language?: string } = {}) => () => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () =>
          $createCodeNode(language || options.defaultLanguage)
        );
        return true;
      }
      return false;
    },
    toggleCodeBlock: ({ language }: { language?: string } = {}) => ({ editor }) => {
      if (editor.isActive("codeBlock")) {
        return editor.commands.setParagraph();
      }
      return editor.commands.setCodeBlock({ language });
    },
  }),
});

// 13. History Extension
export const History = Extension.create({
  name: "history",
  addCommands: () => ({
    undo: () => ({ lexical }) => {
      lexical.dispatchCommand(UNDO_COMMAND, undefined);
      return true;
    },
    redo: () => ({ lexical }) => {
      lexical.dispatchCommand(REDO_COMMAND, undefined);
      return true;
    },
  }),
  addKeyboardShortcuts: ({ editor }) => ({
    "Mod-z": () => editor.commands.undo(),
    "Mod-y": () => editor.commands.redo(),
    "Shift-Mod-z": () => editor.commands.redo(),
  }),
});

// 14. StarterKit - Bundles essential editing extensions into one clean package
export interface StarterKitOptions {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  code?: boolean;
  paragraph?: boolean;
  heading?: boolean | HeadingOptions;
  blockquote?: boolean;
  bulletList?: boolean;
  orderedList?: boolean;
  checkList?: boolean;
  codeBlock?: boolean | CodeBlockOptions;
  history?: boolean;
}

export const StarterKit = Extension.create<StarterKitOptions>({
  name: "starterKit",
  defaultOptions: {
    bold: true,
    italic: true,
    underline: true,
    strike: true,
    code: true,
    paragraph: true,
    heading: true,
    blockquote: true,
    bulletList: true,
    orderedList: true,
    checkList: true,
    codeBlock: true,
    history: true,
  },
  addExtensions: () => {
    return [
      Bold,
      Italic,
      Underline,
      Strike,
      Code,
      Paragraph,
      Heading,
      Blockquote,
      BulletList,
      OrderedList,
      CheckList,
      CodeBlock,
      History,
    ];
  },
});
