"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { useCollab } from "./CollabContext";
import * as Y from "yjs";
import { toast } from "sonner";

export interface CommentAuthor {
  name: string;
  color: string;
  avatar?: string;
}

export interface CommentMessage {
  id: string;
  author: CommentAuthor;
  content: string;
  createdAt: number;
}

export interface CommentThread {
  id: string;
  quote: string;
  author: CommentAuthor;
  createdAt: number;
  resolved: boolean;
  messages: CommentMessage[];
}

export interface DraftComment {
  quote: string;
  isOpen: boolean;
  position?: { x: number; y: number };
}

export interface CommentsContextType {
  threads: CommentThread[];
  activeThreadId: string | null;
  setActiveThreadId: (id: string | null) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  unresolvedCount: number;
  draftComment: DraftComment | null;
  setDraftComment: (draft: DraftComment | null) => void;
  addThread: (quote: string, messageText: string) => string;
  addReply: (threadId: string, messageText: string) => void;
  toggleResolveThread: (threadId: string) => void;
  deleteThread: (threadId: string) => void;
  jumpToQuote: (quote: string, threadId: string) => void;
}

const CommentsContext = createContext<CommentsContextType | null>(null);

export const useComments = (): CommentsContextType => {
  const context = useContext(CommentsContext);
  if (!context) {
    throw new Error("useComments must be used within a CommentsProvider");
  }
  return context;
};

