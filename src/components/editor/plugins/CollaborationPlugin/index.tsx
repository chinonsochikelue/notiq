"use client";

// Silence duplicate Yjs constructor check warnings in Next.js development HMR
if (typeof globalThis !== "undefined") {
  (globalThis as any)["__ $YJS$ __"] = undefined;
}

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CollaborationPlugin as LexicalCollaborationPlugin } from "@lexical/react/LexicalCollaborationPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { CONNECTED_COMMAND } from "@lexical/yjs";
import { COMMAND_PRIORITY_LOW } from "lexical";
import {
  useCollab,
  type CollabUser,
  type CollabConnectionStatus,
} from "../../../providers/CollabContext";
import { WebsocketProvider } from "y-websocket";
import { IndexeddbPersistence } from "y-indexeddb";
import { Doc } from "yjs";
import type { InitialEditorStateType } from "@lexical/react/LexicalComposer";

// Properties that contain nested LexicalEditor instances, DOM references, or complex non-serializable objects
// MUST be excluded from Yjs attribute reflection to avoid infinite recursive markDirty loops and call stack exhaustion.
const COLLAB_EXCLUDED_PROPERTIES: Map<string, Set<string>> = new Map([
  ["stepper", new Set(["__steps"])],
  ["hint", new Set(["__caption"])],
  ["link-with-metadata", new Set(["__editor", "__metadata"])],
  ["poll", new Set(["__options"])],
  ["story-builder", new Set(["__nodes"])],
  ["dynamic-block", new Set(["__payload"])],
]);

interface CollaborationPluginWrapperProps {
  cursorsContainerRef?: React.RefObject<HTMLElement | null>;
  initialEditorState?: InitialEditorStateType;
}

function safeDisconnect(provider: WebsocketProvider | null) {
  if (!provider) return;
  try {
    const ws = provider.ws;
    if (ws) {
      if (ws.readyState === 0 /* CONNECTING */) {
        // If still in handshake, wait for open before closing to avoid browser error:
        // "WebSocket is closed before the connection is established"
        ws.onopen = () => {
          try {
            ws.close(1000, "Clean close");
          } catch {}
        };
        ws.onclose = null;
        ws.onerror = () => {};
        provider.ws = null;
        provider.wsconnecting = false;
        return;
      }
    }
    (provider as any).__rawDisconnect?.() ?? provider.destroy();
  } catch {
    // ignore
  }
}

