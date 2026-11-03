import { $createCodeNode } from "@lexical/code";
import {
  $createParagraphNode,
  $createRangeSelection,
  $createTextNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  createEditor,
  ElementNode,
  LexicalEditor,
  LexicalNode,
  TextNode,
} from "lexical";
import {
  $createHeadingNode,
  $createQuoteNode,
  HeadingNode,
  QuoteNode,
} from '@lexical/rich-text';
import {
  $createHorizontalRuleNode,
  $isHorizontalRuleNode,
  HorizontalRuleNode,
} from '@lexical/react/LexicalHorizontalRuleNode';
import {
  $convertFromMarkdownString,
  TRANSFORMERS,
  ElementTransformer,
} from '@lexical/markdown';
import { ImageNode, $createImageNode, $isImageNode } from '../nodes/ImageNode';
import { $createStepperNode, StepsType } from "../nodes/Stepper";

function getWordsBeforeSelection(
  editor: LexicalEditor,
  numWords: number
): string {
  let wordsBeforeSelection = "";

  editor.update(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) {
      console.warn("No valid text selection found.");
      return;
    }

    const anchor = selection.anchor;
    const firstTextNode = findFirstTextNode($getRoot());

    if (!firstTextNode) {
      console.warn("No text nodes found in the document.");
      return;
    }

    // Create a range from the first text node start to the selection anchor
    const range = $createRangeSelection();
    range.anchor.set(firstTextNode.__key, 0, 'text');
    range.focus.set(anchor.key, anchor.offset, anchor.type);

    const textContent = range.getTextContent();
    const words = textContent.split(/\s+/).filter(word => word.length > 0);

    const startIndex = Math.max(0, words.length - numWords);
    wordsBeforeSelection = words.slice(startIndex, words.length).join(" ");
  });

  return wordsBeforeSelection;
}

// Helper function to find the first text node in document order
function findFirstTextNode(node: LexicalNode): TextNode | null {
  if ($isTextNode(node)) {
    return node;
  }

  const children = (node as ElementNode).getChildren();
  for (const child of children) {
    const result = findFirstTextNode(child);
    if (result) {
      return result;
    }
  }

  return null;
}


function isJSON(text: string): boolean {
  try {
    JSON.parse(text);
    return true;
  } catch (err) {
    return false;
  }
}
function createEditorWithText(text: string): LexicalEditor {
  const editor = createEditor();
  const editorState = editor.parseEditorState(
    JSON.stringify({
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: text,
                type: "text",
                version: 1,
              },
            ],
            direction: null,
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1,
            textFormat: 0,
            textStyle: "",
          },
        ],
        direction: null,
        format: "",
        indent: 0,
        type: "root",
        version: 1,
      },
    })
  );
  editor.setEditorState(editorState);
  return editor;
}

function GenerateSteps(json: string, editor: LexicalEditor) {
  const stepsData = JSON.parse(json);
  const steps: StepsType = stepsData.map((step: { id: number; title: string; content: string }) => {
    return {
      id: step.id,
      title: step.title,
      content: createEditorWithText(step.content),
    };
  });
  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const stepperNode = $createStepperNode(steps);
      selection.insertNodes([stepperNode]);
    }
    return
  })
}

// getMore = number of words to get if the selection was less than 30 len.
const getSelectedText = (editor: LexicalEditor, getMore?: number) => {
  let selectedText = "";
  let context = getMore ? getWordsBeforeSelection(editor, getMore) : null
  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const selectionText = selection.getTextContent();
      if (selectionText.length > 30) {
        selectedText = selectionText;
      } else {
        selectedText = context + selectionText;
      }
    }
  });

  return selectedText;
};


/**
 * Parses markdown text into top-level Lexical ElementNodes (HeadingNode, CodeNode, ParagraphNode).
 * Ensures that no raw TextNode is ever inserted directly into the root node.
 */
/**
 * Appends formatted inline children (bold, italic, inline code, links, bare URLs)
 * into a parent Lexical node.
 */

import {
  NOTIQ_TRANSFORMERS,
  HR_TRANSFORMER,
  IMAGE_TRANSFORMER,
} from "./markdownTransformers";

/**
 * Pre-processes text to ensure un-prefixed article titles and standalone section
 * headers receive proper Markdown '#' or '##' tags so @lexical/markdown recognizes them.
 */
