export interface DiagramNodeSpec {
  id: string;
  label: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color?: string;
}

export interface DiagramEdgeSpec {
  from: string;
  to: string;
  label?: string;
}

export interface DiagramSpec {
  nodes: DiagramNodeSpec[];
  edges?: DiagramEdgeSpec[];
}

function makeBaseElement(
  id: string,
  type: string,
  x: number,
  y: number,
  width: number,
  height: number
) {
  return {
    id,
    type,
    x,
    y,
    width,
    height,
    angle: 0,
    strokeColor: "#4f46e5",
    backgroundColor: "transparent",
    fillStyle: "solid",
    strokeWidth: 2,
    strokeStyle: "solid",
    roughness: 1,
    opacity: 100,
    groupIds: [],
    frameId: null,
    roundness: null,
    seed: Math.floor(Math.random() * 1_000_000) + 1,
    version: 1,
    versionNonce: Math.floor(Math.random() * 1_000_000) + 1,
    isDeleted: false,
    boundElements: null,
    updated: 1,
    link: null,
    locked: false,
  };
}

function extractLabelText(raw: Record<string, unknown>): string | null {
  if (typeof raw.label === "string" && raw.label.trim()) {
    return raw.label;
  }
  if (
    raw.label &&
    typeof raw.label === "object" &&
    typeof (raw.label as Record<string, unknown>).text === "string"
  ) {
    const t = ((raw.label as Record<string, unknown>).text as string).trim();
    return t || null;
  }
  return null;
}

/**
 * Normalizes partial / skeleton Excalidraw elements (e.g. LLM-generated rectangles
 * with `label` or arrows missing `points`/metadata) into valid Excalidraw elements
 * that `exportToSvg` and `ExcalidrawModal` can render reliably.
 */
export function normalizeExcalidrawElements(
  rawElements: unknown[]
): Record<string, unknown>[] {
  const result: Record<string, unknown>[] = [];
  const existingBoundContainers = new Set<string>();

  for (const item of rawElements) {
    if (item && typeof item === "object") {
      const rec = item as Record<string, unknown>;
      if (rec.type === "text" && typeof rec.containerId === "string") {
        existingBoundContainers.add(rec.containerId);
      }
    }
  }

  rawElements.forEach((item, idx) => {
    if (!item || typeof item !== "object") return;
    const raw = item as Record<string, unknown>;
    const type = typeof raw.type === "string" ? raw.type : "rectangle";
    const id = typeof raw.id === "string" && raw.id ? raw.id : `el-${idx}`;
    const x = typeof raw.x === "number" ? raw.x : 60 + (idx % 3) * 240;
    const y = typeof raw.y === "number" ? raw.y : 60 + Math.floor(idx / 3) * 140;
    const width =
      typeof raw.width === "number"
        ? raw.width
        : type === "arrow" || type === "line"
          ? 120
          : 180;
    const height =
      typeof raw.height === "number"
        ? raw.height
        : type === "arrow" || type === "line"
          ? 0
          : 64;

    const base = makeBaseElement(id, type, x, y, width, height);
    const { label: _ignoredLabel, ...restRaw } = raw;

    const normalized: Record<string, unknown> = {
      ...base,
      ...restRaw,
      id,
      type,
      x,
      y,
      width,
      height,
    };

    if (type === "rectangle" && normalized.roundness == null) {
      normalized.roundness = { type: 3 };
    }

    if (type === "text") {
      const textVal =
        typeof normalized.text === "string"
          ? normalized.text
          : extractLabelText(raw) || "";
      normalized.text = textVal;
      normalized.originalText =
        typeof normalized.originalText === "string"
          ? normalized.originalText
          : textVal;
      normalized.fontSize =
        typeof normalized.fontSize === "number" ? normalized.fontSize : 16;
      normalized.fontFamily =
        typeof normalized.fontFamily === "number" ? normalized.fontFamily : 1;
      normalized.textAlign = normalized.textAlign ?? "center";
      normalized.verticalAlign = normalized.verticalAlign ?? "middle";
      normalized.baseline =
        typeof normalized.baseline === "number" ? normalized.baseline : 18;
      if (!raw.strokeColor) {
        normalized.strokeColor = "#1e1b4b";
      }
      result.push(normalized);
      return;
    }

    if (type === "arrow" || type === "line") {
      if (!Array.isArray(normalized.points) || normalized.points.length < 2) {
        normalized.points = [
          [0, 0],
          [width || 120, height || 0],
        ];
      }
      if (normalized.startArrowhead === undefined) {
        normalized.startArrowhead = null;
      }
      if (normalized.endArrowhead === undefined) {
        normalized.endArrowhead = type === "arrow" ? "arrow" : null;
      }
      result.push(normalized);

      const labelText = extractLabelText(raw);
      if (labelText) {
        const pts = normalized.points as [number, number][];
        const lastPt = pts[pts.length - 1] || [width, height];
        const midX = x + lastPt[0] / 2 - 40;
        const midY = y + lastPt[1] / 2 - 20;
        result.push({
          ...makeBaseElement(`${id}-label`, "text", midX, midY, 80, 20),
          strokeColor: "#4338ca",
          text: labelText,
          fontSize: 13,
          fontFamily: 1,
          textAlign: "center",
          verticalAlign: "middle",
          baseline: 14,
          originalText: labelText,
        });
      }
      return;
    }

    const labelText = extractLabelText(raw);
    if (labelText && !existingBoundContainers.has(id)) {
      const textId = `${id}-text`;
      const existingBound = Array.isArray(normalized.boundElements)
        ? [...(normalized.boundElements as Record<string, unknown>[])]
        : [];
      existingBound.push({ id: textId, type: "text" });
      normalized.boundElements = existingBound;
      result.push(normalized);

      const textHeight = Math.max(24, labelText.split("\n").length * 22);
      result.push({
        ...makeBaseElement(
          textId,
          "text",
          x + 12,
          y + Math.max(8, (height - textHeight) / 2),
          Math.max(40, width - 24),
          textHeight
        ),
        strokeColor: "#1e1b4b",
        text: labelText,
        fontSize: 16,
        fontFamily: 1,
        textAlign: "center",
        verticalAlign: "middle",
        baseline: 18,
        containerId: id,
        originalText: labelText,
      });
      return;
    }

    result.push(normalized);
  });

  return result;
}