export default function CollaborationPluginWrapper({
  cursorsContainerRef,
  initialEditorState,
}: CollaborationPluginWrapperProps) {
  const [editor] = useLexicalComposerContext();
  const {
    docId,
    serverUrl,
    username,
    cursorColor,
    avatar,
    offlinePersistence,
    setOfflineStorageStatus,
    setStatus,
    setUsers,
    setProvider,
    isOnline,
    setIsServerSynced,
    setPendingUpdatesCount,
    setLastSavedTimestamp,
    setReconnectCountdown,
  } = useCollab();

  const providerRef = useRef<WebsocketProvider | null>(null);
  const idbRef = useRef<IndexeddbPersistence | null>(null);
  const isUnmountedRef = useRef(false);
  const destroyTimerRef = useRef<NodeJS.Timeout | null>(null);

  // References to preserve stable callbacks without triggering unnecessary unmounts/reconnects
  const serverUrlRef = useRef(serverUrl);
  serverUrlRef.current = serverUrl;
  const setStatusRef = useRef(setStatus);
  setStatusRef.current = setStatus;
  const setProviderRef = useRef(setProvider);
  setProviderRef.current = setProvider;
  const offlinePersistenceRef = useRef(offlinePersistence);
  offlinePersistenceRef.current = offlinePersistence;
  const setOfflineStorageStatusRef = useRef(setOfflineStorageStatus);
  setOfflineStorageStatusRef.current = setOfflineStorageStatus;
  const setIsServerSyncedRef = useRef(setIsServerSynced);
  setIsServerSyncedRef.current = setIsServerSynced;
  const setPendingUpdatesCountRef = useRef(setPendingUpdatesCount);
  setPendingUpdatesCountRef.current = setPendingUpdatesCount;
  const setLastSavedTimestampRef = useRef(setLastSavedTimestamp);
  setLastSavedTimestampRef.current = setLastSavedTimestamp;
  const setReconnectCountdownRef = useRef(setReconnectCountdown);
  setReconnectCountdownRef.current = setReconnectCountdown;

  // Track component lifecycle to avoid Lexical's internal StrictMode double-mount cleanup permanently killing the socket
  useEffect(() => {
    isUnmountedRef.current = false;
    if (destroyTimerRef.current) {
      clearTimeout(destroyTimerRef.current);
      destroyTimerRef.current = null;
    }
    const ws = providerRef.current;
    if (ws && !ws.wsconnected && !ws.wsconnecting) {
      ws.connect();
    }
    return () => {
      isUnmountedRef.current = true;
      destroyTimerRef.current = setTimeout(() => {
        if (isUnmountedRef.current && providerRef.current) {
          safeDisconnect(providerRef.current);
          providerRef.current = null;
        }
      }, 150);
    };
  }, []);

  // Memoize awareness data so Lexical's internal useProvider effect does NOT continuously disconnect/reconnect
  const memoizedAwarenessData = useMemo(
    () => ({
      name: username,
      color: cursorColor,
      avatar,
    }),
    [username, cursorColor, avatar]
  );

  // Normalize initialEditorState so that plain objects are converted to strings for editor.parseEditorState()
  const normalizedInitialEditorState = useMemo(() => {
    if (!initialEditorState) return undefined;
    if (typeof initialEditorState === "string") return initialEditorState;
    if (typeof initialEditorState === "function") return initialEditorState;
    if (typeof (initialEditorState as any).isEmpty === "function") {
      return initialEditorState;
    }
    try {
      return JSON.stringify(initialEditorState);
    } catch {
      return undefined;
    }
  }, [initialEditorState]);

  const syncUsers = useCallback(
    (ws: WebsocketProvider) => {
      if (!ws.awareness) return;
      const states = ws.awareness.getStates();
      const currentClientId = ws.awareness.clientID;
      const userList: CollabUser[] = [];

      states.forEach((state: any, clientId: number) => {
        if (!state) return;

        const isSelf = clientId === currentClientId;
        const name =
          state.name ||
          state.awarenessData?.name ||
          (isSelf ? username : `Collaborator #${clientId.toString().slice(-4)}`);

        const color =
          state.color ||
          state.awarenessData?.color ||
          (isSelf ? cursorColor : "#3b82f6");

        const userAvatar = state.awarenessData?.avatar || state.avatar;
        const isTyping = Boolean(state.isTyping || state.awarenessData?.isTyping);

        userList.push({
          clientId,
          name,
          color,
          avatar: userAvatar,
          isTyping,
          isSelf,
        });
      });

      userList.sort((a, b) => (a.isSelf ? -1 : b.isSelf ? 1 : 0));
      setUsers((prev) => {
        if (
          prev.length === userList.length &&
          prev.every(
            (u, idx) =>
              u.clientId === userList[idx].clientId &&
              u.name === userList[idx].name &&
              u.color === userList[idx].color &&
              u.avatar === userList[idx].avatar &&
              u.isTyping === userList[idx].isTyping &&
              u.isSelf === userList[idx].isSelf
          )
        ) {
          return prev;
        }
        return userList;
      });
    },
    [username, cursorColor, avatar, setUsers]
  );

  const syncUsersRef = useRef(syncUsers);
  syncUsersRef.current = syncUsers;

  // Provider factory with 100% stable identity to avoid Lexical CollaborationPlugin teardown
  const providerFactory = useCallback(
    (id: string, yjsDocMap: Map<string, Doc>) => {
      let doc = yjsDocMap.get(id);
      if (!doc) {
        doc = new Doc();
        yjsDocMap.set(id, doc);
      }

      // Initialize IndexedDB offline persistence
      if (
        offlinePersistenceRef.current &&
        typeof window !== "undefined" &&
        "indexedDB" in window &&
        (!idbRef.current || (idbRef.current as any).name !== id)
      ) {
        try {
          if (idbRef.current) {
            idbRef.current.destroy();
          }
          const idb = new IndexeddbPersistence(id, doc);
          idbRef.current = idb;
          idb.on("synced", () => {
            setOfflineStorageStatusRef.current("synced");
            setLastSavedTimestampRef.current(Date.now());
          });
        } catch (e) {
          console.warn("[Notiq Collab] IndexedDB persistence unavailable:", e);
          setOfflineStorageStatusRef.current("error");
        }
      }

      // Reuse existing provider if room, doc, AND server URL match
      const currentServer = (providerRef.current as any)?.serverUrl;
      const isSameServer = currentServer === serverUrlRef.current;

      if (
        providerRef.current &&
        (providerRef.current as any).roomname === id &&
        (providerRef.current as any).doc === doc &&
        isSameServer
      ) {
        if (!providerRef.current.wsconnected && !providerRef.current.shouldConnect) {
          providerRef.current.connect();
        }
        return providerRef.current as any;
      }

      if (providerRef.current) {
        safeDisconnect(providerRef.current);
        providerRef.current = null;
      }

      if (!isSameServer && doc) {
        yjsDocMap.delete(id);
        doc = new Doc();
        yjsDocMap.set(id, doc);
      }

      const wsProvider = new WebsocketProvider(serverUrlRef.current, id, doc, {
        connect: true,
        resyncInterval: 10000, // Periodically request server sync every 10s
      });

      // Track WebSocket synchronization state
      wsProvider.on("sync", (isSynced: boolean) => {
        setIsServerSyncedRef.current(isSynced);
        if (isSynced) {
          setPendingUpdatesCountRef.current(0);
          setLastSavedTimestampRef.current(Date.now());
          setReconnectCountdownRef.current(null);
        }
      });

      // Track document update events for persistence & pending offline queue
      const handleDocUpdate = (_update: Uint8Array, origin: any) => {
        setLastSavedTimestampRef.current(Date.now());
        if (origin !== wsProvider && origin !== idbRef.current) {
          if (!wsProvider.wsconnected) {
            setPendingUpdatesCountRef.current((prev) => prev + 1);
          }
        }
      };
      doc.on("update", handleDocUpdate);

      // Neutralize y-websocket's faulty 30s inactivity watchdog.
      // y-websocket's built-in watchdog kills healthy connections if no data frames are received
      // for 30s (which happens whenever collaborators pause typing on public cloud servers).
      if ((wsProvider as any)._checkInterval) {
        clearInterval((wsProvider as any)._checkInterval);
        (wsProvider as any)._checkInterval = null;
      }
      (wsProvider as any).wsLastMessageReceived = Date.now();

      // Guard disconnect so Lexical's internal StrictMode double-mount cleanup does NOT kill the socket
      const rawDisconnect = wsProvider.disconnect.bind(wsProvider);
      (wsProvider as any).__rawDisconnect = rawDisconnect;
      wsProvider.disconnect = () => {
        if (isUnmountedRef.current) {
          safeDisconnect(wsProvider);
        }
      };

      providerRef.current = wsProvider;
      setProviderRef.current(wsProvider);

      const handleStatus = ({ status }: { status: string }) => {
        if (status === "connected") {
          setStatusRef.current("connected");
          syncUsersRef.current(wsProvider);
        } else if (status === "connecting") {
          setStatusRef.current("connecting");
        } else if (status === "disconnected") {
          setStatusRef.current("disconnected");
        }
      };

      wsProvider.on("status", handleStatus);
      wsProvider.awareness.on("change", () => syncUsersRef.current(wsProvider));

      if (wsProvider.wsconnected) {
        setStatusRef.current("connected");
        syncUsersRef.current(wsProvider);
      }

      return wsProvider as any;
    },
    [] // Empty deps ensures stable callback identity
  );

  // Monitor connection health & handle exponential countdown backoff
  useEffect(() => {
    let reconnectDelaySec = 4;
    let nextReconnectAt = 0;

    const interval = setInterval(() => {
      const ws = providerRef.current;
      if (!ws) return;

      if (!isOnline) {
        setStatus("offline");
        setReconnectCountdown(null);
        return;
      }

      if (ws.wsconnected) {
        setStatus((prev) => (prev !== "connected" ? "connected" : prev));
        syncUsers(ws);
        setReconnectCountdown(null);
        reconnectDelaySec = 4;
        nextReconnectAt = 0;
      } else if (ws.wsconnecting) {
        setStatus((prev) => (prev !== "connecting" ? "connecting" : prev));
        setReconnectCountdown(null);
      } else {
        // Disconnected from server
        setStatus((prev) => (prev !== "disconnected" ? "disconnected" : prev));

        const now = Date.now();
        if (!nextReconnectAt) {
          nextReconnectAt = now + reconnectDelaySec * 1000;
        }

        const remainingSec = Math.max(0, Math.ceil((nextReconnectAt - now) / 1000));
        setReconnectCountdown(remainingSec);

        if (remainingSec === 0) {
          if (!ws.shouldConnect) {
            ws.shouldConnect = true;
          }
          ws.connect();
          reconnectDelaySec = Math.min(16, Math.round(reconnectDelaySec * 1.5));
          nextReconnectAt = now + reconnectDelaySec * 1000;
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [setStatus, syncUsers, isOnline, setReconnectCountdown]);

  // Listen to Lexical's native CONNECTED_COMMAND
  useEffect(() => {
    return editor.registerCommand(
      CONNECTED_COMMAND,
      (isConnected: boolean) => {
        if (isConnected) {
          setStatus("connected");
          if (providerRef.current) {
            syncUsers(providerRef.current);
          }
        }
        return false;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor, setStatus, syncUsers]);

  // Sync awareness when user changes name or color in profile
  useEffect(() => {
    const ws = providerRef.current;
    if (!ws?.awareness) return;
    const currentLocalState = ws.awareness.getLocalState() || {};
    ws.awareness.setLocalState({
      ...currentLocalState,
      name: username,
      color: cursorColor,
      awarenessData: {
        ...(currentLocalState.awarenessData || {}),
        name: username,
        color: cursorColor,
        avatar,
      },
    });
  }, [username, cursorColor, avatar]);

  // Keep awareness presence alive so idle users do not become outdated (> 30s)
  useEffect(() => {
    const keepalive = setInterval(() => {
      const ws = providerRef.current;
      if (ws?.wsconnected) {
        // Guarantee y-websocket's watchdog is neutralized and timestamp stays fresh
        if ((ws as any)._checkInterval) {
          clearInterval((ws as any)._checkInterval);
          (ws as any)._checkInterval = null;
        }
        (ws as any).wsLastMessageReceived = Date.now();

        // Refresh awareness so remote peers do not prune user
        if (ws.awareness) {
          const localState = ws.awareness.getLocalState();
          if (localState) {
            ws.awareness.setLocalState({ ...localState });
          }
        }
      }
    }, 5000);

    return () => clearInterval(keepalive);
  }, []);

  // Broadcast typing presence with debounce
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    return editor.registerUpdateListener(({ dirtyElements, dirtyLeaves }) => {
      if (dirtyElements.size === 0 && dirtyLeaves.size === 0) return;
      const ws = providerRef.current;
      if (!ws?.awareness) return;

      const localState = ws.awareness.getLocalState();
      if (!localState?.isTyping) {
        ws.awareness.setLocalStateField("isTyping", true);
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        const activeWs = providerRef.current;
        if (activeWs?.awareness) {
          activeWs.awareness.setLocalStateField("isTyping", false);
        }
      }, 1500);
    });
  }, [editor]);

  return (
    <LexicalCollaborationPlugin
      key={`${docId}-${serverUrl}`}
      id={docId}
      providerFactory={providerFactory}
      shouldBootstrap={true}
      username={username}
      cursorColor={cursorColor}
      cursorsContainerRef={cursorsContainerRef as any}
      initialEditorState={normalizedInitialEditorState}
      awarenessData={memoizedAwarenessData}
      excludedProperties={COLLAB_EXCLUDED_PROPERTIES}
    />
  );
}