function normalizeMarkdownHeadings(text: string): string {
  const lines = text.split('\n');
  const result: string[] = [];
  let foundFirstHeading = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      result.push(line);
      continue;
    }

    // Already marked with markdown tags (headings, lists, blockquotes, code, hr, image)
    if (/^(#{1,6}\s|[-*+]\s|\d+\.\s|>|```|---|!\[)/.test(trimmed)) {
      result.push(line);
      if (/^#{1,6}\s/.test(trimmed)) foundFirstHeading = true;
      continue;
    }

    // Standalone title or section header heuristic
    const isShort = trimmed.length >= 3 && trimmed.length <= 100;
    const hasNoEndPunct = !/[.?!;,]$/.test(trimmed);
    const notMeta = !/^by\s+/i.test(trimmed) && !/^\*?date[:\s]/i.test(trimmed) && !/^\*?figure/i.test(trimmed);
    const nextLineEmpty = (i + 1 >= lines.length || !lines[i + 1].trim());

    if (isShort && hasNoEndPunct && notMeta && nextLineEmpty) {
      if (!foundFirstHeading) {
        result.push('# ' + trimmed);
        foundFirstHeading = true;
      } else {
        result.push('## ' + trimmed);
      }
      continue;
    }

    result.push(line);
  }

  return result.join('\n');
}

/**
 * Converts rich markdown into native Lexical nodes using the official @lexical/markdown package,
 * preserving existing document content and inserting at selection.
 */
function parseMarkdownToBlocks(text: string, editor: LexicalEditor): LexicalNode[] {
  const normalized = normalizeMarkdownHeadings(text);
  const root = $getRoot();
  const container = $createParagraphNode();
  root.append(container);

  try {
    $convertFromMarkdownString(normalized, NOTIQ_TRANSFORMERS, container);
    const converted = container.getChildren();
    container.remove();
    return converted;
  } catch (err) {
    console.warn("[Notiq AI] @lexical/markdown conversion error, fallback:", err);
    container.remove();
    const fallbackP = $createParagraphNode();
    fallbackP.append($createTextNode(text));
    return [fallbackP];
  }
}

function applyStyles(AIString: string) {
  return [];
}

function insertText(text: string, editor: LexicalEditor) {
  if (isJSON(text) || text.startsWith("json")) {
    GenerateSteps(text, editor);
    return;
  }

  editor.update(() => {
    const blocks = parseMarkdownToBlocks(text, editor);
    if (blocks.length === 0) return;

    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      try {
        const anchorNode = selection.anchor.getNode();
        const topElement = anchorNode.getTopLevelElement();
        if (topElement) {
          let lastInserted: LexicalNode = topElement;
          blocks.forEach((block) => {
            lastInserted.insertAfter(block);
            lastInserted = block;
          });
          return;
        }
      } catch (err) {
        console.warn("[Notiq AI] Selection insert fallback to root:", err);
      }
    }

    // Always fallback to appending valid Element/Decorator nodes to root
    const root = $getRoot();
    blocks.forEach((block) => root.append(block));
  });
}

function replaceSelectedText(text: string, editor: LexicalEditor) {
  if (isJSON(text) || text.startsWith("json")) {
    GenerateSteps(text, editor);
    return;
  }

  editor.update(() => {
    const blocks = parseMarkdownToBlocks(text, editor);
    if (blocks.length === 0) return;

    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      try {
        selection.removeText();
        const anchorNode = selection.anchor.getNode();
        const topElement = anchorNode.getTopLevelElement();
        if (topElement) {
          let lastInserted: LexicalNode = topElement;
          blocks.forEach((block) => {
            lastInserted.insertAfter(block);
            lastInserted = block;
          });
          return;
        }
      } catch (err) {
        console.warn("[Notiq AI] RangeSelection replace fallback to root:", err);
      }
    }

    const root = $getRoot();
    blocks.forEach((block) => root.append(block));
  });
}

function insertTextUnderSelected(text: string, editor: LexicalEditor) {
  if (isJSON(text) || text.startsWith("json")) {
    GenerateSteps(text, editor);
    return;
  }

  editor.update(() => {
    const blocks = parseMarkdownToBlocks(text, editor);
    if (blocks.length === 0) return;

    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      try {
        const anchorNode = selection.anchor.getNode();
        const topElement = anchorNode.getTopLevelElement();
        if (topElement) {
          let lastInserted: LexicalNode = topElement;
          blocks.forEach((block) => {
            lastInserted.insertAfter(block);
            lastInserted = block;
          });
          return;
        }
      } catch (err) {
        console.warn("[Notiq AI] TopLevelElement insertAfter fallback to root:", err);
      }
    }

    const root = $getRoot();
    blocks.forEach((block) => root.append(block));
  });
}

export {
  replaceSelectedText,
  insertTextUnderSelected,
  getSelectedText,
  insertText,
  getWordsBeforeSelection,
  applyStyles,
  parseMarkdownToBlocks,
  NOTIQ_TRANSFORMERS,
  normalizeMarkdownHeadings,
};
