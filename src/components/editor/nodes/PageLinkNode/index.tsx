"use client";

import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from "lexical";
import { $applyNodeReplacement, DecoratorNode, isHTMLElement } from "lexical";
import { FileText, Hash } from "lucide-react";
import * as React from "react";
import type { JSX } from "react";

export type PageLinkKind = "page" | "heading";

export interface PageLinkPayload {
  target: string;
  label: string;
  kind?: PageLinkKind;
  key?: NodeKey;
}

export type SerializedPageLinkNode = Spread<
  {
    target: string;
    label: string;
    kind: PageLinkKind;
  },
  SerializedLexicalNode
>;

function $convertPageLinkElement(domNode: Node): null | DOMConversionOutput {
  if (isHTMLElement(domNode)) {
    const target = domNode.getAttribute("data-notiq-page-target");
    const label = domNode.textContent?.trim();
    const kind =
      (domNode.getAttribute("data-notiq-page-kind") as PageLinkKind) || "page";
    if (target && label) {
      return {
        node: $createPageLinkNode({ target, label, kind }),
      };
    }
  }
  return null;
}

function PageLinkChip({
  target,
  label,
  kind,
}: {
  target: string;
  label: string;
  kind: PageLinkKind;
}) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (kind === "heading") {
      const headings = Array.from(
        document.querySelectorAll("h1, h2, h3, h4, h5, h6")
      );
      const match = headings.find(
        (el) => el.textContent?.trim().toLowerCase() === label.toLowerCase()
      );
      if (match) {
        match.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    if (typeof window !== "undefined") {
      const event = new CustomEvent("notiq:navigate-page", {
        detail: { target, label },
        cancelable: true,
      });
      const notCancelled = window.dispatchEvent(event);
      if (notCancelled && target.startsWith("/")) {
        window.location.assign(target);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      data-notiq-page-target={target}
      data-notiq-page-kind={kind}
      className="mx-0.5 inline-flex items-center gap-1 rounded-md border border-indigo-500/25 bg-indigo-500/10 px-1.5 py-0.5 text-[13px] font-medium text-indigo-700 dark:text-indigo-300 align-baseline transition-colors hover:bg-indigo-500/20 cursor-pointer"
    >
      {kind === "heading" ? (
        <Hash className="h-3 w-3 shrink-0 opacity-80" />
      ) : (
        <FileText className="h-3 w-3 shrink-0 opacity-80" />
      )}
      <span className="underline decoration-indigo-500/40 underline-offset-2">
        {label}
      </span>
    </button>
  );
}

export class PageLinkNode extends DecoratorNode<JSX.Element> {
  __target: string;
  __label: string;
  __kind: PageLinkKind;

  static getType(): string {
    return "page-link";
  }

  static clone(node: PageLinkNode): PageLinkNode {
    return new PageLinkNode(
      node.__target,
      node.__label,
      node.__kind,
      node.__key
    );
  }

  static importJSON(serializedNode: SerializedPageLinkNode): PageLinkNode {
    return $createPageLinkNode({
      target: serializedNode.target,
      label: serializedNode.label,
      kind: serializedNode.kind ?? "page",
    });
  }

  static importDOM(): DOMConversionMap | null {
    return {
      span: (node: Node) => {
        if (
          isHTMLElement(node) &&
          node.hasAttribute("data-notiq-page-target")
        ) {
          return {
            conversion: $convertPageLinkElement,
            priority: 2,
          };
        }
        return null;
      },
    };
  }

  constructor(
    target: string,
    label: string,
    kind: PageLinkKind = "page",
    key?: NodeKey
  ) {
    super(key);
    this.__target = target;
    this.__label = label;
    this.__kind = kind;
  }

  exportJSON(): SerializedPageLinkNode {
    return {
      type: "page-link",
      version: 1,
      target: this.__target,
      label: this.__label,
      kind: this.__kind,
    };
  }

  exportDOM(): DOMExportOutput {
    const span = document.createElement("span");
    span.setAttribute("data-notiq-page-target", this.__target);
    span.setAttribute("data-notiq-page-kind", this.__kind);
    span.textContent = `[[${this.__label}]]`;
    return { element: span };
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const span = document.createElement("span");
    span.className = "inline-block align-baseline";
    return span;
  }

  updateDOM(): false {
    return false;
  }

  isInline(): true {
    return true;
  }

  getTextContent(): string {
    return `[[${this.__label}]]`;
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): JSX.Element {
    return (
      <PageLinkChip
        target={this.__target}
        label={this.__label}
        kind={this.__kind}
      />
    );
  }
}

export function $createPageLinkNode(payload: PageLinkPayload): PageLinkNode {
  return $applyNodeReplacement(
    new PageLinkNode(payload.target, payload.label, payload.kind ?? "page", payload.key)
  );
}

export function $isPageLinkNode(
  node: LexicalNode | null | undefined
): node is PageLinkNode {
  return node instanceof PageLinkNode;
}
