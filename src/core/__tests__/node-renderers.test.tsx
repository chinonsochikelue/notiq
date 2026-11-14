import React from "react";
import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { $getRoot } from "lexical";
import { BlocksKit } from "../extensions/blocks-kit";
import {
  NotiqNodeRendererProvider,
  setEditorNodeRenderers,
  clearEditorNodeRenderers,
  type HintRendererProps,
  type PollRendererProps,
} from "../react/node-renderers";
import { Hint, $createHintNode } from "../../components/editor/nodes/Hint";
import { PollNode, $createPollNode, createPollOption } from "../../components/editor/nodes/PollNode";

afterEach(() => {
  cleanup();
});

describe("Custom Node Renderers (Headless Rich Decorator Nodes)", () => {
  it("registers NotiqNodeRenderers plugin when BlocksKit is configured with renderers", () => {
    const CustomHint = ({ type }: HintRendererProps) => (
      <div data-testid="custom-hint">{type}</div>
    );
    const configured = BlocksKit.configure({
      renderers: { hint: CustomHint },
    });
    const context = { editor: {} as never, options: configured.options };
    const plugins = configured.getPlugins(context);
    const names = plugins.map((p) => (p as { displayName?: string }).displayName);

    expect(names).toContain("NotiqNodeRenderers");
  });

  it("renders custom Hint renderer via NotiqNodeRendererProvider instead of default UI", () => {
    const CustomHint = ({ type, emoji }: HintRendererProps) => (
      <div data-testid="custom-hint">{`${type}:${emoji}`}</div>
    );

    const { getByTestId } = render(
      <NotiqNodeRendererProvider renderers={{ hint: CustomHint }}>
        <LexicalComposer
          initialConfig={{
            namespace: "test-custom-hint",
            nodes: [Hint],
            onError: (err) => {
              throw err;
            },
            editorState: (editor) => {
              editor.update(() => {
                const root = $getRoot();
                root.append($createHintNode("tip", "🔥"));
              });
            },
          }}
        >
          <RichTextPlugin
            contentEditable={<ContentEditable />}
            placeholder={null}
            ErrorBoundary={LexicalErrorBoundary}
          />
        </LexicalComposer>
      </NotiqNodeRendererProvider>
    );

    expect(getByTestId("custom-hint").textContent).toBe("tip:🔥");
  });

  it("renders custom Poll renderer via editor-scoped setEditorNodeRenderers", () => {
    const CustomPoll = ({ question, options }: PollRendererProps) => (
      <div data-testid="custom-poll">{`${question} (${options.length})`}</div>
    );

    let capturedEditor: Parameters<typeof setEditorNodeRenderers>[0] | null = null;

    const { getByTestId } = render(
      <LexicalComposer
        initialConfig={{
          namespace: "test-custom-poll",
          nodes: [PollNode],
          onError: (err) => {
            throw err;
          },
          editorState: (editor) => {
            capturedEditor = editor;
            setEditorNodeRenderers(editor, { poll: CustomPoll });
            editor.update(() => {
              const root = $getRoot();
              root.append(
                $createPollNode("Headless?", [
                  createPollOption("Yes"),
                  createPollOption("Definitely"),
                ])
              );
            });
          },
        }}
      >
        <RichTextPlugin
          contentEditable={<ContentEditable />}
          placeholder={null}
          ErrorBoundary={LexicalErrorBoundary}
        />
      </LexicalComposer>
    );

    expect(getByTestId("custom-poll").textContent).toBe("Headless? (2)");
    if (capturedEditor) {
      clearEditorNodeRenderers(capturedEditor);
    }
  });
});
