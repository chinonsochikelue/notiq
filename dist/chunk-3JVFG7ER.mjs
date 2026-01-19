import {
  __spreadProps,
  __spreadValues,
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/components/ui/equation/KatexRenderer.tsx
init_react_shim();
import katex from "katex";
import * as React from "react";
import { useEffect, useRef } from "react";
function KatexRenderer({
  equation,
  inline,
  onDoubleClick
}) {
  const katexElementRef = useRef(null);
  useEffect(() => {
    const katexElement = katexElementRef.current;
    if (katexElement !== null) {
      katex.render(equation, katexElement, {
        displayMode: !inline,
        // true === block display //
        errorColor: "#cc0000",
        output: "html",
        strict: "warn",
        throwOnError: false,
        trust: false
      });
    }
  }, [equation, inline]);
  return (
    // We use an empty image tag either side to ensure Android doesn't try and compose from the
    // inner text from Katex. There didn't seem to be any other way of making this work,
    // without having a physical space.
    /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
      "img",
      {
        src: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
        width: "0",
        height: "0",
        alt: ""
      }
    ), /* @__PURE__ */ React.createElement(
      "span",
      {
        role: "button",
        tabIndex: -1,
        onDoubleClick,
        ref: katexElementRef
      }
    ), /* @__PURE__ */ React.createElement(
      "img",
      {
        src: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
        width: "0",
        height: "0",
        alt: ""
      }
    ))
  );
}

// src/components/editor/nodes/EquationNode/EquationNode.tsx
init_react_shim();
import katex2 from "katex";
import { $applyNodeReplacement, DecoratorNode } from "lexical";
import * as React2 from "react";
var EquationComponent = React2.lazy(() => import("./EquationComponent-CB6DFIHV.mjs"));
function $convertEquationElement(domNode) {
  let equation = domNode.getAttribute("data-lexical-equation");
  const inline = domNode.getAttribute("data-lexical-inline") === "true";
  equation = atob(equation || "");
  if (equation) {
    const node = $createEquationNode(equation, inline);
    return { node };
  }
  return null;
}
var EquationNode = class _EquationNode extends DecoratorNode {
  static getType() {
    return "equation";
  }
  static clone(node) {
    return new _EquationNode(node.__equation, node.__inline, node.__key);
  }
  constructor(equation, inline, key) {
    super(key);
    this.__equation = equation;
    this.__inline = inline != null ? inline : false;
  }
  static importJSON(serializedNode) {
    return $createEquationNode(
      serializedNode.equation,
      serializedNode.inline
    ).updateFromJSON(serializedNode);
  }
  exportJSON() {
    return __spreadProps(__spreadValues({}, super.exportJSON()), {
      equation: this.getEquation(),
      inline: this.__inline
    });
  }
  createDOM(_config) {
    const element = document.createElement(this.__inline ? "span" : "div");
    element.className = "editor-equation";
    return element;
  }
  exportDOM() {
    const element = document.createElement(this.__inline ? "span" : "div");
    const equation = btoa(this.__equation);
    element.setAttribute("data-lexical-equation", equation);
    element.setAttribute("data-lexical-inline", `${this.__inline}`);
    katex2.render(this.__equation, element, {
      displayMode: !this.__inline,
      // true === block display //
      errorColor: "#cc0000",
      output: "html",
      strict: "warn",
      throwOnError: false,
      trust: false
    });
    return { element };
  }
  static importDOM() {
    return {
      div: (domNode) => {
        if (!domNode.hasAttribute("data-lexical-equation")) {
          return null;
        }
        return {
          conversion: $convertEquationElement,
          priority: 2
        };
      },
      span: (domNode) => {
        if (!domNode.hasAttribute("data-lexical-equation")) {
          return null;
        }
        return {
          conversion: $convertEquationElement,
          priority: 1
        };
      }
    };
  }
  updateDOM(prevNode) {
    return this.__inline !== prevNode.__inline;
  }
  getTextContent() {
    return this.__equation;
  }
  getEquation() {
    return this.__equation;
  }
  setEquation(equation) {
    const writable = this.getWritable();
    writable.__equation = equation;
  }
  decorate() {
    return /* @__PURE__ */ React2.createElement(
      EquationComponent,
      {
        equation: this.__equation,
        inline: this.__inline,
        nodeKey: this.__key
      }
    );
  }
};
function $createEquationNode(equation = "", inline = false) {
  const equationNode = new EquationNode(equation, inline);
  return $applyNodeReplacement(equationNode);
}
function $isEquationNode(node) {
  return node instanceof EquationNode;
}

export {
  KatexRenderer,
  EquationNode,
  $createEquationNode,
  $isEquationNode
};
