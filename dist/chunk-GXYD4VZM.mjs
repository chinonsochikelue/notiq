import {
  __spreadProps,
  __spreadValues,
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/components/editor/nodes/CollapsibleNode/CollapsibleContainerNode.ts
init_react_shim();
import {
  ElementNode
} from "lexical";
var CollapsibleContainerNode = class _CollapsibleContainerNode extends ElementNode {
  constructor(open, key) {
    super(key);
    this.__open = open;
  }
  static getType() {
    return "collapsible-container";
  }
  static clone(node) {
    return new _CollapsibleContainerNode(node.__open, node.__key);
  }
  createDOM() {
    const dom = document.createElement("details");
    dom.classList.add("Collapsible__container");
    dom.open = this.__open;
    return dom;
  }
  updateDOM(prevNode, dom) {
    if (prevNode.__open !== this.__open) {
      dom.open = this.__open;
    }
    return false;
  }
  static importDOM() {
    return {};
  }
  static importJSON() {
    const node = $createCollapsibleContainerNode();
    return node;
  }
  exportJSON() {
    return __spreadProps(__spreadValues({}, super.exportJSON()), {
      type: "collapsible-container",
      version: 1
    });
  }
  setOpen(open) {
    const writable = this.getWritable();
    writable.__open = open;
  }
  getOpen() {
    return this.__open;
  }
  toggleOpen() {
    this.setOpen(!this.getOpen());
  }
};
function $createCollapsibleContainerNode() {
  return new CollapsibleContainerNode(true);
}
function $isCollapsibleContainerNode(node) {
  return node instanceof CollapsibleContainerNode;
}

// src/components/editor/nodes/CollapsibleNode/CollapsibleContentNode.ts
init_react_shim();
import {
  ElementNode as ElementNode2
} from "lexical";
var CollapsibleContentNode = class _CollapsibleContentNode extends ElementNode2 {
  static getType() {
    return "collapsible-content";
  }
  static clone(node) {
    return new _CollapsibleContentNode(node.__key);
  }
  createDOM() {
    const dom = document.createElement("div");
    dom.classList.add("Collapsible__content");
    return dom;
  }
  updateDOM() {
    return false;
  }
  static importDOM() {
    return {};
  }
  static importJSON() {
    return $createCollapsibleContentNode();
  }
  isShadowRoot() {
    return true;
  }
  exportJSON() {
    return __spreadProps(__spreadValues({}, super.exportJSON()), {
      type: "collapsible-content",
      version: 1
    });
  }
};
function $createCollapsibleContentNode() {
  return new CollapsibleContentNode();
}
function $isCollapsibleContentNode(node) {
  return node instanceof CollapsibleContentNode;
}

// src/components/editor/nodes/CollapsibleNode/CollapsibleTitleNode.ts
init_react_shim();
import {
  $createParagraphNode,
  $isElementNode,
  ElementNode as ElementNode3
} from "lexical";
var CollapsibleTitleNode = class _CollapsibleTitleNode extends ElementNode3 {
  static getType() {
    return "collapsible-title";
  }
  static clone(node) {
    return new _CollapsibleTitleNode(node.__key);
  }
  createDOM() {
    const dom = document.createElement("summary");
    dom.classList.add("Collapsible__title");
    return dom;
  }
  updateDOM() {
    return false;
  }
  static importDOM() {
    return {};
  }
  static importJSON() {
    return $createCollapsibleTitleNode();
  }
  exportJSON() {
    return __spreadProps(__spreadValues({}, super.exportJSON()), {
      type: "collapsible-title",
      version: 1
    });
  }
  collapseAtStart(_selection) {
    this.getParentOrThrow().insertBefore(this);
    return true;
  }
  insertNewAfter() {
    const containerNode = this.getParentOrThrow();
    if (!$isCollapsibleContainerNode(containerNode)) {
      throw new Error(
        "CollapsibleTitleNode expects to be child of CollapsibleContainerNode"
      );
    }
    if (containerNode.getOpen()) {
      const contentNode = this.getNextSibling();
      if (!$isCollapsibleContentNode(contentNode)) {
        throw new Error(
          "CollapsibleTitleNode expects to have CollapsibleContentNode sibling"
        );
      }
      const firstChild = contentNode.getFirstChild();
      if ($isElementNode(firstChild)) {
        return firstChild;
      } else {
        const paragraph = $createParagraphNode();
        contentNode.append(paragraph);
        return paragraph;
      }
    } else {
      const paragraph = $createParagraphNode();
      containerNode.insertAfter(paragraph);
      return paragraph;
    }
  }
};
function $createCollapsibleTitleNode() {
  return new CollapsibleTitleNode();
}
function $isCollapsibleTitleNode(node) {
  return node instanceof CollapsibleTitleNode;
}

export {
  CollapsibleContainerNode,
  $createCollapsibleContainerNode,
  $isCollapsibleContainerNode,
  CollapsibleContentNode,
  $createCollapsibleContentNode,
  $isCollapsibleContentNode,
  CollapsibleTitleNode,
  $createCollapsibleTitleNode,
  $isCollapsibleTitleNode
};
