import {
  __spreadProps,
  __spreadValues,
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/components/editor/nodes/Hint/index.tsx
init_react_shim();
import {
  createCommand,
  createEditor,
  DecoratorNode,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW
} from "lexical";
import React, { Suspense, useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
var HintComponent = React.lazy(() => import("./HintComponet-BRL6EAMS.mjs"));
var Hint = class _Hint extends DecoratorNode {
  constructor(variant, caption, key) {
    super(key);
    this.__variant = variant;
    if (!caption) {
      const initialEditorState = {
        root: {
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: "normal",
                  style: "",
                  text: " ",
                  type: "text",
                  version: 1
                }
              ],
              direction: null,
              format: "",
              indent: 0,
              type: "paragraph",
              version: 1,
              textFormat: 0,
              textStyle: ""
            }
          ],
          direction: null,
          format: "",
          indent: 0,
          type: "root",
          version: 1
        }
      };
      const newEditor = createEditor();
      const parsedEditorState = newEditor.parseEditorState(JSON.stringify(initialEditorState));
      newEditor.setEditorState(parsedEditorState);
      this.__caption = newEditor;
    } else {
      this.__caption = caption;
    }
  }
  static getType() {
    return "hint";
  }
  static clone(node) {
    return new _Hint(node.__variant, node.__caption, node.__key);
  }
  static importJSON(serializedNode) {
    return new _Hint(
      serializedNode.variant,
      // Change from type to variant
      void 0
    ).updateFromJSON(serializedNode);
  }
  setVariant(variant) {
    const self = this.getWritable();
    self.__variant = variant;
    return self;
  }
  createDOM() {
    const element = document.createElement("div");
    element.className = `hint-${this.__type}`;
    return element;
  }
  updateFromJSON(serializedNode) {
    super.updateFromJSON(serializedNode);
    const nestedEditor = this.__caption;
    const editorState = nestedEditor.parseEditorState(serializedNode.caption.editorState);
    if (!editorState.isEmpty()) {
      nestedEditor.setEditorState(editorState);
    }
    return this;
  }
  exportJSON() {
    return __spreadProps(__spreadValues({}, super.exportJSON()), {
      variant: this.__variant,
      type: "hint",
      caption: this.__caption.toJSON()
    });
  }
  updateDOM() {
    return false;
  }
  decorate() {
    return /* @__PURE__ */ React.createElement(Suspense, { fallback: null }, /* @__PURE__ */ React.createElement(
      HintComponent,
      {
        type: this.__variant,
        captionEditor: this.__caption,
        nodeKey: this.getKey()
      }
    ));
  }
};
function $isHintNode(node) {
  return node instanceof Hint;
}
function $createHintNode(type) {
  return new Hint(type);
}
var INSERT_HINT_COMMAND = createCommand();
function $insertHintNode(type) {
  const selection = $getSelection();
  if ($isRangeSelection(selection)) {
    const hintNode = $createHintNode(type);
    selection.insertNodes([hintNode]);
  }
}
function HintPlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (!editor.hasNodes([Hint])) {
      throw new Error("Hint: Hint not registered on editor");
    }
  }, [editor]);
  useEffect(() => {
    return editor.registerCommand(
      INSERT_HINT_COMMAND,
      (payload, editor2) => {
        editor2.update(() => {
          $insertHintNode(payload);
        });
        return true;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor]);
  return null;
}

export {
  Hint,
  $isHintNode,
  INSERT_HINT_COMMAND,
  HintPlugin
};
