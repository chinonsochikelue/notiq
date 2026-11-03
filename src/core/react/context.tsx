"use client";

import React, { createContext, useContext, useMemo } from "react";
import type { NotiqEditor } from "../types";
import {
  createLexicalComposerContext,
  LexicalComposerContext,
} from "@lexical/react/LexicalComposerContext";
import theme from "../../components/editor/themes/editor-theme";

export interface NotiqContextValue {
  editor: NotiqEditor | null;
}

export const NotiqContext = createContext<NotiqContextValue>({
  editor: null,
});

export function useNotiqContext(): { editor: NotiqEditor } {
  const context = useContext(NotiqContext);
  if (!context || !context.editor) {
    throw new Error(
      "[Notiq]: useNotiqContext must be used within a <NotiqProvider /> with a valid editor instance."
    );
  }
  return { editor: context.editor };
}

export interface NotiqProviderProps {
  editor: NotiqEditor | null;
  theme?: any;
  children: React.ReactNode;
}

export function NotiqProvider({
  editor,
  theme: customTheme,
  children,
}: NotiqProviderProps) {
  const activeTheme = customTheme || theme;

  const lexicalContext = useMemo(() => {
    return createLexicalComposerContext(null, activeTheme);
  }, [activeTheme]);

  const value = useMemo(() => ({ editor }), [editor]);

  if (!editor) {
    return <>{children}</>;
  }

  return (
    <LexicalComposerContext.Provider value={[editor.lexical, lexicalContext]}>
      <NotiqContext.Provider value={value}>{children}</NotiqContext.Provider>
    </LexicalComposerContext.Provider>
  );
}
