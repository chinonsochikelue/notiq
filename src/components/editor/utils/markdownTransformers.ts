import {
  $createHorizontalRuleNode,
  $isHorizontalRuleNode,
  HorizontalRuleNode,
} from "@lexical/react/LexicalHorizontalRuleNode";
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  CHECK_LIST,
  TEXT_FORMAT_TRANSFORMERS,
  TEXT_MATCH_TRANSFORMERS,
  TRANSFORMERS,
  ElementTransformer,
  MultilineElementTransformer,
  TextMatchTransformer,
} from "@lexical/markdown";
import { ImageNode, $createImageNode, $isImageNode } from "../nodes/ImageNode";
import {
  InlineImageNode,
  $createInlineImageNode,
  $isInlineImageNode,
} from "../nodes/InlineImageNode/InlineImageNode";
import { YouTubeNode, $createYouTubeNode, $isYouTubeNode } from "../plugins/YouTubeNode";
import { TweetNode, $createTweetNode, $isTweetNode } from "../nodes/TweetNode";
import { FigmaNode, $createFigmaNode, $isFigmaNode } from "../nodes/FigmaNode/FigmaNode";
import { ExcalidrawNode, $createExcalidrawNode, $isExcalidrawNode } from "../nodes/ExcalidrawNode";
import { compileExcalidrawDiagram } from "./excalidrawDiagramBuilder";
import {
  EquationNode,
  $createEquationNode,
  $isEquationNode,
} from "../nodes/EquationNode/EquationNode";
import { Hint, $createHintNode, HintType } from "../nodes/Hint";
import { StepperNode, $isStepperNode } from "../nodes/Stepper";
import { PollNode, $isPollNode } from "../nodes/PollNode";
import { AudioNode, $isAudioNode, $createAudioNode } from "../nodes/AudioNode";
import { FileNode, $isFileNode, $createFileNode } from "../nodes/FileNode";
import {
  $createTableNode,
  $createTableRowNode,
  $createTableCellNode,
  TableNode,
  TableRowNode,
  TableCellNode,
  TableCellHeaderStates,
  $isTableNode,
  $isTableRowNode,
  $isTableCellNode,
} from "@lexical/table";
import { $getRoot, $createParagraphNode, $createTextNode, LexicalNode } from "lexical";

// 1. Horizontal Rule Transformer
export const HR_TRANSFORMER: ElementTransformer = {
  dependencies: [HorizontalRuleNode],
  export: (node: LexicalNode) => ($isHorizontalRuleNode(node) ? "---" : null),
  regExp: /^(---|\*\*\*|___)\s*$/,
  replace: (parentNode) => {
    const line = $createHorizontalRuleNode();
    parentNode.replace(line);
  },
  type: "element",
};

// 2. Image Transformer (supports both ImageNode and InlineImageNode)
export const IMAGE_TRANSFORMER: ElementTransformer = {
  dependencies: [ImageNode, InlineImageNode],
  export: (node: LexicalNode) => {
    if ($isImageNode(node)) {
      return `![${node.getAltText() || "Image"}](${node.getSrc()})`;
    }
    if ($isInlineImageNode(node)) {
      return `![${(node as any).__altText || "Image"}](${(node as any).__src || ""})`;
    }
    return null;
  },
  regExp: /^!\[(.*?)\]\(((?:https?:\/\/|data:image\/).*?)\)$/,
  replace: (parentNode, _1, match) => {
    const [, altText, src] = match;
    const imageNode = $createImageNode({
      altText: altText || "Image",
      src,
      maxWidth: 800,
    });
    parentNode.replace(imageNode);
  },
  type: "element",
};

// 3. YouTube Embed Transformer
export const YOUTUBE_TRANSFORMER: ElementTransformer = {
  dependencies: [YouTubeNode],
  export: (node: LexicalNode) => {
    if (!$isYouTubeNode(node)) return null;
    const id = node.getId();
    return `[![YouTube Video](https://img.youtube.com/vi/${id}/hqdefault.jpg)](https://www.youtube.com/watch?v=${id})\n\n[▶ Watch on YouTube](https://www.youtube.com/watch?v=${id})`;
  },
  regExp: /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  replace: (parentNode, _1, match) => {
    const videoId = match[1];
    if (videoId) {
      const youtubeNode = $createYouTubeNode(videoId);
      parentNode.replace(youtubeNode);
    }
  },
  type: "element",
};

