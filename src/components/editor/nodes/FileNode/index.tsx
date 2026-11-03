import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  ElementFormatType,
  LexicalCommand,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  Spread,
} from "lexical";
import { createCommand } from "lexical";
import {
  DecoratorBlockNode,
  SerializedDecoratorBlockNode,
} from "@lexical/react/LexicalDecoratorBlockNode";
import * as React from "react";

const FileComponent = React.lazy(() => import("./FileComponent"));

export interface FilePayload {
  url: string;
  title: string;
  size?: string;
  extension?: string;
  format?: ElementFormatType | null;
  key?: NodeKey;
}

export type SerializedFileNode = Spread<
  {
    url: string;
    title: string;
    size?: string;
    extension?: string;
  },
  SerializedDecoratorBlockNode
>;

export const INSERT_FILE_COMMAND: LexicalCommand<FilePayload> =
  createCommand("INSERT_FILE_COMMAND");

function $convertFileElement(domNode: HTMLElement): DOMConversionOutput | null {
  const link = domNode as HTMLAnchorElement;
  const url = link.getAttribute("href");
  if (!url) return null;
  const title = link.getAttribute("data-title") || link.textContent || "Attachment";
  const size = link.getAttribute("data-size") || undefined;
  const extension = link.getAttribute("data-extension") || undefined;
  return {
    node: $createFileNode({ url, title, size, extension }),
  };
}

export class FileNode extends DecoratorBlockNode {
  __url: string;
  __title: string;
  __size?: string;
  __extension?: string;

  static getType(): string {
    return "file";
  }

  static clone(node: FileNode): FileNode {
    return new FileNode(
      node.__url,
      node.__title,
      node.__size,
      node.__extension,
      node.__format,
      node.__key
    );
  }

  constructor(
    url: string,
    title = "Untitled File",
    size?: string,
    extension?: string,
    format?: ElementFormatType | null,
    key?: NodeKey
  ) {
    super(format ?? undefined, key);
    this.__url = url;
    this.__title = title;
    this.__size = size;
    this.__extension = extension;
  }

  static importJSON(serializedNode: SerializedFileNode): FileNode {
    return $createFileNode({
      url: serializedNode.url,
      title: serializedNode.title,
      size: serializedNode.size,
      extension: serializedNode.extension,
    }).updateFromJSON(serializedNode);
  }

  exportJSON(): SerializedFileNode {
    return {
      ...super.exportJSON(),
      url: this.__url,
      title: this.__title,
      size: this.__size,
      extension: this.__extension,
    };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      a: (node: Node) => {
        const el = node as HTMLElement;
        if (el.getAttribute("data-lexical-file") === "true") {
          return {
            conversion: $convertFileElement,
            priority: 2,
          };
        }
        return null;
      },
    };
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("a");
    element.setAttribute("href", this.__url);
    element.setAttribute("data-lexical-file", "true");
    element.setAttribute("data-title", this.__title);
    if (this.__size) element.setAttribute("data-size", this.__size);
    if (this.__extension) element.setAttribute("data-extension", this.__extension);
    element.setAttribute("download", this.__title);
    element.textContent = `📎 ${this.__title} (${this.__size || "File"})`;
    return { element };
  }

  getUrl(): string {
    return this.__url;
  }

  getTitle(): string {
    return this.__title;
  }

  getSize(): string | undefined {
    return this.__size;
  }

  getExtension(): string | undefined {
    return this.__extension;
  }

  setTitle(title: string): void {
    const writable = this.getWritable();
    writable.__title = title;
  }

  decorate(editor: LexicalEditor, config: EditorConfig): React.JSX.Element {
    return (
      <React.Suspense fallback={<div className="h-16 w-full animate-pulse rounded-xl bg-muted" />}>
        <FileComponent
          className={{
            base: "relative",
            focus: "ring-2 ring-primary ring-offset-2 rounded-xl",
          }}
          format={this.__format}
          nodeKey={this.getKey()}
          url={this.__url}
          title={this.__title}
          size={this.__size}
          extension={this.__extension}
        />
      </React.Suspense>
    );
  }
}

export function $createFileNode(payload: FilePayload): FileNode {
  return new FileNode(
    payload.url,
    payload.title,
    payload.size,
    payload.extension,
    payload.format,
    payload.key
  );
}

export function $isFileNode(node: LexicalNode | null | undefined): node is FileNode {
  return node instanceof FileNode;
}
