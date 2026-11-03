"use client";

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  FileText,
  Code2,
  Maximize2,
  Sparkles,
  Columns,
  Undo,
  Redo,
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Eye,
  Layers,
  Copy,
  Check,
} from "lucide-react";

// Dynamically import Notiq editor and canvas to avoid SSR issues with DOM APIs
const Editor = dynamic(
  () => import("@collabchron/notiq").then((mod) => mod.Editor || mod.default),
  { ssr: false, loading: () => <EditorSkeleton /> }
);

const CanvasMode = dynamic(
  () => import("@collabchron/notiq").then((mod) => mod.CanvasMode),
  { ssr: false, loading: () => <CanvasSkeleton /> }
);

// Dynamic import for headless framework components
const HeadlessDemo = dynamic(() => import("./HeadlessDemo"), {
  ssr: false,
  loading: () => <EditorSkeleton />,
});

function EditorSkeleton() {
  return (
    <div className="w-full h-[600px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md flex flex-col items-center justify-center gap-3 animate-pulse">
      <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      <span className="text-sm font-medium text-slate-500">Initializing Notiq Editor...</span>
    </div>
  );
}

function CanvasSkeleton() {
  return (
    <div className="w-full h-[700px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-dot-grid flex flex-col items-center justify-center gap-3">
      <div className="size-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
      <span className="text-sm font-medium text-slate-500">Loading Spatial Canvas...</span>
    </div>
  );
}

export default function DocsPlaygroundPage() {
  const [activeTab, setActiveTab] = useState<"document" | "headless" | "canvas">("document");
  const [copied, setCopied] = useState(false);

  const initialDocumentContent = useMemo(
    () => ({
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "✨ Welcome to Notiq Playground",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "heading",
            version: 1,
            tag: "h1",
          },
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Notiq is the next-generation rich-text and spatial content framework. Try out all the cutting-edge features directly in this live sandbox:",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1,
          },
          {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 1,
                    mode: "normal",
                    style: "",
                    text: "🤖 Inline AI Command Bar: ",
                    type: "text",
                    version: 1,
                  },
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Select any text or press Cmd+K / Ctrl+K to ask AI, fix grammar, or improve tone with live streaming word diffs.",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 1,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 1,
                    mode: "normal",
                    style: "",
                    text: "⠿ Notion-Style Block Handles: ",
                    type: "text",
                    version: 1,
                  },
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Hover over the left gutter to drag reorder, click '+' to insert, or click '⠿' to Turn Into headings, quotes, or 2/3 column layouts.",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 2,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 1,
                    mode: "normal",
                    style: "",
                    text: "🎨 Spatial Canvas Mode: ",
                    type: "text",
                    version: 1,
                  },
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Switch to 'Spatial Canvas' in the top bar to explore your document on an infinite whiteboard with sticky notes and Excalidraw.",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 3,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "list",
            version: 1,
            listType: "bullet",
            start: 1,
          },
          {
            children: [
              {
                detail: 0,
                format: 2,
                mode: "normal",
                style: "",
                text: "💡 Tip: Type '/' anywhere on a new line to open the slash command menu for equations, code blocks, polls, and media embeds.",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1,
      },
    }),
    []
  );

  const uploadConfig = useMemo(
    () => ({
      uploadHandler: async (file: File) => {
        return new Promise<{ url: string }>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve({ url: reader.result as string });
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      },
    }),
    []
  );

  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Playground Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
              Notiq Playground
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
              Interactive
            </span>
          </div>
        </div>

        {/* View Mode Switcher Pills */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 shadow-inner">
          <button
            onClick={() => setActiveTab("document")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "document"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <FileText className="size-3.5 text-blue-500" />
            Notion Document
          </button>

          <button
            onClick={() => setActiveTab("headless")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "headless"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Code2 className="size-3.5 text-emerald-500" />
            Headless Framework
          </button>

          <button
            onClick={() => setActiveTab("canvas")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "canvas"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Layers className="size-3.5 text-purple-500" />
            Spatial Canvas
          </button>
        </div>

        {/* Quick action badges */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono">
            ⌘K AI Diff
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono">
            / Commands
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono">
            ⠿ Drag Handles
          </span>
        </div>
      </header>

      {/* Main Sandbox Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === "document" && (
          <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm p-4 sm:p-8 md:p-12 transition-all">
            <Editor
              isEditable={true}
              content={initialDocumentContent}
              aiConfig={{
                apiEndpoint: "/api/ai",
              }}
              uploadConfig={uploadConfig}
              showCollaboratorsBar={false}
            />
          </div>
        )}

        {activeTab === "headless" && <HeadlessDemo />}

        {activeTab === "canvas" && (
          <div className="w-full h-[750px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
            <CanvasMode onExit={() => setActiveTab("document")} />
          </div>
        )}
      </main>
    </div>
  );
}
