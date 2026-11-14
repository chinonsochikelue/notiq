import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  Edit3,
  Trash2,
  Tag,
  Loader2,
  Share2,
  Check,
} from "lucide-react";
import { Editor } from "@collabchron/notiq";

interface PostDetailData {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  content: any;
  html?: string;
  markdown?: string;
  tags: string[];
  author: string;
  status: "draft" | "published";
  readingTimeMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export function PostDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<PostDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/posts/${slug}`);
        if (!res.ok) {
          throw new Error(
            res.status === 404 ? "Article not found" : "Failed to load article"
          );
        }
        const data = await res.json();
        setPost(data);
      } catch (err: any) {
        setError(err.message || "Failed to load post");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!post) return;
    if (!window.confirm(`Are you sure you want to delete "${post.title}"?`)) {
      return;
    }

    try {
      setDeleting(true);
      const res = await fetch(`/api/posts/${post._id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete post");
      navigate("/");
    } catch (err: any) {
      alert(err.message || "Could not delete post");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center gap-3 text-zinc-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-sm font-medium">Loading story...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          {error || "Post Not Found"}
        </h2>
        <p className="text-zinc-500 text-sm">
          The requested article may have been deleted or the URL is incorrect.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-500"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Feed</span>
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Top action bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Articles</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            title="Copy URL to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Share"}</span>
          </button>

          <Link
            to={`/edit/${post._id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white/90 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Post</span>
          </Link>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-950/70 border border-red-200 dark:border-red-900 transition-colors"
            title="Delete this post"
          >
            {deleting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      </div>

      {/* Article Header */}
      <header className="space-y-4 pt-2">
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        )}

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="text-lg text-zinc-600 dark:text-zinc-300 font-normal leading-relaxed">
            {post.excerpt}
          </p>
        )}

        <div className="pt-2 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <div className="flex items-center gap-2 font-medium text-zinc-800 dark:text-zinc-200">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs uppercase">
              {post.author.slice(0, 2)}
            </div>
            <span>{post.author}</span>
          </div>

          <span className="text-zinc-300 dark:text-zinc-700">•</span>

          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-zinc-400" />
            {formattedDate}
          </span>

          <span className="text-zinc-300 dark:text-zinc-700">•</span>

          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-zinc-400" />
            {post.readingTimeMinutes} min read
          </span>
        </div>
      </header>

      {/* Cover Image banner */}
      {post.coverImage && (
        <div className="rounded-2xl overflow-hidden shadow-lg border border-zinc-200/80 dark:border-zinc-800/80 aspect-[16/9] max-h-[480px]">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Post Body rendered with Notiq Editor (Read-Only Mode) */}
      <section className="pt-2">
        <div className="notiq-reader bg-transparent">
          <Editor
            isEditable={false}
            content={post.content}
            showCollaboratorsBar={false}
          />
        </div>
      </section>
    </article>
  );
}
