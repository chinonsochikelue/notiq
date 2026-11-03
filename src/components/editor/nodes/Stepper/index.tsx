import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  SerializedLexicalNode,
  SerializedEditor,
  Spread,
  DecoratorNode,
  NodeKey,
  LexicalNode,
  createEditor,
  LexicalCommand,
  createCommand,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  LexicalEditor,
  EditorState,
} from "lexical";
import React, { Suspense, useEffect } from "react";
const StepperComponent = React.lazy(
  () => import("../../../ui/stepper/stepper")
);

export interface StepType {
  title: string;
  id: number;
  content: LexicalEditor;
}

export type StepsType = StepType[];

export type SerializedStepper = Spread<
  {
    type: "stepper";
    steps: {
      title: string;
      id: string;
      content: SerializedEditor;
    }[];
  },
  SerializedLexicalNode
>;

export const initialEditorState = {
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
            version: 1,
          },
        ],
        direction: null,
        format: "",
        indent: 0,
        type: "paragraph",
        version: 1,
        textFormat: 0,
        textStyle: "",
      },
    ],
    direction: null,
    format: "",
    indent: 0,
    type: "root",
    version: 1,
  },
};

export function safelySetEditorState(editor: LexicalEditor, rawContent: any) {
  try {
    let parsedObj = rawContent;
    if (typeof rawContent === "string") {
      try {
        parsedObj = JSON.parse(rawContent);
      } catch {
        parsedObj = null;
      }
    }
    if (
      parsedObj &&
      typeof parsedObj === "object" &&
      parsedObj.root &&
      typeof parsedObj.root === "object" &&
      parsedObj.root.type === "root" &&
      Array.isArray(parsedObj.root.children) &&
      parsedObj.root.children.length > 0
    ) {
      editor.setEditorState(editor.parseEditorState(JSON.stringify(parsedObj)));
      return;
    }
  } catch (e) {
    // ignore parsing failure and fallback
  }

  try {
    editor.setEditorState(editor.parseEditorState(JSON.stringify(initialEditorState)));
  } catch (e) {
    console.error("Failed to set initialEditorState for Stepper:", e);
  }
}

export class StepperNode extends DecoratorNode<React.ReactElement> {
  __steps: StepsType;

  constructor(steps?: StepsType, key?: NodeKey) {
    super(key);
    const safeSteps = Array.isArray(steps) ? steps : [];
    this.__steps = safeSteps.map((step) => {
      if (!step || typeof step !== "object") {
        const newEditor = createEditor();
        safelySetEditorState(newEditor, null);
        return { id: 1, title: "Step 1", content: newEditor };
      }
      if (!step.content || typeof (step.content as any).isEditable !== "function") {
        const newEditor = createEditor();
        const rawContent = (step.content as any)?.editorState || step.content;
        safelySetEditorState(newEditor, rawContent);
        return { ...step, content: newEditor };
      }
      return step;
    });
  }

  static getType(): string {
    return "stepper";
  }

  addStep(step: Omit<StepType, "content">) {
    const self = this.getWritable();
    const newEditor = createEditor();
    safelySetEditorState(newEditor, null);
    const newStep: StepType = {
      ...step,
      content: newEditor,
    };
    self.__steps.push(newStep);
    return self;
  }

  insertStepAtIndex(step: Omit<StepType, "content">, index: number) {
    if (index < 0 || index > this.__steps.length) {
      throw new Error("Invalid index for inserting step.");
    }
    const self = this.getWritable();
    const newEditor = createEditor();
    safelySetEditorState(newEditor, null);
    const newStep: StepType = {
      ...step,
      content: newEditor,
    };
    self.__steps.splice(index, 0, newStep);
    return self;
  }
  deleteStep(idOrIndex: number) {
    const self = this.getWritable();
    const hasId = self.__steps.some(step => step.id === idOrIndex);
    if (hasId) {
      self.__steps = self.__steps.filter(step => step.id !== idOrIndex);
    } else if (idOrIndex >= 0 && idOrIndex < self.__steps.length) {
      self.__steps.splice(idOrIndex, 1);
    }
    return self;
  }
  updateTitle(id: number, title: string) {
    const self = this.getWritable();
    const step = self.__steps.find(s => s.id === id);
    if (step) step.title = title;
    return self;
  }


