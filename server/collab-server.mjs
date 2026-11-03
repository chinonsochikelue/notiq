#!/usr/bin/env node
/**
 * Notiq Self-Hosted / Local Real-Time Collaboration Server
 *
 * Provides a private, zero-dependency, local Yjs WebSocket synchronization server
 * for Notiq documents, comments, awareness cursors, and version history.
 */

import { WebSocketServer } from "ws";
import * as http from "http";
import * as Y from "yjs";
import * as syncProtocol from "y-protocols/sync";
import * as awarenessProtocol from "y-protocols/awareness";
import * as encoding from "lib0/encoding";
import * as decoding from "lib0/decoding";

const PORT = parseInt(process.env.COLLAB_PORT || "4444", 10);
const HOST = process.env.COLLAB_HOST || "0.0.0.0";

const messageSync = 0;
const messageAwareness = 1;

/**
 * In-memory room store.
 * Each room has its own Y.Doc and Awareness instance.
 */
class Room {
  constructor(name) {
    this.name = name;
    this.doc = new Y.Doc();
    this.awareness = new awarenessProtocol.Awareness(this.doc);
    /** @type {Set<import('ws').WebSocket>} */
    this.conns = new Set();
    this.createdAt = Date.now();

    // Broadcast document updates to all connected peers in this room
    this.doc.on("update", (update, origin) => {
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageSync);
      syncProtocol.writeUpdate(encoder, update);
      const message = encoding.toUint8Array(encoder);

      this.conns.forEach((conn) => {
        if (conn !== origin && conn.readyState === 1) {
          conn.send(message);
        }
      });
    });

    // Broadcast awareness updates (cursor position, username, color)
    this.awareness.on("update", ({ added, updated, removed }, origin) => {
      const changedClients = added.concat(updated).concat(removed);
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageAwareness);
      encoding.writeVarUint8Array(
        encoder,
        awarenessProtocol.encodeAwarenessUpdate(this.awareness, changedClients)
      );
      const message = encoding.toUint8Array(encoder);

      this.conns.forEach((conn) => {
        if (conn !== origin && conn.readyState === 1) {
          conn.send(message);
        }
      });
    });
  }
}

/** @type {Map<string, Room>} */
const rooms = new Map();

function getOrCreateRoom(roomName) {
  let room = rooms.get(roomName);
  if (!room) {
    room = new Room(roomName);
    rooms.set(roomName, room);
    console.log(`[Notiq Collab] Room opened: "${roomName}"`);
  }
  return room;
}

// HTTP Server for health checks and status
const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url?.startsWith("/reset") || req.url?.startsWith("/api/reset")) {
    const url = new URL(req.url, "http://localhost");
    const roomParam = url.searchParams.get("room");
    if (roomParam) {
      rooms.delete(roomParam);
      console.log(`[Notiq Collab] Room reset: "${roomParam}"`);
    } else {
      rooms.clear();
      console.log(`[Notiq Collab] All rooms cleared`);
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "cleared", room: roomParam || "all" }));
    return;
  }

  if (req.url === "/health" || req.url === "/api/health") {
    let totalConnections = 0;
    rooms.forEach((r) => (totalConnections += r.conns.size));

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: "ok",
        service: "notiq-collab-server",
        uptime: Math.floor(process.uptime()),
        roomsCount: rooms.size,
        connectedClients: totalConnections,
        rooms: Array.from(rooms.keys()),
        timestamp: Date.now(),
      })
    );
    return;
  }

  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Notiq Collaboration Server is running. Connect via WebSocket (ws://...).\n");
});

const wss = new WebSocketServer({ server });

