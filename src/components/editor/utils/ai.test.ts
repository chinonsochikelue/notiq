import { describe, it, expect, vi } from "vitest";
import { applyStyles } from "./ai";

// Mock Lexical
vi.mock("lexical", async () => {
    const actual = await vi.importActual<typeof import("lexical")>("lexical");
    return {
        ...actual,
        $createTextNode: vi.fn((text: string) => ({ type: "text", text, format: null, setFormat: function (fmt: any) { this.format = fmt; } })),
        $createParagraphNode: vi.fn(() => ({ type: "paragraph", append: vi.fn() })),
    };
});

vi.mock("../nodes/Stepper", () => ({
    $createStepperNode: vi.fn(),
}));

// Mock @lexical/code
vi.mock("@lexical/code", () => ({
    $createCodeNode: vi.fn((lang) => ({ type: "code", language: lang, children: [] as any[], append: function (child: any) { this.children.push(child); } })),
}));

// Mock @lexical/rich-text
vi.mock("@lexical/rich-text", () => ({
    $createHeadingNode: vi.fn((tag) => ({ type: "heading", tag, children: [] as any[], append: function (child: any) { this.children.push(child); } })),
}));


describe("applyStyles", () => {
    it("should extract language from code block", () => {
        const input = "Here is some code:\n```typescript\nconst a = 1;\n```\nEnd.";
        const nodes = applyStyles(input) as any[];

        // Expected: TextNode, CodeNode(lang=typescript), TextNode
        expect(nodes.length).toBe(3);

        // Check first text node
        expect(nodes[0].text).toBe("Here is some code:\n");

        // Check code node
        const codeNode = nodes[1];
        expect(codeNode.type).toBe("code");
        expect(codeNode.language).toBe("typescript");
        expect(codeNode.children[0].text).toBe("const a = 1;\n");

        // Check last text node
        expect(nodes[2].text).toBe("\nEnd.");
    });

    it("should handle code block without language", () => {
        const input = "```\nconsole.log('hi');\n```";
        const nodes = applyStyles(input) as any[];

        expect(nodes.length).toBe(1);
        const codeNode = nodes[0];
        expect(codeNode.type).toBe("code");
        expect(codeNode.language).toBe(""); // Or undefined/null depending on implementation
        expect(codeNode.children[0].text).toBe("\nconsole.log('hi');\n");
    });

    it("should handle language on same line", () => {
        const input = "```python\nprint('hello')\n```";
        const nodes = applyStyles(input) as any[];
        expect(nodes[0].language).toBe("python");
        expect(nodes[0].children[0].text).toBe("print('hello')\n");
    });
});
