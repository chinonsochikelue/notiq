"use client";

import React, { useEffect, useMemo, useRef } from "react";
import type { NotiqEditor as INotiqEditor, NotiqEditorOptions } from "../types";
import { useNotiq } from "./useNotiq";
import { NotiqProvider } from "./context";
import { NotiqContent } from "./NotiqContent";
import { StarterKit } from "../extensions/nodes-and-marks";
import { BlocksKit } from "../extensions/blocks-kit";
import { AICopilot } from "../extensions/copilot-and-collab";
import {
  CollabProvider,
  type CollabConfig,
} from "../../components/providers/CollabContext";
import { LexicalCollaboration } from "@lexical/react/LexicalCollaborationContext";
import { CommentsProvider } from "../../components/providers/CommentsContext";
import { VersionHistoryProvider } from "../../components/providers/VersionHistoryContext";
import { AIProvider, type AIConfig } from "../../components/providers/AIContext";
import { UploadProvider, type UploadConfig } from "../../components/providers/UploadContext";
import { SharedHistoryContext } from "../../components/providers/SharedHistoryContext";
import { ToolbarContext } from "../../components/providers/ToolbarContext";
import ToolbarPlugin from "../../components/editor/plugins/ToolbarPlugin";
import { ToolbarConfig } from "../../components/editor";
import { cn } from "../../lib/utils";

export interface NotiqEditorProps {
  content?: string | Record<string, any>;
  extensions?: any[];
  editable?: boolean;
  autofocus?: boolean | "start" | "end" | "all";
  placeholder?: string | React.ReactNode;
  showToolbar?: boolean;
  toolbarConfig?: ToolbarConfig;
  collabConfig?: CollabConfig;
  aiConfig?: AIConfig;
  uploadConfig?: UploadConfig;
  className?: string;
  editorClassName?: string;
  onUpdate?: (event: {
    editor: INotiqEditor;
    markdown: string;
    json: any;
    html: string;
  }) => void;
  onEditorReady?: (editor: INotiqEditor) => void;
  children?: React.ReactNode;
}

export function NotiqEditor({
  content,
  extensions,
  editable = true,
  autofocus = false,
  placeholder,
  showToolbar = true,
  toolbarConfig,
  collabConfig,
  aiConfig,
  uploadConfig,
  className,
  editorClassName,
  onUpdate,
  onEditorReady,
  children,
}: NotiqEditorProps) {
  const resolvedExtensions = useMemo(() => {
    return extensions || [StarterKit, BlocksKit, AICopilot];
  }, [extensions]);

  const editorOptions: NotiqEditorOptions = useMemo(
    () => ({
      extensions: resolvedExtensions,
      content,
      editable,
      autofocus,
      placeholder,
      onUpdate: ({ editor }) => {
        if (onUpdate) {
          onUpdate({
            editor,
            markdown: editor.getMarkdown(),
            json: editor.getJSON(),
            html: editor.getHTML(),
          });
        }
      },
    }),
    [resolvedExtensions, content, editable, autofocus, placeholder, onUpdate]
  );

  const editor = useNotiq(editorOptions, [resolvedExtensions]);
  const readyCalledRef = useRef(false);

  useEffect(() => {
    if (editor && !readyCalledRef.current) {
      readyCalledRef.current = true;
      if (onEditorReady) {
        onEditorReady(editor);
      }
    }
  }, [editor, onEditorReady]);

  if (!editor) {
    return null;
  }

  return (
    <CollabProvider config={collabConfig}>
      <LexicalCollaboration>
        <CommentsProvider>
          <VersionHistoryProvider>
            <NotiqProvider editor={editor}>
              <AIProvider config={aiConfig}>
                <UploadProvider config={uploadConfig}>
                  <SharedHistoryContext>
                    <ToolbarContext>
                      <div
                        className={cn(
                          "notiq-editor flex flex-col w-full rounded-xl border border-border bg-background shadow-sm overflow-hidden",
                          className
                        )}
                      >
                        {showToolbar && editable && (
                          <div className="border-b border-border bg-muted/30">
                            <ToolbarPlugin
                              editor={editor.lexical}
                              activeEditor={editor.lexical}
                              setActiveEditor={() => {}}
                              setIsLinkEditMode={() => {}}
                              toolbarConfig={toolbarConfig}
                            />
                          </div>
                        )}

                        <div className="p-4 md:p-8">
                          <NotiqContent
                            editor={editor}
                            className={cn("min-h-[300px]", editorClassName)}
                          >
                            {children}
                          </NotiqContent>
                        </div>
                      </div>
                    </ToolbarContext>
                  </SharedHistoryContext>
                </UploadProvider>
              </AIProvider>
            </NotiqProvider>
          </VersionHistoryProvider>
        </CommentsProvider>
      </LexicalCollaboration>
    </CollabProvider>
  );
}
