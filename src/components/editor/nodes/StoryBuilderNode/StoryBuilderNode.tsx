import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedElementNode,
  Spread,
} from "lexical"

import { $applyNodeReplacement, DecoratorNode } from "lexical"
import * as React from "react"
import { Suspense } from "react"

const StoryBuilderComponent = React.lazy(() => import("./StoryBuilderComponent"))

export interface StoryChoice {
  id: string
  text: string
  targetId: string
}

export interface StoryNode {
  id: string
  title: string
  content: string
  choices: StoryChoice[]
  isStart?: boolean
  isEnd?: boolean
}

export interface StoryBuilderPayload {
  nodes: StoryNode[]
  currentNodeId: string
  title: string
}

export type SerializedStoryBuilderNode = Spread<
  {
    nodes: StoryNode[]
    currentNodeId: string
    title: string
  },
  SerializedElementNode
>

function convertStoryBuilderElement(domNode: HTMLElement): null | DOMConversionOutput {
  const textContent = domNode.textContent
  if (textContent) {
    const node = $createStoryBuilderNode({
      nodes: [],
      currentNodeId: "",
      title: "Interactive Story",
    })
    return {
      node,
    }
  }
  return null
}

export class StoryBuilderNode extends DecoratorNode<React.JSX.Element> {
  __nodes: StoryNode[]
  __currentNodeId: string
  __title: string

  static getType(): string {
    return "story-builder"
  }

  static clone(node: StoryBuilderNode): StoryBuilderNode {
    return new StoryBuilderNode(node.__nodes, node.__currentNodeId, node.__title, node.__key)
  }

  static importJSON(serializedNode: SerializedStoryBuilderNode): StoryBuilderNode {
    const { nodes, currentNodeId, title } = serializedNode
    const node = $createStoryBuilderNode({
      nodes,
      currentNodeId,
      title,
    })
    return node
  }

  exportJSON(): SerializedStoryBuilderNode {
    return {
      nodes: this.__nodes,
      currentNodeId: this.__currentNodeId,
      title: this.__title,
      type: "story-builder",
      version: 1,
    }
  }

  constructor(nodes: StoryNode[], currentNodeId: string, title: string, key?: NodeKey) {
    super(key)
    this.__nodes = nodes
    this.__currentNodeId = currentNodeId
    this.__title = title
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("div")
    element.setAttribute("data-lexical-story-builder", "true")
    element.textContent = this.__title
    return { element }
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute("data-lexical-story-builder")) {
          return null
        }
        return {
          conversion: convertStoryBuilderElement,
          priority: 1,
        }
      },
    }
  }

  updateStory(payload: StoryBuilderPayload): void {
    const writable = this.getWritable()
    writable.__nodes = payload.nodes
    writable.__currentNodeId = payload.currentNodeId
    writable.__title = payload.title
  }

  setTitle(title: string): void {
    const writable = this.getWritable()
    writable.__title = title
  }

  getNodes(): StoryNode[] {
    return this.__nodes
  }

  getCurrentNodeId(): string {
    return this.__currentNodeId
  }

  getTitle(): string {
    return this.__title
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement("div")
    div.style.display = "contents"
    return div
  }

  updateDOM(): false {
    return false
  }

  decorate(): React.JSX.Element {
    return (
      <Suspense fallback={null}>
        <StoryBuilderComponent
          nodes={this.__nodes}
          currentNodeId={this.__currentNodeId}
          title={this.__title}
          nodeKey={this.getKey()}
        />
      </Suspense>
    )
  }
}

export function $createStoryBuilderNode(payload: StoryBuilderPayload): StoryBuilderNode {
  return $applyNodeReplacement(new StoryBuilderNode(payload.nodes, payload.currentNodeId, payload.title))
}

export function $isStoryBuilderNode(node: LexicalNode | null | undefined): node is StoryBuilderNode {
  return node instanceof StoryBuilderNode
}
