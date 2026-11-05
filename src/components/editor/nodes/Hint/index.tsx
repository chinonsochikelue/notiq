import {
  createCommand,
  createEditor,
  DecoratorNode,
  LexicalCommand,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedEditor,
  SerializedLexicalNode,
  Spread,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
} from "lexical";
import React, { Suspense, useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

const HintComponent = React.lazy(() => import("./HintComponet"));

export type HintType =
  | "hint"
  | "note"
  | "info"
  | "tip"
  | "important"
  | "warning"
  | "caution"
  | "error"
  | "success"
  | "neutral";

export type SerializedHint = Spread<
  {
    type: "hint";
    variant: HintType;
    emoji?: string;
    caption: SerializedEditor;
  },
  SerializedLexicalNode
>;

export class Hint extends DecoratorNode<React.ReactElement> {
  __variant: HintType;
  __emoji?: string;
  __caption: LexicalEditor;

  constructor(
    variant: HintType = "tip",
    emojiOrCaption?: string | LexicalEditor,
    caption?: LexicalEditor,
    key?: NodeKey,
  ) {
    super(key);
    this.__variant = variant;

    let initialEditor: LexicalEditor | undefined;
    if (typeof emojiOrCaption === "string") {
      this.__emoji = emojiOrCaption;
      initialEditor = caption;
    } else {
      initialEditor = emojiOrCaption;
    }

    if (!initialEditor) {
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
                  text: "",
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

      const newEditor = createEditor();
      const parsedEditorState = newEditor.parseEditorState(JSON.stringify(initialEditorState));
      newEditor.setEditorState(parsedEditorState);

      this.__caption = newEditor;
    } else {
      this.__caption = initialEditor;
    }
  }

  static getType(): string {
    return "hint";
  }

  static clone(node: Hint): Hint {
    return new Hint(node.__variant, node.__emoji, node.__caption, node.__key);
  }

  static importJSON(serializedNode: SerializedHint): Hint {
    return new Hint(
      serializedNode.variant || "tip",
      serializedNode.emoji,
      undefined
    ).updateFromJSON(serializedNode);
  }

  setVariant(variant: HintType): this {
    const self = this.getWritable();
    self.__variant = variant;
    return self;
  }

  setEmoji(emoji?: string): this {
    const self = this.getWritable();
    self.__emoji = emoji;
    return self;
  }

  createDOM(): HTMLElement {
    const element = document.createElement("div");
    element.className = `hint-${this.__variant || "tip"}`;
    return element;
  }

  updateFromJSON(serializedNode: SerializedHint): this {
    super.updateFromJSON(serializedNode);
    this.__variant = serializedNode.variant || "tip";
    this.__emoji = serializedNode.emoji;
    const nestedEditor = this.__caption;
    if (serializedNode.caption?.editorState) {
      const editorState = nestedEditor.parseEditorState(serializedNode.caption.editorState);
      if (!editorState.isEmpty()) {
        nestedEditor.setEditorState(editorState);
      }
    }
    return this;
  }

  exportJSON(): SerializedHint {
    return {
      ...super.exportJSON(),
      variant: this.__variant,
      emoji: this.__emoji,
      type: "hint",
      caption: this.__caption.toJSON(),
    };
  }

  updateDOM(): false {
    return false;
  }

  decorate(): React.ReactElement {
    return (
      <Suspense fallback={null}>
        <HintComponent
          type={this.__variant}
          emoji={this.__emoji}
          captionEditor={this.__caption}
          nodeKey={this.getKey()}
        />
      </Suspense>
    );
  }
}

export function $isHintNode(
  node: LexicalNode | null | undefined
): node is Hint {
  return node instanceof Hint;
}

export function $createHintNode(
  type: HintType = "tip",
  emoji?: string,
): Hint {
  return new Hint(type, emoji);
}

export const INSERT_HINT_COMMAND: LexicalCommand<
  HintType | { type?: HintType; emoji?: string }
> = createCommand();

export function $insertHintNode(type: HintType = "tip", emoji?: string) {
  const selection = $getSelection();
  if ($isRangeSelection(selection)) {
    const hintNode = $createHintNode(type, emoji);
    selection.insertNodes([hintNode]);
  }
}

export default function HintPlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (!editor.hasNodes([Hint])) {
      throw new Error("Hint: Hint not registered on editor");
    }
  }, [editor]);

  useEffect(() => {
    return editor.registerCommand(
      INSERT_HINT_COMMAND,
      (payload: HintType | { type?: HintType; emoji?: string }, targetEditor: LexicalEditor) => {
        targetEditor.update(() => {
          if (typeof payload === "string") {
            $insertHintNode(payload);
          } else {
            $insertHintNode(payload?.type || "tip", payload?.emoji);
          }
        });
        return true;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor]);

  return null;
}
