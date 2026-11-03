"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ModeToggle } from "../../components/theme/ModeToggle";
import Editor, {
  CollaboratorsBar,
  OfflineBanner,
  CollabProvider,
  CommentsProvider,
  VersionHistoryProvider,
} from "../../components/editor";
import { Users } from "lucide-react";
import { cn } from "../../lib/utils";

export default function PlaygroundPage() {
  const [aiAssistantActive] = useState(false);
  const [documentTitle, setDocumentTitle] = useState("Untitled Document");
  const [lastSaved, setLastSaved] = useState(new Date());
  const [collabActive, setCollabActive] = useState(true);
  const [collabRoom, setCollabRoom] = useState("notiq-playground-demo");
  const [collabServer, setCollabServer] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const syncParams = () => {
        const params = new URLSearchParams(window.location.search);
        const roomParam = params.get("room");
        const collabParam = params.get("collab");
        const serverParam = params.get("server");
        if (roomParam) setCollabRoom(roomParam);
        if (collabParam !== null) setCollabActive(collabParam === "true");
        if (serverParam) setCollabServer(serverParam);
      };

      // Read on initial client mount
      syncParams();

      window.addEventListener("popstate", syncParams);
      return () => window.removeEventListener("popstate", syncParams);
    }
  }, []);

  const uploadConfig = React.useMemo(
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
    [],
  );

  const collabConfig = React.useMemo(
    () => ({
      enabled: collabActive,
      docId: collabRoom,
      serverUrl: collabServer,
    }),
    [collabActive, collabRoom, collabServer],
  );

  // Updated content structure with comprehensive Notiq documentation
  const [content] = useState({
    root: {
      children: [
        // Main title
        {
          children: [
            {
              detail: 0,
              format: 1, // bold
              mode: "normal",
              style: "",
              text: "Introducing Notiq",
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
        // Subtitle description
        {
          children: [
            {
              detail: 0,
              format: 0,
              mode: "normal",
              style: "",
              text: "A powerful Notion-Like, Tiptap-Like, AI-enhanced rich text editor built with Lexical, Next.js, TypeScript, and Tailwind CSS. Create beautiful documents with intelligent writing assistance and advanced content blocks.",
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
        // Features section
        {
          children: [
            {
              detail: 0,
              format: 1, // bold
              mode: "normal",
              style: "",
              text: "🤖 AI-Powered Writing Assistant",
              type: "text",
              version: 1,
            },
          ],
          direction: "ltr",
          format: "",
          indent: 0,
          type: "heading",
          version: 1,
          tag: "h2",
        },
        // AI Features list
        {
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 1, // bold
                  mode: "normal",
                  style: "",
                  text: "Smart Writing: ",
                  type: "text",
                  version: 1,
                },
                {
                  detail: 0,
                  format: 0,
                  mode: "normal",
                  style: "",
                  text: "GPT-4 integration for content improvement, grammar fixes, and style adjustments",
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
                  format: 1, // bold
                  mode: "normal",
                  style: "",
                  text: "AI Chat: ",
                  type: "text",
                  version: 1,
                },
                {
                  detail: 0,
                  format: 0,
                  mode: "normal",
                  style: "",
                  text: "Ask questions about your document content and get contextual responses",
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
                  format: 1, // bold
                  mode: "normal",
                  style: "",
                  text: "Auto-completion: ",
                  type: "text",
                  version: 1,
                },
                {
                  detail: 0,
                  format: 0,
                  mode: "normal",
                  style: "",
                  text: "Intelligent text suggestions and completions",
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
            {
              children: [
                {
                  detail: 0,
                  format: 1, // bold
                  mode: "normal",
                  style: "",
                  text: "Content Enhancement: ",
                  type: "text",
                  version: 1,
                },
                {
                  detail: 0,
                  format: 0,
                  mode: "normal",
                  style: "",
                  text: "Make text longer/shorter, create step-by-step guides, simplify language",
                  type: "text",
                  version: 1,
                },
              ],
              direction: "ltr",
              format: "",
              indent: 0,
              type: "listitem",
              version: 1,
              value: 4,
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
        // Rich Text Editor section
        {
          children: [
            {
              detail: 0,
              format: 1, // bold
              mode: "normal",
              style: "",
              text: "✏️ Rich Text Editor",
              type: "text",
              version: 1,
            },
          ],
          direction: "ltr",
          format: "",
          indent: 0,
          type: "heading",
          version: 1,
          tag: "h2",
        },
        // Rich Text Features list
        {
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 1, // bold
                  mode: "normal",
                  style: "",
                  text: "Lexical Framework: ",
                  type: "text",
                  version: 1,
                },
                {
                  detail: 0,
                  format: 0,
                  mode: "normal",
                  style: "",
                  text: "Built on Facebook's modern Lexical editor framework",
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
                  format: 1, // bold
                  mode: "normal",
                  style: "",
                  text: "WYSIWYG Editing: ",
                  type: "text",
                  version: 1,
                },
                {
                  detail: 0,
                  format: 0,
                  mode: "normal",
                  style: "",
                  text: "What-you-see-is-what-you-get editing experience",
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
                  format: 1, // bold
                  mode: "normal",
                  style: "",
                  text: "Markdown Support: ",
                  type: "text",
                  version: 1,
                },
                {
                  detail: 0,
                  format: 0,
                  mode: "normal",
                  style: "",
                  text: "Full markdown shortcuts and live transformers",
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
            {
              children: [
                {
                  detail: 0,
                  format: 1, // bold
                  mode: "normal",
                  style: "",
                  text: "Slash Commands: ",
                  type: "text",
                  version: 1,
                },
                {
                  detail: 0,
                  format: 0,
                  mode: "normal",
                  style: "",
                  text: 'Type "/" for quick content insertion and formatting',
                  type: "text",
                  version: 1,
                },
              ],
              direction: "ltr",
              format: "",
              indent: 0,
              type: "listitem",
              version: 1,
              value: 4,
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
        // Advanced Content Blocks section
        {
          children: [
            {
              detail: 0,
              format: 1, // bold
              mode: "normal",
              style: "",
              text: "🧩 Advanced Content Blocks",
              type: "text",
              version: 1,
            },
          ],
          direction: "ltr",
          format: "",
          indent: 0,
          type: "heading",
          version: 1,
          tag: "h2",
        },
        // Content blocks description
        {
          children: [
            {
              detail: 0,
              format: 0,
              mode: "normal",
              style: "",
              text: "Notiq supports a comprehensive range of content blocks for creating rich, interactive documents:",
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
        // Content blocks categories
        {
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 1, // bold
                  mode: "normal",
                  style: "",
                  text: "Media: ",
                  type: "text",
                  version: 1,
                },
                {
                  detail: 0,
                  format: 0,
                  mode: "normal",
                  style: "",
                  text: "Images, inline images, YouTube videos, Twitter embeds",
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
                  format: 1, // bold
                  mode: "normal",
                  style: "",
                  text: "Interactive: ",
                  type: "text",
                  version: 1,
                },
                {
                  detail: 0,
                  format: 0,
                  mode: "normal",
                  style: "",
                  text: "Polls, step-by-step guides, collapsible sections",
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
                  format: 1, // bold
                  mode: "normal",
                  style: "",
                  text: "Design: ",
                  type: "text",
                  version: 1,
                },
                {
                  detail: 0,
                  format: 0,
                  mode: "normal",
                  style: "",
                  text: "Excalidraw drawings, Figma embeds",
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
            {
              children: [
                {
                  detail: 0,
                  format: 1, // bold
                  mode: "normal",
                  style: "",
                  text: "Layout: ",
                  type: "text",
                  version: 1,
                },
                {
                  detail: 0,
                  format: 0,
                  mode: "normal",
                  style: "",
                  text: "Multi-column layouts, resizable panels, tables",
                  type: "text",
                  version: 1,
                },
              ],
              direction: "ltr",
              format: "",
              indent: 0,
              type: "listitem",
              version: 1,
              value: 4,
            },
            {
              children: [
                {
                  detail: 0,
                  format: 1, // bold
                  mode: "normal",
                  style: "",
                  text: "Technical: ",
                  type: "text",
                  version: 1,
                },
                {
                  detail: 0,
                  format: 0,
                  mode: "normal",
                  style: "",
                  text: "Code blocks with syntax highlighting, mathematical equations (KaTeX)",
                  type: "text",
                  version: 1,
                },
              ],
              direction: "ltr",
              format: "",
              indent: 0,
              type: "listitem",
              version: 1,
              value: 5,
            },
            {
              children: [
                {
                  detail: 0,
                  format: 1, // bold
                  mode: "normal",
                  style: "",
                  text: "Callouts: ",
                  type: "text",
                  version: 1,
                },
                {
                  detail: 0,
                  format: 0,
                  mode: "normal",
                  style: "",
                  text: "Hint blocks and special callout sections",
                  type: "text",
                  version: 1,
                },
              ],
              direction: "ltr",
              format: "",
              indent: 0,
              type: "listitem",
              version: 1,
              value: 6,
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
        // User Experience section
        {
          children: [
            {
              detail: 0,
              format: 1, // bold
              mode: "normal",
              style: "",
              text: "🎨 User Experience",
              type: "text",
              version: 1,
            },
          ],
          direction: "ltr",
          format: "",
          indent: 0,
          type: "heading",
          version: 1,
          tag: "h2",
        },
        // UX Features list
        {
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 1, // bold
                  mode: "normal",
                  style: "",
                  text: "Drag & Drop: ",
                  type: "text",
                  version: 1,
                },
                {
                  detail: 0,
                  format: 0,
                  mode: "normal",
                  style: "",
                  text: "Draggable blocks and content reordering",
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
                  format: 1, // bold
                  mode: "normal",
                  style: "",
                  text: "Speech-to-Text: ",
                  type: "text",
                  version: 1,
                },
                {
                  detail: 0,
                  format: 0,
                  mode: "normal",
                  style: "",
                  text: "Voice input capabilities",
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
                  format: 1, // bold
                  mode: "normal",
                  style: "",
                  text: "Link Previews: ",
                  type: "text",
                  version: 1,
                },
                {
                  detail: 0,
                  format: 0,
                  mode: "normal",
                  style: "",
                  text: "Rich link previews with metadata",
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
            {
              children: [
                {
                  detail: 0,
                  format: 1, // bold
                  mode: "normal",
                  style: "",
                  text: "Theme Support: ",
                  type: "text",
                  version: 1,
                },
                {
                  detail: 0,
                  format: 0,
                  mode: "normal",
                  style: "",
                  text: "Dark/light mode with seamless switching",
                  type: "text",
                  version: 1,
                },
              ],
              direction: "ltr",
              format: "",
              indent: 0,
              type: "listitem",
              version: 1,
              value: 4,
            },
            {
              children: [
                {
                  detail: 0,
                  format: 1, // bold
                  mode: "normal",
                  style: "",
                  text: "Real-time Collaboration: ",
                  type: "text",
                  version: 1,
                },
                {
                  detail: 0,
                  format: 0,
                  mode: "normal",
                  style: "",
                  text: "Shared editing context and collaborative features",
                  type: "text",
                  version: 1,
                },
              ],
              direction: "ltr",
              format: "",
              indent: 0,
              type: "listitem",
              version: 1,
              value: 5,
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
        // Getting started section
        {
          children: [
            {
              detail: 0,
              format: 1, // bold
              mode: "normal",
              style: "",
              text: "Getting Started",
              type: "text",
              version: 1,
            },
          ],
          direction: "ltr",
          format: "",
          indent: 0,
          type: "heading",
          version: 1,
          tag: "h2",
        },
        {
          children: [
            {
              detail: 0,
              format: 0,
              mode: "normal",
              style: "",
              text: "Start typing to create content, or use ",
              type: "text",
              version: 1,
            },
            {
              detail: 0,
              format: 2, // italic
              mode: "normal",
              style: "",
              text: "slash commands",
              type: "text",
              version: 1,
            },
            {
              detail: 0,
              format: 0,
              mode: "normal",
              style: "",
              text: " by typing '/' to insert advanced content blocks, code snippets, equations, and more. Experience the power of AI-enhanced writing with intelligent suggestions and contextual assistance.",
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
        // Installation section
        {
          children: [
            {
              detail: 0,
              format: 1, // bold
              mode: "normal",
              style: "",
              text: "Installation",
              type: "text",
              version: 1,
            },
          ],
          direction: "ltr",
          format: "",
          indent: 0,
          type: "heading",
          version: 1,
          tag: "h3",
        },
        {
          children: [
            {
              detail: 0,
              format: 0,
              mode: "normal",
              style: "",
              text: "Clone the repository and start building with Notiq:",
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
        // Code block for installation
        {
          children: [
            {
              detail: 0,
              format: 0,
              mode: "normal",
              style:
                "font-family: 'Courier New', monospace; background-color: #f5f5f5; padding: 8px; border-radius: 4px;",
              text: "git clone https://github.com/chinonsochikelue/notiq",
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
        // Learn more section
        {
          children: [
            {
              detail: 0,
              format: 1, // bold
              mode: "normal",
              style: "",
              text: "Learn More",
              type: "text",
              version: 1,
            },
          ],
          direction: "ltr",
          format: "",
          indent: 0,
          type: "heading",
          version: 1,
          tag: "h3",
        },
        {
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: "normal",
                  style: "",
                  text: "⭐ Star us on GitHub",
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
                  format: 0,
                  mode: "normal",
                  style: "",
                  text: "📦 Install the NPM package",
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
                  format: 0,
                  mode: "normal",
                  style: "",
                  text: "🚀 Deploy your own to Vercel",
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
      ],
      type: "root",
      version: 1,
    },
  });

  // Auto-save simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLastSaved(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);


  return (
    <CollabProvider config={collabConfig}>
      <CommentsProvider>
        <VersionHistoryProvider>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-14 sm:h-16 items-center justify-between gap-2">
                  <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
                    <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
                      <Link href="/" className="flex items-center gap-1.5 sm:gap-2">
                        <div className="relative">
                          <div>
                            <img
                              src="/logo.png"
                              className="flex h-8 w-8 sm:h-10 sm:w-10"
                              alt="Notiq Logo"
                            />
                          </div>
                          {aiAssistantActive && (
                            <div className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-green-400 rounded-full animate-pulse"></div>
                          )}
                        </div>
                        <span className="text-base sm:text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                          Notiq
                        </span>
                      </Link>
                    </div>

                    <div className="hidden md:block h-6 w-px bg-slate-300 dark:bg-slate-600"></div>

                    <div className="hidden md:flex items-center space-x-3">
                      <input
                        type="text"
                        value={documentTitle}
                        onChange={(e) => setDocumentTitle(e.target.value)}
                        className="bg-transparent text-slate-900 dark:text-white font-medium text-lg border-none outline-none focus:bg-slate-100 dark:focus:bg-slate-800 px-2 py-1 rounded transition-colors"
                        placeholder="Document title..."
                      />
                    </div>
                  </div>

                  {/* Stats and Actions */}
                  <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
                    <CollaboratorsBar />
                    <ModeToggle />
                  </div>
                </div>
              </div>
            </header>

            <OfflineBanner />

            {/* Main Editor Area */}
            <main className="flex-1">
              <div className="container mx-auto max-w-6xl px-3 sm:px-6 md:px-8 py-4 sm:py-8 md:mt-2">
                <Editor
                  isEditable={true}
                  content={content}
                  aiConfig={{
                    apiEndpoint: "/api/ai",
                  }}
                  uploadConfig={uploadConfig}
                  collabConfig={collabConfig}
                  showCollaboratorsBar={false}
                />
              </div>
            </main>
          </div>
        </VersionHistoryProvider>
      </CommentsProvider>
    </CollabProvider>
  );
}
