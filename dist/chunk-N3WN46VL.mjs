import {
  __spreadProps,
  __spreadValues,
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/components/editor/nodes/ImageNode/index.tsx
init_react_shim();
import { $applyNodeReplacement, createEditor, DecoratorNode } from "lexical";
import * as React from "react";
import { Suspense } from "react";
var ImageComponent = React.lazy(() => import("./image-2PJIAYAT.mjs"));
function isGoogleDocCheckboxImg(img) {
  return img.parentElement != null && img.parentElement.tagName === "LI" && img.previousSibling === null && img.getAttribute("aria-roledescription") === "checkbox";
}
function $convertImageElement(domNode) {
  const img = domNode;
  if (img.src.startsWith("file:///") || isGoogleDocCheckboxImg(img)) {
    return null;
  }
  const { alt: altText, src, width, height } = img;
  const node = $createImageNode({
    altText,
    height,
    src,
    width,
    alignment: "center",
    rounded: 0
  });
  return { node };
}
var ImageNode = class _ImageNode extends DecoratorNode {
  static getType() {
    return "image";
  }
  static clone(node) {
    return new _ImageNode(
      node.__src,
      node.__altText,
      node.__maxWidth,
      node.__width,
      node.__height,
      node.__showCaption,
      node.__caption,
      node.__captionsEnabled,
      node.__key,
      node.__rounded,
      node.__alignment
    );
  }
  static importJSON(serializedNode) {
    const {
      altText,
      height,
      width,
      maxWidth,
      src,
      showCaption,
      alignment,
      rounded
    } = serializedNode;
    return $createImageNode({
      altText,
      height,
      maxWidth,
      showCaption,
      src,
      width,
      rounded,
      alignment
    }).updateFromJSON(serializedNode);
  }
  setAlignment(newAlignment) {
    const writable = this.getWritable();
    writable.__alignment = newAlignment;
  }
  getWidth() {
    return this.__width;
  }
  getHeight() {
    return this.__height;
  }
  setRounded(rounded) {
    const writable = this.getWritable();
    writable.__rounded = rounded;
  }
  updateFromJSON(serializedNode) {
    const node = super.updateFromJSON(serializedNode);
    const { caption } = serializedNode;
    const nestedEditor = node.__caption;
    const editorState = nestedEditor.parseEditorState(caption.editorState);
    if (!editorState.isEmpty()) {
      nestedEditor.setEditorState(editorState);
    }
    return node;
  }
  exportDOM() {
    const element = document.createElement("img");
    element.setAttribute("src", this.__src);
    element.setAttribute("alt", this.__altText);
    element.setAttribute("width", this.__width.toString());
    element.setAttribute("height", this.__height.toString());
    return { element };
  }
  static importDOM() {
    return {
      img: () => ({
        conversion: $convertImageElement,
        priority: 0
      })
    };
  }
  setSrc(src) {
    const self = this.getWritable();
    self.__src = src;
  }
  constructor(src, altText, maxWidth, width, height, showCaption, caption, captionsEnabled, key, rounded = 0, alignment = "center") {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__maxWidth = maxWidth;
    this.__width = width || "inherit";
    this.__height = height || "inherit";
    this.__showCaption = showCaption || false;
    this.__alignment = alignment;
    this.__rounded = rounded;
    this.__caption = caption || createEditor({
      nodes: []
    });
    this.__captionsEnabled = captionsEnabled || captionsEnabled === void 0;
  }
  exportJSON() {
    return __spreadProps(__spreadValues({}, super.exportJSON()), {
      altText: this.getAltText(),
      caption: this.__caption.toJSON(),
      height: this.__height === "inherit" ? 0 : this.__height,
      maxWidth: this.__maxWidth,
      showCaption: this.__showCaption,
      rounded: this.__rounded,
      alignment: this.__alignment,
      src: this.getSrc(),
      width: this.__width === "inherit" ? 0 : this.__width
    });
  }
  setWidthAndHeight(width, height) {
    const writable = this.getWritable();
    writable.__width = width;
    writable.__height = height;
  }
  setShowCaption(showCaption) {
    const writable = this.getWritable();
    writable.__showCaption = showCaption;
  }
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
  getSrc() {
    return this.__src;
  }
  getAltText() {
    return this.__altText;
  }
  decorate() {
    return /* @__PURE__ */ React.createElement(Suspense, { fallback: null }, /* @__PURE__ */ React.createElement(
      "div",
      {
        style: {
          textAlign: this.__alignment
        }
      },
      /* @__PURE__ */ React.createElement(
        ImageComponent,
        {
          src: this.__src,
          altText: this.__altText,
          width: this.__width,
          height: this.__height,
          maxWidth: this.__maxWidth,
          nodeKey: this.getKey(),
          showCaption: this.__showCaption,
          caption: this.__caption,
          captionsEnabled: this.__captionsEnabled,
          resizable: true,
          rounded: this.__rounded
        }
      )
    ));
  }
};
function $createImageNode({
  altText,
  height,
  maxWidth = 500,
  captionsEnabled,
  src,
  width,
  showCaption,
  caption,
  key,
  rounded,
  alignment
}) {
  return $applyNodeReplacement(
    new ImageNode(
      src,
      altText,
      maxWidth,
      width,
      height,
      showCaption,
      caption,
      captionsEnabled,
      key,
      rounded,
      alignment
    )
  );
}
function $isImageNode(node) {
  return node instanceof ImageNode;
}

export {
  ImageNode,
  $createImageNode,
  $isImageNode
};
