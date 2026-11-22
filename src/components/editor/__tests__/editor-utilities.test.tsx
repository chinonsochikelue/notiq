import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  type LexicalEditor,
} from "lexical";
import UniqueIDPlugin, { getBlockId } from "../plugins/UniqueIDPlugin";
import CharacterCountPlugin, {
  computeTextStats,
} from "../plugins/CharacterCountPlugin";
import { searchEmojis } from "../plugins/EmojiPickerPlugin";

function EditorRef({ onReady }: { onReady: (editor: LexicalEditor) => void }) {
  const [editor] = useLexicalComposerContext();
  React.useEffect(() => {
    onReady(editor);
  }, [editor, onReady]);
  return null;
}

describe("UniqueIDPlugin, CharacterCountPlugin & EmojiPickerPlugin", () => {
  it("computes word, character, reading time, and limit stats accurately", () => {
    const empty = computeTextStats("   ");
    expect(empty.words).toBe(0);
    expect(empty.readingTimeMinutes).toBe(0);

    const stats = computeTextStats("Hello Notiq world", 10);
    expect(stats.words).toBe(3);
    expect(stats.characters).toBe(17);
    expect(stats.charactersNoSpaces).toBe(15);
    expect(stats.readingTimeMinutes).toBe(1);
    expect(stats.remaining).toBe(-7);
    expect(stats.isOverLimit).toBe(true);
  });

  it("searches emojis by alias, tag, and description", () => {
    const rocket = searchEmojis("rocket", 5);
    expect(rocket.length).toBeGreaterThan(0);
    expect(rocket[0].emoji).toBe("🚀");
  });

  it("assigns persistent data-notiq-block-id and renders live CharacterCountPlugin bar", async () => {
    let editorRef: LexicalEditor | null = null;
    const { container } = render(
      <LexicalComposer
        initialConfig={{
          namespace: "utilities-test",
          onError: (e) => {
            throw e;
          },
        }}
      >
        <EditorRef onReady={(ed) => (editorRef = ed)} />
        <RichTextPlugin
          contentEditable={<ContentEditable />}
          placeholder={null}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <UniqueIDPlugin />
        <CharacterCountPlugin maxCharacters={100} />
      </LexicalComposer>
    );

    let firstKey = "";
    await act(async () => {
      editorRef!.update(() => {
        const root = $getRoot();
        const p = $createParagraphNode();
        p.append($createTextNode("Notiq block editor"));
        root.append(p);
        firstKey = p.getKey();
      });
    });

    const assignedId = getBlockId(editorRef!, firstKey);
    expect(assignedId).toMatch(/^blk_/);
    expect(container.querySelector(`[data-notiq-block-id="${assignedId}"]`)).toBeTruthy();
    expect(await screen.findByText("3 words")).toBeTruthy();
    expect(screen.getByText("20 / 100 chars")).toBeTruthy();
  });
});
