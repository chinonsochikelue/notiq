import { describe, it, expect } from "vitest";
import { getMentionCandidates } from "../plugins/CommentsPlugin/MentionsAutocomplete";
import { findDOMElementForQuote } from "../plugins/CommentsPlugin";
import type { CollabUser } from "../../providers/CollabContext";

describe("MentionsAutocomplete candidate resolution", () => {
  const mockUsers: CollabUser[] = [
    { clientId: 1, name: "Alice Springs", color: "#ef4444", isSelf: true },
    { clientId: 2, name: "Bob Martin", color: "#3b82f6" },
    { clientId: 3, name: "Charlie Day", color: "#10b981" },
  ];

  it("includes @everyone when query is empty", () => {
    const candidates = getMentionCandidates(mockUsers, "");
    expect(candidates.some((c) => c.name === "everyone" && c.isSpecial)).toBe(true);
    expect(candidates.length).toBe(4); // everyone + 3 users
  });

  it("includes @everyone when query matches 'every' or 'all'", () => {
    const res1 = getMentionCandidates(mockUsers, "every");
    expect(res1.some((c) => c.name === "everyone")).toBe(true);

    const res2 = getMentionCandidates(mockUsers, "all");
    expect(res2.some((c) => c.name === "everyone")).toBe(true);
  });

  it("filters users by name case-insensitively", () => {
    const candidates = getMentionCandidates(mockUsers, "bob");
    expect(candidates.length).toBe(1);
    expect(candidates[0].name).toBe("Bob Martin");
    expect(candidates[0].color).toBe("#3b82f6");
  });

  it("returns empty list if query has no matches", () => {
    const candidates = getMentionCandidates(mockUsers, "nonexistent_person_xyz");
    expect(candidates.length).toBe(0);
  });
});

describe("findDOMElementForQuote DOM finder", () => {
  it("finds exact text node within a container element", () => {
    const root = document.createElement("div");
    const p1 = document.createElement("p");
    p1.textContent = "Once upon a time in a faraway galaxy.";
    const p2 = document.createElement("p");
    p2.textContent = "The mist clung to the ancient oaks.";
    root.appendChild(p1);
    root.appendChild(p2);

    const found = findDOMElementForQuote(root, "mist clung to");
    expect(found).not.toBeNull();
    expect(found?.tagName.toLowerCase()).toBe("p");
    expect(found?.textContent).toContain("mist clung");
  });

  it("finds block element containing substring case-insensitively", () => {
    const root = document.createElement("div");
    const h2 = document.createElement("h2");
    h2.textContent = "Chapter 4: The Whispering Woods";
    root.appendChild(h2);

    const found = findDOMElementForQuote(root, "CHAPTER 4");
    expect(found).toBe(h2);
  });

  it("returns null if quote does not exist in root", () => {
    const root = document.createElement("div");
    const p = document.createElement("p");
    p.textContent = "Hello world";
    root.appendChild(p);

    const found = findDOMElementForQuote(root, "non-existent text snippet");
    expect(found).toBeNull();
  });
});
