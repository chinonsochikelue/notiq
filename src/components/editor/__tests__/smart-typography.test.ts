import { describe, it, expect } from "vitest";
import {
  applySmartTypography,
  revertSmartTypography,
} from "../plugins/SmartTypographyPlugin";
import { applyEquationTypography } from "../../ui/equation/equationTypography";
import { BLOCK_EQUATION, EQUATION } from "../plugins/MarkdownTransformers";
import { looksLikeMarkdown } from "../plugins/MarkdownPastePlugin";

describe("SmartTypographyPlugin", () => {
  it("converts arrows, chained arrows, math operators, dashes, ellipses, and symbols", () => {
    expect(applySmartTypography("a =>", 4)).toMatchObject({ text: "a ⇒", offset: 3 });
    expect(applySmartTypography("a ->", 4)).toMatchObject({ text: "a →", offset: 3 });
    expect(applySmartTypography("a <-", 4)).toMatchObject({ text: "a ←", offset: 3 });
    expect(applySmartTypography("a ≤>", 4)).toMatchObject({ text: "a ⇔", offset: 3 });
    expect(applySmartTypography("a ←>", 4)).toMatchObject({ text: "a ↔", offset: 3 });
    expect(applySmartTypography("x <=", 4)).toMatchObject({ text: "x ≤", offset: 3 });
    expect(applySmartTypography("x >=", 4)).toMatchObject({ text: "x ≥", offset: 3 });
    expect(applySmartTypography("x !=", 4)).toMatchObject({ text: "x ≠", offset: 3 });
    expect(applySmartTypography("x ~=", 4)).toMatchObject({ text: "x ≈", offset: 3 });
    expect(applySmartTypography("x +-", 4)).toMatchObject({ text: "x ±", offset: 3 });
    expect(applySmartTypography("wait...", 7)).toMatchObject({ text: "wait…", offset: 5 });
    expect(applySmartTypography("Notiq(c)", 8)).toMatchObject({ text: "Notiq©", offset: 6 });
    expect(applySmartTypography("Notiq(tm)", 9)).toMatchObject({ text: "Notiq™", offset: 6 });
    expect(applySmartTypography("word --", 7)).toMatchObject({ text: "word –", offset: 6 });
    expect(applySmartTypography("word –-", 7)).toMatchObject({ text: "word —", offset: 6 });
  });

  it("preserves start-of-line dashes so markdown HR (---) still works", () => {
    expect(applySmartTypography("--", 2)).toBeNull();
    expect(applySmartTypography("---", 3)).toBeNull();
  });

  it("preserves trailing text after the cursor", () => {
    expect(applySmartTypography("foo => bar", 6)).toMatchObject({
      text: "foo ⇒ bar",
      offset: 5,
    });
  });

  it("converts LaTeX shorthands inside equation inputs", () => {
    expect(applyEquationTypography("a =>", 4)).toEqual({ text: "a \\Rightarrow ", offset: 14 });
    expect(applyEquationTypography("f: X ->", 7)).toEqual({ text: "f: X \\to ", offset: 9 });
    expect(applyEquationTypography("x <=", 4)).toEqual({ text: "x \\le ", offset: 6 });
    expect(applyEquationTypography("x \\le >", 7)).toEqual({
      text: "x \\Leftrightarrow ",
      offset: 18,
    });
    expect(applyEquationTypography("a \\leftarrow >", 14)).toEqual({
      text: "a \\leftrightarrow ",
      offset: 18,
    });
    expect(applyEquationTypography("a !=", 4)).toEqual({ text: "a \\neq ", offset: 7 });
    expect(applyEquationTypography("a +-", 4)).toEqual({ text: "a \\pm ", offset: 6 });
    expect(applyEquationTypography("x_1, ...", 8)).toEqual({ text: "x_1, \\dots ", offset: 11 });
  });

  it("matches inline ($...$) and block ($$...$$) equations without colliding with currency", () => {
    expect("Energy is $E = mc^2$".match(EQUATION.regExp)?.[1]).toBe("E = mc^2");
    expect("$$E = mc^2$".match(EQUATION.regExp)).toBeNull();
    expect("$$E = mc^2$$".match(BLOCK_EQUATION.regExp)?.[1]).toBe("E = mc^2");
    expect("Total is $5 and $10".match(EQUATION.regExp)).toBeNull();
  });

  it("reverts smart typography on backspace immediately after conversion", () => {
    const applied = applySmartTypography("a => b", 4);
    expect(applied).toEqual({
      text: "a ⇒ b",
      offset: 3,
      original: "=>",
      replacement: "⇒",
    });

    expect(
      revertSmartTypography(applied!.text, applied!.offset, "=>", "⇒")
    ).toEqual({
      text: "a => b",
      offset: 4,
    });
  });

  it("detects markdown and math syntax for smart paste", () => {
    expect(looksLikeMarkdown("# Heading\n\n- item 1")).toBe(true);
    expect(looksLikeMarkdown("Energy: $E = mc^2$")).toBe(true);
    expect(looksLikeMarkdown("Just a plain sentence.")).toBe(false);
    expect(looksLikeMarkdown("Total is $5 and $10.")).toBe(false);
  });
});
