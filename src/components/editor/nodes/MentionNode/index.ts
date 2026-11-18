import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedTextNode,
  Spread,
} from "lexical";
import { $applyNodeReplacement, TextNode } from "lexical";

export type MentionKind = "user" | "date";

export type SerializedMentionNode = Spread<
  {
    mentionName: string;
    mentionKind?: MentionKind;
  },
  SerializedTextNode
>;

function convertMentionElement(
  domNode: HTMLElement
): DOMConversionOutput | null {
  const textContent = domNode.textContent;
  const mentionName = domNode.getAttribute("data-lexical-mention-name");
  const mentionKind =
    (domNode.getAttribute("data-lexical-mention-kind") as MentionKind | null) ||
    "user";

  if (textContent !== null) {
    const node = $createMentionNode(mentionName || textContent.replace(/^@/, ""), {
      kind: mentionKind,
    });
    return { node };
  }

  return null;
}

const USER_MENTION_CLASS =
  "inline-flex items-center rounded-md bg-blue-500/12 dark:bg-blue-400/15 px-1.5 py-0.5 text-[0.92em] font-medium text-blue-700 dark:text-blue-300 border border-blue-500/20 select-none";

const DATE_MENTION_CLASS =
  "inline-flex items-center rounded-md bg-emerald-500/12 dark:bg-emerald-400/15 px-1.5 py-0.5 text-[0.92em] font-medium text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 select-none";

export class MentionNode extends TextNode {
  __mention: string;
  __kind: MentionKind;

  static getType(): string {
    return "mention";
  }

  static clone(node: MentionNode): MentionNode {
    return new MentionNode(
      node.__mention,
      node.__kind,
      node.__text,
      node.__key
    );
  }

  static importJSON(serializedNode: SerializedMentionNode): MentionNode {
    const node = $createMentionNode(serializedNode.mentionName, {
      kind: serializedNode.mentionKind || "user",
      text: serializedNode.text,
    });
    node.setFormat(serializedNode.format);
    node.setDetail(serializedNode.detail);
    node.setMode(serializedNode.mode);
    node.setStyle(serializedNode.style);
    return node;
  }

  constructor(
    mentionName: string,
    kind: MentionKind = "user",
    text?: string,
    key?: NodeKey
  ) {
    super(text ?? (kind === "date" ? mentionName : `@${mentionName}`), key);
    this.__mention = mentionName;
    this.__kind = kind;
  }

  exportJSON(): SerializedMentionNode {
    return {
      ...super.exportJSON(),
      mentionName: this.__mention,
      mentionKind: this.__kind,
      type: "mention",
      version: 1,
    };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config);
    dom.className =
      this.__kind === "date" ? DATE_MENTION_CLASS : USER_MENTION_CLASS;
    dom.setAttribute("data-lexical-mention", "true");
    dom.setAttribute("data-lexical-mention-name", this.__mention);
    dom.setAttribute("data-lexical-mention-kind", this.__kind);
    return dom;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("span");
    element.setAttribute("data-lexical-mention", "true");
    element.setAttribute("data-lexical-mention-name", this.__mention);
    element.setAttribute("data-lexical-mention-kind", this.__kind);
    element.textContent = this.__text;
    return { element };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      span: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute("data-lexical-mention")) {
          return null;
        }
        return {
          conversion: convertMentionElement,
          priority: 1,
        };
      },
    };
  }

  isTextEntity(): true {
    return true;
  }

  canInsertTextBefore(): boolean {
    return false;
  }

  canInsertTextAfter(): boolean {
    return false;
  }
}

export function $createMentionNode(
  mentionName: string,
  options?: { kind?: MentionKind; text?: string }
): MentionNode {
  const kind = options?.kind ?? "user";
  const mentionNode = new MentionNode(mentionName, kind, options?.text);
  mentionNode.setMode("segmented").toggleDirectionless();
  return $applyNodeReplacement(mentionNode);
}

export function $isMentionNode(
  node: LexicalNode | null | undefined
): node is MentionNode {
  return node instanceof MentionNode;
}
