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

const AudioComponent = React.lazy(() => import("./AudioComponent"));

export interface AudioPayload {
  src: string;
  title?: string;
  author?: string;
  format?: ElementFormatType | null;
  key?: NodeKey;
}

export type SerializedAudioNode = Spread<
  {
    src: string;
    title: string;
    author: string;
  },
  SerializedDecoratorBlockNode
>;

export const INSERT_AUDIO_COMMAND: LexicalCommand<AudioPayload> =
  createCommand("INSERT_AUDIO_COMMAND");

function $convertAudioElement(domNode: HTMLElement): DOMConversionOutput | null {
  const audio = domNode as HTMLAudioElement;
  const src = audio.getAttribute("src") || audio.querySelector("source")?.getAttribute("src");
  if (!src) return null;
  const title = audio.getAttribute("data-title") || "Audio Track";
  const author = audio.getAttribute("data-author") || "Audio Clip";
  return {
    node: $createAudioNode({ src, title, author }),
  };
}

export class AudioNode extends DecoratorBlockNode {
  __src: string;
  __title: string;
  __author: string;

  static getType(): string {
    return "audio";
  }

  static clone(node: AudioNode): AudioNode {
    return new AudioNode(
      node.__src,
      node.__title,
      node.__author,
      node.__format,
      node.__key
    );
  }

  constructor(
    src: string,
    title = "Audio Track",
    author = "Audio Clip",
    format?: ElementFormatType | null,
    key?: NodeKey
  ) {
    super(format ?? undefined, key);
    this.__src = src;
    this.__title = title;
    this.__author = author;
  }

  static importJSON(serializedNode: SerializedAudioNode): AudioNode {
    return $createAudioNode({
      src: serializedNode.src,
      title: serializedNode.title,
      author: serializedNode.author,
    }).updateFromJSON(serializedNode);
  }

  exportJSON(): SerializedAudioNode {
    return {
      ...super.exportJSON(),
      src: this.__src,
      title: this.__title,
      author: this.__author,
    };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      audio: () => ({
        conversion: $convertAudioElement,
        priority: 1,
      }),
    };
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("audio");
    element.setAttribute("src", this.__src);
    element.setAttribute("data-title", this.__title);
    element.setAttribute("data-author", this.__author);
    element.setAttribute("controls", "true");
    return { element };
  }

  getSrc(): string {
    return this.__src;
  }

  getTitle(): string {
    return this.__title;
  }

  getAuthor(): string {
    return this.__author;
  }

  setTitle(title: string): void {
    const writable = this.getWritable();
    writable.__title = title;
  }

  setAuthor(author: string): void {
    const writable = this.getWritable();
    writable.__author = author;
  }

  decorate(editor: LexicalEditor, config: EditorConfig): React.JSX.Element {
    return (
      <React.Suspense fallback={<div className="h-28 w-full animate-pulse rounded-2xl bg-muted" />}>
        <AudioComponent
          className={{
            base: "relative",
            focus: "ring-2 ring-primary ring-offset-2 rounded-2xl",
          }}
          format={this.__format}
          nodeKey={this.getKey()}
          src={this.__src}
          title={this.__title}
          author={this.__author}
        />
      </React.Suspense>
    );
  }
}

export function $createAudioNode(payload: AudioPayload): AudioNode {
  return new AudioNode(
    payload.src,
    payload.title,
    payload.author,
    payload.format,
    payload.key
  );
}

export function $isAudioNode(node: LexicalNode | null | undefined): node is AudioNode {
  return node instanceof AudioNode;
}
