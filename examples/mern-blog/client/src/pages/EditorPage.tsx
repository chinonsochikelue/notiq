import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Save,
  ArrowLeft,
  Loader2,
  Sparkles,
  Tag,
  Image as ImageIcon,
  User,
  SlidersHorizontal,
  CheckCircle,
  Sun,
  Moon,
} from "lucide-react";
import { NotiqEditor } from "@collabchron/notiq/react";
import type { NotiqEditor as INotiqEditor } from "@collabchron/notiq";

export function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showMeta, setShowMeta] = useState(false);

  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("theme") === "dark" ||
        (!("theme" in localStorage) &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
      );
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  // Form State
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [author, setAuthor] = useState("Chronicle Author");
  const [status, setStatus] = useState<"draft" | "published">("published");

  // Content state extracted from Notiq
  const [editorContent, setEditorContent] = useState<any>(null);
  const [editorHtml, setEditorHtml] = useState<string>("");
  const [editorMarkdown, setEditorMarkdown] = useState<string>("");
  const editorRef = useRef<INotiqEditor | null>(null);

  // Load existing post if editing
  useEffect(() => {
    if (!id) return;
    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/posts/${id}`);
        if (!res.ok) throw new Error("Could not find post to edit");
        const data = await res.json();

        setTitle(data.title || "");
        setExcerpt(data.excerpt || "");
        setCoverImage(data.coverImage || "");
        setTagsInput((data.tags || []).join(", "));
        setAuthor(data.author || "Anonymous");
        setStatus(data.status || "draft");
        setEditorContent(data.content);
        setEditorHtml(data.html || "");
        setEditorMarkdown(data.markdown || "");
      } catch (err: any) {
        alert(err.message || "Failed to load post");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, navigate]);

  const handleEditorReady = (editor: INotiqEditor) => {
    editorRef.current = editor;
  };

  const handleEditorUpdate = ({
    editor,
    json,
    html,
    markdown,
  }: {
    editor: INotiqEditor;
    json: any;
    html: string;
    markdown: string;
  }) => {
    setEditorContent(json);
    setEditorHtml(html);
    setEditorMarkdown(markdown);
  };

  const handleSave = async (targetStatus?: "draft" | "published") => {
    const finalStatus = targetStatus || status;

    // Extract JSON, HTML, and Markdown from editor instance if available
    const content =
      editorRef.current && typeof editorRef.current.getJSON === "function"
        ? editorRef.current.getJSON()
        : editorContent;
    const html =
      editorRef.current && typeof editorRef.current.getHTML === "function"
        ? editorRef.current.getHTML()
        : editorHtml;
    const markdown =
      editorRef.current && typeof editorRef.current.getMarkdown === "function"
        ? editorRef.current.getMarkdown()
        : editorMarkdown;

    // Auto-detect title from document canvas if title input was left blank
    let finalTitle = title.trim();
    if (!finalTitle && markdown) {
      const firstLine = markdown.split("\n").find((l: string) => l.trim().length > 0);
      if (firstLine) {
        finalTitle = firstLine.replace(/^#+\s*/, "").trim().slice(0, 100);
      }
    }
    if (!finalTitle) {
      finalTitle = "Untitled Story";
    }

    try {
      setSaving(true);
      setSaveSuccess(false);

      const tags = tagsInput
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const payload = {
        title: finalTitle,
        excerpt: excerpt.trim() || undefined,
        coverImage: coverImage.trim() || undefined,
        content,
        html,
        markdown,
        tags,
        author: author.trim() || "Anonymous",
        status: finalStatus,
      };

      const url = isEditing ? `/api/posts/${id}` : "/api/posts";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save post");
      }

      const savedPost = await res.json();
      setSaveSuccess(true);
      setStatus(finalStatus);

      // Redirect to post detail view after short delay
      setTimeout(() => {
        navigate(`/post/${savedPost.slug}`);
      }, 500);
    } catch (err: any) {
      alert(err.message || "An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center gap-3 text-zinc-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-sm font-medium">Preparing Notiq studio...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-24 transition-colors">
      {/* Unified Studio Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/95 dark:bg-zinc-950/95 border-b border-zinc-200 dark:border-zinc-800 h-16 flex items-center transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Articles</span>
            </Link>

            <span className="text-zinc-300 dark:text-zinc-700 hidden sm:inline">|</span>

            <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate max-w-[150px] sm:max-w-sm">
              {title.trim() || "Untitled Story"}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Status Selector */}
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setStatus("draft")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  status === "draft"
                    ? "bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-400 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
              >
                Draft
              </button>
              <button
                type="button"
                onClick={() => setStatus("published")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  status === "published"
                    ? "bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
              >
                Publish
              </button>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Toggle color theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Save Button */}
            <button
              onClick={() => handleSave()}
              disabled={saving}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold text-white shadow-sm transition-all ${
                saveSuccess
                  ? "bg-emerald-600"
                  : status === "published"
                  ? "bg-emerald-600 hover:bg-emerald-500"
                  : "bg-amber-600 hover:bg-amber-500"
              }`}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saveSuccess ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>
                {saving
                  ? "Saving..."
                  : saveSuccess
                  ? "Saved!"
                  : status === "published"
                  ? isEditing
                    ? "Update Post"
                    : "Publish Post"
                  : "Save Draft"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Studio Canvas */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        {/* Document Header Canvas (Notion / Medium Style) */}
        <div className="space-y-4">
          {/* Post Title Input */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled Story..."
            className="w-full text-3xl sm:text-5xl font-extrabold text-zinc-900 dark:text-zinc-50 bg-transparent border-0 outline-none focus:ring-0 placeholder:text-zinc-300 dark:placeholder:text-zinc-700 py-1"
          />

          {/* Quick Info & Drawer Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500 dark:text-zinc-400 pt-1 pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowMeta(!showMeta)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium transition-colors border border-zinc-200 dark:border-zinc-800"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{showMeta ? "Hide Article Metadata" : "Add Cover, Tags & Author"}</span>
              </button>

              {coverImage && (
                <span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
                  <ImageIcon className="w-3 h-3" />
                  Cover Added
                </span>
              )}
            </div>

            <div className="text-zinc-400 text-xs">
              Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-[10px] border border-zinc-300 dark:border-zinc-700">/</kbd> inside editor for commands
            </div>
          </div>

          {/* Collapsible Metadata Drawer */}
          {showMeta && (
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-4 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Short Summary / Excerpt
                </label>
                <textarea
                  rows={2}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="A brief 1-2 sentence hook for cards, social sharing, and search previews..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-800 dark:text-zinc-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Cover Image URL</span>
                  </label>
                  <input
                    type="text"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-800 dark:text-zinc-200"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Tags (comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="react, webdev, notiq, mern"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-800 dark:text-zinc-200"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>Author</span>
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Your Name"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-800 dark:text-zinc-200"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notiq Rich-Text Editor Canvas */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-md relative min-h-[600px]">
          <NotiqEditor
            content={editorContent}
            editable={true}
            showToolbar={true}
            placeholder="Write your article here, add headings, code blocks, tables, callouts..."
            onEditorReady={handleEditorReady}
            onUpdate={handleEditorUpdate}
            className="border-0 shadow-none rounded-none"
          />
        </div>
      </div>
    </div>
  );
}
