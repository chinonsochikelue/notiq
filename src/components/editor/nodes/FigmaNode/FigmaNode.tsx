/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
  EditorConfig,
  ElementFormatType,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  Spread,
} from 'lexical';
import type { JSX } from 'react';

import { BlockWithAlignableContents } from '@lexical/react/LexicalBlockWithAlignableContents';
import {
  DecoratorBlockNode,
  SerializedDecoratorBlockNode,
} from '@lexical/react/LexicalDecoratorBlockNode';
import * as React from 'react';

type FigmaComponentProps = Readonly<{
  className: Readonly<{
    base: string;
    focus: string;
  }>;
  format: ElementFormatType | null;
  nodeKey: NodeKey;
  documentID: string;
}>;

function getFigmaEmbedUrl(documentID: string): string {
  const cleanId = (documentID || '').trim();
  const figmaUrl = cleanId.startsWith('http')
    ? cleanId
    : `https://www.figma.com/file/${cleanId}`;
  return `https://www.figma.com/embed?embed_host=notiq&url=${encodeURIComponent(figmaUrl)}`;
}

function FigmaComponent({
  className,
  format,
  nodeKey,
  documentID,
}: FigmaComponentProps) {
  const embedUrl = getFigmaEmbedUrl(documentID);

  return (
    <BlockWithAlignableContents
      className={className}
      format={format}
      nodeKey={nodeKey}>
      <div className="relative my-4 aspect-video w-full max-w-3xl overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
        <iframe
          className="h-full w-full border-0"
          src={embedUrl}
          allowFullScreen={true}
          title="Figma Document"
          loading="lazy"
        />
      </div>
    </BlockWithAlignableContents>
  );
}

export type SerializedFigmaNode = Spread<
  {
    documentID: string;
  },
  SerializedDecoratorBlockNode
>;

export class FigmaNode extends DecoratorBlockNode {
  __id: string;

  static getType(): string {
    return 'figma';
  }

  static clone(node: FigmaNode): FigmaNode {
    return new FigmaNode(node.__id, node.__format, node.__key);
  }

  static importJSON(serializedNode: SerializedFigmaNode): FigmaNode {
    return $createFigmaNode(serializedNode.documentID).updateFromJSON(
      serializedNode,
    );
  }

  exportJSON(): SerializedFigmaNode {
    return {
      ...super.exportJSON(),
      documentID: this.__id,
    };
  }

  constructor(id: string, format?: ElementFormatType, key?: NodeKey) {
    super(format, key);
    this.__id = id;
  }

  updateDOM(): false {
    return false;
  }

  getId(): string {
    return this.__id;
  }

  getTextContent(): string {
    return `https://www.figma.com/file/${this.__id}`;
  }

  decorate(): JSX.Element {
    return (
      <FigmaComponent
        className={{
          base: '',
          focus: '',
        }}
        format={this.__format}
        nodeKey={this.getKey()}
        documentID={this.__id}
      />
    );
  }
}

export function $createFigmaNode(datasetID: string): FigmaNode {
  return new FigmaNode(datasetID);
}

export function $isFigmaNode(
  node: FigmaNode | LexicalNode | null | undefined,
): node is FigmaNode {
  return node instanceof FigmaNode;
}
