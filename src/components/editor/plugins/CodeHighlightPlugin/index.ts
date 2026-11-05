/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { $isCodeNode, CodeNode } from '@lexical/code';
import {
  loadCodeTheme,
  registerCodeHighlighting,
  ShikiTokenizer,
} from '@lexical/code-shiki';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $nodesOfType } from 'lexical';
import { useTheme } from 'next-themes';
import React, { useEffect, useRef, useState } from 'react';

export const DARK_CODE_THEME = 'github-dark';
export const LIGHT_CODE_THEME = 'github-light';

export default function CodeHighlightPlugin(): React.JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  let resolvedTheme: string | undefined;
  try {
    const themeContext = useTheme();
    resolvedTheme = themeContext?.resolvedTheme;
  } catch {
    // safe fallback if outside ThemeProvider
  }

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted
    ? resolvedTheme === 'dark' ||
      (typeof document !== 'undefined' &&
        document.documentElement.classList.contains('dark'))
    : typeof document !== 'undefined' &&
      document.documentElement.classList.contains('dark');

  const activeTheme = isDark ? DARK_CODE_THEME : LIGHT_CODE_THEME;

  const tokenizerRef = useRef({
    ...ShikiTokenizer,
    defaultTheme: activeTheme,
  });

  // Keep defaultTheme up-to-date for newly inserted code blocks
  tokenizerRef.current.defaultTheme = activeTheme;

  // Preload both themes so switching is instant without any render flicker
  useEffect(() => {
    loadCodeTheme(DARK_CODE_THEME);
    loadCodeTheme(LIGHT_CODE_THEME);
  }, []);

  // Register Shiki code highlighting with dynamic tokenizer
  useEffect(() => {
    return registerCodeHighlighting(editor, tokenizerRef.current);
  }, [editor]);

  // Synchronize existing CodeNodes when theme toggles between dark and light
  useEffect(() => {
    editor.update(() => {
      const codeNodes = $nodesOfType(CodeNode);
      for (const node of codeNodes) {
        const currentTheme = node.getTheme();
        // If theme is unset or is one of the standard default themes, update to match active theme
        if (
          !currentTheme ||
          currentTheme === DARK_CODE_THEME ||
          currentTheme === LIGHT_CODE_THEME ||
          currentTheme === 'one-light' ||
          currentTheme === 'one-dark-pro' ||
          currentTheme === 'poimandres'
        ) {
          if (currentTheme !== activeTheme) {
            node.setTheme(activeTheme);
            node.markDirty();
          }
        }
      }
    });
  }, [editor, activeTheme]);

  return null;
}
