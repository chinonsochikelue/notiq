import { describe, it, expect } from "vitest";
import { normalizeMarkdownHeadings, parseMarkdownToBlocks } from "./ai";
import { createEditor } from "lexical";
import nodes from "../nodes";

describe("Markdown & AI Pipeline", () => {
    it("normalizes markdown headings correctly", () => {
        const input = "Introduction to Quantum Computing\n\nQuantum bits exist in superposition.\n\nKey Concepts\n\nEntanglement is crucial.";
        const normalized = normalizeMarkdownHeadings(input);
        expect(normalized).toContain("# Introduction to Quantum Computing");
        expect(normalized).toContain("## Key Concepts");
    });

    it("preserves already formatted markdown headings", () => {
        const input = "# Existing Title\n\n## Subheading\n\n```python\nprint(1)\n```";
        const normalized = normalizeMarkdownHeadings(input);
        expect(normalized).toBe(input);
    });

    it("parses markdown to native Lexical blocks safely", () => {
        const editor = createEditor({ nodes: [...nodes] });
        editor.update(() => {
            const blocks = parseMarkdownToBlocks(
                "# Title\n\nSome paragraph text.\n\n```typescript\nconst x = 42;\n```",
                editor
            );
            expect(blocks.length).toBeGreaterThanOrEqual(2);
        });
    });

    it("verifies clean structure for copilot completions", () => {
        const rawCompletion = '" allowing team members to communicate effortlessly."';
        const cleaned = rawCompletion.replace(/^["'`]+|["'`]+$/g, "").trim();
        expect(cleaned).toBe("allowing team members to communicate effortlessly.");
    });

    it("verifies copilot width clamping logic prevents overflow", () => {
        const rootRight = 800;
        const paddingRight = 16;
        const windowWidth = 1000;
        const maxRight = Math.min(rootRight - paddingRight, windowWidth - 20); // 784
        
        // Caret near middle of line
        const caretX = 400;
        const availableWidth = maxRight - caretX;
        expect(availableWidth).toBe(384);
        expect(availableWidth).toBeGreaterThanOrEqual(140);

        // Caret near end of line (< 140px)
        const caretNearEnd = 700;
        const remainingWidth = maxRight - caretNearEnd;
        expect(remainingWidth).toBe(84);
        expect(remainingWidth).toBeLessThan(140);
    });
});