/**
 * Compiles either a raw Excalidraw elements array or a declarative `{ nodes, edges }`
 * diagram specification into a serialized Excalidraw elements JSON string.
 */
export function compileExcalidrawDiagram(rawJson: string): string | null {
  try {
    const parsed = JSON.parse(rawJson.trim());
    if (Array.isArray(parsed)) {
      if (parsed.length === 0) return null;
      return JSON.stringify({
        appState: { viewBackgroundColor: "#ffffff" },
        elements: normalizeExcalidrawElements(parsed),
        files: {},
      });
    }

    if (parsed && Array.isArray(parsed.elements)) {
      if (parsed.elements.length === 0) return null;
      return JSON.stringify({
        appState: parsed.appState || { viewBackgroundColor: "#ffffff" },
        elements: normalizeExcalidrawElements(parsed.elements),
        files: parsed.files || {},
      });
    }

    if (!parsed || !Array.isArray(parsed.nodes) || parsed.nodes.length === 0) {
      return null;
    }

    const spec = parsed as DiagramSpec;
    const elements: Record<string, unknown>[] = [];
    const nodeBoxMap = new Map<
      string,
      { x: number; y: number; width: number; height: number }
    >();

    spec.nodes.forEach((node, idx) => {
      const lines = node.label.split("\n");
      const maxLineLen = Math.max(...lines.map((l) => l.length), 1);
      const width =
        node.width ?? Math.max(160, Math.min(340, maxLineLen * 10 + 44));
      const textHeight = Math.max(24, lines.length * 22);
      const height = node.height ?? Math.max(64, lines.length * 24 + 28);
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const x = node.x ?? 60 + col * 360;
      const y = node.y ?? 60 + row * 155;
      const rectId = `node-rect-${idx}-${node.id}`;
      const textId = `node-text-${idx}-${node.id}`;

      nodeBoxMap.set(node.id, { x, y, width, height });

      elements.push({
        ...makeBaseElement(rectId, "rectangle", x, y, width, height),
        backgroundColor: node.color || "#eef2ff",
        roundness: { type: 3 },
        boundElements: [{ id: textId, type: "text" }],
      });

      elements.push({
        ...makeBaseElement(
          textId,
          "text",
          x + 12,
          y + Math.max(8, (height - textHeight) / 2),
          width - 24,
          textHeight
        ),
        strokeColor: "#1e1b4b",
        text: node.label,
        fontSize: 16,
        fontFamily: 1,
        textAlign: "center",
        verticalAlign: "middle",
        baseline: 18,
        containerId: rectId,
        originalText: node.label,
      });
    });

    (spec.edges || []).forEach((edge, idx) => {
      const fromBox = nodeBoxMap.get(edge.from);
      const toBox = nodeBoxMap.get(edge.to);
      if (!fromBox || !toBox) return;

      const fromCenterX = fromBox.x + fromBox.width / 2;
      const fromCenterY = fromBox.y + fromBox.height / 2;
      const toCenterX = toBox.x + toBox.width / 2;
      const toCenterY = toBox.y + toBox.height / 2;

      const horizontal =
        Math.abs(toCenterX - fromCenterX) >= Math.abs(toCenterY - fromCenterY);
      const startX = horizontal
        ? toCenterX >= fromCenterX
          ? fromBox.x + fromBox.width
          : fromBox.x
        : fromCenterX;
      const startY = horizontal
        ? fromCenterY
        : toCenterY >= fromCenterY
          ? fromBox.y + fromBox.height
          : fromBox.y;

      const endX = horizontal
        ? toCenterX >= fromCenterX
          ? toBox.x
          : toBox.x + toBox.width
        : toCenterX;
      const endY = horizontal
        ? toCenterY
        : toCenterY >= fromCenterY
          ? toBox.y
          : toBox.y + toBox.height;

      const dx = endX - startX;
      const dy = endY - startY;

      elements.push({
        ...makeBaseElement(
          `edge-${idx}`,
          "arrow",
          startX,
          startY,
          Math.abs(dx) || 1,
          Math.abs(dy) || 1
        ),
        strokeColor: "#6366f1",
        points: [
          [0, 0],
          [dx, dy],
        ],
        startArrowhead: null,
        endArrowhead: "arrow",
      });

      if (edge.label) {
        const midX = startX + dx / 2 - 40;
        const midY = startY + dy / 2 - 22;
        elements.push({
          ...makeBaseElement(`edge-label-${idx}`, "text", midX, midY, 80, 20),
          strokeColor: "#4338ca",
          text: edge.label,
          fontSize: 13,
          fontFamily: 1,
          textAlign: "center",
          verticalAlign: "middle",
          baseline: 14,
          originalText: edge.label,
        });
      }
    });

    return JSON.stringify({
      appState: { viewBackgroundColor: "#ffffff" },
      elements,
      files: {},
    });
  } catch {
    return null;
  }
}
