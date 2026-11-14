import React from "react";
import { Link } from "react-router-dom";
import { Clock, Calendar, User, Tag } from "lucide-react";

export interface PostSummary {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  tags: string[];
  author: string;
  status: "draft" | "published";
  readingTimeMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export function PostCard({ post }: { post: PostSummary }) {
  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article className="group flex flex-col bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-zinc-950/50 transition-all duration-300 hover:-translate-y-1">
      {/* Cover image or gradient header */}
      <Link to={`/post/${post.slug}`} className="relative h-48 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        {post.coverImage ? (
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-emerald-500/20 via-teal-500/10 to-zinc-500/10 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-zinc-900 flex items-center justify-center p-6">
            <span className="text-zinc-400 dark:text-zinc-600 font-mono text-sm uppercase tracking-wider">
              {post.tags[0] || "Chronicle Story"}
            </span>
          </div>
        )}

        {post.status === "draft" && (
          <span className="absolute top-3 right-3 px-2 py-0.5 text-xs font-semibold rounded-md bg-amber-500/90 text-white backdrop-blur-sm shadow-sm">
            Draft
          </span>
        )}
      </Link>

      {/* Content */}
      <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between">
        <div>
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                >
                  <Tag className="w-2.5 h-2.5" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <Link to={`/post/${post.slug}`}>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
              {post.title}
            </h2>
          </Link>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
              {post.excerpt}
            </p>
          )}
        </div>

        {/* Metadata footer */}
        <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-1.5 font-medium">
            <User className="w-3.5 h-3.5 text-zinc-400" />
            <span className="truncate max-w-[120px]">{post.author}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              {post.readingTimeMinutes} min read
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