const CommentsProviderInternal = ({ children }: { children: ReactNode }) => {
  const { provider, username, cursorColor, avatar } = useCollab();
  const [threads, setThreads] = useState<CommentThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [draftComment, setDraftComment] = useState<DraftComment | null>(null);

  // Sync threads with Yjs doc.getArray('notiq-comments')
  useEffect(() => {
    const doc = provider?.doc;
    if (!doc) return;

    const yComments = doc.getArray<any>("notiq-comments");

    const syncThreadsFromYjs = () => {
      try {
        const rawList = yComments.toArray();
        const parsed: CommentThread[] = rawList.map((item: any) => {
          if (typeof item === "string") {
            try {
              return JSON.parse(item);
            } catch {
              return item;
            }
          }
          return item;
        });
        setThreads(parsed);
      } catch (err) {
        console.warn("[Notiq Comments] Failed to parse Yjs comments array:", err);
      }
    };

    // Initial read
    syncThreadsFromYjs();

    // Listen to changes from local & remote collaborators
    yComments.observeDeep(syncThreadsFromYjs);

    return () => {
      yComments.unobserveDeep(syncThreadsFromYjs);
    };
  }, [provider?.doc]);

  const author: CommentAuthor = useMemo(
    () => ({
      name: username,
      color: cursorColor,
      avatar,
    }),
    [username, cursorColor, avatar]
  );

  const addThread = useCallback(
    (quote: string, messageText: string): string => {
      const threadId = `comment-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const newThread: CommentThread = {
        id: threadId,
        quote: quote.trim(),
        author,
        createdAt: Date.now(),
        resolved: false,
        messages: [
          {
            id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            author,
            content: messageText.trim(),
            createdAt: Date.now(),
          },
        ],
      };

      const doc = provider?.doc;
      if (doc) {
        const yComments = doc.getArray<any>("notiq-comments");
        doc.transact(() => {
          yComments.push([JSON.stringify(newThread)]);
        });
      } else {
        // Fallback local state if collab provider not yet ready
        setThreads((prev) => [...prev, newThread]);
      }

      setActiveThreadId(threadId);
      setIsSidebarOpen(true);
      setDraftComment(null);

      toast.success("Comment added", {
        description: `Thread started on "${quote.slice(0, 30)}${quote.length > 30 ? "..." : ""}"`,
      });

      return threadId;
    },
    [author, provider?.doc]
  );

  const addReply = useCallback(
    (threadId: string, messageText: string) => {
      if (!messageText.trim()) return;

      const reply: CommentMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        author,
        content: messageText.trim(),
        createdAt: Date.now(),
      };

      const doc = provider?.doc;
      if (doc) {
        const yComments = doc.getArray<any>("notiq-comments");
        doc.transact(() => {
          const rawList = yComments.toArray();
          const targetIndex = rawList.findIndex((item: any) => {
            const thread = typeof item === "string" ? JSON.parse(item) : item;
            return thread.id === threadId;
          });

          if (targetIndex !== -1) {
            const currentThread =
              typeof rawList[targetIndex] === "string"
                ? JSON.parse(rawList[targetIndex])
                : rawList[targetIndex];
            const updatedThread: CommentThread = {
              ...currentThread,
              messages: [...(currentThread.messages || []), reply],
            };
            yComments.delete(targetIndex, 1);
            yComments.insert(targetIndex, [JSON.stringify(updatedThread)]);
          }
        });
      } else {
        setThreads((prev) =>
          prev.map((thread) =>
            thread.id === threadId
              ? { ...thread, messages: [...thread.messages, reply] }
              : thread
          )
        );
      }
    },
    [author, provider?.doc]
  );

  const toggleResolveThread = useCallback(
    (threadId: string) => {
      const doc = provider?.doc;
      if (doc) {
        const yComments = doc.getArray<any>("notiq-comments");
        doc.transact(() => {
          const rawList = yComments.toArray();
          const targetIndex = rawList.findIndex((item: any) => {
            const thread = typeof item === "string" ? JSON.parse(item) : item;
            return thread.id === threadId;
          });

          if (targetIndex !== -1) {
            const currentThread =
              typeof rawList[targetIndex] === "string"
                ? JSON.parse(rawList[targetIndex])
                : rawList[targetIndex];
            const updatedThread: CommentThread = {
              ...currentThread,
              resolved: !currentThread.resolved,
            };
            yComments.delete(targetIndex, 1);
            yComments.insert(targetIndex, [JSON.stringify(updatedThread)]);
          }
        });
      } else {
        setThreads((prev) =>
          prev.map((thread) =>
            thread.id === threadId ? { ...thread, resolved: !thread.resolved } : thread
          )
        );
      }
    },
    [provider?.doc]
  );

  const deleteThread = useCallback(
    (threadId: string) => {
      const doc = provider?.doc;
      if (doc) {
        const yComments = doc.getArray<any>("notiq-comments");
        doc.transact(() => {
          const rawList = yComments.toArray();
          const targetIndex = rawList.findIndex((item: any) => {
            const thread = typeof item === "string" ? JSON.parse(item) : item;
            return thread.id === threadId;
          });

          if (targetIndex !== -1) {
            yComments.delete(targetIndex, 1);
          }
        });
      } else {
        setThreads((prev) => prev.filter((t) => t.id !== threadId));
      }

      if (activeThreadId === threadId) {
        setActiveThreadId(null);
      }

      toast.info("Comment thread deleted");
    },
    [activeThreadId, provider?.doc]
  );

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const jumpToQuote = useCallback((quote: string, threadId: string) => {
    setActiveThreadId(threadId);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("notiq:jump-to-quote", {
          detail: { quote, threadId },
        })
      );
    }
  }, []);

  const unresolvedCount = useMemo(
    () => threads.filter((t) => !t.resolved).length,
    [threads]
  );

  const value = useMemo(
    () => ({
      threads,
      activeThreadId,
      setActiveThreadId,
      isSidebarOpen,
      setIsSidebarOpen,
      toggleSidebar,
      unresolvedCount,
      draftComment,
      setDraftComment,
      addThread,
      addReply,
      toggleResolveThread,
      deleteThread,
      jumpToQuote,
    }),
    [
      threads,
      activeThreadId,
      isSidebarOpen,
      toggleSidebar,
      unresolvedCount,
      draftComment,
      addThread,
      addReply,
      toggleResolveThread,
      deleteThread,
      jumpToQuote,
    ]
  );

  return <CommentsContext.Provider value={value}>{children}</CommentsContext.Provider>;
};

export const CommentsProvider = ({ children }: { children: ReactNode }) => {
  const existing = useContext(CommentsContext);
  if (existing) {
    return <>{children}</>;
  }
  return <CommentsProviderInternal>{children}</CommentsProviderInternal>;
};