  replaceSteps(steps?: StepsType) {
    const self = this.getWritable();
    const safeSteps = Array.isArray(steps) ? steps : [];
    self.__steps = safeSteps.map((step) => {
      if (step?.content && typeof (step.content as any).isEditable === "function") return step;
      const newEditor = createEditor();
      const rawContent = (step?.content as any)?.editorState || step?.content;
      safelySetEditorState(newEditor, rawContent);
      return { ...step, content: newEditor };
    });
    return self;
  }

  reorderSteps(newSteps: StepsType) {
    const self = this.getWritable();
    self.__steps = newSteps;
    return self;
  }


  static clone(node: StepperNode): StepperNode {
    const safeSteps = Array.isArray(node.__steps) ? node.__steps : [];
    return new StepperNode(safeSteps, node.__key);
  }

  static importJSON(serializedNode: SerializedStepper): StepperNode {
    const serializedSteps = Array.isArray(serializedNode?.steps)
      ? serializedNode.steps
      : [];
    const steps: StepType[] = serializedSteps.map((serializedStep, index) => {
      const newEditor = createEditor();
      const rawContentState = serializedStep?.content?.editorState || (serializedStep as any)?.content;
      safelySetEditorState(newEditor, rawContentState);
      return {
        title: serializedStep?.title || `Step ${index + 1}`,
        id: parseInt(serializedStep?.id || `${index + 1}`, 10) || (index + 1),
        content: newEditor,
      };
    });
    return new StepperNode(steps);
  }

  exportJSON(): SerializedStepper {
    const safeSteps = Array.isArray(this.__steps) ? this.__steps : [];
    return {
      ...super.exportJSON(),
      steps: safeSteps.map((step) => {
        let serializedEditorState: any = initialEditorState;
        try {
          if (step?.content && typeof (step.content as any).getEditorState === "function") {
            serializedEditorState = step.content.getEditorState().toJSON();
          } else if ((step?.content as any)?.editorState) {
            serializedEditorState = (step.content as any).editorState;
          }
        } catch {
          serializedEditorState = initialEditorState;
        }
        return {
          title: step?.title || "",
          id: (step?.id ?? "").toString(),
          content: {
            editorState: serializedEditorState,
          },
        };
      }),
      type: "stepper",
    };
  }

  createDOM(): HTMLElement {
    const element = document.createElement("div");
    element.className = `stepper-${this.__type}`;
    return element;
  }

  updateDOM(): false {
    return false;
  }

  decorate(): React.ReactElement {
    const safeSteps = Array.isArray(this.__steps) ? this.__steps : [];
    return (
      <Suspense fallback={null}>
        <div>
          <StepperComponent steps={safeSteps} nodeKey={this.getKey()} />
        </div>
      </Suspense>
    );
  }
}

export function $isStepperNode(
  node: LexicalNode | null | undefined
): node is StepperNode {
  return node instanceof StepperNode;
}

export function $createStepperNode(steps?: StepsType): StepperNode {
  return new StepperNode(steps || []);
}

export const INSERT_STEPPER_COMMAND: LexicalCommand<StepsType> =
  createCommand();

export function $insertStepperNode(steps: StepsType) {
  const selection = $getSelection();
  if ($isRangeSelection(selection)) {
    const stepperNode = $createStepperNode(steps);
    selection.insertNodes([stepperNode]);
  }
}

export default function StepperPlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (!editor.hasNodes([StepperNode])) {
      throw new Error("StepperNode: StepperNode not registered on editor");
    }
  }, [editor]);
  useEffect(() => {
    return editor.registerCommand(
      INSERT_STEPPER_COMMAND,
      (payload: StepsType) => {
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
