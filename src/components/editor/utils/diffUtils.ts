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

export type DiffHunkStatus = "pending" | "accepted" | "rejected";

export interface DiffHunk {
  id: string;
  index: number;
  type: "added" | "removed" | "replaced" | "unchanged";
  originalText: string;
  updatedText: string;
  status: DiffHunkStatus;
}

/**
 * Groups `DiffPart[]` into interactive hunks, pairing adjacent `removed` + `added`
 * parts into a single `"replaced"` hunk for per-hunk Accept / Reject review.
 */
export function buildDiffHunks(parts: DiffPart[]): DiffHunk[] {
  const hunks: DiffHunk[] = [];
  let i = 0;

  while (i < parts.length) {
    const current = parts[i];
    const next = parts[i + 1];

    if (current.type === "removed" && next?.type === "added") {
      hunks.push({
        id: `hunk-${hunks.length}`,
        index: hunks.length,
        type: "replaced",
        originalText: current.text,
        updatedText: next.text,
        status: "pending",
      });
      i += 2;
      continue;
    }

    if (current.type === "added") {
      hunks.push({
        id: `hunk-${hunks.length}`,
        index: hunks.length,
        type: "added",
        originalText: "",
        updatedText: current.text,
        status: "pending",
      });
    } else if (current.type === "removed") {
      hunks.push({
        id: `hunk-${hunks.length}`,
        index: hunks.length,
        type: "removed",
        originalText: current.text,
        updatedText: "",
        status: "pending",
      });
    } else {
      hunks.push({
        id: `hunk-${hunks.length}`,
        index: hunks.length,
        type: "unchanged",
        originalText: current.text,
        updatedText: current.text,
        status: "accepted",
      });
    }

    i += 1;
  }

  return hunks;
}

/**
 * Reconstructs the final text from reviewed diff hunks:
 * rejected hunks keep `originalText`; accepted or pending hunks use `updatedText`.
 */
export function resolveDiffHunks(
  hunks: DiffHunk[],
  decisions: Record<string, DiffHunkStatus> = {}
): string {
  return hunks
    .map((hunk) => {
      if (hunk.type === "unchanged") return hunk.originalText;
      const status = decisions[hunk.id] ?? hunk.status;
      return status === "rejected" ? hunk.originalText : hunk.updatedText;
    })
    .join("");
}
