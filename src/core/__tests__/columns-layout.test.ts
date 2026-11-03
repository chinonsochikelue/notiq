import { describe, it, expect } from "vitest";
import { createNotiqEditor } from "../editor";
import { StarterKit } from "../extensions/nodes-and-marks";
import { BlocksKit, ColumnsLayout } from "../extensions/blocks-kit";

describe("ColumnsLayout Extension", () => {
  it("registers setColumns command with BlocksKit", () => {
    const editor = createNotiqEditor({
      extensions: [StarterKit, BlocksKit],
    });

    expect(editor.commands.setColumns).toBeDefined();
    expect(typeof editor.commands.setColumns).toBe("function");
    expect(typeof editor.chain().setColumns).toBe("function");
  });

  it("registers ColumnsLayout standalone extension", () => {
    const editor = createNotiqEditor({
      extensions: [StarterKit, ColumnsLayout],
    });

    expect(editor.commands.setColumns).toBeDefined();
    expect(typeof editor.commands.setColumns).toBe("function");
  });
});
