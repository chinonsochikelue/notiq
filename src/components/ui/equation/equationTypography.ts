export interface EquationTypographyRule {
  pattern: RegExp;
  replacement: string;
}

/**
 * Ordered LaTeX shorthand rules applied as the user types inside an equation input.
 * Chained rules must appear before single-token rules so `<=>` and `<->` work
 * smoothly even when `<=` or `<-` was already expanded on the previous keystroke.
 */
export const EQUATION_TYPOGRAPHY_RULES: ReadonlyArray<EquationTypographyRule> = [
  // Chained expansions when typing `>` after `<=` (\le ) or `<-` (\leftarrow )
  { pattern: /\\le\s*>$/, replacement: "\\Leftrightarrow " },
  { pattern: /\\leftarrow\s*>$/, replacement: "\\leftrightarrow " },
  { pattern: /<=>$/, replacement: "\\Leftrightarrow " },
  { pattern: /<->$/, replacement: "\\leftrightarrow " },

  // Arrows
  { pattern: /=>$/, replacement: "\\Rightarrow " },
  { pattern: /->$/, replacement: "\\to " },
  { pattern: /<-$/, replacement: "\\leftarrow " },

  // Comparisons & math operators
  { pattern: /<=$/, replacement: "\\le " },
  { pattern: />=$/, replacement: "\\ge " },
  { pattern: /!=$/, replacement: "\\neq " },
  { pattern: /~=$/, replacement: "\\approx " },
  { pattern: /\+-$/, replacement: "\\pm " },
  { pattern: /\.\.\.$/, replacement: "\\dots " },
];

/**
 * Pure helper that applies LaTeX shorthand replacements immediately before `cursorOffset`.
 * Returns the updated equation text and new cursor offset, or `null` if no rule matched.
 */
export function applyEquationTypography(
  text: string,
  cursorOffset: number
): { text: string; offset: number } | null {
  if (cursorOffset <= 0 || cursorOffset > text.length) {
    return null;
  }

  const before = text.slice(0, cursorOffset);
  const after = text.slice(cursorOffset);

  for (const rule of EQUATION_TYPOGRAPHY_RULES) {
    const match = before.match(rule.pattern);
    if (match) {
      const matchedStr = match[0];
      const prefix = before.slice(0, before.length - matchedStr.length);
      const nextBefore = prefix + rule.replacement;
      return {
        text: nextBefore + after,
        offset: nextBefore.length,
      };
    }
  }

  return null;
}

/**
 * Handles an `<input>` or `<textarea>` change event for equation editors,
 * applying LaTeX shorthand replacements and preserving the caret position.
 */
export function handleEquationInputChange(
  target: HTMLInputElement | HTMLTextAreaElement,
  setEquation: (equation: string) => void
): void {
  const rawValue = target.value;
  const cursor = target.selectionStart ?? rawValue.length;
  const transformed = applyEquationTypography(rawValue, cursor);

  if (transformed) {
    setEquation(transformed.text);
    requestAnimationFrame(() => {
      if (typeof target.setSelectionRange === "function") {
        target.setSelectionRange(transformed.offset, transformed.offset);
      }
    });
    return;
  }

  setEquation(rawValue);
}
