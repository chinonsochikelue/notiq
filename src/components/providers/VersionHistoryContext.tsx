"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  ReactNode,
} from "react";
import { useCollab } from "./CollabContext";
import { toast } from "sonner";
import type { SerializedEditorState } from "lexical";

export interface VersionAuthor {
  name: string;
  color: string;
  avatar?: string;
}

export interface DocumentVersion {
  id: string;
  title: string;
  timestamp: number;
  author: VersionAuthor;
  editorState: SerializedEditorState | any;
  wordCount: number;
  isNamed: boolean;
}

export interface VersionHistoryContextType {
  versions: DocumentVersion[];
  previewVersion: DocumentVersion | null;
  setPreviewVersion: (version: DocumentVersion | null) => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  toggleDrawer: () => void;
  isNameModalOpen: boolean;
  setIsNameModalOpen: (open: boolean) => void;
  createCheckpoint: (title?: string, customEditorState?: any, isNamed?: boolean) => string;
  restoreVersion: (version: DocumentVersion) => void;
  deleteVersion: (versionId: string) => void;
}

const VersionHistoryContext = createContext<VersionHistoryContextType | null>(null);

export const useVersionHistory = (): VersionHistoryContextType => {
  const context = useContext(VersionHistoryContext);
  if (!context) {
    throw new Error("useVersionHistory must be used within a VersionHistoryProvider");
  }
  return context;
};

const VersionHistoryProviderInternal = ({ children }: { children: ReactNode }) => {
  const { provider, username, cursorColor, avatar } = useCollab();
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [previewVersion, setPreviewVersion] = useState<DocumentVersion | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);

  // Sync versions array with Yjs doc.getArray('notiq-version-history')
  useEffect(() => {
    const doc = provider?.doc;
    if (!doc) return;

    const yVersions = doc.getArray<any>("notiq-version-history");

    const syncFromYjs = () => {
      try {
        const raw = yVersions.toArray();
        const parsed: DocumentVersion[] = raw.map((item: any) => {
          if (typeof item === "string") {
            try {
              return JSON.parse(item);
            } catch {
              return item;
            }
          }
          return item;
        });

        // Sort descending by timestamp (newest first)
        parsed.sort((a, b) => b.timestamp - a.timestamp);
        setVersions(parsed);
      } catch (err) {
        console.warn("[Notiq VersionHistory] Failed to parse versions:", err);
      }
    };

    syncFromYjs();
    yVersions.observeDeep(syncFromYjs);

    return () => {
      yVersions.unobserveDeep(syncFromYjs);
    };
  }, [provider?.doc]);

  const author: VersionAuthor = useMemo(
    () => ({
      name: username,
      color: cursorColor,
      avatar,
    }),
    [username, cursorColor, avatar]
  );

  const calculateWordCount = (editorState: any): number => {
    try {
      if (!editorState?.root?.children) return 0;
      let text = "";
      const walk = (node: any) => {
        if (node.text) text += " " + node.text;
        if (node.children) node.children.forEach(walk);
      };
      walk(editorState.root);
      const words = text.trim().split(/\s+/).filter(Boolean);
      return words.length;
    } catch {
      return 0;
    }
  };

  const createCheckpoint = useCallback(
    (
      title?: string,
      customEditorState?: any,
      isNamed = false
    ): string => {
      if (!customEditorState) return "";

      const versionId = `v-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const wordCount = calculateWordCount(customEditorState);

      const newVersion: DocumentVersion = {
        id: versionId,
        title: title?.trim() || `Revision by ${author.name}`,
        timestamp: Date.now(),
        author,
        editorState: customEditorState,
        wordCount,
        isNamed,
      };

      const doc = provider?.doc;
      if (doc) {
        const yVersions = doc.getArray<any>("notiq-version-history");
        doc.transact(() => {
          yVersions.push([JSON.stringify(newVersion)]);
        });
      } else {
        setVersions((prev) => [newVersion, ...prev]);
      }

      if (isNamed) {
        toast.success("Version saved", {
          description: `Snapshot "${newVersion.title}" created.`,
        });
      }

      return versionId;
    },
    [author, provider?.doc]
  );

  // Restore version callback - dispatched to Lexical via custom event
  const restoreVersion = useCallback(
    (version: DocumentVersion) => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("notiq:restore-version", {
            detail: version,
          })
        );
      }
      setPreviewVersion(null);
      setIsDrawerOpen(false);

      toast.success("Version restored", {
        description: `Document restored to "${version.title}".`,
      });
    },
    []
  );

  const deleteVersion = useCallback(
    (versionId: string) => {
      const doc = provider?.doc;
      if (doc) {
        const yVersions = doc.getArray<any>("notiq-version-history");
        doc.transact(() => {
          const raw = yVersions.toArray();
          const targetIndex = raw.findIndex((item: any) => {
            const parsed = typeof item === "string" ? JSON.parse(item) : item;
            return parsed.id === versionId;
          });
          if (targetIndex !== -1) {
            yVersions.delete(targetIndex, 1);
          }
        });
      } else {
        setVersions((prev) => prev.filter((v) => v.id !== versionId));
      }

      if (previewVersion?.id === versionId) {
        setPreviewVersion(null);
      }

      toast.info("Version snapshot deleted");
    },
    [previewVersion?.id, provider?.doc]
  );

  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen((prev) => !prev);
  }, []);

  const value = useMemo(
    () => ({
      versions,
      previewVersion,
      setPreviewVersion,
      isDrawerOpen,
      setIsDrawerOpen,
      toggleDrawer,
      isNameModalOpen,
      setIsNameModalOpen,
      createCheckpoint,
      restoreVersion,
      deleteVersion,
    }),
    [
      versions,
      previewVersion,
      isDrawerOpen,
      toggleDrawer,
      isNameModalOpen,
      createCheckpoint,
      restoreVersion,
      deleteVersion,
    ]
  );

  return (
    <VersionHistoryContext.Provider value={value}>
      {children}
    </VersionHistoryContext.Provider>
  );
};

export const VersionHistoryProvider = ({ children }: { children: ReactNode }) => {
  const existing = useContext(VersionHistoryContext);
  if (existing) {
    return <>{children}</>;
  }
  return <VersionHistoryProviderInternal>{children}</VersionHistoryProviderInternal>;
};
