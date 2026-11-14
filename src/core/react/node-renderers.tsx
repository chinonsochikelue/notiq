"use client";

import React, { createContext, useContext, useMemo } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import type { LexicalEditor, NodeKey } from "lexical";

export type HintRendererVariant =
  | "info"
  | "warning"
  | "tip"
  | "danger"
  | "note"
  | "success"
  | string;

export interface HintRendererProps {
  type: HintRendererVariant;
  emoji?: string;
  captionEditor: LexicalEditor;
  nodeKey: NodeKey;
}

export interface ExcalidrawRendererProps {
  nodeKey: NodeKey;
  data: string;
  width: number | "inherit";
  height: number | "inherit";
}

export interface PollRendererOption {
  readonly text: string;
  readonly uid: string;
  readonly votes: Array<string>;
}

export interface PollRendererProps {
  question: string;
  options: ReadonlyArray<PollRendererOption>;
  nodeKey: NodeKey;
}

export interface ImageRendererProps {
  src: string;
  altText: string;
  width: "inherit" | number;
  height: "inherit" | number;
  maxWidth: number;
  nodeKey: NodeKey;
  showCaption: boolean;
  caption: LexicalEditor;
  captionsEnabled: boolean;
  resizable: boolean;
  rounded?: boolean | number;
  alignment?: string;
}

export interface InlineImageRendererProps {
  src: string;
  altText: string;
  width: "inherit" | number;
  height: "inherit" | number;
  nodeKey: NodeKey;
  showCaption: boolean;
  caption: LexicalEditor;
  position: "left" | "right" | "full" | undefined;
}

export interface NotiqNodeRendererMap {
  hint: HintRendererProps;
  excalidraw: ExcalidrawRendererProps;
  poll: PollRendererProps;
  image: ImageRendererProps;
  inlineImage: InlineImageRendererProps;
}

export type NotiqNodeRenderers = {
  [K in keyof NotiqNodeRendererMap]?: React.ComponentType<NotiqNodeRendererMap[K]>;
};

const NotiqNodeRendererContext = createContext<NotiqNodeRenderers>({});

const editorNodeRenderersMap = new WeakMap<LexicalEditor, NotiqNodeRenderers>();

export function setEditorNodeRenderers(
  editor: LexicalEditor,
  renderers: NotiqNodeRenderers
): void {
  const existing = editorNodeRenderersMap.get(editor) || {};
  editorNodeRenderersMap.set(editor, { ...existing, ...renderers });
}

export function getEditorNodeRenderers(
  editor: LexicalEditor
): NotiqNodeRenderers | undefined {
  return editorNodeRenderersMap.get(editor);
}

export function clearEditorNodeRenderers(editor: LexicalEditor): void {
  editorNodeRenderersMap.delete(editor);
}

export interface NotiqNodeRendererProviderProps {
  renderers: NotiqNodeRenderers;
  children: React.ReactNode;
}

export function NotiqNodeRendererProvider({
  renderers,
  children,
}: NotiqNodeRendererProviderProps): React.JSX.Element {
  const parent = useContext(NotiqNodeRendererContext);
  const merged = useMemo(
    () => ({ ...parent, ...renderers }),
    [parent, renderers]
  );
  return (
    <NotiqNodeRendererContext.Provider value={merged}>
      {children}
    </NotiqNodeRendererContext.Provider>
  );
}

export function useNotiqNodeRenderers(): NotiqNodeRenderers {
  return useContext(NotiqNodeRendererContext);
}

export function NodeRendererSlot<K extends keyof NotiqNodeRendererMap>({
  nodeType,
  rendererProps,
  fallback,
}: {
  nodeType: K;
  rendererProps: NotiqNodeRendererMap[K];
  fallback: React.ReactNode;
}): React.JSX.Element {
  const [editor] = useLexicalComposerContext();
  const contextRenderers = useContext(NotiqNodeRendererContext);
  const editorRenderers = getEditorNodeRenderers(editor);
  const CustomRenderer = (contextRenderers[nodeType] ??
    editorRenderers?.[nodeType]) as
    | React.ComponentType<NotiqNodeRendererMap[K]>
    | undefined;

  if (CustomRenderer) {
    return <CustomRenderer {...rendererProps} />;
  }

  return <>{fallback}</>;
}
