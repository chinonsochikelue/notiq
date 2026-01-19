import {
  __spreadProps,
  __spreadValues,
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/components/editor/nodes/ExcalidrawNode/index.tsx
init_react_shim();
import { DecoratorNode } from "lexical";
import * as React from "react";
var ExcalidrawComponent = React.lazy(() => import("./ExcalidrawComponent-XW6646OH.mjs"));
function $convertExcalidrawElement(domNode) {
  const excalidrawData = domNode.getAttribute("data-lexical-excalidraw-json");
  const styleAttributes = window.getComputedStyle(domNode);
  const heightStr = styleAttributes.getPropertyValue("height");
  const widthStr = styleAttributes.getPropertyValue("width");
  const height = !heightStr || heightStr === "inherit" ? "inherit" : parseInt(heightStr, 10);
  const width = !widthStr || widthStr === "inherit" ? "inherit" : parseInt(widthStr, 10);
  if (excalidrawData) {
    const node = $createExcalidrawNode(excalidrawData, width, height);
    return {
      node
    };
  }
  return null;
}
var ExcalidrawNode = class _ExcalidrawNode extends DecoratorNode {
  static getType() {
    return "excalidraw";
  }
  static clone(node) {
    return new _ExcalidrawNode(
      node.__data,
      node.__width,
      node.__height,
      node.__key
    );
  }
  static importJSON(serializedNode) {
    var _a, _b;
    return new _ExcalidrawNode(
      serializedNode.data,
      (_a = serializedNode.width) != null ? _a : "inherit",
      (_b = serializedNode.height) != null ? _b : "inherit"
    ).updateFromJSON(serializedNode);
  }
  exportJSON() {
    return __spreadProps(__spreadValues({}, super.exportJSON()), {
      data: this.__data,
      height: this.__height === "inherit" ? void 0 : this.__height,
      width: this.__width === "inherit" ? void 0 : this.__width
    });
  }
  constructor(data = "[]", width = "inherit", height = "inherit", key) {
    super(key);
    this.__data = data;
    this.__width = width;
    this.__height = height;
  }
  // View
  createDOM(config) {
    const span = document.createElement("span");
    const theme = config.theme;
    const className = theme.image;
    if (className !== void 0) {
      span.className = className;
    }
    return span;
  }
  updateDOM() {
    return false;
  }
  static importDOM() {
    return {
      span: (domNode) => {
        if (!domNode.hasAttribute("data-lexical-excalidraw-json")) {
          return null;
        }
        return {
          conversion: $convertExcalidrawElement,
          priority: 1
        };
      }
    };
  }
  exportDOM(editor) {
    const element = document.createElement("span");
    element.style.display = "inline-block";
    const content = editor.getElementByKey(this.getKey());
    if (content !== null) {
      const svg = content.querySelector("svg");
      if (svg !== null) {
        element.innerHTML = svg.outerHTML;
      }
    }
    element.style.width = this.__width === "inherit" ? "inherit" : `${this.__width}px`;
    element.style.height = this.__height === "inherit" ? "inherit" : `${this.__height}px`;
    element.setAttribute("data-lexical-excalidraw-json", this.__data);
    return { element };
  }
  setData(data) {
    const self = this.getWritable();
    self.__data = data;
  }
  getWidth() {
    return this.getLatest().__width;
  }
  setWidth(width) {
    const self = this.getWritable();
    self.__width = width;
  }
  getHeight() {
    return this.getLatest().__height;
  }
  setHeight(height) {
    const self = this.getWritable();
    self.__height = height;
  }
  decorate(editor, config) {
    return /* @__PURE__ */ React.createElement(
      ExcalidrawComponent,
      {
        nodeKey: this.getKey(),
        data: this.__data,
        width: this.__width,
        height: this.__height
      }
    );
  }
};
function $createExcalidrawNode(data = "[]", width = "inherit", height = "inherit") {
  return new ExcalidrawNode(data, width, height);
}
function $isExcalidrawNode(node) {
  return node instanceof ExcalidrawNode;
}

export {
  ExcalidrawNode,
  $createExcalidrawNode,
  $isExcalidrawNode
};
