import { describe, it, expect } from "vitest";
import {
  detectContentFormat,
  importContentToEditor,
  importJSONToEditor,
  importPlainTextToEditor,
} from "../utils/importUtils";
import { createEditor, ParagraphNode, TextNode, $getRoot, LineBreakNode } from "lexical";
import { HeadingNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";

describe("detectContentFormat", () => {
  it("detects format by file extension", () => {
    expect(detectContentFormat("Some text", "notes.md")).toBe("markdown");
    expect(detectContentFormat("Some text", "readme.markdown")).toBe("markdown");
    expect(detectContentFormat("Some text", "backup.json")).toBe("json");
    expect(detectContentFormat("Some text", "state.lexical")).toBe("json");
    expect(detectContentFormat("Some text", "article.html")).toBe("html");
    expect(detectContentFormat("Some text", "article.htm")).toBe("html");
    expect(detectContentFormat("Some text", "simple.txt")).toBe("text");
  });

  it("detects JSON format from raw content", () => {
    const jsonState = JSON.stringify({
      root: {
        children: [],
        type: "root",
      },
    });
    expect(detectContentFormat(jsonState)).toBe("json");
  });

  it("detects HTML format from raw tags", () => {
    expect(detectContentFormat("<!DOCTYPE html><html><body><p>Hello</p></body></html>")).toBe("html");
    expect(detectContentFormat("<div class='article'><p>A paragraph</p></div>")).toBe("html");
  });

  it("detects Markdown format from headers and syntax", () => {
    expect(detectContentFormat("# Introduction\n\nThis is a test.")).toBe("markdown");
    expect(detectContentFormat("> [!NOTE]\n> A callout note")).toBe("markdown");
    expect(detectContentFormat("- Item 1\n- Item 2")).toBe("markdown");
    expect(detectContentFormat("| Col 1 | Col 2 |\n| --- | --- |")).toBe("markdown");
    expect(detectContentFormat("Check out [Google](https://google.com)")).toBe("markdown");
  });

  it("falls back to plain text for unformatted text", () => {
    expect(detectContentFormat("Just an ordinary sentence without special markers.")).toBe("text");
  });
});

describe("importPlainTextToEditor", () => {
  it("splits double line breaks into paragraphs and single breaks into linebreaks", () => {
    const editor = createEditor({
      nodes: [ParagraphNode, TextNode, LineBreakNode],
    });

    const sampleText = "Paragraph 1 line 1\nParagraph 1 line 2\n\nParagraph 2 single line";

    importPlainTextToEditor(editor, sampleText, "replace");

    editor.getEditorState().read(() => {
      const root = $getRoot();
      const children = root.getChildren();
      expect(children.length).toBe(2);
      expect(children[0].getTextContent()).toBe("Paragraph 1 line 1\nParagraph 1 line 2");
      expect(children[1].getTextContent()).toBe("Paragraph 2 single line");
    });
  });
});

describe("importJSONToEditor", () => {
  it("correctly sets editor state from JSON structure", () => {
    const editor = createEditor({
      nodes: [ParagraphNode, TextNode, HeadingNode],
    });

    // Create a minimal serialized state with discrete update
    editor.update(
      () => {
        const root = $getRoot();
        const p = new ParagraphNode();
        p.append(new TextNode("Saved in snapshot"));
        root.append(p);
      },
      { discrete: true }
    );

    const serialized = JSON.stringify(editor.getEditorState().toJSON());

    // Create a new fresh editor
    const newEditor = createEditor({
      nodes: [ParagraphNode, TextNode, HeadingNode],
    });

    const success = importJSONToEditor(newEditor, serialized);
    expect(success).toBe(true);

    newEditor.getEditorState().read(() => {
      expect($getRoot().getTextContent()).toBe("Saved in snapshot");
    });
  });

  it("throws error on invalid JSON", () => {
    const editor = createEditor({
      nodes: [ParagraphNode, TextNode],
    });

    expect(() => importJSONToEditor(editor, "{ invalid_json: ")).toThrow();
  });
});
