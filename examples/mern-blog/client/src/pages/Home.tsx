import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Sparkles, Plus, Loader2, RefreshCw } from "lucide-react";
import { PostCard, PostSummary } from "../components/PostCard";

export function HomePage() {
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (selectedTag) params.set("tag", selectedTag);

      const res = await fetch(`/api/posts?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Failed to load posts: ${res.statusText}`);
      }
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (err: any) {
      setError(err.message || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPosts();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedTag]);

  const handleSeed = async () => {
    try {
      setSeeding(true);
      const res = await fetch("/api/posts/seed", { method: "POST" });
      if (!res.ok) throw new Error("Failed to seed sample posts");
      await fetchPosts();
    } catch (err: any) {
      alert(err.message || "Could not seed posts");
    } finally {
      setSeeding(false);
    }
  };

  // Extract all unique tags
  const allTags = Array.from(new Set(posts.flatMap((p) => p.tags || [])));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Hero Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Powered by @collabchron/notiq & MERN Stack</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Stories, Ideas & Code Crafted with{" "}
          <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
            Notiq
          </span>
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
          A production-grade modern publication engine built with MongoDB, Express, React 19, Node.js, and the Notiq rich-text framework.
        </p>

        {/* Search & Actions Bar */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-xl mx-auto">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles by title or keyword..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            />
          </div>

          <button
            onClick={handleSeed}
            disabled={seeding}
            className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors"
            title="Seed demo articles showcasing Notiq rich text features"
          >
            {seeding ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            ) : (
              <RefreshCw className="w-4 h-4 text-emerald-600" />
            )}
            <span>Seed Samples</span>
          </button>
        </div>

        {/* Tag pills filter */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1.5 pt-2">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedTag === null
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedTag === tag
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Main Grid */}
      <section>
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-zinc-400">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <p className="text-sm font-medium">Loading published stories...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/20 rounded-2xl p-6 border border-red-200 dark:border-red-900">
            <p className="font-semibold">{error}</p>
            <p className="text-xs mt-1 text-zinc-500">
              Make sure the backend server is running at <code className="font-mono">http://localhost:5000</code>.
            </p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 p-8 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              No published stories found
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
              Get started by seeding sample posts created with Notiq or write your very first article from scratch.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleSeed}
                disabled={seeding}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm"
              >
                {seeding ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>Load Demo Articles</span>
              </button>
              <Link
                to="/new"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Post</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
