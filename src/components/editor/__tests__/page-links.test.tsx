import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { HeadingNode, $createHeadingNode } from "@lexical/rich-text";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  type LexicalEditor,
} from "lexical";
import {
  PageLinkNode,
  $createPageLinkNode,
  $isPageLinkNode,
} from "../nodes/PageLinkNode";
import PageLinksPlugin, {
  extractPageLinksFromEditorState,
} from "../plugins/PageLinksPlugin";

function EditorRef({ onReady }: { onReady: (editor: LexicalEditor) => void }) {
  const [editor] = useLexicalComposerContext();
  React.useEffect(() => {
    onReady(editor);
  }, [editor, onReady]);
  return null;
}

describe("PageLinkNode & PageLinksPlugin", () => {
  it("serializes and deserializes PageLinkNode via exportJSON/importJSON", () => {
    let editorRef: LexicalEditor | null = null;
    render(
      <LexicalComposer
        initialConfig={{
          namespace: "page-link-json-test",
          nodes: [PageLinkNode],
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
      </LexicalComposer>
    );

    let exported: ReturnType<PageLinkNode["exportJSON"]> | null = null;
    act(() => {
      editorRef!.update(() => {
        const p = $createParagraphNode();
        const link = $createPageLinkNode({
          target: "/collaboration",
          label: "Live Collaboration Room",
          kind: "page",
        });
        p.append(link);
        $getRoot().append(p);
        exported = link.exportJSON();
      });
    });

    expect(exported!.type).toBe("page-link");
    expect(exported!.target).toBe("/collaboration");
    expect(exported!.label).toBe("Live Collaboration Room");
    expect(exported!.kind).toBe("page");

    act(() => {
      editorRef!.update(() => {
        const rehydrated = PageLinkNode.importJSON(exported!);
        expect($isPageLinkNode(rehydrated)).toBe(true);
        expect(rehydrated.getTextContent()).toBe("[[Live Collaboration Room]]");
      });
    });
  });

  it("extracts unique page links and renders collapsible PageBacklinksFooter", async () => {
    let editorRef: LexicalEditor | null = null;
    render(
      <LexicalComposer
        initialConfig={{
          namespace: "page-links-footer-test",
          nodes: [PageLinkNode, HeadingNode],
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
        <PageLinksPlugin />
      </LexicalComposer>
    );

    await act(async () => {
      editorRef!.update(() => {
        const heading = $createHeadingNode("h2");
        heading.append($createTextNode("Architecture"));
        const p = $createParagraphNode();
        p.append(
          $createPageLinkNode({
            target: "/collaboration",
            label: "Live Collaboration Room",
            kind: "page",
          }),
          $createPageLinkNode({
            target: "/collaboration",
            label: "Live Collaboration Room",
            kind: "page",
          }),
          $createPageLinkNode({
            target: "#h1",
            label: "Architecture",
            kind: "heading",
          })
        );
        $getRoot().append(heading, p);
      });
    });

    const extracted = extractPageLinksFromEditorState(editorRef!.getEditorState());
    expect(extracted).toHaveLength(2);

    const toggleBtn = await screen.findByRole("button", {
      name: /Page Links & Backlinks \(2\)/i,
    });
    expect(toggleBtn).toBeTruthy();

    fireEvent.click(toggleBtn);
    expect(screen.getAllByText("Live Collaboration Room").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("Architecture").length).toBeGreaterThanOrEqual(2);
  });
});
