"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useComments } from "../../../providers/CommentsContext";
import { useCollab } from "../../../providers/CollabContext";
import MentionsAutocomplete, {
  getMentionCandidates,
  type MentionItem,
} from "./MentionsAutocomplete";
import { Button } from "../../../ui/button";
import { Textarea } from "../../../ui/textarea";
import { MessageSquarePlus, X, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function NewCommentDialog() {
  const { draftComment, setDraftComment, addThread } = useComments();
  const { users, username, cursorColor } = useCollab();

  const [commentText, setCommentText] = useState("");
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionIndex, setMentionIndex] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const backdropRef = useRef<HTMLDivElement | null>(null);

  const mentionCandidates = useMemo(
    () => (mentionQuery !== null ? getMentionCandidates(users, mentionQuery) : []),
    [users, mentionQuery]
  );

  useEffect(() => {
    if (draftComment?.isOpen) {
      setCommentText("");
      setMentionQuery(null);
      setMentionIndex(0);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [draftComment?.isOpen]);

  if (!draftComment?.isOpen) return null;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCommentText(val);

    const cursorPos = e.target.selectionStart || 0;
    const textBeforeCursor = val.slice(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@([A-Za-z0-9_]*)$/);

    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
      setMentionIndex(0);
    } else {
      setMentionQuery(null);
    }
  };

  const handleSelectMention = (item: MentionItem) => {
    if (!textareaRef.current) return;
    const cursorPos = textareaRef.current.selectionStart || 0;
    const textBeforeCursor = commentText.slice(0, cursorPos);
    const textAfterCursor = commentText.slice(cursorPos);

    const updatedBefore = textBeforeCursor.replace(/@([A-Za-z0-9_]*)$/, `@${item.name} `);
    setCommentText(updatedBefore + textAfterCursor);
    setMentionQuery(null);
    setMentionIndex(0);
    textareaRef.current.focus();
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!commentText.trim()) return;
    addThread(draftComment.quote, commentText);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // If mentions autocomplete is active, intercept navigation keys
    if (mentionQuery !== null && mentionCandidates.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setMentionIndex((prev) => (prev + 1) % mentionCandidates.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setMentionIndex((prev) => (prev - 1 + mentionCandidates.length) % mentionCandidates.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        const candidate = mentionCandidates[mentionIndex] || mentionCandidates[0];
        if (candidate) {
          handleSelectMention(candidate);
        }
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setMentionQuery(null);
        return;
      }
    }

    // Submit on Ctrl+Enter or Cmd+Enter
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(e);
      return;
    }

    // Dismiss dialog on Escape when not mentioning
    if (e.key === "Escape" && mentionQuery === null) {
      e.preventDefault();
      setDraftComment(null);
    }
  };

  return (
    <AnimatePresence>
      <div
        ref={backdropRef}
        onClick={(e) => {
          if (e.target === backdropRef.current) {
            setDraftComment(null);
          }
        }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/50 backdrop-blur-xs"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.15 }}
          className="w-full max-w-md rounded-2xl border border-border bg-card p-4 shadow-xl text-xs space-y-3"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-1 border-b border-border/50">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <MessageSquarePlus className="h-4 w-4 text-primary" />
              <span>New Comment Discussion</span>
            </div>
            <button
              type="button"
              onClick={() => setDraftComment(null)}
              className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors cursor-pointer"
              aria-label="Close comment dialog"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Quoted highlighted context */}
          {draftComment.quote && (
            <div className="pl-3 py-1.5 border-l-2 border-primary bg-muted/40 rounded-r-lg text-muted-foreground italic line-clamp-3 font-serif">
              &ldquo;{draftComment.quote}&rdquo;
            </div>
          )}

          {/* Author indicator */}
          <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
            <span
              className="h-4 w-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-xs"
              style={{ backgroundColor: cursorColor }}
            >
              {username.slice(0, 1).toUpperCase()}
            </span>
            <span>
              Commenting as <strong className="text-foreground">{username}</strong>
            </span>
          </div>

          {/* Comment input form */}
          <form onSubmit={handleSubmit} className="relative space-y-3">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={commentText}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                placeholder="Write your thought... (Type @ to mention collaborators)"
                className="min-h-[85px] resize-none text-xs rounded-xl focus-visible:ring-1"
              />

              {mentionQuery !== null && (
                <MentionsAutocomplete
                  query={mentionQuery}
                  users={users}
                  selectedIndex={mentionIndex}
                  onHoverIndex={setMentionIndex}
                  onSelect={handleSelectMention}
                  className="bottom-full mb-1 left-0"
                />
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-muted-foreground">
                Tip: Press <kbd className="px-1 py-0.5 rounded bg-muted border border-border/80">Ctrl</kbd> + <kbd className="px-1 py-0.5 rounded bg-muted border border-border/80">Enter</kbd> to submit
              </span>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setDraftComment(null)}
                  className="h-7 px-3 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!commentText.trim()}
                  className="h-7 px-3 text-xs gap-1.5 shadow-xs"
                >
                  <Send className="h-3 w-3" />
                  Comment
                </Button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
