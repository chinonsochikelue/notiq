"use client";

import React, { useState, useMemo } from "react";
import { useComments } from "../../../providers/CommentsContext";
import CommentThreadItem from "./CommentThreadItem";
import { Button } from "../../../ui/button";
import { Tabs, TabsList, TabsTrigger } from "../../../ui/tabs";
import { MessageSquare, X, Inbox, Search, Sparkles } from "lucide-react";
import { cn } from "../../../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function CommentsSidebar() {
  const {
    threads,
    activeThreadId,
    setActiveThreadId,
    isSidebarOpen,
    setIsSidebarOpen,
    unresolvedCount,
  } = useComments();

  const [filter, setFilter] = useState<"open" | "resolved" | "all">("open");
  const [searchQuery, setSearchQuery] = useState("");

  const openThreads = useMemo(() => threads.filter((t) => !t.resolved), [threads]);
  const resolvedThreads = useMemo(() => threads.filter((t) => t.resolved), [threads]);

  const baseThreads =
    filter === "open"
      ? openThreads
      : filter === "resolved"
      ? resolvedThreads
      : threads;

  // Filter by search query if any
  const displayedThreads = useMemo(() => {
    if (!searchQuery.trim()) return baseThreads;
    const clean = searchQuery.toLowerCase().trim();
    return baseThreads.filter((t) => {
      const matchQuote = t.quote?.toLowerCase().includes(clean);
      const matchAuthor = t.author?.name?.toLowerCase().includes(clean);
      const matchMessage = t.messages?.some((m) =>
        m.content?.toLowerCase().includes(clean) || m.author?.name?.toLowerCase().includes(clean)
      );
      return matchQuote || matchAuthor || matchMessage;
    });
  }, [baseThreads, searchQuery]);

  // Sort newest first
  const sortedThreads = useMemo(
    () => [...displayedThreads].sort((a, b) => b.createdAt - a.createdAt),
    [displayedThreads]
  );

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <>
          {/* Mobile Overlay Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-39 bg-black/40 backdrop-blur-2xs sm:hidden"
            aria-hidden="true"
          />

          <motion.aside
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className={cn(
              "fixed top-14 right-0 bottom-0 z-40 w-full sm:w-80 md:w-96 max-w-full",
              "border-l border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl",
              "flex flex-col select-none"
            )}
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <MessageSquare className="h-4 w-4 text-primary" />
                <span>Discussions & Comments</span>
                {unresolvedCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-primary text-primary-foreground">
                    {unresolvedCount}
                  </span>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(false)}
                className="h-7 w-7 p-0 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label="Close discussions sidebar"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="px-4 py-2 border-b border-border/40 bg-muted/20 space-y-2">
              <Tabs
                value={filter}
                onValueChange={(val) => setFilter(val as any)}
                className="w-full"
              >
                <TabsList className="grid grid-cols-3 h-7 text-xs p-0.5">
                  <TabsTrigger value="open" className="text-[11px] py-1 cursor-pointer">
                    Open ({openThreads.length})
                  </TabsTrigger>
                  <TabsTrigger value="resolved" className="text-[11px] py-1 cursor-pointer">
                    Resolved ({resolvedThreads.length})
                  </TabsTrigger>
                  <TabsTrigger value="all" className="text-[11px] py-1 cursor-pointer">
                    All ({threads.length})
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {threads.length > 2 && (
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search comments or @mentions..."
                    className="w-full pl-8 pr-7 py-1 text-xs rounded-md bg-background border border-border/70 placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Threads List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {sortedThreads.length > 0 ? (
                sortedThreads.map((thread) => (
                  <CommentThreadItem
                    key={thread.id}
                    thread={thread}
                    isActive={activeThreadId === thread.id}
                    onSelect={() => setActiveThreadId(thread.id)}
                  />
                ))
              ) : (
                <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-6 text-muted-foreground space-y-2.5">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shadow-2xs">
                    {searchQuery ? (
                      <Search className="h-5 w-5 text-muted-foreground/60" />
                    ) : (
                      <Inbox className="h-5 w-5 text-muted-foreground/60" />
                    )}
                  </div>
                  <p className="text-xs font-semibold text-foreground">
                    {searchQuery
                      ? `No discussions matching "${searchQuery}"`
                      : filter === "resolved"
                      ? "No resolved discussions yet"
                      : "All caught up! No open comments"}
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-normal max-w-[220px]">
                    {searchQuery
                      ? "Try searching for a different keyword, author, or quoted text."
                      : "Highlight any text in the document and press Ctrl+Alt+M (or click Comment in toolbar) to start a discussion."}
                  </p>
                  {!searchQuery && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 text-[10px] text-muted-foreground font-mono mt-1 border border-border/50">
                      <Sparkles className="h-3 w-3 text-primary" />
                      <span>Ctrl+Alt+M to comment</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