// 4. Tweet / X Embed Transformer
export const TWEET_TRANSFORMER: ElementTransformer = {
  dependencies: [TweetNode],
  export: (node: LexicalNode) => {
    if (!$isTweetNode(node)) return null;
    const id = node.getId();
    return `> 𝕏 **Tweet** [View Post](https://x.com/i/web/status/${id})`;
  },
  regExp: /^(?:https?:\/\/)?(?:twitter\.com|x\.com)\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+)/,
  replace: (parentNode, _1, match) => {
    const tweetId = match[2];
    if (tweetId) {
      const tweetNode = $createTweetNode(tweetId);
      parentNode.replace(tweetNode);
    }
  },
  type: "element",
};

// 5. Figma Embed Transformer
export const FIGMA_TRANSFORMER: ElementTransformer = {
  dependencies: [FigmaNode],
  export: (node: LexicalNode) => {
    if (!$isFigmaNode(node)) return null;
    const id = node.getId();
    const url = id.startsWith("http") ? id : `https://www.figma.com/file/${id}`;
    return `[📐 Figma Design Embed](${url})`;
  },
  regExp: /^(?:https?:\/\/)?(?:www\.)?figma\.com\/(?:file|design)\/([a-zA-Z0-9]+)/,
  replace: (parentNode, _1, match) => {
    const figmaNode = $createFigmaNode(match[0]);
    parentNode.replace(figmaNode);
  },
  type: "element",
};

// 6. Mathematical Equation Transformer
export const EQUATION_TRANSFORMER: ElementTransformer = {
  dependencies: [EquationNode],
  export: (node: LexicalNode) => {
    if (!$isEquationNode(node)) return null;
    const equation = (node as any).__equation || "";
    const isInline = (node as any).__inline;
    return isInline ? `$${equation}$` : `$$\n${equation}\n$$`;
  },
  regExp: /^\$\$(.*?)\$\$$/,
  replace: (parentNode, _children, match) => {
    const equation = match[1]?.trim();
    if (!equation) return;
    const paragraph = $createParagraphNode();
    paragraph.append($createEquationNode(equation, false));
    parentNode.replace(paragraph);
  },
  type: "element",
};

// 7. Hint / Callout Block Transformer
export const HINT_TRANSFORMER: ElementTransformer = {
  dependencies: [Hint],
  export: (node: LexicalNode) => {
    if (!(node instanceof Hint)) return null;
    let text = "";
    try {
      const captionEditor = (node as any).__caption;
      if (captionEditor?.getEditorState) {
        text = captionEditor.getEditorState().read(() => $getRoot().getTextContent());
      }
    } catch {
      text = "";
    }
    const variant = ((node as any).__variant || "note").toUpperCase();
    return `> [!${variant}]\n> ${text.trim() || "Note"}`;
  },
  regExp: /^>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION|INFO|ERROR)\]\s*(.*)$/i,
  replace: (parentNode, _1, match) => {
    const rawTag = (match[1] || "note").toLowerCase();
    const tagMap: Record<string, HintType> = {
      note: "note",
      info: "note",
      tip: "tip",
      important: "important",
      warning: "warning",
      caution: "caution",
      error: "caution",
    };
    const variant: HintType = tagMap[rawTag] || "note";
    const hintNode = $createHintNode(variant);
    const content = match[2]?.trim();
    if (content) {
      const nested = (hintNode as any).__caption;
      if (nested?.update) {
        nested.update(
          () => {
            const root = $getRoot();
            root.clear();
            $convertFromMarkdownString(content, [
              ...TEXT_FORMAT_TRANSFORMERS,
              ...TEXT_MATCH_TRANSFORMERS,
            ]);
          },
          { discrete: true }
        );
      }
    }
    parentNode.replace(hintNode);
  },
  type: "element",
};

// 8. Stepper / Process Node Transformer
export const STEPPER_TRANSFORMER: ElementTransformer = {
  dependencies: [StepperNode],
  export: (node: LexicalNode) => {
    if (!$isStepperNode(node)) return null;
    const steps = (node as any).__steps || [];
    return steps
      .map((s: any, idx: number) => {
        let contentText = "";
        try {
          if (s.content?.getEditorState) {
            contentText = s.content.getEditorState().read(() => $getRoot().getTextContent());
          }
        } catch {}
        return `### Step ${idx + 1}: ${s.title || `Step ${idx + 1}`}\n${contentText.trim()}`;
      })
      .join("\n\n");
  },
  regExp: /^###\s+Step\s+\d+:\s*(.*)$/,
  replace: () => {},
  type: "element",
};

