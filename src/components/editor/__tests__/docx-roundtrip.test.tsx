import React from "react";
import { describe, it, expect } from "vitest";
import { render, act } from "@testing-library/react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { HeadingNode, $createHeadingNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { LinkNode } from "@lexical/link";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  type LexicalEditor,
} from "lexical";
import { exportEditorToDocxBuffer } from "../../../utils/docxExport";
import {
  convertDocxBufferToHtml,
  importDocxBufferToEditor,
} from "../../../utils/docxImport";

function EditorRef({ onReady }: { onReady: (editor: LexicalEditor) => void }) {
  const [editor] = useLexicalComposerContext();
  React.useEffect(() => {
    onReady(editor);
  }, [editor, onReady]);
  return null;
}

describe("DOCX Export & Import round-trip", () => {
  it("exports Lexical editor state to a valid .docx buffer and re-imports it", async () => {
    let sourceEditor: LexicalEditor | null = null;
    let targetEditor: LexicalEditor | null = null;

    render(
      <>
        <LexicalComposer
          initialConfig={{
            namespace: "docx-export-test",
            nodes: [HeadingNode, ListNode, ListItemNode, LinkNode],
            onError: (e) => {
              throw e;
            },
          }}
        >
          <EditorRef onReady={(ed) => (sourceEditor = ed)} />
          <RichTextPlugin
            contentEditable={<ContentEditable />}
            placeholder={null}
            ErrorBoundary={LexicalErrorBoundary}
          />
        </LexicalComposer>
        <LexicalComposer
          initialConfig={{
            namespace: "docx-import-test",
            nodes: [HeadingNode, ListNode, ListItemNode, LinkNode],
            onError: (e) => {
              throw e;
            },
          }}
        >
          <EditorRef onReady={(ed) => (targetEditor = ed)} />
          <RichTextPlugin
            contentEditable={<ContentEditable />}
            placeholder={null}
            ErrorBoundary={LexicalErrorBoundary}
          />
        </LexicalComposer>
      </>
    );

    act(() => {
      sourceEditor!.update(() => {
        const root = $getRoot();
        root.clear();
        const h1 = $createHeadingNode("h1");
        h1.append($createTextNode("Notiq Architecture"));
        const p = $createParagraphNode();
        const bold = $createTextNode("Real-time");
        bold.toggleFormat("bold");
        p.append(bold, $createTextNode(" CRDT collaboration"));
        root.append(h1, p);
      }, { discrete: true });
    });

    const bytes = await exportEditorToDocxBuffer(sourceEditor!);
    expect(bytes.byteLength).toBeGreaterThan(1000);
    // OOXML .docx is a ZIP archive starting with 'PK' (0x50, 0x4b)
    expect(bytes[0]).toBe(0x50);
    expect(bytes[1]).toBe(0x4b);

    const arrayBuffer = bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength
    ) as ArrayBuffer;

    const { html } = await convertDocxBufferToHtml(arrayBuffer);
    expect(html).toContain("Notiq Architecture");
    expect(html).toContain("Real-time");

    await act(async () => {
      await importDocxBufferToEditor(targetEditor!, arrayBuffer, "replace");
    });

    const importedText = targetEditor!
      .getEditorState()
      .read(() => $getRoot().getTextContent());
    expect(importedText).toContain("Notiq Architecture");
    expect(importedText).toContain("Real-time CRDT collaboration");
  });
});
