"use client";

import React, { useMemo, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalEditable } from "@lexical/react/useLexicalEditable";
import { $getNodeByKey, type NodeKey } from "lexical";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Kanban,
  Plus,
  Search,
  Table2,
  Trash2,
} from "lucide-react";
import { cn } from "../../../../lib/utils";
import {
  $isDatabaseNode,
  type DatabasePriority,
  type DatabaseRow,
  type DatabaseStatus,
  type DatabaseViewMode,
} from "./index";

export type DatabaseSortKey = "none" | "priority" | "title" | "dueDate";

const STATUS_META: Record<
  DatabaseStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  todo: {
    label: "To Do",
    badgeClass:
      "bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20",
    dotClass: "bg-slate-400",
  },
  in_progress: {
    label: "In Progress",
    badgeClass:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25",
    dotClass: "bg-blue-500",
  },
  done: {
    label: "Done",
    badgeClass:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
    dotClass: "bg-emerald-500",
  },
};

const PRIORITY_META: Record<
  DatabasePriority,
  { label: string; rank: number; badgeClass: string }
> = {
  high: {
    label: "High",
    rank: 3,
    badgeClass:
      "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25",
  },
  medium: {
    label: "Medium",
    rank: 2,
    badgeClass:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
  },
  low: {
    label: "Low",
    rank: 1,
    badgeClass:
      "bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20",
  },
};

const STATUS_ORDER: DatabaseStatus[] = ["todo", "in_progress", "done"];

export function filterAndSortDatabaseRows(
  rows: DatabaseRow[],
  options: {
    query?: string;
    statusFilter?: DatabaseStatus | "all";
    sortBy?: DatabaseSortKey;
  }
): DatabaseRow[] {
  const q = (options.query ?? "").trim().toLowerCase();
  const statusFilter = options.statusFilter ?? "all";
  const sortBy = options.sortBy ?? "none";

  const filtered = rows.filter((row) => {
    if (statusFilter !== "all" && row.status !== statusFilter) {
      return false;
    }
    if (!q) return true;
    return (
      row.title.toLowerCase().includes(q) ||
      row.tag.toLowerCase().includes(q) ||
      STATUS_META[row.status].label.toLowerCase().includes(q)
    );
  });

  if (sortBy === "none") return filtered;

  return [...filtered].sort((a, b) => {
    if (sortBy === "priority") {
      return PRIORITY_META[b.priority].rank - PRIORITY_META[a.priority].rank;
    }
    if (sortBy === "title") {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === "dueDate") {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    }
    return 0;
  });
}

