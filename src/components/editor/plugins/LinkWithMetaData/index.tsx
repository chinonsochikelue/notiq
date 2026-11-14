import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createParagraphNode,
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  createCommand,
  DOMExportOutput,
  EditorConfig,
  ElementNode,
  LexicalCommand,
  LexicalEditor,
  LexicalNode,
  NodeKey,
} from "lexical";
import { $insertNodeToNearestRoot } from "@lexical/utils";
import { useEffect } from "react";
import {
  fetchMetadata,
  getInitialMetadata,
  Metadata,
  normalizeUrl,
} from "../../utils/url";

export class LinkWithMetaDataNode extends ElementNode {
  __url: string | null;
  __metadata: Metadata | null = null;
  __editor?: LexicalEditor;

  constructor(
    url: string | null,
    editor?: LexicalEditor,
    metadata?: Metadata | null,
    key?: NodeKey
  ) {
    super(key);
    this.__url = url ? normalizeUrl(url) : null;
    this.__editor = editor;
    this.__metadata =
      metadata || (this.__url ? getInitialMetadata(this.__url) : null);
  }

  static clone(node: LinkWithMetaDataNode): LinkWithMetaDataNode {
    return new LinkWithMetaDataNode(
      node.__url,
      node.__editor,
      node.__metadata ? { ...node.__metadata } : null,
      node.__key
    );
  }

  static importJSON(serializedNode: any): LinkWithMetaDataNode {
    const node = new LinkWithMetaDataNode(
      serializedNode.url,
      undefined,
      serializedNode.metadata
    );
    return node;
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      url: this.__url,
      metadata: this.__metadata,
      type: "link-with-metadata",
      version: 1,
    };
  }

  static getType(): string {
    return "link-with-metadata";
  }

  isInline(): boolean {
    return false;
  }

  canBeEmpty(): boolean {
    return false;
  }

  isKeyboardSelectable(): boolean {
    return true;
  }

  setMetadata(metadata: Metadata) {
    const writable = this.getWritable();
    writable.__metadata = metadata;
  }

  getMetadata(): Metadata | null {
    return this.__metadata;
  }

  getUrl(): string | null {
    return this.__url;
  }

  createDOM(config?: EditorConfig, editor?: LexicalEditor): HTMLElement {
    const elementDIV = document.createElement("div");
    elementDIV.className =
      "notiq-link-card my-3 w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 shadow-sm hover:shadow-md rounded-xl overflow-hidden cursor-pointer transition-all duration-200 select-none";
    elementDIV.setAttribute("contenteditable", "false");

    const container = document.createElement("div");
    container.className =
      "flex flex-row w-full justify-between items-stretch min-h-[96px]";

    // Left container for text content
    const leftContainer = document.createElement("div");
    leftContainer.className =
      "flex flex-col flex-1 justify-between p-3.5 sm:p-4 min-w-0";

    const topSection = document.createElement("div");
    topSection.className = "space-y-1";

    // Title Link
    const titleLink = document.createElement("a");
    titleLink.className =
      "font-semibold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 line-clamp-1 truncate block hover:underline";
    titleLink.href = this.__url || "#";
    titleLink.target = "_blank";
    titleLink.rel = "noopener noreferrer";
    titleLink.textContent =
      this.__metadata?.title || this.__url || "No URL provided";
    topSection.appendChild(titleLink);

    // Description
    const descriptionSmall = document.createElement("p");
    descriptionSmall.className =
      "text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1 break-words leading-relaxed";
    descriptionSmall.textContent =
      this.__metadata?.description || "Loading preview...";
    topSection.appendChild(descriptionSmall);

    leftContainer.appendChild(topSection);

    // Source footer with favicon and domain
    const footer = document.createElement("div");
    footer.className =
      "flex items-center gap-2 mt-3 text-xs text-zinc-400 dark:text-zinc-500";

    const favicon = document.createElement("img");
    favicon.className = "w-4 h-4 rounded-sm object-contain";
    favicon.src =
      this.__metadata?.logo ||
      (this.__url
        ? `https://www.google.com/s2/favicons?domain=${new URL(this.__url).hostname}&sz=64`
        : "/favicon.ico");
    favicon.alt = "";
    footer.appendChild(favicon);

    const sourceText = document.createElement("span");
    sourceText.className = "font-medium truncate";
    sourceText.textContent =
      this.__metadata?.website || (this.__url ? new URL(this.__url).hostname : "");
    footer.appendChild(sourceText);

    leftContainer.appendChild(footer);
    container.appendChild(leftContainer);

    // Right container for thumbnail image
    const rightContainer = document.createElement("div");
    rightContainer.className =
      "link-card-thumbnail w-32 sm:w-44 shrink-0 bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex items-center justify-center";

    if (this.__metadata?.image) {
      const image = document.createElement("img");
      image.src = this.__metadata.image;
      image.alt = this.__metadata.title || "Link preview";
      image.className = "w-full h-full object-cover";
      rightContainer.appendChild(image);
    } else {
      rightContainer.style.display = "none";
    }

    container.appendChild(rightContainer);
    elementDIV.appendChild(container);

    // Click handler for opening the link
    elementDIV.addEventListener("click", (e) => {
      if ((e.target as HTMLElement).tagName.toLowerCase() !== "a" && this.__url) {
        window.open(this.__url, "_blank", "noopener,noreferrer");
      }
    });

    // If metadata needs full details, trigger async fetch
    const currentEditor = editor || this.__editor;
    if (this.__url && currentEditor) {
      const nodeKey = this.getKey();
      fetchMetadata(this.__url)
        .then((metadata) => {
          currentEditor.update(() => {
            const node = $getNodeByKey(nodeKey);
            if ($isLinkNode(node)) {
              node.setMetadata(metadata);
            }
          });
        })
        .catch((error) => {
          console.error("Error fetching link metadata:", error);
        });
    }

    return elementDIV;
  }

  updateDOM(prevNode: LinkWithMetaDataNode, dom: HTMLElement): boolean {
    if (this.__metadata !== prevNode.__metadata || this.__url !== prevNode.__url) {
      const titleLink = dom.querySelector("a");
      const descriptionSmall = dom.querySelector("p");
      const sourceSmall = dom.querySelector("span");
      const favicon = dom.querySelector("img[alt='']");
      const thumbContainer = dom.querySelector(
        ".link-card-thumbnail"
      ) as HTMLElement | null;

      if (titleLink) {
        titleLink.href = this.__url || "#";
        titleLink.textContent =
          this.__metadata?.title || this.__url || "No URL provided";
      }
      if (descriptionSmall) {
        descriptionSmall.textContent =
          this.__metadata?.description || "Loading preview...";
      }
      if (sourceSmall) {
        sourceSmall.textContent =
          this.__metadata?.website ||
          (this.__url ? new URL(this.__url).hostname : "");
      }
      if (favicon && this.__metadata?.logo) {
        (favicon as HTMLImageElement).src = this.__metadata.logo;
      }

      if (thumbContainer) {
        if (this.__metadata?.image) {
          thumbContainer.style.display = "";
          let image = thumbContainer.querySelector("img");
          if (!image) {
            image = document.createElement("img");
            image.className = "w-full h-full object-cover";
            thumbContainer.appendChild(image);
          }
          image.src = this.__metadata.image;
          image.alt = this.__metadata.title || "Link preview";
        } else {
          thumbContainer.style.display = "none";
        }
      }

      return true;
    }
    return false;
  }

  exportDOM(editor: LexicalEditor): DOMExportOutput {
    const element = this.createDOM(undefined, editor);
    return { element };
  }
}

