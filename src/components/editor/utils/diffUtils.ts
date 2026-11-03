export type DiffChangeType = "added" | "removed" | "unchanged";

export interface DiffPart {
  type: DiffChangeType;
  text: string;
}

/**
 * Tokenizes text into words and whitespace/punctuation preserving formatting.
 */
function tokenize(text: string): string[] {
  // Split on word boundaries while keeping delimiters
  return text.match(/\S+|\s+/g) || [];
}

/**
 * Computes an ultra-fast token-based diff between original text and replacement text
 * using Longest Common Subsequence (LCS).
 */
export function computeWordDiff(original: string, updated: string): DiffPart[] {
  const origTokens = tokenize(original);
  const upTokens = tokenize(updated);

  const n = origTokens.length;
  const m = upTokens.length;

  // Optimize empty cases
  if (n === 0 && m === 0) return [];
  if (n === 0) return [{ type: "added", text: updated }];
  if (m === 0) return [{ type: "removed", text: original }];

  // LCS Matrix
  // For performance on large texts, cap matrix if tokens > 1500
  if (n > 1500 || m > 1500) {
    return [
      { type: "removed", text: original },
      { type: "added", text: updated },
    ];
  }

  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array(m + 1).fill(0)
  );

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (origTokens[i - 1] === upTokens[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to reconstruct diff parts
  const parts: DiffPart[] = [];
  let i = n;
  let j = m;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && origTokens[i - 1] === upTokens[j - 1]) {
      parts.unshift({ type: "unchanged", text: origTokens[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      parts.unshift({ type: "added", text: upTokens[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      parts.unshift({ type: "removed", text: origTokens[i - 1] });
      i--;
    }
  }

  // Merge adjacent parts with the same type for cleaner rendering
  const merged: DiffPart[] = [];
  for (const part of parts) {
    if (merged.length > 0 && merged[merged.length - 1].type === part.type) {
      merged[merged.length - 1].text += part.text;
    } else {
      merged.push({ ...part });
    }
  }

  return merged;
}
