import React from "react";
import { describe, it, expect } from "vitest";
import { render, act, screen } from "@testing-library/react";
import Editor from "../index";
import { StepperNode, $createStepperNode } from "../nodes/Stepper";
import { createEditor } from "lexical";
import nodes from "../nodes";
import { WebsocketProvider } from "y-websocket";
import { Doc } from "yjs";
import { NOTIQ_TRANSFORMERS } from "../utils/markdownTransformers";
import { $convertFromMarkdownString, $convertToMarkdownString } from "@lexical/markdown";

describe("Lexical Nodes & Collaboration Tests", () => {
  it("clones and serializes StepperNode safely", () => {
    const editor = createEditor({ nodes: [...nodes] });
    editor.update(() => {
      const stepper = $createStepperNode([
        { id: 1, title: "Step 1", content: createEditor() },
        { id: 2, title: "Step 2", content: createEditor() },
      ]);
      const cloned = StepperNode.clone(stepper);
      expect(cloned.__steps.length).toBe(2);
      const json = stepper.exportJSON();
      expect(json.steps.length).toBe(2);
      const imported = StepperNode.importJSON(json);
      expect(imported.__steps.length).toBe(2);
    });
  });

  it("converts markdown with NOTIQ_TRANSFORMERS without infinite recursion", () => {
    const editor = createEditor({ nodes: [...nodes] });
    const md = `# Title\n\n--- \n\n![Image](https://example.com/pic.png)\n\nhttps://www.youtube.com/watch?v=dQw4w9WgXcQ\n\n> Quote\n`;
    editor.update(() => {
      $convertFromMarkdownString(md, NOTIQ_TRANSFORMERS);
      const exported = $convertToMarkdownString(NOTIQ_TRANSFORMERS);
      expect(exported).toContain("# Title");
    });
  });

  it("handles awareness simulation without recursion", async () => {
    const doc = new Doc();
    const ws = new WebsocketProvider("ws://localhost:4444", "test-awareness-room", doc, {
      connect: false,
    });
    let callCount = 0;
    ws.awareness.on("change", () => {
      callCount++;
    });
    ws.awareness.setLocalStateField("name", "Test User");
    ws.awareness.setLocalStateField("color", "#ff0000");
    expect(callCount).toBeGreaterThan(0);
    expect(callCount).toBeLessThan(10);
    ws.destroy();
  });

  it("renders a document containing a table in read-only mode without TableObserver error", () => {
    const tableContent = {
      root: {
        type: "root",
        direction: "ltr",
        format: "",
        indent: 0,
        version: 1,
        children: [
          {
            type: "heading",
            tag: "h1",
            direction: "ltr",
            format: "",
            indent: 0,
            version: 1,
            children: [{ detail: 0, format: 0, mode: "normal", style: "", text: "Title", type: "text", version: 1 }],
          },
          {
            type: "table",
            direction: "ltr",
            format: "",
            indent: 0,
            version: 1,
            children: [
              {
                type: "tablerow",
                direction: "ltr",
                format: "",
                indent: 0,
                version: 1,
                children: [
                  {
                    type: "tablecell",
                    headerState: 1,
                    colSpan: 1,
                    rowSpan: 1,
                    backgroundColor: null,
                    direction: "ltr",
                    format: "",
                    indent: 0,
                    version: 1,
                    children: [
                      {
                        type: "paragraph",
                        direction: "ltr",
                        format: "",
                        indent: 0,
                        version: 1,
                        textFormat: 0,
                        textStyle: "",
                        children: [{ detail: 0, format: 0, mode: "normal", style: "", text: "Header", type: "text", version: 1 }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    };
    const errors: unknown[] = [];
    const origError = console.error;
    console.error = (...args: unknown[]) => {
      errors.push(args);
    };
    try {
      render(<Editor isEditable={false} content={tableContent} />);
    } finally {
      console.error = origError;
    }
    expect(errors.length).toBe(0);
  });

  it("renders link-with-metadata and table together in StrictMode without TableObserver error", async () => {
    const React = await import("react");
    const content = {
      root: {
        type: "root",
        direction: "ltr",
        format: "",
        indent: 0,
        version: 1,
        children: [
          {
            type: "link-with-metadata",
            url: "https://example.com",
            metadata: {
              title: "Example",
              description: "Example description",
              image: "",
              favicon: "",
            },
            direction: "ltr",
            format: "",
            indent: 0,
            version: 1,
            children: [],
          },
          {
            type: "table",
            direction: null,
            format: "",
            indent: 0,
            version: 1,
            children: [
              {
                type: "tablerow",
                direction: null,
                format: "",
                indent: 0,
                version: 1,
                children: [
                  {
                    type: "tablecell",
                    backgroundColor: null,
                    colSpan: 1,
                    headerState: 1,
                    rowSpan: 1,
                    direction: "ltr",
                    format: "",
                    indent: 0,
                    version: 1,
                    children: [
                      {
                        type: "paragraph",
                        direction: "ltr",
                        format: "",
                        indent: 0,
                        version: 1,
                        children: [{ detail: 0, format: 0, mode: "normal", style: "", text: "Col", type: "text", version: 1 }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    };
    const errors: unknown[] = [];
    const origError = console.error;
    console.error = (...args: unknown[]) => {
      errors.push(args);
    };
    try {
      render(
        <React.StrictMode>
          <Editor isEditable={false} content={content} showCollaboratorsBar={false} />
        </React.StrictMode>
      );
    } finally {
      console.error = origError;
    }
    expect(errors.length).toBe(0);
  });

  it("renders PollNode and PollOptionComponent without requiring an external QueryClientProvider", async () => {
    const content = {
      root: {
        type: "root",
        direction: "ltr",
        format: "",
        indent: 0,
        version: 1,
        children: [
          {
            type: "poll",
            question: "Best editor engine?",
            options: [
              { uid: "opt-1", text: "Option A", votes: [] },
              { uid: "opt-2", text: "Option B", votes: [] },
            ],
            version: 1,
          },
        ],
      },
    };
    render(<Editor isEditable={false} content={content} showCollaboratorsBar={false} />);
    expect(await screen.findByText("Best editor engine?")).toBeTruthy();
    expect(await screen.findByDisplayValue("Option A")).toBeTruthy();
  });
});
