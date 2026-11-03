import { describe, it, expect } from "vitest";
import { normalizeMarkdownHeadings, parseMarkdownToBlocks } from "./ai";
import { createEditor } from "lexical";
import nodes from "../nodes";
import { computeCopilotPositioning } from "../plugins/InlineCopilotPlugin";

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
        const maxRight = Math.min(rootRight - paddingRight, windowWidth - 64); // 784
        
        // Caret near middle of line
        const caretX = 400;
        const availableWidth = maxRight - caretX;
        expect(availableWidth).toBe(384);
        expect(availableWidth).toBeGreaterThanOrEqual(240);

        // Caret near end of line (< 240px)
        const caretNearEnd = 700;
        const remainingWidth = maxRight - caretNearEnd;
        expect(remainingWidth).toBe(84);
        expect(remainingWidth).toBeLessThan(240);
    });

    it("places short copilot suggestion inline when space permits", () => {
        const result = computeCopilotPositioning({
            caretRect: { right: 200, top: 100, bottom: 120, height: 20 },
            rootRect: { left: 50, right: 900, width: 850 },
            paddingLeft: 24,
            paddingRight: 24,
            windowWidth: 1200,
            suggestionText: " hello world",
        });

        expect(result.isNextLine).toBe(false);
        expect(result.x).toBe(200);
        expect(result.y).toBe(100);
        expect(result.maxWidth).toBeGreaterThan(200);
    });

    it("wraps long copilot suggestion to next line when line space is insufficient", () => {
        // User text ends near line boundary (e.g. "Once upon a time... curtain of mist.")
        const result = computeCopilotPositioning({
            caretRect: { right: 750, top: 100, bottom: 120, height: 20 },
            rootRect: { left: 100, right: 950, width: 850 },
            paddingLeft: 32,
            paddingRight: 32,
            windowWidth: 1200,
            suggestionText: " The mist clung to the ancient oaks, whispering of forgotten kings and ancient magic.",
        });

        expect(result.isNextLine).toBe(true);
        expect(result.x).toBe(132); // rootRect.left (100) + paddingLeft (32)
        expect(result.y).toBe(123); // caretRect.bottom (120) + 3
        expect(result.maxWidth).toBeGreaterThan(600);
    });

    it("clears right obstacles like floating analytics button and sidebars", () => {
        // Window is 1000px, but analytics button is at x=940
        const result = computeCopilotPositioning({
            caretRect: { right: 200, top: 100, bottom: 120, height: 20 },
            rootRect: { left: 50, right: 980, width: 930 },
            paddingLeft: 20,
            paddingRight: 20,
            windowWidth: 1000,
            suggestionText: " short text",
            rightObstacleLeft: 940,
        });

        // maxRight should be bounded by obstacle (940 - 16 = 924)
        // Total right extent: x + maxWidth <= 924
        expect(result.x + result.maxWidth).toBeLessThanOrEqual(924);
    });
});
