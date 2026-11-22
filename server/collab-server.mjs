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
import { fileURLToPath } from "node:url";

const PORT = parseInt(process.env.PORT || process.env.COLLAB_PORT || "4444", 10);
const HOST = process.env.COLLAB_HOST || "0.0.0.0";
const API_KEY = process.env.COLLAB_API_KEY || "";

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

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8").trim();
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload));
}

function isAuthorized(req) {
  if (!API_KEY) return true;
  const auth = req.headers["authorization"] || "";
  return auth === `Bearer ${API_KEY}`;
}

export async function handleHttpRequest(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url || "/", "http://localhost");
  const pathname = parsedUrl.pathname;

  if (pathname === "/health" || pathname === "/api/health") {
    let totalConnections = 0;
    rooms.forEach((r) => (totalConnections += r.conns.size));

    sendJson(res, 200, {
      status: "ok",
      service: "notiq-collab-server",
      uptime: Math.floor(process.uptime()),
      roomsCount: rooms.size,
      connectedClients: totalConnections,
      rooms: Array.from(rooms.keys()),
      timestamp: Date.now(),
    });
    return;
  }

  if (pathname.startsWith("/reset") || pathname.startsWith("/api/reset")) {
    if (!isAuthorized(req)) {
      sendJson(res, 401, { error: "Unauthorized" });
      return;
    }
    const roomParam = parsedUrl.searchParams.get("room");
    if (roomParam) {
      rooms.delete(roomParam);
      console.log(`[Notiq Collab] Room reset: "${roomParam}"`);
    } else {
      rooms.clear();
      console.log(`[Notiq Collab] All rooms cleared`);
    }
    sendJson(res, 200, { status: "cleared", room: roomParam || "all" });
    return;
  }

  // Headless Document REST API (/docs, /docs/:room, /api/docs, /api/docs/:room)
  const docMatch = pathname.match(/^\/(?:api\/)?docs(?:\/([^/]+))?$/);
  if (docMatch) {
    if (!isAuthorized(req)) {
      sendJson(res, 401, { error: "Unauthorized" });
      return;
    }

    const roomParam = docMatch[1] ? decodeURIComponent(docMatch[1]) : null;

    if (!roomParam && req.method === "GET") {
      const list = Array.from(rooms.values()).map((r) => ({
        name: r.name,
        createdAt: r.createdAt,
        connectedClients: r.conns.size,
        stateBytes: Y.encodeStateAsUpdate(r.doc).byteLength,
      }));
      sendJson(res, 200, { rooms: list, count: list.length });
      return;
    }

    if (roomParam && req.method === "GET") {
      const room = getOrCreateRoom(roomParam);
      const update = Y.encodeStateAsUpdate(room.doc);
      const metaMap = room.doc.getMap("metadata");
      const rootText = room.doc.get("root", Y.XmlText).toString();

      sendJson(res, 200, {
        room: room.name,
        createdAt: room.createdAt,
        connectedClients: room.conns.size,
        stateBase64: Buffer.from(update).toString("base64"),
        metadata: metaMap.toJSON(),
        rootXmlText: rootText,
      });
      return;
    }

    if (roomParam && (req.method === "POST" || req.method === "PUT")) {
      let body;
      try {
        body = await readJsonBody(req);
      } catch {
        sendJson(res, 400, { error: "Invalid JSON body" });
        return;
      }

      const room = getOrCreateRoom(roomParam);
      if (typeof body.updateBase64 === "string" && body.updateBase64.length > 0) {
        const updateBytes = new Uint8Array(Buffer.from(body.updateBase64, "base64"));
        Y.applyUpdate(room.doc, updateBytes, "rest-api");
      }
      if (body.metadata && typeof body.metadata === "object") {
        const metaMap = room.doc.getMap("metadata");
        room.doc.transact(() => {
          for (const [k, v] of Object.entries(body.metadata)) {
            metaMap.set(k, v);
          }
        }, "rest-api");
      }

      sendJson(res, 200, {
        status: "updated",
        room: room.name,
        metadata: room.doc.getMap("metadata").toJSON(),
        stateBytes: Y.encodeStateAsUpdate(room.doc).byteLength,
      });
      return;
    }

    if (roomParam && req.method === "DELETE") {
      const existed = rooms.delete(roomParam);
      sendJson(res, 200, { status: existed ? "deleted" : "not_found", room: roomParam });
      return;
    }

    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Notiq Collaboration Server is running. Connect via WebSocket (ws://...) or REST (/docs).\n");
}

// HTTP Server for health checks and Document REST API
const server = http.createServer((req, res) => {
  void handleHttpRequest(req, res);
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

heartbeatTimer.unref?.();

const isMainModule =
  process.argv[1] &&
  fileURLToPath(import.meta.url).toLowerCase() ===
    process.argv[1].toLowerCase();

if (isMainModule) {
  server.listen(PORT, HOST, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║   Notiq Real-Time Collaboration Server (Self-Hosted)      ║
║                                                            ║
║   WebSocket: ws://${HOST === "0.0.0.0" ? "localhost" : HOST}:${PORT}                            ║
║   Health API: http://localhost:${PORT}/health                  ║
║   Docs REST:  http://localhost:${PORT}/docs                    ║
║   Status: Ready for peer connections                       ║
╚════════════════════════════════════════════════════════════╝
`);
  });
}

export { rooms, getOrCreateRoom, server };
