import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { HomePage } from "./pages/Home";
import { PostDetailPage } from "./pages/PostDetail";
import { EditorPage } from "./pages/EditorPage";
import { ManagePostsPage } from "./pages/ManagePosts";

export default function App() {
  const location = useLocation();
  const isStudio = location.pathname.startsWith("/new") || location.pathname.startsWith("/edit");

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
      {!isStudio && <Navbar />}

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/post/:slug" element={<PostDetailPage />} />
          <Route path="/new" element={<EditorPage />} />
          <Route path="/edit/:id" element={<EditorPage />} />
          <Route path="/manage" element={<ManagePostsPage />} />
        </Routes>
      </main>

      {!isStudio && (
        <footer className="border-t border-zinc-200/80 dark:border-zinc-800/80 py-8 text-center text-xs text-zinc-500 dark:text-zinc-500 bg-white dark:bg-zinc-950 transition-colors">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p>
              Chronicle Blog — Built with{" "}
              <a
                href="https://github.com/CollabChronicles/notiq"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
              >
                @collabchron/notiq
              </a>
              , React 19, Vite, Express & MongoDB.
            </p>
            <p className="font-mono text-[11px] text-zinc-400">
              MERN Example Stack
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}
