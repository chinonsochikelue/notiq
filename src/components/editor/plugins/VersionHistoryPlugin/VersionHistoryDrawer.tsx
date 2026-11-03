"use client";

import React from "react";
import {
  useVersionHistory,
  type DocumentVersion,
} from "../../../providers/VersionHistoryContext";
import { Button } from "../../../ui/button";
import {
  History,
  X,
  RotateCcw,
  Bookmark,
  Trash2,
  FileText,
  Clock,
  Sparkles,
} from "lucide-react";
import { cn } from "../../../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  const timeStr = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isToday) {
    return `Today at ${timeStr}`;
  }
  return `${date.toLocaleDateString([], { month: "short", day: "numeric" })} at ${timeStr}`;
}

function formatRelative(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function VersionHistoryDrawer() {
  const {
    versions,
    isDrawerOpen,
    setIsDrawerOpen,
    setIsNameModalOpen,
    restoreVersion,
    deleteVersion,
  } = useVersionHistory();

  if (!isDrawerOpen) return null;

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ x: 340, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 340, opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={cn(
          "fixed top-14 right-0 bottom-0 z-40 w-full sm:w-80 md:w-96 max-w-full",
          "border-l border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl",
          "flex flex-col select-none"
        )}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <History className="h-4 w-4 text-blue-500" />
            <span>Version History</span>
            <span className="text-xs text-muted-foreground font-normal">
              ({versions.length})
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDrawerOpen(false)}
            className="h-7 w-7 p-0 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Action Bar */}
        <div className="p-3 border-b border-border/40 bg-muted/20 flex items-center justify-between gap-2">
          <span className="text-[11px] text-muted-foreground">
            Snapshots & Restore Points
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsNameModalOpen(true)}
            className="h-7 text-xs gap-1.5 px-2.5 rounded-lg shadow-xs"
          >
            <Bookmark className="h-3.5 w-3.5 text-blue-500" />
            <span>Name current version</span>
          </Button>
        </div>

        {/* Versions Timeline List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {versions.length > 0 ? (
            versions.map((ver, idx) => (
              <div
                key={ver.id}
                className={cn(
                  "relative rounded-xl border p-3.5 text-xs bg-card transition-all space-y-2.5 group",
                  ver.isNamed
                    ? "border-blue-500/40 bg-blue-500/5 shadow-xs"
                    : "border-border/60 hover:border-border"
                )}
              >
                {/* Header info */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5 font-semibold text-foreground truncate">
                      {ver.isNamed && (
                        <Bookmark className="h-3 w-3 text-blue-500 shrink-0 fill-blue-500/20" />
                      )}
                      <span className="truncate">{ver.title}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" />
                        {formatTimestamp(ver.timestamp)}
                      </span>
                      <span>•</span>
                      <span>{formatRelative(ver.timestamp)}</span>
                    </div>
                  </div>

                  {idx === 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                      Current
                    </span>
                  )}
                </div>

                {/* Metadata: Author & Word count */}
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-3.5 w-3.5 rounded-full flex items-center justify-center text-[8px] font-bold text-white shadow-xs"
                      style={{ backgroundColor: ver.author.color }}
                    >
                      {ver.author.name.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="truncate max-w-[120px] font-medium text-foreground/80">
                      {ver.author.name}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono">
                    {ver.wordCount} words
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1.5 pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteVersion(ver.id)}
                    className="h-6 w-6 p-0 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-md opacity-80 group-hover:opacity-100 transition-opacity"
                    title="Delete snapshot"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => restoreVersion(ver)}
                    className="h-6 px-2.5 text-[11px] gap-1 rounded-md hover:bg-primary hover:text-primary-foreground transition-colors shadow-xs"
                  >
                    <RotateCcw className="h-2.5 w-2.5" />
                    Restore
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground space-y-2">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <History className="h-5 w-5 text-muted-foreground/60" />
              </div>
              <p className="text-xs font-medium text-foreground">
                No checkpoints yet
              </p>
              <p className="text-[11px] text-muted-foreground leading-normal max-w-[220px]">
                Click &ldquo;Name current version&rdquo; above to save a snapshot point anytime, or keep typing — revisions will be recorded automatically.
              </p>
            </div>
          )}
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
