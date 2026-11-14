import { describe, it, expect } from "vitest";
import { createNotiqEditor } from "../editor";
import { StarterKit } from "../extensions/nodes-and-marks";
import { AICommandBar, AICopilot } from "../extensions/copilot-and-collab";
import {
  OPEN_AI_COMMAND_BAR_COMMAND,
  extractThinkingAndSources,
} from "../../components/editor/plugins/AICommandBarPlugin";
import { compileExcalidrawDiagram } from "../../components/editor/utils/excalidrawDiagramBuilder";
import { INLINE_IMAGE_TRANSFORMER } from "../../components/editor/utils/markdownTransformers";

describe("AI Command Bar Extension", () => {
  it("registers openAICommandBar command with AICommandBar extension", () => {
    const editor = createNotiqEditor({
      extensions: [StarterKit, AICommandBar],
    });

    expect(editor.commands.openAICommandBar).toBeDefined();
    expect(typeof editor.commands.openAICommandBar).toBe("function");
    expect(typeof editor.chain().openAICommandBar).toBe("function");
  });

  it("registers AICommandBar when AICopilot is included", () => {
    const editor = createNotiqEditor({
      extensions: [StarterKit, AICopilot],
    });

    expect(editor.commands.openAICommandBar).toBeDefined();
    expect(typeof editor.commands.openAICommandBar).toBe("function");
  });

  it("dispatches openAICommandBar command through the command chain", () => {
    const editor = createNotiqEditor({
      extensions: [StarterKit, AICommandBar],
      content: "Text to transform with AI",
    });

    const result = editor.chain().focus().openAICommandBar({ action: "ImproveWriting" }).run();
    expect(result).toBe(true);
  });

  it("extracts thinking trace and research sources without polluting editor content", () => {
    const raw =
      `<thinking>\n- Step 1\n- Step 2\n</thinking>\n\n# Answer\n\nBody text.\n<!--SOURCES:[{"title":"Wiki","url":"https://en.wikipedia.org/wiki/Test"}]-->`;
    const parsed = extractThinkingAndSources(raw);
    expect(parsed.thinking).toBe("- Step 1\n- Step 2");
    expect(parsed.sources).toEqual([
      { title: "Wiki", url: "https://en.wikipedia.org/wiki/Test" },
    ]);
    expect(parsed.content).toBe("# Answer\n\nBody text.");

    const partial = extractThinkingAndSources("<thinking>\n- Planning...");
    expect(partial.thinking).toBe("- Planning...");
    expect(partial.content).toBe("");
  });

  it("compiles declarative nodes and edges into Excalidraw elements", () => {
    const compiled = compileExcalidrawDiagram(
      JSON.stringify({
        nodes: [
          { id: "a", label: "Client" },
          { id: "b", label: "Server" },
        ],
        edges: [{ from: "a", to: "b", label: "HTTPS" }],
      })
    );
    expect(compiled).not.toBeNull();
    const data = JSON.parse(compiled!);
    expect(Array.isArray(data.elements)).toBe(true);
    expect(data.elements.some((el: any) => el.type === "rectangle")).toBe(true);
    expect(data.elements.some((el: any) => el.type === "text" && el.text === "Client")).toBe(true);
    expect(data.elements.some((el: any) => el.type === "arrow")).toBe(true);
  });

  it("normalizes simplified element arrays with labels into full Excalidraw elements", () => {
    const compiled = compileExcalidrawDiagram(
      JSON.stringify([
        {
          id: "editor-core",
          label: "Tiptap Editor Instance",
          type: "rectangle",
          x: 400,
          y: 100,
          width: 200,
          height: 80,
          strokeColor: "#1e1e1e",
          backgroundColor: "#a5d8ff",
          fillStyle: "solid",
        },
        {
          id: "flow-1",
          type: "arrow",
          x: 500,
          y: 180,
          width: 0,
          height: 80,
          label: "updates",
        },
      ])
    );
    expect(compiled).not.toBeNull();
    const data = JSON.parse(compiled!);
    expect(Array.isArray(data.elements)).toBe(true);
    const rect = data.elements.find((el: any) => el.id === "editor-core");
    expect(rect).toBeDefined();
    expect(rect.seed).toBeTypeOf("number");
    expect(rect.version).toBe(1);
    expect(rect.label).toBeUndefined();
    expect(Array.isArray(rect.boundElements)).toBe(true);

    const boundText = data.elements.find(
      (el: any) => el.type === "text" && el.containerId === "editor-core"
    );
    expect(boundText?.text).toBe("Tiptap Editor Instance");

    const arrow = data.elements.find((el: any) => el.id === "flow-1");
    expect(Array.isArray(arrow.points)).toBe(true);
    expect(arrow.points.length).toBeGreaterThanOrEqual(2);
  });

  it("matches inline image markdown syntax with position", () => {
    const match = "See ![inline:right:Logo](https://example.com/logo.png)".match(
      INLINE_IMAGE_TRANSFORMER.regExp
    );
    expect(match?.[1]).toBe("right");
    expect(match?.[2]).toBe("Logo");
    expect(match?.[3]).toBe("https://example.com/logo.png");
  });
});
