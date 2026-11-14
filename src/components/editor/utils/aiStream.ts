import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isTextNode,
  $parseSerializedNode,
  createEditor,
  type Klass,
  type LexicalEditor,
  type LexicalNode,
  type SerializedLexicalNode,
} from "lexical";
import { $convertFromMarkdownString } from "@lexical/markdown";
import { NOTIQ_TRANSFORMERS } from "./markdownTransformers";

export const AI_GENERATED_STYLE =
  "color: #7c3aed; background-color: rgba(139, 92, 246, 0.08); border-radius: 3px;";

export const AI_CARET_STYLE =
  "color: #7c3aed; font-size: 0.78em; animation: notiq-ai-pulse 1s ease-in-out infinite;";

export const AI_CARET_TEXT = " ●";

let cachedDetachedEditor: LexicalEditor | null = null;
let cachedNodesRef: ReadonlyArray<Klass<LexicalNode>> | null = null;

function getDetachedMarkdownEditor(
  nodes: ReadonlyArray<Klass<LexicalNode>>
): LexicalEditor {
  if (cachedDetachedEditor && cachedNodesRef === nodes) {
    return cachedDetachedEditor;
  }
  cachedNodesRef = nodes;
  cachedDetachedEditor = createEditor({
    namespace: "notiq-ai-markdown-parser",
    nodes: [...nodes],
    onError: (err) => {
      console.warn("[Notiq AI Stream Parser]:", err);
    },
  });
  return cachedDetachedEditor;
}

/**
 * Sanitizes an in-flight markdown stream so incomplete fences, math blocks,
 * or raw HTML/MDX tags don't flash as broken literal syntax while streaming.
 */
export function sanitizeStreamingMarkdown(raw: string): string {
  if (!raw) return "";
  let text = raw.replace(/\r\n/g, "\n");

  // 1. Strip an incomplete trailing HTML/MDX tag (e.g. "<callout", "<span style=...")
  text = text.replace(/<[a-zA-Z][^>\n]*$/, "");

  // 2. If there is an unclosed $$ math block at the end, hold back the incomplete tail
  const mathMatches = text.match(/\$\$/g);
  if (mathMatches && mathMatches.length % 2 === 1) {
    const lastIdx = text.lastIndexOf("$$");
    text = text.slice(0, lastIdx);
  }

  // 3. If there is an unclosed fenced code block (```), handle it cleanly:
  // For unclosed ```excalidraw blocks, show a clean status placeholder instead of
  // flashing raw JSON lines in the editor; for regular code blocks, close the fence.
  const fenceMatches = text.match(/^```/gm);
  if (fenceMatches && fenceMatches.length % 2 === 1) {
    const lastFenceIdx = text.lastIndexOf("```");
    const tail = text.slice(lastFenceIdx);
    if (/^```excalidraw\b/i.test(tail)) {
      text =
        text.slice(0, lastFenceIdx) +
        "> 🎨 *Drawing interactive Excalidraw diagram...*";
    } else {
      text = text + "\n```";
    }
  }

  // 4. Collapse multi-line GFM callout blocks (> [!TIP]\n> body...) into single-line
  // form (> [!TIP] body...) so HINT_TRANSFORMER captures the full callout body
  // instead of leaving an empty callout + trailing blockquote.
  const lines = text.split("\n");
  const collapsed: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const calloutMatch = line.match(
      /^(>\s*\[!(?:NOTE|TIP|IMPORTANT|WARNING|CAUTION|INFO|ERROR)\])\s*(.*)$/i
    );
    if (calloutMatch) {
      const tag = calloutMatch[1];
      const parts: string[] = [];
      if (calloutMatch[2]?.trim()) {
        parts.push(calloutMatch[2].trim());
      }
      while (i + 1 < lines.length && /^>\s?(.*)$/.test(lines[i + 1])) {
        const nextLine = lines[i + 1];
        if (/^>\s*\[!/i.test(nextLine)) break;
        const body = nextLine.replace(/^>\s?/, "").trim();
        if (body) parts.push(body);
        i++;
      }
      collapsed.push(parts.length > 0 ? `${tag} ${parts.join(" ")}` : tag);
    } else {
      collapsed.push(line);
    }
  }
  text = collapsed.join("\n");

  return text;
}

function $serializeNodeTree(node: LexicalNode): SerializedLexicalNode {
  const json = node.exportJSON() as any;
  if ($isElementNode(node)) {
    json.children = node.getChildren().map($serializeNodeTree);
  }
  return json;
}

/**
 * Parses a markdown string into serialized Lexical nodes using a detached editor.
 */
export function serializeMarkdownToNodes(
  markdown: string,
  nodes: ReadonlyArray<Klass<LexicalNode>>
): SerializedLexicalNode[] {
  const sanitized = sanitizeStreamingMarkdown(markdown);
  if (!sanitized.trim()) return [];

  const detached = getDetachedMarkdownEditor(nodes);
  let serializedChildren: SerializedLexicalNode[] = [];

  detached.update(
    () => {
      $getRoot().clear();
      $convertFromMarkdownString(sanitized, NOTIQ_TRANSFORMERS);
      serializedChildren = $getRoot().getChildren().map($serializeNodeTree);
    },
    { discrete: true }
  );

  return serializedChildren;
}

