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
import { ArrowLeft, Check, Copy, Share2, Shuffle } from "lucide-react";
import { cn } from "../../lib/utils";

export default function PlaygroundPage() {
  const [aiAssistantActive] = useState(false);
  const [documentTitle, setDocumentTitle] = useState("Untitled Document");
  const [lastSaved, setLastSaved] = useState(new Date());
  const [collabActive, setCollabActive] = useState(true);
  const [collabRoom, setCollabRoom] = useState("notiq-playground-demo");
  const [collabServer, setCollabServer] = useState<string | undefined>(undefined);
  const [roomMenuOpen, setRoomMenuOpen] = useState(false);
  const [roomDraft, setRoomDraft] = useState("notiq-playground-demo");
  const [copiedLink, setCopiedLink] = useState(false);
  const roomMenuRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRoomDraft(collabRoom);
  }, [collabRoom]);

  useEffect(() => {
    if (!roomMenuOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (roomMenuRef.current && !roomMenuRef.current.contains(event.target as Node)) {
        setRoomMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setRoomMenuOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [roomMenuOpen]);

  const applyRoom = React.useCallback(
    (nextRoom: string) => {
      const cleaned = nextRoom.trim();
      if (!cleaned) return;
      setCollabRoom(cleaned);
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("room", cleaned);
        window.history.replaceState({}, "", url.toString());
      }
      setRoomMenuOpen(false);
    },
    [],
  );

  const handleCopyInviteLink = React.useCallback(async () => {
    if (typeof window === "undefined") return;
    const url = new URL(`${window.location.origin}/collaboration`);
    url.searchParams.set("room", collabRoom);
    if (collabServer) {
      url.searchParams.set("server", collabServer);
    }
    try {
      await navigator.clipboard.writeText(url.toString());
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Fallback ignored if clipboard permission denied
    }
  }, [collabRoom, collabServer]);

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
              <div className="container mx-auto px-3 sm:px-6 lg:px-8">
                <div className="flex flex-wrap sm:flex-nowrap min-h-14 sm:h-16 items-center justify-between gap-x-2 gap-y-1.5 py-2 sm:py-0">
                  <div className="order-1 flex items-center gap-2 sm:gap-3 min-w-0">
                    <Link
                      href="https://collabchron.com.ng/"
                      className="flex items-center gap-1.5 sm:gap-2 shrink-0"
                    >
                      <div className="relative">
                        <img
                          src="/logo.png"
                          className="h-7 w-7 sm:h-9 sm:w-9"
                          alt="Notiq Logo"
                        />
                        {aiAssistantActive && (
                          <div className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-green-400 rounded-full animate-pulse" />
                        )}
                      </div>
                      <span className="text-base sm:text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                        Notiq
                      </span>
                    </Link>

                    <div className="hidden lg:block h-5 w-px bg-slate-300 dark:bg-slate-700" />

                    <input
                      type="text"
                      value={documentTitle}
                      onChange={(e) => setDocumentTitle(e.target.value)}
                      className="hidden lg:block w-44 xl:w-56 truncate bg-transparent text-slate-900 dark:text-white font-medium text-base border-none outline-none focus:bg-slate-100 dark:focus:bg-slate-800 px-2 py-1 rounded transition-colors"
                      placeholder="Document title..."
                    />
                  </div>

                  {/* Compact, responsive collaboration controls */}
                  <div className="contents sm:flex sm:items-center sm:gap-2 min-w-0">
                    <div className="order-2 sm:order-none ml-auto sm:ml-0 relative shrink-0" ref={roomMenuRef}>
                      <button
                        type="button"
                        onClick={() => setRoomMenuOpen((prev) => !prev)}
                        aria-label="Share or switch collaboration room"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 sm:px-2.5 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 shadow-xs transition-colors hover:bg-emerald-500/20"
                      >
                        <Share2 className="h-3.5 w-3.5 shrink-0" />
                        <span className="hidden md:inline max-w-[110px] truncate font-mono">
                          {collabRoom}
                        </span>
                      </button>

                      {roomMenuOpen && (
                        <div className="fixed sm:absolute left-3 right-3 sm:left-auto sm:right-0 top-16 sm:top-auto sm:mt-2 sm:w-80 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-xl z-50">
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Collaboration Room
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const randomId = `notiq-${Math.random().toString(36).slice(2, 8)}`;
                                  setRoomDraft(randomId);
                                  applyRoom(randomId);
                                }}
                                className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                              >
                                <Shuffle className="h-3 w-3" />
                                New Room
                              </button>
                            </div>

                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                applyRoom(roomDraft);
                              }}
                              className="flex items-center gap-2"
                            >
                              <input
                                type="text"
                                value={roomDraft}
                                onChange={(e) => setRoomDraft(e.target.value)}
                                placeholder="Enter room ID..."
                                className="min-w-0 flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/40"
                              />
                              <button
                                type="submit"
                                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-500"
                              >
                                Join
                              </button>
                            </form>

                            <button
                              type="button"
                              onClick={handleCopyInviteLink}
                              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              {copiedLink ? (
                                <>
                                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                                  <span>Invite link copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3.5 w-3.5" />
                                  <span>Copy Invite Link</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="order-5 sm:order-none basis-full sm:basis-auto flex justify-center border-t border-slate-200/40 dark:border-slate-800/40 pt-1.5 sm:border-t-0 sm:pt-0">
                      <CollaboratorsBar />
                    </div>

                    <Link
                      href="/"
                      aria-label="Back to Playground"
                      className="order-3 sm:order-none inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 px-2 sm:px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-xs transition-colors hover:bg-slate-100 dark:hover:bg-slate-700/80 shrink-0"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      <span className="hidden md:inline">Playground</span>
                    </Link>

                    <div className="order-4 sm:order-none shrink-0">
                      <ModeToggle />
                    </div>
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
