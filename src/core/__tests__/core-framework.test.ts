import { describe, it, expect, vi } from "vitest";
import { createNotiqEditor } from "../editor";
import { Extension } from "../extension";
import {
  StarterKit,
  Bold,
  Italic,
  Heading,
  Paragraph,
  CodeBlock,
  BulletList,
} from "../extensions/nodes-and-marks";
import { BlocksKit, Excalidraw, Figma, Equation } from "../extensions/blocks-kit";

describe("Notiq Framework Core", () => {
  it("initializes an editor with StarterKit and default options", () => {
    const editor = createNotiqEditor({
      extensions: [StarterKit],
    });

    expect(editor).toBeDefined();
    expect(editor.lexical).toBeDefined();
    expect(editor.isEditable).toBe(true);
    expect(editor.commands).toBeDefined();
    expect(typeof editor.chain).toBe("function");
    expect(typeof editor.can).toBe("function");
    expect(typeof editor.isActive).toBe("function");
  });

  it("supports extension configuration via .configure()", () => {
    const CustomHeading = Heading.configure({
      levels: [1, 2],
    });

    expect(CustomHeading.name).toBe("heading");
    expect(CustomHeading.options.levels).toEqual([1, 2]);
  });

  it("supports extension subExtensions and extension aggregation", () => {
    const CustomKit = Extension.create({
      name: "customKit",
      addExtensions: () => [Bold, Italic],
    });

    const editor = createNotiqEditor({
      extensions: [CustomKit],
    });

    expect(editor.commands.toggleBold).toBeDefined();
    expect(editor.commands.toggleItalic).toBeDefined();
  });

  it("executes fluent chained commands atomically", () => {
    const editor = createNotiqEditor({
      extensions: [StarterKit],
    });

    const result = editor
      .chain()
      .focus()
      .setHeading({ level: 1 })
      .toggleBold()
      .run();

    expect(result).toBe(true);
    expect(editor.isActive("heading", { level: 1 })).toBe(true);
  });

  it("sets and gets markdown and plaintext content", () => {
    const editor = createNotiqEditor({
      extensions: [StarterKit],
    });

    editor.setContent("# Hello Notiq Framework\n\nThis is a **high-speed** editor.");

    const text = editor.getText();
    expect(text).toContain("Hello Notiq");

    const md = editor.getMarkdown();
    expect(md).toContain("Hello Notiq");

    const json = editor.getJSON();
    expect(json.root).toBeDefined();
    expect(json.root.children.length).toBeGreaterThan(0);
  });

  it("clears content properly", () => {
    const editor = createNotiqEditor({
      extensions: [StarterKit],
      content: "# To be cleared",
    });

    expect(editor.getText()).toContain("To be cleared");

    editor.clearContent();
    expect(editor.getText().trim()).toBe("");
  });

  it("triggers update event listeners", () => {
    const onUpdateMock = vi.fn();
    const editor = createNotiqEditor({
      extensions: [StarterKit],
      onUpdate: onUpdateMock,
    });

    const customListener = vi.fn();
    editor.on("update", customListener);

    editor.setContent("Some updated content");

    expect(customListener).toHaveBeenCalled();
  });

  it("registers rich block commands with BlocksKit", () => {
    const editor = createNotiqEditor({
      extensions: [StarterKit, BlocksKit],
    });

    expect(editor.commands.insertExcalidraw).toBeDefined();
    expect(editor.commands.insertFigma).toBeDefined();
    expect(editor.commands.insertEquation).toBeDefined();
    expect(editor.commands.insertStepper).toBeDefined();
    expect(editor.commands.insertPoll).toBeDefined();
    expect(editor.commands.insertHint).toBeDefined();
    expect(editor.commands.insertYouTube).toBeDefined();
    expect(editor.commands.insertTweet).toBeDefined();

    // Verify chain contains rich block commands
    const chain = editor.chain();
    expect(typeof chain.insertExcalidraw).toBe("function");
    expect(typeof chain.insertFigma).toBe("function");
    expect(typeof chain.insertEquation).toBe("function");
  });
});
