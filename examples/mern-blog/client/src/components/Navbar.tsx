import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { PenSquare, BookOpen, Sun, Moon, Sparkles, LayoutList } from "lucide-react";

export function Navbar() {
  const location = useLocation();
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

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/95 dark:bg-zinc-950/95 border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-zinc-900 dark:text-zinc-50">
              Chronicle
            </span>
            <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              Notiq MERN
            </span>
          </div>
        </Link>

        {/* Navigation Actions */}
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === "/"
                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Feed</span>
          </Link>

          <Link
            to="/manage"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === "/manage"
                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900"
            }`}
          >
            <LayoutList className="w-4 h-4" />
            <span className="hidden sm:inline">Manage</span>
          </Link>

          <Link
            to="/new"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm shadow-emerald-600/30 transition-all hover:shadow hover:shadow-emerald-600/40"
          >
            <PenSquare className="w-4 h-4" />
            <span>Write</span>
          </Link>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Toggle color theme"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </nav>
      </div>
    </header>
  );
}
