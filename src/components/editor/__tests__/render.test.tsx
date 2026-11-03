import React from "react";
import { describe, it, expect } from "vitest";
import { render, act } from "@testing-library/react";
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
});
