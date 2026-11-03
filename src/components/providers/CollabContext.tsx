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
import type { WebsocketProvider } from "y-websocket";
import { toast } from "sonner";

export type CollabConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "offline";

export type SetStatusAction =
  | CollabConnectionStatus
  | ((prev: CollabConnectionStatus) => CollabConnectionStatus);

export interface CollabUser {
  clientId: number;
  name: string;
  color: string;
  avatar?: string;
  isTyping?: boolean;
  isSelf: boolean;
}

export interface CollabConfig {
  /**
   * Whether real-time collaboration is enabled.
   */
  enabled?: boolean;
  /**
   * Unique room / document identifier.
   */
  docId?: string;
  /**
   * WebSocket server URL. Defaults to "wss://demos.yjs.dev/ws".
   */
  serverUrl?: string;
  /**
   * Collaborator's display name.
   */
  username?: string;
  /**
   * Collaborator's cursor / highlight color.
   */
  cursorColor?: string;
  /**
   * Optional avatar URL or initials.
   */
  avatar?: string;
  /**
   * Whether to persist document locally in IndexedDB for offline editing. Defaults to true.
   */
  offlinePersistence?: boolean;
}

export type OfflineStorageStatus = "loading" | "synced" | "disabled" | "error";

export interface CollabContextType {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  toggleEnabled: () => void;
  status: CollabConnectionStatus;
  setStatus: (status: SetStatusAction) => void;
  users: CollabUser[];
  setUsers: React.Dispatch<React.SetStateAction<CollabUser[]>>;
  docId: string;
  setDocId: (docId: string) => void;
  serverUrl: string;
  setServerUrl: (serverUrl: string) => void;
  username: string;
  cursorColor: string;
  avatar?: string;
  offlinePersistence: boolean;
  offlineStorageStatus: OfflineStorageStatus;
  setOfflineStorageStatus: (status: OfflineStorageStatus) => void;
  isOnline: boolean;
  isServerSynced: boolean;
  setIsServerSynced: (synced: boolean) => void;
  pendingUpdatesCount: number;
  setPendingUpdatesCount: React.Dispatch<React.SetStateAction<number>>;
  lastSavedTimestamp: number | null;
  setLastSavedTimestamp: (timestamp: number | null) => void;
  reconnectCountdown: number | null;
  setReconnectCountdown: (countdown: number | null) => void;
  manualReconnect: () => void;
  clearLocalPersistence: () => Promise<void>;
  updateUser: (name: string, color?: string, avatar?: string) => void;
  provider: WebsocketProvider | null;
  setProvider: (provider: WebsocketProvider | null) => void;
}

export const COLLAB_SERVER_PRESETS = [
  { label: "Local Server (Self-Hosted: ws://localhost:4444)", url: "ws://localhost:4444" },
  { label: "Public Demo (Cloud: wss://demos.yjs.dev/ws)", url: "wss://demos.yjs.dev/ws" },
] as const;

export const DEFAULT_SERVER_URL = "ws://localhost:4444";
export const FALLBACK_SERVER_URL = "wss://demos.yjs.dev/ws";
export const DEFAULT_DOC_ID = "notiq-collab-room";

export const COLLAB_COLORS = [
  "#2563eb", // Royal Blue
  "#7c3aed", // Violet
  "#db2777", // Pink
  "#ea580c", // Orange
  "#16a34a", // Emerald Green
  "#0891b2", // Cyan
  "#d97706", // Amber
  "#4f46e5", // Indigo
  "#e11d48", // Rose
  "#0d9488", // Teal
];

const ANIMALS = [
  "Fox",
  "Falcon",
  "Otter",
  "Panda",
  "Koala",
  "Hawk",
  "Badger",
  "Lynx",
  "Tiger",
  "Wolf",
  "Dolphin",
  "Phoenix",
];

const ADJECTIVES = [
  "Swift",
  "Bright",
  "Cosmic",
  "Clever",
  "Calm",
  "Brave",
  "Silent",
  "Vivid",
  "Solar",
  "Lunar",
  "Noble",
  "Radiant",
];

