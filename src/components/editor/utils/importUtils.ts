import {
  $getRoot,
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  $createTextNode,
  $createLineBreakNode,
  type LexicalEditor,
} from "lexical";
import { $convertFromMarkdownString } from "@lexical/markdown";
import { $generateNodesFromDOM } from "@lexical/html";
import { NOTIQ_TRANSFORMERS } from "./markdownTransformers";

export type ImportFormat = "markdown" | "json" | "html" | "text";
export type ImportMode = "replace" | "append" | "insert";

/**
 * Detects the document format from file extension and string content.
 */
export function detectContentFormat(
  content: string,
  filename?: string
): ImportFormat {
  if (filename) {
    const ext = filename.toLowerCase().split(".").pop();
    if (ext === "md" || ext === "markdown") return "markdown";
    if (ext === "json" || ext === "lexical") return "json";
    if (ext === "html" || ext === "htm") return "html";
    if (ext === "txt") return "text";
  }

  const trimmed = content.trim();

  // JSON detection
  if (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  ) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && (parsed.root || parsed.editorState || Array.isArray(parsed))) {
        return "json";
      }
    } catch {
      // Not valid JSON
    }
  }

  // HTML detection
  if (
    /<!doctype html>/i.test(trimmed) ||
    (/<\/?[a-z][\s\S]*>/i.test(trimmed) &&
      (trimmed.includes("<p>") ||
        trimmed.includes("<div") ||
        trimmed.includes("<h1") ||
        trimmed.includes("<html") ||
        trimmed.includes("<body")))
  ) {
    return "html";
  }

  // Markdown detection
  if (
    /(^|\n)(#{1,6}\s|>\s|[-*+]\s|\d+\.\s|```|\|.*\|)/.test(trimmed) ||
    /\[.*?\]\(.*?\)/.test(trimmed) ||
    /\*\*.*?\*\*/.test(trimmed) ||
    /_{2}.*?_{2}/.test(trimmed)
  ) {
    return "markdown";
  }

  return "text";
}

/**
 * Imports Markdown content into the Lexical editor.
 */
export function importMarkdownToEditor(
  editor: LexicalEditor,
  markdown: string,
  mode: ImportMode = "replace"
): void {
  editor.update(
    () => {
      if (mode === "replace") {
        const root = $getRoot();
        root.clear();
        $convertFromMarkdownString(markdown, NOTIQ_TRANSFORMERS, root, true);
      } else if (mode === "append") {
        const root = $getRoot();
        $convertFromMarkdownString(markdown, NOTIQ_TRANSFORMERS, root, true);
      } else {
        // insert at cursor
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const tempP = $createParagraphNode();
          $convertFromMarkdownString(markdown, NOTIQ_TRANSFORMERS, tempP, true);
          const children = tempP.getChildren();
          if (children.length > 0) {
            selection.insertNodes(children);
          } else {
            selection.insertText(markdown);
          }
        } else {
          const root = $getRoot();
          $convertFromMarkdownString(markdown, NOTIQ_TRANSFORMERS, root, true);
        }
      }
    },
    { discrete: true }
  );
}

/**
 * Imports serialized Lexical JSON document state.
 */
export function importJSONToEditor(
  editor: LexicalEditor,
  jsonString: string | object
): boolean {
  try {
    const parsed =
      typeof jsonString === "string" ? JSON.parse(jsonString) : jsonString;
    const stateData = parsed.editorState || parsed;
    const editorState = editor.parseEditorState(stateData);
    editor.setEditorState(editorState);
    return true;
  } catch (err) {
    console.error("[Notiq Import JSON Error]:", err);
    throw err;
  }
}

/**
 * Imports HTML content into the Lexical editor.
 */
export function importHTMLToEditor(
  editor: LexicalEditor,
  html: string,
  mode: ImportMode = "replace"
): void {
  editor.update(
    () => {
      const parser = new DOMParser();
      const cleanHtml = html.replace(/<!DOCTYPE html>/i, "").trim();
      const dom = parser.parseFromString(cleanHtml, "text/html");
      const nodes = $generateNodesFromDOM(editor, dom);

      if (nodes.length === 0) return;

      if (mode === "replace") {
        const root = $getRoot();
        root.clear();
        root.append(...nodes);
      } else if (mode === "append") {
        const root = $getRoot();
        root.append(...nodes);
      } else {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          selection.insertNodes(nodes);
        } else {
          $getRoot().append(...nodes);
        }
      }
    },
    { discrete: true }
  );
}

/**
 * Imports plain text with preserved line breaks into the Lexical editor.
 */
export function importPlainTextToEditor(
  editor: LexicalEditor,
  text: string,
  mode: ImportMode = "replace"
): void {
  editor.update(
    () => {
      const blocks = text.split(/\r?\n\r?\n/);
      const nodes = blocks.map((block) => {
        const p = $createParagraphNode();
        const lines = block.split(/\r?\n/);
        lines.forEach((line, idx) => {
          if (idx > 0) p.append($createLineBreakNode());
          p.append($createTextNode(line));
        });
        return p;
      });

      if (mode === "replace") {
        const root = $getRoot();
        root.clear();
        root.append(...nodes);
      } else if (mode === "append") {
        $getRoot().append(...nodes);
      } else {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          selection.insertNodes(nodes);
        } else {
          $getRoot().append(...nodes);
        }
      }
    },
    { discrete: true }
  );
}

/**
 * High-level unified dispatcher for importing content based on format.
 */
export function importContentToEditor(
  editor: LexicalEditor,
  content: string,
  format: ImportFormat,
  mode: ImportMode = "replace"
): void {
  switch (format) {
    case "json":
      importJSONToEditor(editor, content);
      break;
    case "html":
      importHTMLToEditor(editor, content, mode);
      break;
    case "markdown":
      importMarkdownToEditor(editor, content, mode);
      break;
    case "text":
    default:
      importPlainTextToEditor(editor, content, mode);
      break;
  }
}
