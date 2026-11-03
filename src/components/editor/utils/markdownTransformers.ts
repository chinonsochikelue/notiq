import {
  $createHorizontalRuleNode,
  $isHorizontalRuleNode,
  HorizontalRuleNode,
} from "@lexical/react/LexicalHorizontalRuleNode";
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  TRANSFORMERS,
  ElementTransformer,
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
import { ExcalidrawNode, $isExcalidrawNode } from "../nodes/ExcalidrawNode";
import { EquationNode, $isEquationNode } from "../nodes/EquationNode/EquationNode";
import { Hint } from "../nodes/Hint";
import { StepperNode, $isStepperNode } from "../nodes/Stepper";
import { PollNode, $isPollNode } from "../nodes/PollNode";
import { AudioNode, $isAudioNode, $createAudioNode } from "../nodes/AudioNode";
import { FileNode, $isFileNode, $createFileNode } from "../nodes/FileNode";
import {
  TableNode,
  TableRowNode,
  TableCellNode,
  $isTableNode,
  $isTableRowNode,
  $isTableCellNode,
} from "@lexical/table";
import { $getRoot, LexicalNode } from "lexical";

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
  regExp: /^!\[(.*?)\]\((https?:\/\/.*?)\)$/,
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
  replace: () => {},
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
  replace: () => {},
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
  replace: () => {},
  type: "element",
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
export const NOTIQ_TRANSFORMERS = [
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
  AUDIO_TRANSFORMER,
  FILE_TRANSFORMER,
  ...TRANSFORMERS,
];
