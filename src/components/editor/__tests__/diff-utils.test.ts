import { describe, it, expect } from "vitest";
import {
  buildDiffHunks,
  computeWordDiff,
  resolveDiffHunks,
} from "../utils/diffUtils";

describe("diffUtils computeWordDiff", () => {
  it("detects completely identical text as unchanged", () => {
    const diff = computeWordDiff("Hello world", "Hello world");
    expect(diff).toEqual([{ type: "unchanged", text: "Hello world" }]);
  });

  it("detects added words", () => {
    const diff = computeWordDiff("Hello", "Hello beautiful world");
    expect(diff.some((p) => p.type === "added")).toBe(true);
    const added = diff.filter((p) => p.type === "added").map((p) => p.text).join("");
    expect(added).toContain("beautiful world");
  });

  it("detects replaced words", () => {
    const diff = computeWordDiff("The bad code", "The clean code");
    const removed = diff.find((p) => p.type === "removed");
    const added = diff.find((p) => p.type === "added");
    expect(removed?.text.trim()).toBe("bad");
    expect(added?.text.trim()).toBe("clean");
  });

  it("handles empty strings cleanly", () => {
    expect(computeWordDiff("", "")).toEqual([]);
    expect(computeWordDiff("", "New text")).toEqual([
      { type: "added", text: "New text" },
    ]);
    expect(computeWordDiff("Old text", "")).toEqual([
      { type: "removed", text: "Old text" },
    ]);
  });
});

describe("buildDiffHunks & resolveDiffHunks", () => {
  it("pairs removed + added tokens into replaced hunks and resolves selective accept/reject", () => {
    const parts = computeWordDiff(
      "The bad code runs slowly",
      "The clean code runs fast"
    );
    const hunks = buildDiffHunks(parts);
    const changed = hunks.filter((h) => h.type !== "unchanged");
    expect(changed.length).toBe(2);
    expect(changed[0].type).toBe("replaced");
    expect(changed[0].originalText).toBe("bad");
    expect(changed[0].updatedText).toBe("clean");

    // Accept first hunk, reject second hunk
    const resolved = resolveDiffHunks(hunks, {
      [changed[0].id]: "accepted",
      [changed[1].id]: "rejected",
    });
    expect(resolved).toBe("The clean code runs slowly");
  });
});
