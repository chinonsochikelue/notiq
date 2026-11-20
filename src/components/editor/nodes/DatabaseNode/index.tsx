"use client";

import type {
  DOMExportOutput,
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from "lexical";
import { $applyNodeReplacement, DecoratorNode } from "lexical";
import * as React from "react";
import type { JSX } from "react";

const DatabaseComponent = React.lazy(() => import("./DatabaseComponent"));

export type DatabaseStatus = "todo" | "in_progress" | "done";
export type DatabasePriority = "low" | "medium" | "high";
export type DatabaseViewMode = "table" | "kanban";

export interface DatabaseRow {
  id: string;
  title: string;
  status: DatabaseStatus;
  priority: DatabasePriority;
  tag: string;
  dueDate: string;
}

export interface DatabasePayload {
  title?: string;
  view?: DatabaseViewMode;
  rows?: DatabaseRow[];
  key?: NodeKey;
}

export type SerializedDatabaseNode = Spread<
  {
    title: string;
    view: DatabaseViewMode;
    rows: DatabaseRow[];
  },
  SerializedLexicalNode
>;

export function createDefaultDatabaseRows(): DatabaseRow[] {
  return [
    {
      id: "row-1",
      title: "Draft project roadmap",
      status: "done",
      priority: "high",
      tag: "Planning",
      dueDate: "",
    },
    {
      id: "row-2",
      title: "Design collaborative UI",
      status: "in_progress",
      priority: "medium",
      tag: "Design",
      dueDate: "",
    },
    {
      id: "row-3",
      title: "Run end-to-end verification",
      status: "todo",
      priority: "high",
      tag: "QA",
      dueDate: "",
    },
  ];
}

export class DatabaseNode extends DecoratorNode<JSX.Element> {
  __title: string;
  __view: DatabaseViewMode;
  __rows: DatabaseRow[];

  static getType(): string {
    return "database";
  }

  static clone(node: DatabaseNode): DatabaseNode {
    return new DatabaseNode(
      node.__title,
      node.__view,
      node.__rows.map((r) => ({ ...r })),
      node.__key
    );
  }

  static importJSON(serializedNode: SerializedDatabaseNode): DatabaseNode {
    return $createDatabaseNode({
      title: serializedNode.title,
      view: serializedNode.view,
      rows: serializedNode.rows,
    });
  }

  constructor(
    title: string = "Project Tasks",
    view: DatabaseViewMode = "table",
    rows: DatabaseRow[] = createDefaultDatabaseRows(),
    key?: NodeKey
  ) {
    super(key);
    this.__title = title;
    this.__view = view;
    this.__rows = rows.map((r) => ({ ...r }));
  }

  exportJSON(): SerializedDatabaseNode {
    return {
      type: "database",
      version: 1,
      title: this.__title,
      view: this.__view,
      rows: this.__rows.map((r) => ({ ...r })),
    };
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const div = document.createElement("div");
    div.className = "my-4 notiq-database-node";
    return div;
  }

  updateDOM(): false {
    return false;
  }

  isInline(): false {
    return false;
  }

  exportDOM(): DOMExportOutput {
    const wrapper = document.createElement("div");
    wrapper.setAttribute("data-lexical-database", "true");
    const heading = document.createElement("h4");
    heading.textContent = this.__title;
    wrapper.appendChild(heading);

    const list = document.createElement("ul");
    for (const row of this.__rows) {
      const li = document.createElement("li");
      li.textContent = `[${row.status}] ${row.title} (${row.priority})`;
      list.appendChild(li);
    }
    wrapper.appendChild(list);
    return { element: wrapper };
  }

  setTitle(title: string): void {
    const writable = this.getWritable();
    writable.__title = title;
  }

  setView(view: DatabaseViewMode): void {
    const writable = this.getWritable();
    writable.__view = view;
  }

  setRows(rows: DatabaseRow[]): void {
    const writable = this.getWritable();
    writable.__rows = rows.map((r) => ({ ...r }));
  }

  addRow(row: DatabaseRow): void {
    const writable = this.getWritable();
    writable.__rows = [...writable.__rows, { ...row }];
  }

  updateRow(rowId: string, patch: Partial<DatabaseRow>): void {
    const writable = this.getWritable();
    writable.__rows = writable.__rows.map((r) =>
      r.id === rowId ? { ...r, ...patch } : r
    );
  }

  deleteRow(rowId: string): void {
    const writable = this.getWritable();
    writable.__rows = writable.__rows.filter((r) => r.id !== rowId);
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): JSX.Element {
    return (
      <React.Suspense
        fallback={
          <div className="my-4 h-40 w-full animate-pulse rounded-xl border border-border bg-muted/30" />
        }
      >
        <DatabaseComponent
          nodeKey={this.__key}
          title={this.__title}
          view={this.__view}
          rows={this.__rows}
        />
      </React.Suspense>
    );
  }
}

export function $createDatabaseNode(payload: DatabasePayload = {}): DatabaseNode {
  return $applyNodeReplacement(
    new DatabaseNode(
      payload.title ?? "Project Tasks",
      payload.view ?? "table",
      payload.rows ?? createDefaultDatabaseRows(),
      payload.key
    )
  );
}

export function $isDatabaseNode(
  node: LexicalNode | null | undefined
): node is DatabaseNode {
  return node instanceof DatabaseNode;
}
