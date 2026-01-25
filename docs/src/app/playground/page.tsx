"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { MoveLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Editor, ToolbarConfig } from "@collabchron/notiq";
import "@collabchron/notiq/styles.css";

// Dynamically import the Editor with SSR disabled
// const Editor = dynamic(() => import("@collabchron/notiq").then((mod) => mod.Editor), {
//     ssr: false,
//     loading: () => (
//         <div className="flex flex-col gap-4 p-8">
//             <Skeleton className="h-10 w-[60%] rounded-lg" />
//             <Skeleton className="h-32 w-full rounded-lg" />
//             <Skeleton className="h-64 w-full rounded-lg" />
//         </div>
//     ),
// });

export default function PlaygroundPage() {
    const [documentTitle, setDocumentTitle] = useState("Untilted Document");
    const [lastSaved, setLastSaved] = useState(new Date());

    // Auto-save simulation
    useEffect(() => {
        const interval = setInterval(() => {
            setLastSaved(new Date());
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const formatLastSaved = (date: Date) => {
        const now = new Date();
        const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
        if (diff < 60) return "Saved just now";
        if (diff < 3600) return `Saved ${Math.floor(diff / 60)}m ago`;
        return `Saved ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            {/* Header Section */}
            <header className="sticky top-0 z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm">
                <div className="px-6 py-2">
                    <div className="flex h-14 items-center justify-between">
                        <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-3">
                                <Link
                                    href="/"
                                    className="p-2 transition-all rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-500 hover:text-slate-900 dark:hover:text-white group"
                                    title="Back to Home"
                                >
                                    <MoveLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                </Link>
                                <div className="flex items-center gap-2 pr-4 border-r border-slate-200 dark:border-slate-800">
                                    <div className="relative">
                                        <img src="/logo.png" className="h-8 w-8 min-w-[32px]" alt="Notiq Logo" />
                                        <div className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-blue-500 rounded-full animate-pulse border-2 border-white dark:border-slate-900"></div>
                                    </div>
                                    <span className="hidden sm:inline text-lg font-black tracking-tighter bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                                        Notiq
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <input
                                    type="text"
                                    value={documentTitle}
                                    onChange={(e) => setDocumentTitle(e.target.value)}
                                    className="bg-transparent text-slate-900 dark:text-white font-bold text-base border-none outline-none focus:ring-0 w-48 md:w-64"
                                    placeholder="Document title..."
                                />
                                <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/5 border border-blue-500/10 text-[10px] text-blue-600 font-bold uppercase tracking-wider">
                                    <Sparkles className="w-2.5 h-2.5" />
                                    AI Enabled
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="hidden md:flex flex-col items-end mr-2">
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest leading-none mb-1">Status</span>
                                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 tabular-nums">
                                    {formatLastSaved(lastSaved)}
                                </span>
                            </div>

                            <div className="h-6 w-px bg-slate-200 dark:border-slate-800 mx-2" />

                            <ThemeToggle />

                            <Link
                                href="/docs"
                                className="px-5 py-2 text-sm font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full hover:scale-105 transition-all shadow-lg shadow-black/5 dark:shadow-white/5"
                            >
                                View Docs
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Interactive Workspace */}
            <main className="flex-1 overflow-hidden relative">
                <div className="absolute inset-0 p-4 md:p-8">
                    <div className="[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] max-w-5xl mx-auto h-full min-h-[calc(100vh-160px)] bg-white dark:bg-slate-900/50 rounded-2xl shadow-2xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-200/50 dark:border-slate-800/50 overflow-y-auto notiq-editor">
                        <Editor
                            isEditable={true}
                            toolbarConfig={{
                                className: "fixed top-18 z-30"
                            }}
                        />
                    </div>
                </div>
            </main>

            {/* Micro-Footer */}
            <footer className="px-6 py-2 border-t border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm text-[10px] text-slate-400 dark:text-slate-500 flex justify-between items-center font-medium tracking-tight">
                <div className="flex items-center gap-4">
                    <span>Notiq Editor Framework v1.0.7</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                    <span>Experimental Playground</span>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        <span>Connected to Gemini Pro</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span>Autosave Active</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300 dark:text-slate-700">
                        <span>Markdown Shortcuts</span>
                        <span>Ctrl+S to Force Save</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
