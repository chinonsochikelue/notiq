import { describe, it, expect } from "vitest";
import { createNotiqEditor } from "../editor";
import { StarterKit } from "../extensions/nodes-and-marks";
import { AICommandBar, AICopilot } from "../extensions/copilot-and-collab";
import { OPEN_AI_COMMAND_BAR_COMMAND } from "../../components/editor/plugins/AICommandBarPlugin";

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
});
