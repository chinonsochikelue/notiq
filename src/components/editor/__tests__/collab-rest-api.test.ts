import { describe, it, expect, beforeEach } from "vitest";
import { EventEmitter } from "node:events";
import * as Y from "yjs";
import { handleHttpRequest, rooms } from "../../../../server/collab-server.mjs";

function createMockReq(method: string, url: string, body?: unknown) {
  const req = new EventEmitter() as EventEmitter & {
    method: string;
    url: string;
    headers: Record<string, string>;
  };
  req.method = method;
  req.url = url;
  req.headers = {};

  process.nextTick(() => {
    if (body !== undefined) {
      req.emit("data", Buffer.from(JSON.stringify(body), "utf8"));
    }
    req.emit("end");
  });

  return req;
}

function createMockRes() {
  let statusCode = 200;
  let body = "";
  const headers: Record<string, string> = {};

  return {
    setHeader(k: string, v: string) {
      headers[k] = v;
    },
    writeHead(code: number, h?: Record<string, string>) {
      statusCode = code;
      if (h) Object.assign(headers, h);
    },
    end(chunk?: string) {
      if (chunk) body += chunk;
    },
    get statusCode() {
      return statusCode;
    },
    json() {
      return JSON.parse(body);
    },
  };
}

describe("Notiq Collab Server Headless Document REST API", () => {
  beforeEach(() => {
    rooms.clear();
  });

  it("supports POST, GET, list, and DELETE for Yjs document rooms", async () => {
    const clientDoc = new Y.Doc();
    clientDoc.get("root", Y.XmlText).insert(0, "Hello from REST API");
    const updateBase64 = Buffer.from(Y.encodeStateAsUpdate(clientDoc)).toString(
      "base64"
    );

    const postRes = createMockRes();
    await handleHttpRequest(
      createMockReq("POST", "/docs/api-room-1", {
        updateBase64,
        metadata: { title: "API Spec", version: 1 },
      }) as never,
      postRes as never
    );
    expect(postRes.statusCode).toBe(200);
    expect(postRes.json().status).toBe("updated");
    expect(postRes.json().metadata).toEqual({ title: "API Spec", version: 1 });

    const getRes = createMockRes();
    await handleHttpRequest(
      createMockReq("GET", "/docs/api-room-1") as never,
      getRes as never
    );
    expect(getRes.statusCode).toBe(200);
    expect(getRes.json().rootXmlText).toContain("Hello from REST API");
    expect(typeof getRes.json().stateBase64).toBe("string");

    const listRes = createMockRes();
    await handleHttpRequest(
      createMockReq("GET", "/docs") as never,
      listRes as never
    );
    expect(listRes.statusCode).toBe(200);
    expect(listRes.json().count).toBe(1);
    expect(listRes.json().rooms[0].name).toBe("api-room-1");

    const delRes = createMockRes();
    await handleHttpRequest(
      createMockReq("DELETE", "/docs/api-room-1") as never,
      delRes as never
    );
    expect(delRes.statusCode).toBe(200);
    expect(delRes.json().status).toBe("deleted");
  });
});
