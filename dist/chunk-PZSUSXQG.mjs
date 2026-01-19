import {
  DEFAULT_FONT_SIZE,
  MAX_ALLOWED_FONT_SIZE,
  MIN_ALLOWED_FONT_SIZE
} from "./chunk-7NZAPJ4G.mjs";
import {
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/components/editor/utils/editorFormatting.ts
init_react_shim();
import { $createCodeNode } from "@lexical/code";
import {
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND
} from "@lexical/list";
import { $isDecoratorBlockNode } from "@lexical/react/LexicalDecoratorBlockNode";
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  $isQuoteNode
} from "@lexical/rich-text";
import { $patchStyleText, $setBlocksType } from "@lexical/selection";
import { $isTableSelection } from "@lexical/table";
import { $getNearestBlockElementAncestorOrThrow } from "@lexical/utils";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  $isTextNode
} from "lexical";
var calculateNextFontSize = (currentFontSize, updateType) => {
  if (!updateType) {
    return currentFontSize;
  }
  let updatedFontSize = currentFontSize;
  switch (updateType) {
    case 2 /* decrement */:
      switch (true) {
        case currentFontSize > MAX_ALLOWED_FONT_SIZE:
          updatedFontSize = MAX_ALLOWED_FONT_SIZE;
          break;
        case currentFontSize >= 48:
          updatedFontSize -= 12;
          break;
        case currentFontSize >= 24:
          updatedFontSize -= 4;
          break;
        case currentFontSize >= 14:
          updatedFontSize -= 2;
          break;
        case currentFontSize >= 9:
          updatedFontSize -= 1;
          break;
        default:
          updatedFontSize = MIN_ALLOWED_FONT_SIZE;
          break;
      }
      break;
    case 1 /* increment */:
      switch (true) {
        case currentFontSize < MIN_ALLOWED_FONT_SIZE:
          updatedFontSize = MIN_ALLOWED_FONT_SIZE;
          break;
        case currentFontSize < 12:
          updatedFontSize += 1;
          break;
        case currentFontSize < 20:
          updatedFontSize += 2;
          break;
        case currentFontSize < 36:
          updatedFontSize += 4;
          break;
        case currentFontSize <= 60:
          updatedFontSize += 12;
          break;
        default:
          updatedFontSize = MAX_ALLOWED_FONT_SIZE;
          break;
      }
      break;
    default:
      break;
  }
  return updatedFontSize;
};
var updateFontSizeInSelection = (editor, newFontSize, updateType) => {
  const getNextFontSize = (prevFontSize) => {
    if (!prevFontSize) {
      prevFontSize = `${DEFAULT_FONT_SIZE}px`;
    }
    prevFontSize = prevFontSize.slice(0, -2);
    const nextFontSize = calculateNextFontSize(
      Number(prevFontSize),
      updateType
    );
    return `${nextFontSize}px`;
  };
  editor.update(() => {
    if (editor.isEditable()) {
      const selection = $getSelection();
      if (selection !== null) {
        $patchStyleText(selection, {
          "font-size": newFontSize || getNextFontSize
        });
      }
    }
  });
};
var updateFontSize = (editor, updateType, inputValue) => {
  if (inputValue !== "") {
    const nextFontSize = calculateNextFontSize(Number(inputValue), updateType);
    updateFontSizeInSelection(editor, String(nextFontSize) + "px", null);
  } else {
    updateFontSizeInSelection(editor, null, updateType);
  }
};
var formatParagraph = (editor) => {
  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      $setBlocksType(selection, () => $createParagraphNode());
    }
  });
};
var formatHeading = (editor, blockType, headingSize) => {
  if (blockType !== headingSize) {
    editor.update(() => {
      const selection = $getSelection();
      $setBlocksType(selection, () => $createHeadingNode(headingSize));
    });
  }
};
var formatBulletList = (editor, blockType) => {
  if (blockType !== "bullet") {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, void 0);
  } else {
    formatParagraph(editor);
  }
};
var formatCheckList = (editor, blockType) => {
  if (blockType !== "check") {
    editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, void 0);
  } else {
    formatParagraph(editor);
  }
};
var formatNumberedList = (editor, blockType) => {
  if (blockType !== "number") {
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, void 0);
  } else {
    formatParagraph(editor);
  }
};
var formatQuote = (editor, blockType) => {
  if (blockType !== "quote") {
    editor.update(() => {
      const selection = $getSelection();
      $setBlocksType(selection, () => $createQuoteNode());
    });
  }
};
var formatCode = (editor, blockType) => {
  if (blockType !== "code") {
    editor.update(() => {
      let selection = $getSelection();
      if (selection !== null) {
        if (selection.isCollapsed()) {
          $setBlocksType(selection, () => $createCodeNode());
        } else {
          const textContent = selection.getTextContent();
          const codeNode = $createCodeNode();
          selection.insertNodes([codeNode]);
          selection = $getSelection();
          if ($isRangeSelection(selection)) {
            selection.insertRawText(textContent);
          }
        }
      }
    });
  }
};
var clearFormatting = (editor) => {
  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection) || $isTableSelection(selection)) {
      const anchor = selection.anchor;
      const focus = selection.focus;
      const nodes = selection.getNodes();
      const extractedNodes = selection.extract();
      if (anchor.key === focus.key && anchor.offset === focus.offset) {
        return;
      }
      nodes.forEach((node, idx) => {
        if ($isTextNode(node)) {
          let textNode = node;
          if (idx === 0 && anchor.offset !== 0) {
            textNode = textNode.splitText(anchor.offset)[1] || textNode;
          }
          if (idx === nodes.length - 1) {
            textNode = textNode.splitText(focus.offset)[0] || textNode;
          }
          const extractedTextNode = extractedNodes[0];
          if (nodes.length === 1 && $isTextNode(extractedTextNode)) {
            textNode = extractedTextNode;
          }
          if (textNode.__style !== "") {
            textNode.setStyle("");
          }
          if (textNode.__format !== 0) {
            textNode.setFormat(0);
            $getNearestBlockElementAncestorOrThrow(textNode).setFormat("");
          }
          node = textNode;
        } else if ($isHeadingNode(node) || $isQuoteNode(node)) {
          node.replace($createParagraphNode(), true);
        } else if ($isDecoratorBlockNode(node)) {
          node.setFormat("");
        }
      });
    }
  });
};

export {
  updateFontSizeInSelection,
  updateFontSize,
  formatParagraph,
  formatHeading,
  formatBulletList,
  formatCheckList,
  formatNumberedList,
  formatQuote,
  formatCode,
  clearFormatting
};
