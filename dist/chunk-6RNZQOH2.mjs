import {
  __spreadProps,
  __spreadValues,
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/components/editor/nodes/Stepper/index.tsx
init_react_shim();
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  DecoratorNode,
  createEditor,
  createCommand,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW
} from "lexical";
import React, { Suspense, useEffect } from "react";
var StepperComponent = React.lazy(
  () => import("./stepper-FSARL6X6.mjs")
);
var initialEditorState = {
  root: {
    children: [
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: "type the content here..",
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
var StepperNode = class _StepperNode extends DecoratorNode {
  constructor(steps, key) {
    super(key);
    this.__steps = steps.map((step) => {
      if (!step.content) {
        const newEditor = createEditor();
        const parsedEditorState = newEditor.parseEditorState(
          JSON.stringify(initialEditorState)
        );
        newEditor.setEditorState(parsedEditorState);
        return __spreadProps(__spreadValues({}, step), { content: newEditor });
      }
      return step;
    });
  }
  static getType() {
    return "stepper";
  }
  addStep(step) {
    const self = this.getWritable();
    const newEditor = createEditor();
    const parsedEditorState = newEditor.parseEditorState(
      JSON.stringify(initialEditorState)
    );
    newEditor.setEditorState(parsedEditorState);
    const newStep = __spreadProps(__spreadValues({}, step), {
      content: newEditor
    });
    self.__steps.push(newStep);
    return self;
  }
  insertStepAtIndex(step, index) {
    if (index < 0 || index > this.__steps.length) {
      throw new Error("Invalid index for inserting step.");
    }
    const self = this.getWritable();
    const newEditor = createEditor();
    const parsedEditorState = newEditor.parseEditorState(
      JSON.stringify(initialEditorState)
    );
    newEditor.setEditorState(parsedEditorState);
    const newStep = __spreadProps(__spreadValues({}, step), {
      content: newEditor
    });
    self.__steps.splice(index, 0, newStep);
    return self;
  }
  deleteStep(id) {
    const self = this.getWritable();
    self.__steps = self.__steps.filter((step) => step.id !== id);
    return self;
  }
  updateTitle(id, title) {
    const self = this.getWritable();
    const step = self.__steps.find((s) => s.id === id);
    if (step) step.title = title;
    return self;
  }
  replaceSteps(steps) {
    const self = this.getWritable();
    self.__steps = steps.map((step) => {
      if (step.content) return step;
      const newEditor = createEditor();
      const parsedEditorState = newEditor.parseEditorState(
        JSON.stringify(initialEditorState)
      );
      newEditor.setEditorState(parsedEditorState);
      return __spreadProps(__spreadValues({}, step), { content: newEditor });
    });
    return self;
  }
  reorderSteps(newSteps) {
    const self = this.getWritable();
    self.__steps = newSteps;
    return self;
  }
  static clone(node) {
    return new _StepperNode(node.__steps, node.__key);
  }
  static importJSON(serializedNode) {
    const steps = serializedNode.steps.map((serializedStep) => {
      const newEditor = createEditor();
      const editorState = newEditor.parseEditorState(
        serializedStep.content.editorState
      );
      newEditor.setEditorState(editorState);
      return {
        title: serializedStep.title,
        id: parseInt(serializedStep.id, 10),
        content: newEditor
      };
    });
    return new _StepperNode(steps);
  }
  exportJSON() {
    return __spreadProps(__spreadValues({}, super.exportJSON()), {
      steps: this.__steps.map((step) => ({
        title: step.title,
        id: step.id.toString(),
        content: {
          editorState: step.content.getEditorState().toJSON()
        }
      })),
      type: "stepper"
    });
  }
  createDOM() {
    const element = document.createElement("div");
    element.className = `stepper-${this.__type}`;
    return element;
  }
  updateDOM() {
    return false;
  }
  decorate() {
    return /* @__PURE__ */ React.createElement(Suspense, { fallback: null }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(StepperComponent, { steps: this.__steps, nodeKey: this.getKey() })));
  }
};
function $isStepperNode(node) {
  return node instanceof StepperNode;
}
function $createStepperNode(steps) {
  return new StepperNode(steps);
}
var INSERT_STEPPER_COMMAND = createCommand();
function $insertStepperNode(steps) {
  const selection = $getSelection();
  if ($isRangeSelection(selection)) {
    const stepperNode = $createStepperNode(steps);
    selection.insertNodes([stepperNode]);
  }
}
function StepperPlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (!editor.hasNodes([StepperNode])) {
      throw new Error("StepperNode: StepperNode not registered on editor");
    }
  }, [editor]);
  useEffect(() => {
    return editor.registerCommand(
      INSERT_STEPPER_COMMAND,
      (payload) => {
        editor.update(() => {
          $insertStepperNode(payload);
        });
        return true;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor]);
  return null;
}

export {
  initialEditorState,
  StepperNode,
  $isStepperNode,
  $createStepperNode,
  INSERT_STEPPER_COMMAND,
  StepperPlugin
};
