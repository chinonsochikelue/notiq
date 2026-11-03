"use client";

import React, { useState } from "react";
import { useVersionHistory } from "../../../providers/VersionHistoryContext";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Bookmark, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function NameVersionModal() {
  const [editor] = useLexicalComposerContext();
  const { isNameModalOpen, setIsNameModalOpen, createCheckpoint } = useVersionHistory();
  const [versionName, setVersionName] = useState("");

  if (!isNameModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!versionName.trim()) return;

    editor.getEditorState().read(() => {
      const json = editor.getEditorState().toJSON();
      createCheckpoint(versionName.trim(), json, true);
    });

    setVersionName("");
    setIsNameModalOpen(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/50 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.15 }}
          className="w-full max-w-sm rounded-2xl border border-border bg-card p-4 shadow-xl text-xs space-y-3"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-1 border-b border-border/50">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <Bookmark className="h-4 w-4 text-blue-500" />
              <span>Name Current Version</span>
            </div>
            <button
              type="button"
              onClick={() => setIsNameModalOpen(false)}
              className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="text-muted-foreground text-[11px] leading-relaxed">
            Create a labeled restore point in version history to easily revisit this state later.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="version-title" className="text-xs font-medium">
                Version Name
              </Label>
              <Input
                id="version-title"
                value={versionName}
                onChange={(e) => setVersionName(e.target.value)}
                placeholder="e.g. Final Proposal, Pre-review draft"
                maxLength={40}
                className="h-8 text-xs rounded-lg"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsNameModalOpen(false)}
                className="h-7 px-3 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={!versionName.trim()}
                className="h-7 px-3 text-xs gap-1.5"
              >
                <Check className="h-3 w-3" />
                Save Version
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
