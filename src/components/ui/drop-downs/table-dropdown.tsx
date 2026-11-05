"use client";

import React, { useState, useCallback } from "react";
import { LexicalEditor } from "lexical";
import {
  INSERT_TABLE_COMMAND,
  $deleteTableColumn__EXPERIMENTAL,
  $deleteTableRow__EXPERIMENTAL,
  $getTableCellNodeFromLexicalNode,
  $getTableNodeFromLexicalNodeOrThrow,
  $insertTableColumn__EXPERIMENTAL,
  $insertTableRow__EXPERIMENTAL,
  $isTableCellNode,
  $isTableSelection,
  $unmergeCell,
  TableCellHeaderStates,
  TableCellNode,
  $getNodeTriplet,
} from "@lexical/table";
import {
  $getSelection,
  $isRangeSelection,
} from "lexical";
import {
  Table as TableIcon,
  ChevronRight,
  ChevronDown,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  X,
  PaintBucket,
  Columns,
  Rows,
  Split,
  Merge,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import { Button } from "../button";
import { cn } from "../../../lib/utils";

const GRID_MAX_COLS = 10;
const GRID_MAX_ROWS = 8;

export function TableGridPicker({
  onSelect,
}: {
  onSelect: (rows: number, cols: number) => void;
}) {
  const [hoveredRow, setHoveredRow] = useState(6);
  const [hoveredCol, setHoveredCol] = useState(8);

  return (
    <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl flex flex-col items-center">
      <div
        className="grid gap-1 mb-2 select-none"
        style={{
          gridTemplateColumns: `repeat(${GRID_MAX_COLS}, minmax(0, 1fr))`,
        }}
        onMouseLeave={() => {
          setHoveredRow(0);
          setHoveredCol(0);
        }}
      >
        {Array.from({ length: GRID_MAX_ROWS }).map((_, rIndex) => {
          const rowNum = rIndex + 1;
          return Array.from({ length: GRID_MAX_COLS }).map((_, cIndex) => {
            const colNum = cIndex + 1;
            const isHighlighted = rowNum <= hoveredRow && colNum <= hoveredCol;

            return (
              <div
                key={`${rowNum}-${colNum}`}
                onMouseEnter={() => {
                  setHoveredRow(rowNum);
                  setHoveredCol(colNum);
                }}
                onClick={() => onSelect(rowNum, colNum)}
                className={cn(
                  "w-4 h-4 rounded-[2px] transition-colors duration-75 cursor-pointer border",
                  isHighlighted
                    ? "bg-emerald-500/30 border-emerald-500"
                    : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
                )}
              />
            );
          });
        })}
      </div>
      <div className="text-xs font-mono text-zinc-300 font-semibold tracking-wide">
        {hoveredCol > 0 && hoveredRow > 0
          ? `${hoveredCol} × ${hoveredRow}`
          : "Insert Table"}
      </div>
    </div>
  );
}

export default function TableDropDown({
  editor,
  disabled,
  className,
}: {
  editor: LexicalEditor;
  disabled?: boolean;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState<
    "table" | "cell" | "row" | "column" | null
  >("table");

  const insertTable = useCallback(
    (rows: number, cols: number) => {
      editor.dispatchCommand(INSERT_TABLE_COMMAND, {
        columns: String(cols),
        rows: String(rows),
        includeHeaders: true,
      });
      setIsOpen(false);
    },
    [editor]
  );

  const insertRowAbove = useCallback(() => {
    editor.update(() => {
      $insertTableRow__EXPERIMENTAL(false);
    });
    setIsOpen(false);
  }, [editor]);

  const insertRowBelow = useCallback(() => {
    editor.update(() => {
      $insertTableRow__EXPERIMENTAL(true);
    });
    setIsOpen(false);
  }, [editor]);

  const deleteRow = useCallback(() => {
    editor.update(() => {
      $deleteTableRow__EXPERIMENTAL();
    });
    setIsOpen(false);
  }, [editor]);

  const insertColLeft = useCallback(() => {
    editor.update(() => {
      $insertTableColumn__EXPERIMENTAL(false);
    });
    setIsOpen(false);
  }, [editor]);

  const insertColRight = useCallback(() => {
    editor.update(() => {
      $insertTableColumn__EXPERIMENTAL(true);
    });
    setIsOpen(false);
  }, [editor]);

  const deleteCol = useCallback(() => {
    editor.update(() => {
      $deleteTableColumn__EXPERIMENTAL();
    });
    setIsOpen(false);
  }, [editor]);

  const deleteTable = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection) || $isTableSelection(selection)) {
        const [cell] = $getNodeTriplet(selection.anchor);
        if ($isTableCellNode(cell)) {
          const tableNode = $getTableNodeFromLexicalNodeOrThrow(cell);
          tableNode.remove();
        }
      }
    });
    setIsOpen(false);
  }, [editor]);

  const setCellBgColor = useCallback(
    (color: string) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection) || $isTableSelection(selection)) {
          const [cell] = $getNodeTriplet(selection.anchor);
          if ($isTableCellNode(cell)) {
            cell.setBackgroundColor(color);
          }
        }
      });
      setIsOpen(false);
    },
    [editor]
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          variant="ghost"
          size="Toolbar"
          className={cn(
            "flex items-center gap-1 px-2.5 h-8 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors",
            className
          )}
          title="Table menu"
        >
          <TableIcon className="w-4 h-4 text-zinc-300" />
          <ChevronDown className="w-3 h-3 text-zinc-500" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-auto p-0 bg-transparent border-none shadow-none z-50 flex items-start gap-2"
      >
        {/* Submenu on the Left (Grid Picker for Table) */}
        {activeSubMenu === "table" && (
          <div className="animate-in fade-in-50 zoom-in-95 duration-100">
            <TableGridPicker onSelect={insertTable} />
          </div>
        )}

        {/* Submenu for Cell Background */}
        {activeSubMenu === "cell" && (
          <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl w-44 flex flex-col gap-2 animate-in fade-in-50 zoom-in-95 duration-100">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Cell Color
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { label: "Clear", color: "" },
                { label: "Dark Zinc", color: "#18181b" },
                { label: "Emerald", color: "#064e3b" },
                { label: "Indigo", color: "#312e81" },
                { label: "Rose", color: "#881337" },
                { label: "Amber", color: "#78350f" },
                { label: "Cyan", color: "#164e63" },
                { label: "Violet", color: "#4c1d95" },
              ].map((swatch) => (
                <button
                  key={swatch.label}
                  type="button"
                  title={swatch.label}
                  onClick={() => setCellBgColor(swatch.color)}
                  className="w-7 h-7 rounded border border-zinc-700 hover:scale-110 transition-transform relative flex items-center justify-center"
                  style={{
                    backgroundColor: swatch.color || "transparent",
                  }}
                >
                  {!swatch.color && (
                    <span className="w-3.5 h-[1.5px] bg-red-500 rotate-45 block" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Submenu for Row Actions */}
        {activeSubMenu === "row" && (
          <div className="p-1.5 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl w-48 flex flex-col gap-0.5 animate-in fade-in-50 zoom-in-95 duration-100">
            <button
              onClick={insertRowAbove}
              className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-lg transition-colors text-left"
            >
              <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Insert row above</span>
            </button>
            <button
              onClick={insertRowBelow}
              className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-lg transition-colors text-left"
            >
              <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />
              <span>Insert row below</span>
            </button>
            <div className="my-1 border-t border-zinc-800" />
            <button
              onClick={deleteRow}
              className="flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg transition-colors text-left"
            >
              <X className="w-3.5 h-3.5 text-red-400" />
              <span>Delete row</span>
            </button>
          </div>
        )}

        {/* Submenu for Column Actions */}
        {activeSubMenu === "column" && (
          <div className="p-1.5 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl w-48 flex flex-col gap-0.5 animate-in fade-in-50 zoom-in-95 duration-100">
            <button
              onClick={insertColLeft}
              className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-lg transition-colors text-left"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
              <span>Insert column left</span>
            </button>
            <button
              onClick={insertColRight}
              className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-lg transition-colors text-left"
            >
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              <span>Insert column right</span>
            </button>
            <div className="my-1 border-t border-zinc-800" />
            <button
              onClick={deleteCol}
              className="flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg transition-colors text-left"
            >
              <X className="w-3.5 h-3.5 text-red-400" />
              <span>Delete column</span>
            </button>
          </div>
        )}

        {/* Main Menu (Right Panel) matching Image 1 */}
        <div className="w-52 p-1.5 bg-zinc-950/95 border border-zinc-800 rounded-xl shadow-2xl backdrop-blur-md flex flex-col gap-0.5 text-zinc-300">
          {/* Table item */}
          <button
            onMouseEnter={() => setActiveSubMenu("table")}
            className={cn(
              "flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors",
              activeSubMenu === "table"
                ? "bg-zinc-800 text-white"
                : "hover:bg-zinc-900 text-zinc-300"
            )}
          >
            <div className="flex items-center gap-2.5">
              <TableIcon className="w-4 h-4 text-emerald-400" />
              <span>Table</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>

          {/* Cell item */}
          <button
            onMouseEnter={() => setActiveSubMenu("cell")}
            className={cn(
              "flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors",
              activeSubMenu === "cell"
                ? "bg-zinc-800 text-white"
                : "hover:bg-zinc-900 text-zinc-300"
            )}
          >
            <div className="flex items-center gap-2.5">
              <PaintBucket className="w-4 h-4 text-cyan-400" />
              <span>Cell</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>

          {/* Row item */}
          <button
            onMouseEnter={() => setActiveSubMenu("row")}
            className={cn(
              "flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors",
              activeSubMenu === "row"
                ? "bg-zinc-800 text-white"
                : "hover:bg-zinc-900 text-zinc-300"
            )}
          >
            <div className="flex items-center gap-2.5">
              <Rows className="w-4 h-4 text-violet-400" />
              <span>Row</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>

          {/* Column item */}
          <button
            onMouseEnter={() => setActiveSubMenu("column")}
            className={cn(
              "flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors",
              activeSubMenu === "column"
                ? "bg-zinc-800 text-white"
                : "hover:bg-zinc-900 text-zinc-300"
            )}
          >
            <div className="flex items-center gap-2.5">
              <Columns className="w-4 h-4 text-amber-400" />
              <span>Column</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>

          <div className="my-1 border-t border-zinc-800" />

          {/* Delete Table item */}
          <button
            onClick={deleteTable}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
            <span>Delete table</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
