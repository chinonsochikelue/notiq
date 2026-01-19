import {
  __spreadProps,
  __spreadValues,
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/components/editor/nodes/DynamicBlockNode/DynamicBlockNode.tsx
init_react_shim();
import { DecoratorBlockNode } from "@lexical/react/LexicalDecoratorBlockNode";
import * as React from "react";
function convertDynamicBlockElement(domNode) {
  const element = domNode;
  const payload = element.getAttribute("data-lexical-dynamic-block");
  if (payload) {
    const node = $createDynamicBlockNode(JSON.parse(payload));
    return { node };
  }
  return null;
}
var DynamicBlockNode = class _DynamicBlockNode extends DecoratorBlockNode {
  static getType() {
    return "dynamic-block";
  }
  static clone(node) {
    return new _DynamicBlockNode(node.__payload, node.__format, node.__key);
  }
  static importJSON(serializedNode) {
    const { payload } = serializedNode;
    const node = $createDynamicBlockNode(payload);
    node.setFormat(serializedNode.format);
    return node;
  }
  exportJSON() {
    return __spreadProps(__spreadValues({}, super.exportJSON()), {
      payload: this.__payload,
      type: "dynamic-block",
      version: 1
    });
  }
  static importDOM() {
    return {
      div: (node) => ({
        conversion: convertDynamicBlockElement,
        priority: 1
      })
    };
  }
  exportDOM() {
    const element = document.createElement("div");
    element.setAttribute("data-lexical-dynamic-block", JSON.stringify(this.__payload));
    element.className = "dynamic-block-container";
    return { element };
  }
  constructor(payload, format, key) {
    super(format, key);
    this.__payload = payload;
  }
  updatePayload(payload) {
    const writable = this.getWritable();
    writable.__payload = payload;
  }
  getPayload() {
    return this.getLatest().__payload;
  }
  getTextContent() {
    return `Dynamic Block: ${this.__payload.title}`;
  }
  decorate() {
    return /* @__PURE__ */ React.createElement(DynamicBlockComponent, { nodeKey: this.getKey(), payload: this.__payload });
  }
};
function $createDynamicBlockNode(payload) {
  return new DynamicBlockNode(payload);
}
function $isDynamicBlockNode(node) {
  return node instanceof DynamicBlockNode;
}
var DynamicBlockComponent = React.lazy(() => import("./DynamicBlockComponent-NRQJ4WW4.mjs"));

export {
  DynamicBlockNode,
  $createDynamicBlockNode,
  $isDynamicBlockNode
};
