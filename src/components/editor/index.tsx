"use client"

import React from "react";
import { SharedHistoryContext } from "../providers/SharedHistoryContext";
import { ToolbarContext } from "../providers/ToolbarContext";
import { LexicalComposer } from "@lexical/react/LexicalComposer";


import theme from "./themes/editor-theme";
import Core from "./Core";
import nodes from "./nodes";

import { AIProvider, type AIConfig } from "../providers/AIContext";
import { UploadProvider, type UploadConfig } from "../providers/UploadContext";

export type ToolbarItem =
  | "undo"
  | "redo"
  | "block-format"
  | "font-family"
  | "font-size"
  | "bold"
  | "italic"
  | "underline"
  | "code"
  | "link"
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

export default function Editor({
  isEditable = false,
  content,
  aiConfig,
  uploadConfig,
  toolbarConfig,
}: {
  isEditable: boolean;
  content?: unknown;
  aiConfig?: AIConfig;
  uploadConfig?: UploadConfig;
  toolbarConfig?: ToolbarConfig;
}) {
  const initialConfig = {
    namespace: "Bloger editor",
    theme,
    editorState: typeof content === "string" ? content : undefined,
    // typeof content === "string" ? content : JSON.stringify(content),
    nodes: [...nodes],
    onError: (error: Error) => {
      throw error;
    },
    editable: isEditable,
  };

  console.log("Editor content:", content);

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <AIProvider config={aiConfig}>
        <UploadProvider config={uploadConfig}>
          <SharedHistoryContext>
            <ToolbarContext>
              <Core toolbarConfig={toolbarConfig} />
            </ToolbarContext>
          </SharedHistoryContext>
        </UploadProvider>
      </AIProvider>
    </LexicalComposer>
  );
}