wss.on("connection", (conn, req) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  // Extract room name from path (/ws/:room or /:room or ?room=...)
  let roomName = url.searchParams.get("room");
  if (!roomName) {
    const segments = url.pathname.split("/").filter(Boolean);
    if (segments.length > 0) {
      roomName = segments[segments.length - 1];
    }
  }
  roomName = roomName || "notiq-default-room";

  const room = getOrCreateRoom(roomName);
  room.conns.add(conn);

  // Track client IDs controlled by this connection to clean up awareness on disconnect
  const controlledIds = new Set();
  const awarenessListener = ({ added }, origin) => {
    if (origin === conn) {
      added.forEach((id) => controlledIds.add(id));
    }
  };
  room.awareness.on("update", awarenessListener);

  // Send Sync Step 1
  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, messageSync);
  syncProtocol.writeSyncStep1(encoder, room.doc);
  conn.send(encoding.toUint8Array(encoder));

  // Send initial awareness states
  const awarenessStates = room.awareness.getStates();
  if (awarenessStates.size > 0) {
    const awarenessEncoder = encoding.createEncoder();
    encoding.writeVarUint(awarenessEncoder, messageAwareness);
    encoding.writeVarUint8Array(
      awarenessEncoder,
      awarenessProtocol.encodeAwarenessUpdate(
        room.awareness,
        Array.from(awarenessStates.keys())
      )
    );
    conn.send(encoding.toUint8Array(awarenessEncoder));
  }

  conn.on("message", (data) => {
    try {
      const buf = new Uint8Array(data);
      const decoder = decoding.createDecoder(buf);
      const messageType = decoding.readVarUint(decoder);

      switch (messageType) {
        case messageSync: {
          const replyEncoder = encoding.createEncoder();
          encoding.writeVarUint(replyEncoder, messageSync);
          syncProtocol.readSyncMessage(decoder, replyEncoder, room.doc, conn);
          if (encoding.length(replyEncoder) > 1) {
            conn.send(encoding.toUint8Array(replyEncoder));
          }
          break;
        }
        case messageAwareness: {
          const update = decoding.readVarUint8Array(decoder);
          awarenessProtocol.applyAwarenessUpdate(room.awareness, update, conn);
          break;
        }
        default:
          break;
      }
    } catch (err) {
      console.error("[Notiq Collab] Error processing message:", err);
    }
  });

  conn.on("close", () => {
    room.conns.delete(conn);
    room.awareness.off("update", awarenessListener);
    if (controlledIds.size > 0) {
      awarenessProtocol.removeAwarenessStates(
        room.awareness,
        Array.from(controlledIds),
        null
      );
    }
    if (room.conns.size === 0) {
      // Keep room in memory for reconnecting peers, or prune if inactive
      console.log(`[Notiq Collab] Room empty: "${roomName}"`);
    }
  });

  conn.on("error", (err) => {
    console.warn(`[Notiq Collab] Client socket error:`, err.message);
  });
});

// Periodic heartbeat to prevent y-websocket 30s inactivity timeout and keep TCP connections active
const HEARTBEAT_INTERVAL_MS = 10000; // 10 seconds

const heartbeatTimer = setInterval(() => {
  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, messageAwareness);
  // Empty awareness update [0] resets client provider.wsLastMessageReceived
  encoding.writeVarUint8Array(encoder, new Uint8Array([0]));
  const pingMessage = encoding.toUint8Array(encoder);

  rooms.forEach((room) => {
    room.conns.forEach((conn) => {
      if (conn.readyState === 1) {
        try {
          conn.send(pingMessage);
          conn.ping();
        } catch {
          // ignore closing sockets
        }
      }
    });
  });
}, HEARTBEAT_INTERVAL_MS);

heartbeatTimer.unref();

server.listen(PORT, HOST, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║   Notiq Real-Time Collaboration Server (Self-Hosted)      ║
║                                                            ║
║   WebSocket: ws://${HOST === "0.0.0.0" ? "localhost" : HOST}:${PORT}                            ║
║   Health API: http://localhost:${PORT}/health                  ║
║   Status: Ready for peer connections                       ║
╚════════════════════════════════════════════════════════════╝
`);
});
