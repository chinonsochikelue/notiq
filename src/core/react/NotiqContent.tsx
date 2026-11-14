"use client";

import React, { useContext, useMemo } from "react";
import type { NotiqEditor } from "../types";
import { NotiqContext, NotiqProvider, useNotiqContext } from "./context";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { cn } from "../../lib/utils";
import {
  NotiqNodeRendererProvider,
  type NotiqNodeRenderers,
} from "./node-renderers";

export interface NotiqContentProps {
  editor?: NotiqEditor | null;
  className?: string;
  containerClassName?: string;
  placeholder?: React.ReactNode | string;
  renderPlugins?: boolean;
  /** Custom React renderers for rich decorator nodes (hint, excalidraw, poll, image, inlineImage). */
  renderers?: NotiqNodeRenderers;
  children?: React.ReactNode;
}

function InnerContent({
  editor,
  className,
  containerClassName,
  placeholder,
  renderPlugins = true,
  children,
}: {
  editor: NotiqEditor;
  className?: string;
  containerClassName?: string;
  placeholder?: React.ReactNode | string;
  renderPlugins?: boolean;
  children?: React.ReactNode;
}) {
  const extensionPlugins = useMemo(() => {
    if (!renderPlugins || !editor.extensions) return [];
    return editor.extensions.flatMap((ext) =>
      typeof ext.getPlugins === "function"
        ? ext.getPlugins({
            editor,
            lexical: editor.lexical,
            options: ext.options,
            storage: ext.storage,
          })
        : []
    );
  }, [editor, renderPlugins]);

  const resolvedPlaceholder = placeholder !== undefined ? placeholder : editor.options.placeholder;

  const placeholderElement = resolvedPlaceholder ? (
    typeof resolvedPlaceholder === "string" ? (
      <div className="pointer-events-none select-none absolute top-4 left-4 z-10 text-muted-foreground/60 text-base flex items-center gap-1.5">
        <span>{resolvedPlaceholder}</span>
      </div>
    ) : (
      <div className="pointer-events-none select-none absolute top-4 left-4 z-10">
        {resolvedPlaceholder}
      </div>
    )
  ) : null;

  return (
    <div className={cn("relative w-full", containerClassName)}>
      <RichTextPlugin
        contentEditable={
          <ContentEditable
            className={cn(
              "notiq-content min-h-[160px] outline-none text-foreground p-4 text-base leading-relaxed",
              className
            )}
          />
        }
        placeholder={placeholderElement}
        ErrorBoundary={LexicalErrorBoundary}
      />

      {/* Render all React plugins contributed by configured extensions */}
      {extensionPlugins.map((PluginComponent, index) => (
        <PluginComponent key={`ext-plugin-${index}`} />
      ))}

      {/* Custom consumer children (e.g. BubbleMenu, FloatingMenu, extra custom plugins) */}
      {children}
    </div>
  );
}

export function NotiqContent({
  editor: propEditor,
  className,
  containerClassName,
  placeholder,
  renderPlugins,
  renderers,
  children,
}: NotiqContentProps) {
  const context = useContext(NotiqContext);
  const activeEditor = propEditor || context.editor;

  if (!activeEditor) {
    return null;
  }

  const content = (
    <InnerContent
      editor={activeEditor}
      className={className}
      containerClassName={containerClassName}
      placeholder={placeholder}
      renderPlugins={renderPlugins}
    >
      {children}
    </InnerContent>
  );

  const wrappedContent = renderers ? (
    <NotiqNodeRendererProvider renderers={renderers}>
      {content}
    </NotiqNodeRendererProvider>
  ) : (
    content
  );

  // If already inside NotiqProvider, render InnerContent directly
  if (context.editor === activeEditor) {
    return wrappedContent;
  }

  // Otherwise, wrap in NotiqProvider automatically
  return (
    <NotiqProvider editor={activeEditor}>
      {wrappedContent}
    </NotiqProvider>
  );
}