/**
 * Hydrates serialized nodes inside the active editor's update() transaction
 * and marks all TextNodes with the AI-generated purple highlight style.
 */
export function hydrateSerializedAINodes(
  serialized: SerializedLexicalNode[],
  options: { showCaret?: boolean } = {}
): LexicalNode[] {
  const created: LexicalNode[] = [];

  for (const item of serialized) {
    try {
      const node = $parseSerializedNode(item);
      markSubtreeAsAIGenerated(node);
      created.push(node);
    } catch (err) {
      console.warn("[Notiq AI Hydrate]: skipped node", item?.type, err);
    }
  }

  if (created.length === 0) {
    const p = $createParagraphNode();
    created.push(p);
  }

  if (options.showCaret) {
    appendCaretToLastTextContainer(created);
  }

  return created;
}

export function markSubtreeAsAIGenerated(node: LexicalNode): void {
  if ($isTextNode(node)) {
    const existing = node.getStyle();
    if (!existing.includes(AI_GENERATED_STYLE)) {
      const prefix = existing && !existing.trim().endsWith(";") ? `${existing}; ` : existing;
      node.setStyle(`${prefix}${AI_GENERATED_STYLE}`);
    }
    return;
  }

  if ($isElementNode(node)) {
    for (const child of node.getChildren()) {
      markSubtreeAsAIGenerated(child);
    }
  }
}

export function stripAIStyleFromSubtree(node: LexicalNode): void {
  if ($isTextNode(node)) {
    const style = node.getStyle();
    if (style.includes(AI_GENERATED_STYLE)) {
      const cleaned = style.replace(AI_GENERATED_STYLE, "").trim();
      node.setStyle(cleaned);
    }
    if (node.getTextContent() === AI_CARET_TEXT && node.getStyle().includes("notiq-ai-pulse")) {
      node.remove();
    }
    return;
  }

  if ($isElementNode(node)) {
    for (const child of node.getChildren()) {
      stripAIStyleFromSubtree(child);
    }
  }
}

function appendCaretToLastTextContainer(nodes: LexicalNode[]): void {
  for (let i = nodes.length - 1; i >= 0; i--) {
    const target = findDeepestTextContainer(nodes[i]);
    if (target) {
      const caretNode = $createTextNode(AI_CARET_TEXT);
      caretNode.setStyle(AI_CARET_STYLE);
      target.append(caretNode);
      return;
    }
  }
}

function findDeepestTextContainer(node: LexicalNode): ReturnType<typeof $createParagraphNode> | null {
  if (!$isElementNode(node)) return null;
  const children = node.getChildren();
  for (let i = children.length - 1; i >= 0; i--) {
    const child = children[i];
    if ($isElementNode(child) && !child.isInline()) {
      const deeper = findDeepestTextContainer(child);
      if (deeper) return deeper;
    }
  }
  if (node.canBeEmpty() || children.length > 0) {
    return node as any;
  }
  return null;
}

/**
 * Builds a structured context string containing the document's heading outline
 * and the blocks immediately surrounding the cursor, avoiding noisy full-doc dumps.
 */
export function extractSurroundingContext(
  editor: LexicalEditor,
  maxBlocksBefore = 3,
  maxBlocksAfter = 2
): string {
  let result = "";

  editor.getEditorState().read(() => {
    const root = $getRoot();
    const children = root.getChildren();
    if (children.length === 0) return;

    const outline: string[] = [];
    for (const child of children) {
      if (child.getType() === "heading") {
        const tag = (child as any).getTag?.() || "h2";
        const text = child.getTextContent().trim();
        if (text) outline.push(`${tag.toUpperCase()}: ${text}`);
      }
    }

    // Find active top-level block index
    let activeIdx = children.length - 1;
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      const top =
        anchorNode.getKey() === "root"
          ? null
          : anchorNode.getTopLevelElementOrThrow();
      if (top) {
        const idx = children.findIndex((c) => c.getKey() === top.getKey());
        if (idx !== -1) activeIdx = idx;
      }
    }

    const start = Math.max(0, activeIdx - maxBlocksBefore);
    const end = Math.min(children.length, activeIdx + maxBlocksAfter + 1);
    const windowText = children
      .slice(start, end)
      .map((c) => c.getTextContent().trim())
      .filter(Boolean)
      .join("\n\n");

    const parts: string[] = [];
    if (outline.length > 0) {
      parts.push(`Document Outline:\n${outline.slice(0, 12).join("\n")}`);
    }
    if (windowText) {
      parts.push(`Surrounding Context:\n${windowText}`);
    }
    result = parts.join("\n\n");
  });

  return result;
}
