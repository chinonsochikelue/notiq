"use client";

import React, { useState } from "react";
import {
  useEditor,
  EditorContent,
  StarterKit,
  AIKit,
  BlocksKit,
  BubbleMenu,
} from "@collabchron/notiq";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  List,
  Columns,
  Sparkles,
  Undo,
  Redo,
  Code,
  FileJson,
  FileCode,
  Copy,
  Check,
} from "lucide-react";

export default function HeadlessDemo() {
  const [inspectorTab, setInspectorTab] = useState<"html" | "json" | "code">("html");
  const [copied, setCopied] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      AIKit.configure({
        apiEndpoint: "/api/ai",
      }),
      BlocksKit,
    ],
    content: `
      <h2>Headless Lexical Architecture</h2>
      <p>This editor instance is running completely <strong>headless</strong> using Notiq's modern extension pipeline and fluent chained commands.</p>
      <p>Highlight any text to see the floating <strong>BubbleMenu</strong>, or use the chained command buttons above to toggle marks and block structures.</p>
    `,
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sampleSnippet = `import { useEditor, EditorContent, StarterKit, AIKit, BubbleMenu } from "@collabchron/notiq";

export function MyEditor() {
  const editor = useEditor({
    extensions: [StarterKit, AIKit.configure({ apiEndpoint: "/api/ai" })],
    content: "<p>Hello from Headless Notiq!</p>",
  });

  return (
    <div>
      <BubbleMenu editor={editor} showAskAI={true} />
      <button onClick={() => editor.chain().focus().toggleBold().run()}>
        Bold
      </button>
      <EditorContent editor={editor} className="prose" />
    </div>
  );
}`;

  if (!editor) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <span className="text-sm text-slate-500">Mounting headless editor...</span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Top Controller & Editor */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        {/* Headless Fluent Toolbar */}
        <div className="flex flex-wrap items-center gap-1.5 p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 backdrop-blur-md">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              editor.isActive("bold")
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
            title="Toggle Bold (Cmd+B)"
          >
            <Bold className="size-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              editor.isActive("italic")
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
            title="Toggle Italic (Cmd+I)"
          >
            <Italic className="size-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              editor.isActive("strike")
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
            title="Toggle Strikethrough"
          >
            <Strikethrough className="size-4" />
          </button>

          <div className="h-5 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

          <button
            onClick={() => editor.chain().focus().setHeading({ level: 1 }).run()}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              editor.isActive("heading", { level: 1 })
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            H1
          </button>

          <button
            onClick={() => editor.chain().focus().setHeading({ level: 2 }).run()}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              editor.isActive("heading", { level: 2 })
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            H2
          </button>

          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              editor.isActive("bulletList")
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
            title="Toggle Bullet List"
          >
            <List className="size-4" />
          </button>

          <div className="h-5 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

          <button
            onClick={() => editor.commands.setColumns(2)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
            title="Split block into 2 columns"
          >
            <Columns className="size-3.5 text-blue-500" />
            2 Cols
          </button>

          <button
            onClick={() => editor.commands.openAICommandBar()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white transition-colors cursor-pointer ml-auto shadow-xs"
          >
            <Sparkles className="size-3.5" />
            Ask AI (⌘K)
          </button>
        </div>

        {/* Bubble Menu attached to selection */}
        <BubbleMenu editor={editor} showAskAI={true} />

        {/* Headless Editor Content Canvas */}
        <div className="p-6 sm:p-8 min-h-[350px]">
          <EditorContent
            editor={editor}
            className="prose dark:prose-invert max-w-none focus:outline-none min-h-[300px]"
          />
        </div>
      </div>

      {/* Real-time State & Code Inspector */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setInspectorTab("html")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                inspectorTab === "html"
                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <FileCode className="size-3.5" />
              Live HTML
            </button>
            <button
              onClick={() => setInspectorTab("json")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                inspectorTab === "json"
                  ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <FileJson className="size-3.5" />
              AST JSON
            </button>
            <button
              onClick={() => setInspectorTab("code")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                inspectorTab === "code"
                  ? "bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Code className="size-3.5" />
              Framework Code
            </button>
          </div>

          <button
            onClick={() =>
              copyToClipboard(
                inspectorTab === "html"
                  ? editor.getHTML()
                  : inspectorTab === "json"
                  ? JSON.stringify(editor.getJSON(), null, 2)
                  : sampleSnippet
              )
            }
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            {copied ? <Check className="size-3.5 text-green-500" /> : <Copy className="size-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <div className="p-4 bg-slate-950 text-slate-300 font-mono text-xs overflow-x-auto max-h-72 leading-relaxed">
          {inspectorTab === "html" && (
            <pre className="whitespace-pre-wrap">{editor.getHTML() || "<p>Empty document</p>"}</pre>
          )}
          {inspectorTab === "json" && (
            <pre className="whitespace-pre-wrap">{JSON.stringify(editor.getJSON(), null, 2)}</pre>
          )}
          {inspectorTab === "code" && (
            <pre className="whitespace-pre-wrap text-emerald-400">{sampleSnippet}</pre>
          )}
        </div>
      </div>
    </div>
  );
}