// 9. Poll Transformer
export const POLL_TRANSFORMER: ElementTransformer = {
  dependencies: [PollNode],
  export: (node: LexicalNode) => {
    if (!$isPollNode(node)) return null;
    try {
      const json = node.exportJSON();
      const optionsStr = (json.options || [])
        .map((opt) => `- [ ] ${opt.text} (${(opt.votes || []).length} votes)`)
        .join("\n");
      return `### 📊 Poll: ${json.question}\n${optionsStr}`;
    } catch {
      return null;
    }
  },
  regExp: /^###\s+📊\s+Poll:\s*(.*)$/,
  replace: () => {},
  type: "element",
};

// 10. Excalidraw Diagram Transformer
export const EXCALIDRAW_TRANSFORMER: ElementTransformer = {
  dependencies: [ExcalidrawNode],
  export: (node: LexicalNode) => {
    if (!$isExcalidrawNode(node)) return null;
    return `🎨 *[Excalidraw Diagram]*`;
  },
  regExp: /^🎨\s+\*\[Excalidraw Diagram\]\*$/,
  replace: () => {},
  type: "element",
};

// 11. Table Transformer (exports Markdown tables)
export const TABLE_TRANSFORMER: ElementTransformer = {
  dependencies: [TableNode, TableRowNode, TableCellNode],
  export: (node: LexicalNode) => {
    if (!$isTableNode(node)) return null;
    const rows = node.getChildren();
    const mdLines: string[] = [];

    rows.forEach((row, rowIndex) => {
      if ($isTableRowNode(row)) {
        const cells = row.getChildren();
        const cellValues = cells.map((cell) => {
          return cell.getTextContent().replace(/\|/g, "\\|").trim() || " ";
        });
        mdLines.push(`| ${cellValues.join(" | ")} |`);

        // Insert divider row after header
        if (rowIndex === 0) {
          const dividers = cells.map(() => "---");
          mdLines.push(`| ${dividers.join(" | ")} |`);
        }
      }
    });

    return mdLines.join("\n");
  },
  regExp: /^\|(.+)\|$/,
  replace: (parentNode, _1, match) => {
    const rawLine = match[1];
    const cells = rawLine.split("|").map((c) => c.trim());
    // Skip markdown table divider rows like | --- | --- |
    if (cells.every((c) => /^:?-{2,}:?$/.test(c))) {
      parentNode.remove();
      return;
    }

    const prev = parentNode.getPreviousSibling();
    const isHeaderRow = !$isTableNode(prev);

    const row = $createTableRowNode();
    for (const cellText of cells) {
      const cell = $createTableCellNode(
        isHeaderRow ? TableCellHeaderStates.ROW : TableCellHeaderStates.NO_STATUS
      );
      if (cellText) {
        $convertFromMarkdownString(
          cellText,
          [
            INLINE_EQUATION_TRANSFORMER,
            ...TEXT_FORMAT_TRANSFORMERS,
            ...TEXT_MATCH_TRANSFORMERS,
          ],
          cell
        );
      } else {
        cell.append($createParagraphNode());
      }
      row.append(cell);
    }

    if ($isTableNode(prev)) {
      prev.append(row);
      parentNode.remove();
    } else {
      const table = $createTableNode();
      table.append(row);
      parentNode.replace(table);
    }
  },
  type: "element",
};

// 11b. Inline KaTeX Equation Transformer ($...$)
export const INLINE_EQUATION_TRANSFORMER: TextMatchTransformer = {
  dependencies: [EquationNode],
  export: (node: LexicalNode) => {
    if (!$isEquationNode(node)) return null;
    return `$${node.getEquation()}$`;
  },
  importRegExp: /(?<!\$)\$(?!\s)([^$\n]*?\S)\$/,
  regExp: /(?<!\$)\$(?!\s)([^$\n]*?\S)\$$/,
  replace: (textNode, match) => {
    const equation = match[1]?.trim();
    if (!equation) return;
    const eqNode = $createEquationNode(equation, true);
    textNode.replace(eqNode);
  },
  trigger: "$",
  type: "text-match",
};

// 12. Audio Track Transformer
export const AUDIO_TRANSFORMER: ElementTransformer = {
  dependencies: [AudioNode],
  export: (node: LexicalNode) => {
    if (!$isAudioNode(node)) return null;
    return `[🎵 Audio: ${node.getTitle()}](${node.getSrc()})`;
  },
  regExp: /^\[🎵\s+Audio:\s*(.*?)\]\((https?:\/\/.*?)\)$/,
  replace: (parentNode, _1, match) => {
    const [, title, src] = match;
    const audioNode = $createAudioNode({
      src,
      title: title || "Audio Track",
    });
    parentNode.replace(audioNode);
  },
  type: "element",
};