export function $createLinkNode(
  url: string | null,
  editor?: LexicalEditor,
  metadata?: Metadata | null
): LinkWithMetaDataNode {
  return new LinkWithMetaDataNode(url, editor, metadata);
}

export function $isLinkNode(node: LexicalNode | null | undefined): node is LinkWithMetaDataNode {
  return node instanceof LinkWithMetaDataNode;
}

export const TOGGLE_LINK_COMMAND_LinkWithMetaDataNode: LexicalCommand<
  string | null | { url: string; metadata?: Metadata | null }
> = createCommand("toggleLinkWithMetadata");

export function LinkWithMetaDataPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([LinkWithMetaDataNode])) {
      throw new Error(
        "LinkWithMetaDataPlugin: LinkWithMetaDataNode not registered on editor"
      );
    }
  }, [editor]);

  useEffect(() => {
    return editor.registerCommand(
      TOGGLE_LINK_COMMAND_LinkWithMetaDataNode,
      (payload: string | null | { url: string; metadata?: Metadata | null }) => {
        if (!payload) return false;
        const rawUrl = typeof payload === "string" ? payload : payload.url;
        if (!rawUrl) return false;

        const normalized = normalizeUrl(rawUrl);
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const anchor = selection.anchor.getNode();
          const topLevel = anchor.getTopLevelElement();
          const initialMeta =
            typeof payload === "object" && payload.metadata
              ? payload.metadata
              : getInitialMetadata(normalized);

          const linkNode = $createLinkNode(normalized, editor, initialMeta);

          if (topLevel && topLevel.getTextContent().trim() === "") {
            topLevel.replace(linkNode);
          } else {
            $insertNodeToNearestRoot(linkNode);
          }

          const p = $createParagraphNode();
          linkNode.insertAfter(p);
          p.select();

          // Fetch full asynchronous metadata to enrich card
          const nodeKey = linkNode.getKey();
          fetchMetadata(normalized).then((meta) => {
            editor.update(() => {
              const node = $getNodeByKey(nodeKey);
              if ($isLinkNode(node)) {
                node.setMetadata(meta);
              }
            });
          });
        }
        return true;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor]);

  return null;
}
