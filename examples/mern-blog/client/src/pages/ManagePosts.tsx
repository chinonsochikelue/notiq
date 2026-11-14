import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutList,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Loader2,
  RefreshCw,
  Tag,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { PostSummary } from "../components/PostCard";

export function ManagePostsPage() {
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/posts/all");
      if (!res.ok) throw new Error("Failed to load post list");
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (err: any) {
      setError(err.message || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleToggleStatus = async (post: PostSummary) => {
    const newStatus = post.status === "published" ? "draft" : "published";
    try {
      const res = await fetch(`/api/posts/${post._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Could not update status");
      await fetchPosts();
    } catch (err: any) {
      alert(err.message || "Failed to toggle status");
    }
  };

  const handleDelete = async (post: PostSummary) => {
    if (!window.confirm(`Delete post "${post.title}"?`)) return;
    try {
      const res = await fetch(`/api/posts/${post._id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Could not delete post");
      setPosts((prev) => prev.filter((p) => p._id !== post._id));
    } catch (err: any) {
      alert(err.message || "Failed to delete post");
    }
  };

  const handleSeed = async () => {
    try {
      setSeeding(true);
      const res = await fetch("/api/posts/seed", { method: "POST" });
      if (!res.ok) throw new Error("Failed to seed samples");
      await fetchPosts();
    } catch (err: any) {
      alert(err.message || "Error seeding samples");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 flex items-center gap-2.5">
            <LayoutList className="w-7 h-7 text-emerald-600" />
            <span>Manage Posts</span>
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Review drafts, toggle publication state, or edit articles written with Notiq.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors"
          >
            {seeding ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
            )}
            <span>Seed Samples</span>
          </button>

          <Link
            to="/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Post</span>
          </Link>
        </div>
      </div>

      {/* Posts Table */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3 text-zinc-400">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-sm font-medium">Fetching posts catalog...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 text-center font-medium text-sm">
          {error}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 p-8 space-y-4">
          <p className="text-zinc-500 text-sm">No articles in the database yet.</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={handleSeed}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white"
            >
              Seed Sample Posts
            </button>
            <Link
              to="/new"
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
            >
              Write First Post
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-xs uppercase font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Title & Slug</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Author</th>
                  <th className="py-3.5 px-4">Created</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {posts.map((post) => (
                  <tr
                    key={post._id}
                    className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {post.title}
                      </div>
                      <div className="text-xs text-zinc-400 font-mono mt-0.5">
                        /{post.slug}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleToggleStatus(post)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-opacity hover:opacity-80 ${
                          post.status === "published"
                            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                            : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                        }`}
                        title="Click to toggle status"
                      >
                        {post.status === "published" ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>Published</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                            <span>Draft</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="py-4 px-4 text-xs text-zinc-600 dark:text-zinc-300">
                      {post.author}
                    </td>

                    <td className="py-4 px-4 text-xs text-zinc-500 whitespace-nowrap">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          to={`/post/${post.slug}`}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          title="View post"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/edit/${post._id}`}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          title="Edit post in Notiq Studio"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(post)}
                          className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                          title="Delete post"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
