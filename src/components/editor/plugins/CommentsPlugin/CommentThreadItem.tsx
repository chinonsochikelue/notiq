"use client";

import React, { useState, useRef, useMemo } from "react";
import {
  type CommentThread,
  useComments,
} from "../../../providers/CommentsContext";
import { useCollab } from "../../../providers/CollabContext";
import MentionsAutocomplete, {
  getMentionCandidates,
  type MentionItem,
} from "./MentionsAutocomplete";
import { Button } from "../../../ui/button";
import { Textarea } from "../../../ui/textarea";
import {
  Check,
  RotateCcw,
  Trash2,
  CornerDownRight,
  Send,
  MoreVertical,
  Crosshair,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../ui/dropdown-menu";
import { cn } from "../../../../lib/utils";

function formatRelativeTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function renderMessageContent(content: string) {
  // Split on @mentions
  const parts = content.split(/(@[A-Za-z0-9_\s-]+)/g);
  return parts.map((part, i) => {
    if (part.startsWith("@")) {
      const isEveryone = part.toLowerCase().includes("@everyone") || part.toLowerCase().includes("@all");
      return (
        <span
          key={i}
          className={cn(
            "inline-flex items-center px-1.5 py-0.2 mx-0.5 rounded-md font-semibold text-[11px] shadow-2xs font-mono",
            isEveryone
              ? "bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/20"
              : "bg-primary/10 text-primary dark:text-primary-foreground border border-primary/20"
          )}
        >
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function CommentThreadItem({
  thread,
  isActive,
  onSelect,
}: {
  thread: CommentThread;
  isActive: boolean;
  onSelect?: () => void;
}) {
  const { addReply, toggleResolveThread, deleteThread, jumpToQuote } = useComments();
  const { users } = useCollab();

  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionIndex, setMentionIndex] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const mentionCandidates = useMemo(
    () => (mentionQuery !== null ? getMentionCandidates(users, mentionQuery) : []),
    [users, mentionQuery]
  );

  const handleReplyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setReplyText(val);

    // Check for @mention trigger
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
    const textBeforeCursor = replyText.slice(0, cursorPos);
    const textAfterCursor = replyText.slice(cursorPos);

    const updatedBefore = textBeforeCursor.replace(/@([A-Za-z0-9_]*)$/, `@${item.name} `);
    setReplyText(updatedBefore + textAfterCursor);
    setMentionQuery(null);
    setMentionIndex(0);
    textareaRef.current.focus();
  };

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    addReply(thread.id, replyText);
    setReplyText("");
    setIsReplying(false);
    setMentionQuery(null);
    setMentionIndex(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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

    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmitReply(e);
    }
  };

  const handleCardClick = () => {
    onSelect?.();
    if (thread.quote) {
      jumpToQuote(thread.quote, thread.id);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        "rounded-xl border p-3.5 transition-all text-xs bg-card shadow-xs group cursor-pointer",
        isActive
          ? "border-primary ring-1 ring-primary/40 shadow-sm"
          : "border-border/60 hover:border-border/90",
        thread.resolved && "opacity-75 bg-muted/30"
      )}
    >
      {/* Thread Header */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-xs"
            style={{ backgroundColor: thread.author.color }}
          >
            {thread.author.name.slice(0, 1).toUpperCase()}
          </span>
          <span className="font-semibold text-foreground truncate">
            {thread.author.name}
          </span>
          <span className="text-[10px] text-muted-foreground shrink-0">
            {formatRelativeTime(thread.createdAt)}
          </span>
        </div>

        {/* Actions menu */}
        <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              toggleResolveThread(thread.id);
            }}
            className={cn(
              "h-6 px-1.5 text-[11px] gap-1 rounded-md cursor-pointer",
              thread.resolved
                ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
            title={thread.resolved ? "Reopen discussion" : "Resolve discussion"}
          >
            {thread.resolved ? (
              <>
                <RotateCcw className="h-3 w-3" />
                <span>Reopen</span>
              </>
            ) : (
              <>
                <Check className="h-3 w-3" />
                <span>Resolve</span>
              </>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-muted rounded-md text-muted-foreground cursor-pointer"
              >
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="text-xs">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  deleteThread(thread.id);
                }}
                className="text-destructive focus:text-destructive gap-1.5 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete thread
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Quoted highlighted text with Jump action */}
      {thread.quote && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            jumpToQuote(thread.quote, thread.id);
          }}
          className="w-full text-left relative mb-2.5 pl-2.5 py-1.5 pr-2 border-l-2 border-primary/60 bg-muted/40 hover:bg-muted/70 rounded-r-lg text-muted-foreground hover:text-foreground font-serif text-[11px] italic transition-all flex items-center justify-between group/quote cursor-pointer"
          title="Click to jump to quoted text in document"
        >
          <span className="line-clamp-2 flex-1">&ldquo;{thread.quote}&rdquo;</span>
          <span className="inline-flex items-center gap-1 text-[10px] text-primary font-sans font-medium not-italic opacity-70 group-hover/quote:opacity-100 ml-2 shrink-0">
            <Crosshair className="h-3 w-3" />
            <span className="hidden sm:inline">Jump</span>
          </span>
        </button>
      )}

      {/* Messages Stack */}
      <div className="space-y-2 mb-3">
        {thread.messages.map((msg, index) => (
          <div key={msg.id} className="space-y-0.5">
            {index > 0 && (
              <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground pt-1">
                <span
                  className="h-3.5 w-3.5 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0"
                  style={{ backgroundColor: msg.author.color }}
                >
                  {msg.author.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="font-semibold text-foreground/80">
                  {msg.author.name}
                </span>
                <span>•</span>
                <span>{formatRelativeTime(msg.createdAt)}</span>
              </div>
            )}
            <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap break-words pl-0.5">
              {renderMessageContent(msg.content)}
            </p>
          </div>
        ))}
      </div>

      {/* Reply input / button */}
      {!thread.resolved && (
        <>
          {isReplying ? (
            <form
              onSubmit={handleSubmitReply}
              onClick={(e) => e.stopPropagation()}
              className="relative mt-2"
            >
              <Textarea
                ref={textareaRef}
                value={replyText}
                onChange={handleReplyChange}
                onKeyDown={handleKeyDown}
                placeholder="Write a reply... (use @ to mention)"
                className="min-h-[58px] text-xs resize-none pr-14 py-1.5 rounded-lg border-border/80 focus-visible:ring-1"
                autoFocus
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

              <div className="flex items-center justify-end gap-1.5 mt-1.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsReplying(false)}
                  className="h-6 px-2 text-[11px]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!replyText.trim()}
                  className="h-6 px-2.5 text-[11px] gap-1 cursor-pointer"
                >
                  <Send className="h-2.5 w-2.5" />
                  Reply
                </Button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsReplying(true);
              }}
              className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground font-medium transition-colors pt-1 cursor-pointer"
            >
              <CornerDownRight className="h-3 w-3 text-muted-foreground/70" />
              Reply to thread...
            </button>
          )}
        </>
      )}
    </div>
  );
}
