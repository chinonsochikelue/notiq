import { describe, it, expect } from "vitest";
import { createEditor, $getRoot, $createParagraphNode, ParagraphNode } from "lexical";
import { MentionNode, $createMentionNode, $isMentionNode } from "../nodes/MentionNode";
import { getSmartDateOptions } from "../plugins/MentionsPlugin";

describe("MentionNode & MentionsPlugin helpers", () => {
  it("creates user and date MentionNodes and roundtrips JSON", () => {
    const editor = createEditor({
      nodes: [ParagraphNode, MentionNode],
    });

    editor.update(
      () => {
        const root = $getRoot();
        const p = $createParagraphNode();
        const userMention = $createMentionNode("Alice", { kind: "user" });
        const dateMention = $createMentionNode("📅 Nov 18, 2026", {
          kind: "date",
          text: "📅 Nov 18, 2026",
        });
        expect($isMentionNode(userMention)).toBe(true);
        expect($isMentionNode(dateMention)).toBe(true);
        p.append(userMention, dateMention);
        root.append(p);
      },
      { discrete: true }
    );

    const serialized = editor.getEditorState().toJSON();
    const restoredEditor = createEditor({
      nodes: [ParagraphNode, MentionNode],
    });
    const parsedState = restoredEditor.parseEditorState(serialized);
    restoredEditor.setEditorState(parsedState);

    restoredEditor.getEditorState().read(() => {
      const p = $getRoot().getFirstChild() as ParagraphNode;
      const children = p.getChildren();
      expect($isMentionNode(children[0])).toBe(true);
      expect((children[0] as MentionNode).__mention).toBe("Alice");
      expect((children[0] as MentionNode).__kind).toBe("user");
      expect(children[0].getTextContent()).toBe("@Alice");

      expect($isMentionNode(children[1])).toBe(true);
      expect((children[1] as MentionNode).__kind).toBe("date");
      expect(children[1].getTextContent()).toBe("📅 Nov 18, 2026");
    });
  });

  it("provides today, tomorrow, and yesterday smart date options", () => {
    const options = getSmartDateOptions();
    expect(options.map((o) => o.keyword)).toEqual([
      "today",
      "tomorrow",
      "yesterday",
    ]);
    for (const opt of options) {
      expect(opt.formatted.length).toBeGreaterThan(0);
    }
  });
});