function getRandomUser(): { name: string; color: string } {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const color = COLLAB_COLORS[Math.floor(Math.random() * COLLAB_COLORS.length)];
  return {
    name: `${adj} ${animal}`,
    color,
  };
}

const EMPTY_USERS: CollabUser[] = [];

const CollabContext = createContext<CollabContextType | null>(null);

export const useCollab = (): CollabContextType => {
  const context = useContext(CollabContext);
  if (!context) {
    throw new Error("useCollab must be used within a CollabProvider");
  }
  return context;
};

const CollabProviderInternal = ({
  config,
  children,
}: {
  config?: CollabConfig;
  children: ReactNode;
}) => {
  // Generate or restore user identity
  const [userProfile, setUserProfile] = useState<{
    name: string;
    color: string;
    avatar?: string;
  }>({
    name: "Collaborator",
    color: COLLAB_COLORS[0],
  });

  const [enabled, setEnabled] = useState<boolean>(() => config?.enabled ?? false);
  const [docId, setDocId] = useState<string>(() => config?.docId || DEFAULT_DOC_ID);
  const [serverUrl, setServerUrlState] = useState<string>(() => config?.serverUrl || DEFAULT_SERVER_URL);
  const [status, setStatusState] = useState<CollabConnectionStatus>(() =>
    config?.enabled ? "connecting" : "offline"
  );
  const [users, setUsers] = useState<CollabUser[]>([]);
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [offlineStorageStatus, setOfflineStorageStatus] = useState<OfflineStorageStatus>(
    () => (config?.offlinePersistence !== false ? "loading" : "disabled")
  );

  // Offline, persistence, and reconnect indicators
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.navigator.onLine : true
  );
  const [isServerSynced, setIsServerSynced] = useState<boolean>(false);
  const [pendingUpdatesCount, setPendingUpdatesCount] = useState<number>(0);
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<number | null>(null);
  const [reconnectCountdown, setReconnectCountdown] = useState<number | null>(null);

  // Monitor browser online and offline lifecycle events
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOffline = () => {
      setIsOnline(false);
      setStatusState("offline");
      toast.info("Network offline: Edits are being saved locally to IndexedDB.", {
        duration: 4000,
      });
    };

    const handleOnline = () => {
      setIsOnline(true);
      setStatusState("connecting");
      if (provider) {
        provider.connect();
      }
      toast.success("Network connection restored. Syncing with collaborators...", {
        duration: 3500,
      });
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, [provider]);

  const manualReconnect = useCallback(() => {
    setReconnectCountdown(null);
    setStatusState("connecting");
    if (provider) {
      if (!provider.shouldConnect) {
        provider.shouldConnect = true;
      }
      provider.connect();
      toast.loading("Reconnecting to collaboration server...", { duration: 1500 });
    }
  }, [provider]);

  const clearLocalPersistence = useCallback(async () => {
    try {
      if (typeof window !== "undefined" && "indexedDB" in window) {
        window.indexedDB.deleteDatabase(docId);
        setOfflineStorageStatus("synced");
        setPendingUpdatesCount(0);
        toast.success("Local document IndexedDB cache cleared.");
      }
    } catch (err) {
      console.error("[Notiq Collab] Failed to clear IndexedDB cache:", err);
      toast.error("Failed to clear local cache.");
    }
  }, [docId]);

  const hasUserSelectedServer = React.useRef(false);

  // Client-side hydration for profile and saved server
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem("notiq_collab_profile");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.name && parsed.color) {
            setUserProfile(parsed);
            return;
          }
        }
      } catch {}
      setUserProfile(getRandomUser());
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && !config?.serverUrl) {
      try {
        const saved = localStorage.getItem("notiq_collab_server_url");
        if (saved) setServerUrlState(saved);
      } catch {}
    }
  }, [config?.serverUrl]);

  const setServerUrl = useCallback((url: string) => {
    const cleanUrl = url.trim();
    if (!cleanUrl) return;
    hasUserSelectedServer.current = true;
    setServerUrlState(cleanUrl);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("notiq_collab_server_url", cleanUrl);
      } catch {}
    }
  }, []);

  const offlinePersistence = config?.offlinePersistence !== false;

  const setStatus = useCallback((action: SetStatusAction) => {
    setStatusState((prev) => {
      const next = typeof action === "function" ? action(prev) : action;
      return next === prev ? prev : next;
    });
  }, []);

  // Sync external config updates
  useEffect(() => {
    if (config?.enabled !== undefined) {
      setEnabled(config.enabled);
      setStatusState((prev) => {
        if (config.enabled) {
          return prev === "offline" || prev === "disconnected" ? "connecting" : prev;
        }
        return "offline";
      });
    }
    if (config?.docId) {
      setDocId(config.docId);
    }
    if (config?.serverUrl && !hasUserSelectedServer.current) {
      setServerUrlState(config.serverUrl);
    }
  }, [config?.enabled, config?.docId, config?.serverUrl]);

  const username = config?.username || userProfile.name;
  const cursorColor = config?.cursorColor || userProfile.color;
  const avatar = config?.avatar || userProfile.avatar;

  const updateUser = useCallback(
    (name: string, color?: string, newAvatar?: string) => {
      const updated = {
        name: name.trim() || userProfile.name,
        color: color || userProfile.color,
        avatar: newAvatar !== undefined ? newAvatar : userProfile.avatar,
      };
      setUserProfile(updated);

      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem("notiq_collab_profile", JSON.stringify(updated));
        } catch {
          // ignore
        }
      }

      // Propagate to active awareness if provider exists
      if (provider?.awareness) {
        provider.awareness.setLocalStateField("name", updated.name);
        if (updated.color) {
          provider.awareness.setLocalStateField("color", updated.color);
        }
        if (updated.avatar !== undefined) {
          provider.awareness.setLocalStateField("avatar", updated.avatar);
        }
        const currentData = provider.awareness.getLocalState()?.awarenessData || {};
        provider.awareness.setLocalStateField("awarenessData", {
          ...currentData,
          name: updated.name,
          color: updated.color,
          avatar: updated.avatar,
        });
      }
    },
    [provider, userProfile]
  );

  const toggleEnabled = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      setStatusState(next ? "connecting" : "offline");
      return next;
    });
  }, []);

  const value = useMemo<CollabContextType>(
    () => ({
      enabled,
      setEnabled,
      toggleEnabled,
      status: enabled ? status : "offline",
      setStatus,
      users: enabled ? users : EMPTY_USERS,
      setUsers,
      docId,
      setDocId,
      serverUrl,
      setServerUrl,
      username,
      cursorColor,
      avatar: config?.avatar,
      offlinePersistence,
      offlineStorageStatus,
      setOfflineStorageStatus,
      isOnline,
      isServerSynced,
      setIsServerSynced,
      pendingUpdatesCount,
      setPendingUpdatesCount,
      lastSavedTimestamp,
      setLastSavedTimestamp,
      reconnectCountdown,
      setReconnectCountdown,
      manualReconnect,
      clearLocalPersistence,
      updateUser,
      provider,
      setProvider,
    }),
    [
      enabled,
      toggleEnabled,
      status,
      setStatus,
      users,
      docId,
      serverUrl,
      setServerUrl,
      username,
      cursorColor,
      config?.avatar,
      offlinePersistence,
      offlineStorageStatus,
      isOnline,
      isServerSynced,
      pendingUpdatesCount,
      lastSavedTimestamp,
      reconnectCountdown,
      manualReconnect,
      clearLocalPersistence,
      updateUser,
      provider,
    ]
  );

  return (
    <CollabContext.Provider value={value}>{children}</CollabContext.Provider>
  );
};

export const CollabProvider = ({
  config,
  children,
}: {
  config?: CollabConfig;
  children: ReactNode;
}) => {
  const existing = useContext(CollabContext);
  if (existing) {
    return <>{children}</>;
  }
  return <CollabProviderInternal config={config}>{children}</CollabProviderInternal>;
};
