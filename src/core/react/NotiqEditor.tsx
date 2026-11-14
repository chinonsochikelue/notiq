"use client";

import React from "react";
import Editor, { type ToolbarConfig } from "../../components/editor";
import type { CollabConfig } from "../../components/providers/CollabContext";
import type { AIConfig } from "../../components/providers/AIContext";
import type { UploadConfig } from "../../components/providers/UploadContext";

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
  onChange?: (editorState: any, editor: any) => void;
  onUpdate?: (event: {
    editor: any;
    markdown: string;
    json: any;
    html: string;
  }) => void;
  onEditorReady?: (editor: any) => void;
  children?: React.ReactNode;
}

export function NotiqEditor({
  content,
  editable = true,
  toolbarConfig,
  collabConfig,
  aiConfig,
  uploadConfig,
  className,
  editorClassName,
  onChange,
  onUpdate,
  onEditorReady,
  children,
}: NotiqEditorProps) {
  return (
    <Editor
      isEditable={editable}
      content={content}
      toolbarConfig={toolbarConfig}
      collabConfig={collabConfig}
      aiConfig={aiConfig}
      uploadConfig={uploadConfig}
      className={className}
      editorClassName={editorClassName}
      onChange={onChange}
      onUpdate={onUpdate}
      onEditorReady={onEditorReady}
    >
      {children}
    </Editor>
  );
}
