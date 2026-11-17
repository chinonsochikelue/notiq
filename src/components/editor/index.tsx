"use client"

import React, { useMemo } from "react";
import { SharedHistoryContext } from "../providers/SharedHistoryContext";
import { ToolbarContext } from "../providers/ToolbarContext";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { LexicalCollaboration } from "@lexical/react/LexicalCollaborationContext";
import {
  CollabProvider,
  useCollab,
  type CollabConfig,
  type CollabUser,
  type CollabConnectionStatus,
} from "../providers/CollabContext";
import { CommentsProvider, useComments, type CommentThread } from "../providers/CommentsContext";
import {
  VersionHistoryProvider,
  useVersionHistory,
  type DocumentVersion,
} from "../providers/VersionHistoryContext";
import CollaboratorsBar, { OfflineBanner } from "./plugins/CollaborationPlugin/CollaboratorsBar";

import theme from "./themes/editor-theme";
import Core from "./Core";
import nodes from "./nodes";

import { AIProvider, type AIConfig } from "../providers/AIContext";
import { UploadProvider, type UploadConfig } from "../providers/UploadContext";
import QueryProvider from "../providers/QueryProvider";
import { normalizeInitialEditorState } from "./utils/importUtils";

export {
  CollaboratorsBar,
  OfflineBanner,
  CollabProvider,
  useCollab,
  type CollabConfig,
  type CollabUser,
  type CollabConnectionStatus,
  CommentsProvider,
  useComments,
  type CommentThread,
  VersionHistoryProvider,
  useVersionHistory,
  type DocumentVersion,
};

export type ToolbarItem =
  | "undo"
  | "redo"
  | "ai"
  | "block-format"
  | "font-family"
  | "font-size"
  | "bold"
  | "italic"
  | "underline"
  | "code"
  | "link"
  | "table"
  | "color"
  | "bg-color"
  | "text-format"
  | "insert"
  | "align"
  | "speech"
  | "template"
  | "download"
  | "export-md"
  | "export-pdf"
  | "separator";

export type ToolbarConfig = {
  items?: ToolbarItem[];
  className?: string;
  itemClassName?: string;
  activeItemClassName?: string;
  mobileClassName?: string;
  mobileItemClassName?: string;
};

export type EditorProps = {
  isEditable?: boolean;
  content?: unknown;
  aiConfig?: AIConfig;
  uploadConfig?: UploadConfig;
  toolbarConfig?: ToolbarConfig;
  collabConfig?: CollabConfig;
  showCollaboratorsBar?: boolean;
  className?: string;
  editorClassName?: string;
  onChange?: (editorState: any, editor: any) => void;
  onUpdate?: (payload: { json: any; html: string; markdown: string; editor: any }) => void;
  onEditorReady?: (editor: any) => void;
  children?: React.ReactNode;
};

export default function Editor({
  isEditable = false,
  content,
  aiConfig,
  uploadConfig,
  toolbarConfig,
  collabConfig,
  showCollaboratorsBar,
  className,
  editorClassName,
  onChange,
  onUpdate,
  onEditorReady,
  children,
}: EditorProps) {
  const isCollabActive = Boolean(collabConfig?.enabled);

  // When collaboration is active, local editorState is left undefined so Lexical
  // initializes from the Yjs CRDT tree (or bootstraps initialEditorState cleanly)
  const initialConfig = useMemo(
    () => ({
      namespace: "Bloger editor",
      theme,
      editorState: isCollabActive
        ? undefined
        : normalizeInitialEditorState(content),
      nodes: [...nodes],
      onError: (error: Error) => {
        throw error;
      },
      editable: isEditable,
    }),
    [isCollabActive, content, isEditable]
  );

  return (
    <QueryProvider>
      <CollabProvider config={collabConfig}>
        <LexicalCollaboration>
          <CommentsProvider>
            <VersionHistoryProvider>
              <LexicalComposer initialConfig={initialConfig}>
                <AIProvider config={aiConfig}>
                  <UploadProvider config={uploadConfig}>
                    <SharedHistoryContext>
                      <ToolbarContext>
                        <Core
                          toolbarConfig={toolbarConfig}
                          content={content}
                          showCollaboratorsBar={showCollaboratorsBar}
                          className={className}
                          editorClassName={editorClassName}
                          onChange={onChange}
                          onUpdate={onUpdate}
                          onEditorReady={onEditorReady}
                        >
                          {children}
                        </Core>
                      </ToolbarContext>
                    </SharedHistoryContext>
                  </UploadProvider>
                </AIProvider>
              </LexicalComposer>
            </VersionHistoryProvider>
          </CommentsProvider>
        </LexicalCollaboration>
      </CollabProvider>
    </QueryProvider>
  );
}
