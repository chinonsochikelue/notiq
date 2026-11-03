"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Layers } from "lucide-react";

export default function PlaygroundRedirectPage() {
  useEffect(() => {
    // Attempt automatic navigation if hosted
    if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
      window.location.href = "https://notiq-editor.vercel.app/playground";
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-center">
      <div className="max-w-lg p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl space-y-6">
        <div className="size-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
          <Sparkles className="size-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            Playground Moved to Docs
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            The interactive Notiq playground has been integrated directly into the official Documentation site, featuring the Notion Document sandbox, Headless Framework inspector, and Infinite Spatial Canvas.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="https://notiq-editor.vercel.app/playground"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold text-sm shadow-md transition-all hover:scale-105"
          >
            Launch Docs Playground
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/framework"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium text-sm transition-all"
          >
            <Layers className="size-4" />
            Local Framework View
          </Link>
        </div>
      </div>
    </div>
  );
}