function generateRowId(): string {
  return `row-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

export default function DatabaseComponent({
  nodeKey,
  title,
  view,
  rows,
}: {
  nodeKey: NodeKey;
  title: string;
  view: DatabaseViewMode;
  rows: DatabaseRow[];
}) {
  const [editor] = useLexicalComposerContext();
  const isEditable = useLexicalEditable();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<DatabaseStatus | "all">(
    "all"
  );
  const [sortBy, setSortBy] = useState<DatabaseSortKey>("none");
  const [draggedRowId, setDraggedRowId] = useState<string | null>(null);

  const visibleRows = useMemo(
    () =>
      filterAndSortDatabaseRows(rows, {
        query: searchQuery,
        statusFilter,
        sortBy,
      }),
    [rows, searchQuery, statusFilter, sortBy]
  );

  const updateNode = (
    updater: (node: NonNullable<ReturnType<typeof $getNodeByKey>>) => void
  ) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isDatabaseNode(node)) {
        updater(node);
      }
    });
  };

  const handleViewChange = (nextView: DatabaseViewMode) => {
    updateNode((node) => {
      if ($isDatabaseNode(node)) node.setView(nextView);
    });
  };

  const handleTitleChange = (nextTitle: string) => {
    if (!isEditable) return;
    updateNode((node) => {
      if ($isDatabaseNode(node)) node.setTitle(nextTitle);
    });
  };

  const handleAddRow = (status: DatabaseStatus = "todo") => {
    if (!isEditable) return;
    const newRow: DatabaseRow = {
      id: generateRowId(),
      title: "Untitled task",
      status,
      priority: "medium",
      tag: "General",
      dueDate: "",
    };
    updateNode((node) => {
      if ($isDatabaseNode(node)) node.addRow(newRow);
    });
  };

  const handleUpdateRow = (rowId: string, patch: Partial<DatabaseRow>) => {
    if (!isEditable) return;
    updateNode((node) => {
      if ($isDatabaseNode(node)) node.updateRow(rowId, patch);
    });
  };

  const handleDeleteRow = (rowId: string) => {
    if (!isEditable) return;
    updateNode((node) => {
      if ($isDatabaseNode(node)) node.deleteRow(rowId);
    });
  };

  const cycleSort = () => {
    const order: DatabaseSortKey[] = ["none", "priority", "title", "dueDate"];
    const next = order[(order.indexOf(sortBy) + 1) % order.length];
    setSortBy(next);
  };

  const sortLabel =
    sortBy === "none"
      ? "Sort"
      : sortBy === "priority"
        ? "Sort: Priority"
        : sortBy === "title"
          ? "Sort: Title"
          : "Sort: Due";

  return (
    <div
      contentEditable={false}
      className="my-4 w-full overflow-hidden rounded-2xl border border-border/80 bg-card/90 shadow-sm backdrop-blur-sm select-none"
    >
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 bg-muted/30 px-3.5 py-2.5">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <input
            type="text"
            value={title}
            readOnly={!isEditable}
            aria-label="Database title"
            onChange={(e) => handleTitleChange(e.target.value)}
            className="min-w-0 flex-1 max-w-[220px] truncate rounded-md bg-transparent px-1.5 py-0.5 text-sm font-semibold text-foreground outline-none focus:bg-background/80 focus:ring-1 focus:ring-ring"
          />
          <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
            {rows.length} {rows.length === 1 ? "item" : "items"}
          </span>
        </div>

        {/* Search, Filter, Sort & View Switcher */}
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter..."
              aria-label="Filter database rows"
              className="h-7 w-28 sm:w-36 rounded-lg border border-border/80 bg-background/80 pl-6 pr-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <select
            value={statusFilter}
            aria-label="Filter by status"
            onChange={(e) =>
              setStatusFilter(e.target.value as DatabaseStatus | "all")
            }
            className="h-7 rounded-lg border border-border/80 bg-background/80 px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>

          <button
            type="button"
            onClick={cycleSort}
            className={cn(
              "inline-flex h-7 items-center gap-1 rounded-lg border px-2 text-xs font-medium transition-colors cursor-pointer",
              sortBy !== "none"
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border/80 bg-background/80 text-muted-foreground hover:text-foreground"
            )}
          >
            <ArrowUpDown className="h-3 w-3" />
            <span>{sortLabel}</span>
          </button>

          {/* Table / Kanban Switcher */}
          <div
            role="tablist"
            aria-label="Database view"
            className="inline-flex h-7 items-center rounded-lg border border-border/80 bg-muted/50 p-0.5"
          >
            <button
              type="button"
              role="tab"
              aria-selected={view === "table"}
              onClick={() => handleViewChange("table")}
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium transition-colors cursor-pointer",
                view === "table"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Table2 className="h-3 w-3" />
              <span>Table</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === "kanban"}
              onClick={() => handleViewChange("kanban")}
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium transition-colors cursor-pointer",
                view === "kanban"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Kanban className="h-3 w-3" />
              <span>Kanban</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table View */}
      {view === "table" ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-border/60 bg-muted/20 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <th className="px-3.5 py-2">Task</th>
                <th className="px-3 py-2 w-32">Status</th>
                <th className="px-3 py-2 w-28">Priority</th>
                <th className="px-3 py-2 w-28">Tag</th>
                <th className="px-3 py-2 w-32">Due Date</th>
                {isEditable && <th className="px-2 py-2 w-10" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {visibleRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={isEditable ? 6 : 5}
                    className="px-4 py-6 text-center text-xs text-muted-foreground"
                  >
                    No matching tasks.
                  </td>
                </tr>
              ) : (
                visibleRows.map((row) => (
                  <tr
                    key={row.id}
                    className="group hover:bg-muted/25 transition-colors"
                  >
                    <td className="px-3.5 py-2">
                      <input
                        type="text"
                        value={row.title}
                        readOnly={!isEditable}
                        aria-label="Task title"
                        onChange={(e) =>
                          handleUpdateRow(row.id, { title: e.target.value })
                        }
                        className="w-full min-w-[160px] rounded bg-transparent px-1.5 py-1 text-xs font-medium text-foreground outline-none focus:bg-background focus:ring-1 focus:ring-ring"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={row.status}
                        disabled={!isEditable}
                        aria-label="Task status"
                        onChange={(e) =>
                          handleUpdateRow(row.id, {
                            status: e.target.value as DatabaseStatus,
                          })
                        }
                        className={cn(
                          "rounded-md border px-2 py-1 text-[11px] font-medium outline-none cursor-pointer",
                          STATUS_META[row.status].badgeClass
                        )}
                      >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={row.priority}
                        disabled={!isEditable}
                        aria-label="Task priority"
                        onChange={(e) =>
                          handleUpdateRow(row.id, {
                            priority: e.target.value as DatabasePriority,
                          })
                        }
                        className={cn(
                          "rounded-md border px-2 py-1 text-[11px] font-medium outline-none cursor-pointer",
                          PRIORITY_META[row.priority].badgeClass
                        )}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={row.tag}
                        readOnly={!isEditable}
                        aria-label="Task tag"
                        onChange={(e) =>
                          handleUpdateRow(row.id, { tag: e.target.value })
                        }
                        className="w-24 rounded-md border border-border/60 bg-muted/30 px-2 py-1 text-[11px] text-foreground outline-none focus:bg-background focus:ring-1 focus:ring-ring"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="date"
                        value={row.dueDate}
                        readOnly={!isEditable}
                        aria-label="Due date"
                        onChange={(e) =>
                          handleUpdateRow(row.id, { dueDate: e.target.value })
                        }
                        className="rounded-md border border-border/60 bg-background/60 px-2 py-1 text-[11px] text-muted-foreground outline-none focus:text-foreground focus:ring-1 focus:ring-ring"
                      />
                    </td>
                    {isEditable && (
                      <td className="px-2 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(row.id)}
                          aria-label={`Delete ${row.title}`}
                          className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {isEditable && (
            <div className="border-t border-border/50 px-3.5 py-2">
              <button
                type="button"
                onClick={() => handleAddRow("todo")}
                className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>New Row</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Kanban View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 bg-muted/10">
          {STATUS_ORDER.map((colStatus, colIndex) => {
            const meta = STATUS_META[colStatus];
            const colRows = visibleRows.filter((r) => r.status === colStatus);

            return (
              <div
                key={colStatus}
                onDragOver={(e) => {
                  if (isEditable && draggedRowId) e.preventDefault();
                }}
                onDrop={(e) => {
                  if (!isEditable || !draggedRowId) return;
                  e.preventDefault();
                  handleUpdateRow(draggedRowId, { status: colStatus });
                  setDraggedRowId(null);
                }}
                className="flex flex-col rounded-xl border border-border/70 bg-background/60 p-2.5 min-h-[160px]"
              >
                <div className="mb-2.5 flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn("h-2 w-2 rounded-full", meta.dotClass)}
                    />
                    <span className="text-xs font-semibold text-foreground">
                      {meta.label}
                    </span>
                  </div>
                  <span className="rounded-full bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                    {colRows.length}
                  </span>
                </div>

                <div className="flex-1 space-y-2">
                  {colRows.map((row) => (
                    <div
                      key={row.id}
                      draggable={isEditable}
                      onDragStart={() => setDraggedRowId(row.id)}
                      onDragEnd={() => setDraggedRowId(null)}
                      className={cn(
                        "group rounded-lg border border-border/80 bg-card p-2.5 shadow-xs transition-all hover:border-primary/40",
                        isEditable && "cursor-grab active:cursor-grabbing"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <input
                          type="text"
                          value={row.title}
                          readOnly={!isEditable}
                          aria-label="Card title"
                          onChange={(e) =>
                            handleUpdateRow(row.id, { title: e.target.value })
                          }
                          className="w-full rounded bg-transparent px-1 py-0.5 text-xs font-medium text-foreground outline-none focus:bg-muted/50"
                        />
                        {isEditable && (
                          <button
                            type="button"
                            onClick={() => handleDeleteRow(row.id)}
                            aria-label={`Delete ${row.title}`}
                            className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>

                      <div className="mt-2 flex flex-wrap items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={cn(
                              "rounded border px-1.5 py-0.5 text-[10px] font-medium",
                              PRIORITY_META[row.priority].badgeClass
                            )}
                          >
                            {PRIORITY_META[row.priority].label}
                          </span>
                          {row.tag && (
                            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                              {row.tag}
                            </span>
                          )}
                        </div>

                        {isEditable && (
                          <div className="flex items-center gap-0.5">
                            {colIndex > 0 && (
                              <button
                                type="button"
                                title={`Move to ${
                                  STATUS_META[STATUS_ORDER[colIndex - 1]].label
                                }`}
                                aria-label={`Move ${row.title} left`}
                                onClick={() =>
                                  handleUpdateRow(row.id, {
                                    status: STATUS_ORDER[colIndex - 1],
                                  })
                                }
                                className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                              >
                                <ChevronLeft className="h-3.5 w-3.5" />
                              </button>
                            )}
                            {colIndex < STATUS_ORDER.length - 1 && (
                              <button
                                type="button"
                                title={`Move to ${
                                  STATUS_META[STATUS_ORDER[colIndex + 1]].label
                                }`}
                                aria-label={`Move ${row.title} right`}
                                onClick={() =>
                                  handleUpdateRow(row.id, {
                                    status: STATUS_ORDER[colIndex + 1],
                                  })
                                }
                                className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                              >
                                <ChevronRight className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {isEditable && (
                  <button
                    type="button"
                    onClick={() => handleAddRow(colStatus)}
                    className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-border/70 py-1.5 text-[11px] font-medium text-muted-foreground hover:border-primary/40 hover:bg-muted/40 hover:text-foreground transition-colors cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add card</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
