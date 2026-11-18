import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { HeadingNode, $createHeadingNode } from "@lexical/rich-text";
import { $getRoot, $createTextNode, type LexicalEditor } from "lexical";
import TableOfContentsPlugin, {
  extractHeadingsFromEditorState,
} from "../plugins/TableOfContentsPlugin";

function EditorHarness({
  onReady,
}: {
  onReady?: (editor: LexicalEditor) => void;
}) {
  const [editor] = useLexicalComposerContext();
  React.useEffect(() => {
    onReady?.(editor);
  }, [editor, onReady]);
  return null;
}

describe("TableOfContentsPlugin & useTableOfContents", () => {
  it("extracts headings up to maxLevel and ignores empty headings", async () => {
    let editorRef: LexicalEditor | null = null;
    render(
      <LexicalComposer
        initialConfig={{
          namespace: "toc-test",
          nodes: [HeadingNode],
          onError: (err) => {
            throw err;
          },
        }}
      >
        <RichTextPlugin
          contentEditable={<ContentEditable />}
          placeholder={null}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <EditorHarness onReady={(ed) => (editorRef = ed)} />
        <TableOfContentsPlugin maxLevel={3} minHeadings={1}>
          {({ headings, scrollToHeading }) => (
            <div>
              {headings.map((h) => (
                <button
                  key={h.key}
                  type="button"
                  onClick={() => scrollToHeading(h.key)}
                >
                  {`${h.tag}:${h.text}`}
                </button>
              ))}
            </div>
          )}
        </TableOfContentsPlugin>
      </LexicalComposer>
    );

    await act(async () => {
      editorRef!.update(
        () => {
          const root = $getRoot();
          root.clear();
          const h1 = $createHeadingNode("h1");
          h1.append($createTextNode("Introduction"));
          const h2 = $createHeadingNode("h2");
          h2.append($createTextNode("Architecture"));
          const emptyH3 = $createHeadingNode("h3");
          const h4 = $createHeadingNode("h4");
          h4.append($createTextNode("Deep Detail"));
          root.append(h1, h2, emptyH3, h4);
        },
        { discrete: true }
      );
    });

    expect(screen.getByText("h1:Introduction")).toBeInTheDocument();
    expect(screen.getByText("h2:Architecture")).toBeInTheDocument();
    expect(screen.queryByText("h4:Deep Detail")).not.toBeInTheDocument();

    const extracted = extractHeadingsFromEditorState(
      editorRef!.getEditorState(),
      4
    );
    expect(extracted.map((h) => h.text)).toEqual([
      "Introduction",
      "Architecture",
      "Deep Detail",
    ]);

    const firstHeadingEl = editorRef!.getElementByKey(extracted[0].key);
    const scrollSpy = vi.fn();
    if (firstHeadingEl) {
      firstHeadingEl.scrollIntoView = scrollSpy;
    }

    fireEvent.click(screen.getByText("h1:Introduction"));
    if (firstHeadingEl) {
      expect(scrollSpy).toHaveBeenCalledWith({
        behavior: "smooth",
        block: "center",
      });
    }
  });
});
