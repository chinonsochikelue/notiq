import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  ElementFormatType,
  LexicalNode,
  NodeKey,
  Spread,
} from "lexical"

import { DecoratorBlockNode } from "@lexical/react/LexicalDecoratorBlockNode"
import * as React from "react"

export interface DynamicBlockPayload {
  id: string
  title: string
  blocks: DynamicContentBlock[]
  triggers: BlockTrigger[]
  currentBlockId: string
}

export interface DynamicContentBlock {
  id: string
  type: "text" | "image" | "video" | "html"
  content: string
  styles?: Record<string, string>
  animation?: "fade" | "slide" | "bounce" | "none"
}

export interface BlockTrigger {
  id: string
  type: "click" | "hover" | "time" | "scroll"
  condition: string | number
  targetBlockId: string
  action: "show" | "hide" | "replace" | "animate"
}

export type SerializedDynamicBlockNode = Spread<
  {
    payload: DynamicBlockPayload
  },
  SerializedDecoratorBlockNode
>

function convertDynamicBlockElement(domNode: Node): null | DOMConversionOutput {
  const element = domNode as HTMLElement
  const payload = element.getAttribute("data-lexical-dynamic-block")
  if (payload) {
    const node = $createDynamicBlockNode(JSON.parse(payload))
    return { node }
  }
  return null
}

export class DynamicBlockNode extends DecoratorBlockNode {
  __payload: DynamicBlockPayload

  static getType(): string {
    return "dynamic-block"
  }

  static clone(node: DynamicBlockNode): DynamicBlockNode {
    return new DynamicBlockNode(node.__payload, node.__format, node.__key)
  }

  static importJSON(serializedNode: SerializedDynamicBlockNode): DynamicBlockNode {
    const { payload } = serializedNode
    const node = $createDynamicBlockNode(payload)
    node.setFormat(serializedNode.format)
    return node
  }

  exportJSON(): SerializedDynamicBlockNode {
    return {
      ...super.exportJSON(),
      payload: this.__payload,
      type: "dynamic-block",
      version: 1,
    }
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (node: Node) => ({
        conversion: convertDynamicBlockElement,
        priority: 1,
      }),
    }
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("div")
    element.setAttribute("data-lexical-dynamic-block", JSON.stringify(this.__payload))
    element.className = "dynamic-block-container"
    return { element }
  }

  constructor(payload: DynamicBlockPayload, format?: ElementFormatType, key?: NodeKey) {
    super(format, key)
    this.__payload = payload
  }

  updatePayload(payload: DynamicBlockPayload): void {
    const writable = this.getWritable()
    writable.__payload = payload
  }

  getPayload(): DynamicBlockPayload {
    return this.getLatest().__payload
  }

  getTextContent(): string {
    return `Dynamic Block: ${this.__payload.title}`
  }

  decorate(): React.JSX.Element {
    return <DynamicBlockComponent nodeKey={this.getKey()} payload={this.__payload} />
  }
}

export function $createDynamicBlockNode(payload: DynamicBlockPayload): DynamicBlockNode {
  return new DynamicBlockNode(payload)
}

export function $isDynamicBlockNode(node: LexicalNode | null | undefined): node is DynamicBlockNode {
  return node instanceof DynamicBlockNode
}

// Component will be imported from separate file
const DynamicBlockComponent = React.lazy(() => import("./DynamicBlockComponent"))

type SerializedDecoratorBlockNode = {
  format: ElementFormatType
  type: string
  version: number
}
