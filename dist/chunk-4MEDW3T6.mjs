import {
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/components/editor/nodes/StoryBuilderNode/StoryBuilderNode.tsx
init_react_shim();
import { $applyNodeReplacement, DecoratorNode } from "lexical";
import * as React from "react";
import { Suspense } from "react";
var StoryBuilderComponent = React.lazy(() => import("./StoryBuilderComponent-JGDBM5JU.mjs"));
function convertStoryBuilderElement(domNode) {
  const textContent = domNode.textContent;
  if (textContent) {
    const node = $createStoryBuilderNode({
      nodes: [],
      currentNodeId: "",
      title: "Interactive Story"
    });
    return {
      node
    };
  }
  return null;
}
var StoryBuilderNode = class _StoryBuilderNode extends DecoratorNode {
  static getType() {
    return "story-builder";
  }
  static clone(node) {
    return new _StoryBuilderNode(node.__nodes, node.__currentNodeId, node.__title, node.__key);
  }
  static importJSON(serializedNode) {
    const { nodes, currentNodeId, title } = serializedNode;
    const node = $createStoryBuilderNode({
      nodes,
      currentNodeId,
      title
    });
    return node;
  }
  exportJSON() {
    return {
      nodes: this.__nodes,
      currentNodeId: this.__currentNodeId,
      title: this.__title,
      type: "story-builder",
      version: 1
    };
  }
  constructor(nodes, currentNodeId, title, key) {
    super(key);
    this.__nodes = nodes;
    this.__currentNodeId = currentNodeId;
    this.__title = title;
  }
  exportDOM() {
    const element = document.createElement("div");
    element.setAttribute("data-lexical-story-builder", "true");
    element.textContent = this.__title;
    return { element };
  }
  static importDOM() {
    return {
      div: (domNode) => {
        if (!domNode.hasAttribute("data-lexical-story-builder")) {
          return null;
        }
        return {
          conversion: convertStoryBuilderElement,
          priority: 1
        };
      }
    };
  }
  updateStory(payload) {
    const writable = this.getWritable();
    writable.__nodes = payload.nodes;
    writable.__currentNodeId = payload.currentNodeId;
    writable.__title = payload.title;
  }
  setTitle(title) {
    const writable = this.getWritable();
    writable.__title = title;
  }
  getNodes() {
    return this.__nodes;
  }
  getCurrentNodeId() {
    return this.__currentNodeId;
  }
  getTitle() {
    return this.__title;
  }
  createDOM(config) {
    const div = document.createElement("div");
    div.style.display = "contents";
    return div;
  }
  updateDOM() {
    return false;
  }
  decorate() {
    return /* @__PURE__ */ React.createElement(Suspense, { fallback: null }, /* @__PURE__ */ React.createElement(
      StoryBuilderComponent,
      {
        nodes: this.__nodes,
        currentNodeId: this.__currentNodeId,
        title: this.__title,
        nodeKey: this.getKey()
      }
    ));
  }
};
function $createStoryBuilderNode(payload) {
  return $applyNodeReplacement(new StoryBuilderNode(payload.nodes, payload.currentNodeId, payload.title));
}
function $isStoryBuilderNode(node) {
  return node instanceof StoryBuilderNode;
}

export {
  StoryBuilderNode,
  $createStoryBuilderNode,
  $isStoryBuilderNode
};
