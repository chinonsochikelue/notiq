import { describe, it, expect } from "vitest";
import { createEditor, $getRoot, $isElementNode, $isTextNode } from "lexical";
import nodes from "../nodes";
import {
  AI_CARET_TEXT,
  AI_GENERATED_STYLE,
  hydrateSerializedAINodes,
  sanitizeStreamingMarkdown,
  serializeMarkdownToNodes,
  stripAIStyleFromSubtree,
} from "../utils/aiStream";

describe("AI In-Canvas Streaming Utilities", () => {
  it("sanitizes incomplete trailing tags, math blocks, and code fences", () => {
    expect(sanitizeStreamingMarkdown("Hello <callout")).toBe("Hello ");
    expect(sanitizeStreamingMarkdown("Math:\n$$\nx^2")).toBe("Math:\n");
    expect(sanitizeStreamingMarkdown("```ts\nconst x = 1;")).toBe(
      "```ts\nconst x = 1;\n```"
    );
    expect(sanitizeStreamingMarkdown("```excalidraw\n[{\"id\":\"a\"")).toBe(
      "> 🎨 *Drawing interactive Excalidraw diagram...*"
    );
  });

  it("hydrates markdown into AI-styled Lexical nodes with streaming caret and strips cleanly on accept", () => {
    const markdown = "# Heading\n\n- **Bold** item";
    const serialized = serializeMarkdownToNodes(markdown, nodes);
    expect(serialized.length).toBeGreaterThanOrEqual(2);

    const editor = createEditor({
      nodes: [...nodes],
      onError: (err) => {
        throw err;
      },
    });
    editor.update(
      () => {
        const root = $getRoot();
        root.clear();
        const hydrated = hydrateSerializedAINodes(serialized, { showCaret: true });
        for (const n of hydrated) {
          root.append(n);
        }

        const textContent = root.getTextContent();
        expect(textContent).toContain("Heading");
        expect(textContent).toContain("Bold item");
        expect(textContent).toContain(AI_CARET_TEXT);

        // Verify AI purple style is applied
        const firstChild = root.getFirstChild();
        expect($isElementNode(firstChild)).toBe(true);
        if ($isElementNode(firstChild)) {
          const textNode = firstChild.getFirstChild();
          expect($isTextNode(textNode)).toBe(true);
          if ($isTextNode(textNode)) {
            expect(textNode.getStyle()).toContain(AI_GENERATED_STYLE);
          }
        }

        // Now strip AI styles (Accept)
        for (const child of root.getChildren()) {
          stripAIStyleFromSubtree(child);
        }

        expect(root.getTextContent()).not.toContain(AI_CARET_TEXT);
        const acceptedFirst = root.getFirstChild();
        if ($isElementNode(acceptedFirst)) {
          const textNode = acceptedFirst.getFirstChild();
          if ($isTextNode(textNode)) {
            expect(textNode.getStyle()).not.toContain(AI_GENERATED_STYLE);
          }
        }
      },
      { discrete: true }
    );
  });

  it("parses tables, checklists, and inline equations without duplicating across incremental updates", () => {
    const chunks = [
      "# Title\n\n- [x] Done",
      "# Title\n\n- **Formatted text** with *italics*, `inline code`, and inline math $E = mc^2$\n- [x] Done\n- [ ] Todo\n\n| A | B |\n| --- | --- |\n| 1 | 2 |",
    ];
    const editor = createEditor({
      nodes: [...nodes],
      onError: (err) => {
        throw err;
      },
    });

    let keys: string[] = [];
    for (const md of chunks) {
      const serialized = serializeMarkdownToNodes(md, nodes);
      editor.update(
        () => {
          const root = $getRoot();
          const newNodes = hydrateSerializedAINodes(serialized, { showCaret: false });
          for (const k of keys) {
            const existing = root.getChildren().find((c) => c.getKey() === k);
            if (existing) existing.remove();
          }
          root.splice(0, 0, newNodes);
          keys = newNodes.map((n) => n.getKey());
        },
        { discrete: true }
      );
    }

    editor.getEditorState().read(() => {
      const text = $getRoot().getTextContent();
      const json = JSON.stringify(editor.getEditorState().toJSON());
      expect(json).toContain('"type":"equation"');
      expect(text.match(/Title/g)?.length).toBe(1);
      expect(text.match(/Done/g)?.length).toBe(1);
      expect(text).toContain("1");
      expect(text).toContain("2");
    });
  });

  it("hydrates a complete excalidraw block alongside preceding heading and paragraph", () => {
    const md = [
      "## Tiptap Editor Architecture",
      "",
      "The following diagram illustrates the core architecture.",
      "",
      "```excalidraw",
      '{"nodes":[{"id":"editor","label":"Editor Instance"},{"id":"pm","label":"ProseMirror State"}],"edges":[{"from":"editor","to":"pm","label":"updates"}]}',
      "```",
    ].join("\n");

    const serialized = serializeMarkdownToNodes(md, nodes);
    const types = serialized.map((n: any) => n.type);
    expect(types).toContain("heading");
    expect(types).toContain("paragraph");

    const editor = createEditor({
      nodes: [...nodes],
      onError: (err) => {
        throw err;
      },
    });

    editor.update(
      () => {
        const root = $getRoot();
        root.clear();
        const hydrated = hydrateSerializedAINodes(serialized, { showCaret: false });
        root.append(...hydrated);
        const childTypes = root.getChildren().map((c) => c.getType());
        expect(childTypes).toContain("heading");
        expect(childTypes).toContain("paragraph");
      },
      { discrete: true }
    );

    const json = JSON.stringify(editor.getEditorState().toJSON());
    expect(json).toContain('"type":"excalidraw"');
  });

  it("hydrates multi-line GFM callouts with content and parses inline bold inside table cells", () => {
    const md = [
      "> [!TIP]",
      "> **The Core Philosophy:** First principles thinking.",
      "",
      "| Company | Industry |",
      "| --- | --- |",
      "| **SpaceX** | Aerospace |",
    ].join("\n");

    const serialized = serializeMarkdownToNodes(md, nodes);
    const jsonStr = JSON.stringify(serialized);
    expect(jsonStr).toContain('"type":"hint"');
    expect(jsonStr).toContain("The Core Philosophy:");
    expect(jsonStr).not.toContain('"type":"quote"');
    expect(jsonStr).not.toContain("**SpaceX**");
    expect(jsonStr).toContain('"text":"SpaceX"');
  });
});