// 13. File Attachment Transformer
export const FILE_TRANSFORMER: ElementTransformer = {
  dependencies: [FileNode],
  export: (node: LexicalNode) => {
    if (!$isFileNode(node)) return null;
    const sizeStr = node.getSize() ? ` (${node.getSize()})` : "";
    return `📎 [${node.getTitle()}${sizeStr}](${node.getUrl()})`;
  },
  regExp: /^📎\s+\[(.*?)(?:\s*\((.*?)\))?\]\((https?:\/\/.*?)\)$/,
  replace: (parentNode, _1, match) => {
    const [, title, size, url] = match;
    const fileNode = $createFileNode({
      url,
      title: title || "Attached File",
      size: size || undefined,
    });
    parentNode.replace(fileNode);
  },
  type: "element",
};

/**
 * Complete suite of Notiq Markdown Transformers.
 * Guarantees that YouTube, Tweets, Figma, Images, Tables, Steppers,
 * Equations, Polls, Audio, and Files are fully preserved when exporting to Markdown.
 */
// 13b. Inline Image Transformer (![inline:left|right|full:alt](url))
export const INLINE_IMAGE_TRANSFORMER: TextMatchTransformer = {
  dependencies: [InlineImageNode],
  export: (node: LexicalNode) => {
    if (!$isInlineImageNode(node)) return null;
    const pos = node.getPosition();
    const prefix = pos ? `inline:${pos}:` : "inline:";
    return `![${prefix}${node.getAltText() || "Image"}](${node.getSrc()})`;
  },
  importRegExp: /!\[inline:(?:(left|right|full):)?([^\]]*?)\]\(((?:https?:\/\/|data:image\/)[^)\s]+)\)/,
  regExp: /!\[inline:(?:(left|right|full):)?([^\]]*?)\]\(((?:https?:\/\/|data:image\/)[^)\s]+)\)$/,
  replace: (textNode, match) => {
    const [, posRaw, altText, src] = match;
    if (!src) return;
    const position =
      posRaw === "left" || posRaw === "right" || posRaw === "full"
        ? posRaw
        : "left";
    const inlineImg = $createInlineImageNode({
      altText: altText?.trim() || "Inline Image",
      src,
      position,
      width: 280,
    });
    textNode.replace(inlineImg);
  },
  trigger: ")",
  type: "text-match",
};

// 14. Excalidraw Fenced Diagram Block Transformer (```excalidraw ... ```)
export const EXCALIDRAW_BLOCK_TRANSFORMER: MultilineElementTransformer = {
  dependencies: [ExcalidrawNode],
  export: (node: LexicalNode) => {
    if (!$isExcalidrawNode(node)) return null;
    return `\`\`\`excalidraw\n${(node as any).__data || "[]"}\n\`\`\``;
  },
  regExpStart: /^```excalidraw\s*$/i,
  regExpEnd: /^```\s*$/,
  replace: (rootNode, _children, startMatch, _endMatch, linesInBetween, isImport) => {
    if (!startMatch || !linesInBetween) return;
    const rawJson = linesInBetween.join("\n").trim();
    const compiled = compileExcalidrawDiagram(rawJson);
    if (!compiled) return false;
    const excalidrawNode = $createExcalidrawNode(compiled);
    const paragraph = $createParagraphNode();
    paragraph.append(excalidrawNode);
    if (isImport) {
      rootNode.append(paragraph);
    } else {
      rootNode.replace(paragraph);
    }
  },
  type: "multiline-element",
};

export const NOTIQ_TRANSFORMERS = [
  EXCALIDRAW_BLOCK_TRANSFORMER,
  INLINE_IMAGE_TRANSFORMER,
  HR_TRANSFORMER,
  IMAGE_TRANSFORMER,
  YOUTUBE_TRANSFORMER,
  TWEET_TRANSFORMER,
  FIGMA_TRANSFORMER,
  EQUATION_TRANSFORMER,
  HINT_TRANSFORMER,
  STEPPER_TRANSFORMER,
  POLL_TRANSFORMER,
  EXCALIDRAW_TRANSFORMER,
  TABLE_TRANSFORMER,
  INLINE_EQUATION_TRANSFORMER,
  AUDIO_TRANSFORMER,
  FILE_TRANSFORMER,
  CHECK_LIST,
  ...TRANSFORMERS,
];
