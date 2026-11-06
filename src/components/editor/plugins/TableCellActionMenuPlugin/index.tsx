import type { ElementNode, LexicalEditor } from "lexical";
import { Compact } from '@uiw/react-color';

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalEditable } from "@lexical/react/useLexicalEditable";
import {
  $deleteTableColumn__EXPERIMENTAL,
  $deleteTableRow__EXPERIMENTAL,
  $getNodeTriplet,
  $getTableCellNodeFromLexicalNode,
  $getTableColumnIndexFromTableCellNode,
  $getTableNodeFromLexicalNodeOrThrow,
  $getTableRowIndexFromTableCellNode,
  $insertTableColumn__EXPERIMENTAL,
  $insertTableRow__EXPERIMENTAL,
  $isTableCellNode,
  $isTableRowNode,
  $isTableSelection,
  $unmergeCell,
  getTableElement,
  getTableObserverFromTableElement,
  TableCellHeaderStates,
  TableCellNode,
  TableObserver,
  TableRowNode,
  TableSelection,
} from "@lexical/table";
import { mergeRegister } from "@lexical/utils";
import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  $isElementNode,
  $isParagraphNode,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_CRITICAL,
  getDOMSelection,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import * as React from "react";
import { ReactPortal, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import invariant from "../../utils/invariant";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Menu,
  Merge,
  PaintBucket,
  Split,
  Table,
  Table as TableIcon,
  TableColumnsSplit,
  TableRowsSplit,
  Trash,
  Trash2,
  X,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../../../ui/popover";
import { DropDown } from "../../../ui/drop-downs";
import useModal from "../../../ui/models/use-model";

function computeSelectionCount(selection: TableSelection): {
  columns: number;
  rows: number;
} {
  const selectionShape = selection.getShape();
  return {
    columns: selectionShape.toX - selectionShape.fromX + 1,
    rows: selectionShape.toY - selectionShape.fromY + 1,
  };
}

function $canUnmerge(): boolean {
  try {
    const selection = $getSelection();
    if (
      ($isRangeSelection(selection) && !selection.isCollapsed()) ||
      ($isTableSelection(selection) && !selection.anchor.is(selection.focus)) ||
      (!$isRangeSelection(selection) && !$isTableSelection(selection))
    ) {
      return false;
    }
    const [cell] = $getNodeTriplet(selection.anchor);
    return cell ? (cell.__colSpan > 1 || cell.__rowSpan > 1) : false;
  } catch {
    return false;
  }
}

function $cellContainsEmptyParagraph(cell: TableCellNode): boolean {
  if (cell.getChildrenSize() !== 1) {
    return false;
  }
  const firstChild = cell.getFirstChildOrThrow();
  if (!$isParagraphNode(firstChild) || !firstChild.isEmpty()) {
    return false;
  }
  return true;
}

function $selectLastDescendant(node: ElementNode): void {
  const lastDescendant = node.getLastDescendant();
  if ($isTextNode(lastDescendant)) {
    lastDescendant.select();
  } else if ($isElementNode(lastDescendant)) {
    lastDescendant.selectEnd();
  } else if (lastDescendant !== null) {
    lastDescendant.selectNext();
  }
}

function currentCellBackgroundColor(editor: LexicalEditor): null | string {
  try {
    return editor.getEditorState().read(() => {
      try {
        const selection = $getSelection();
        if ($isRangeSelection(selection) || $isTableSelection(selection)) {
          const [cell] = $getNodeTriplet(selection.anchor);
          if ($isTableCellNode(cell)) {
            return cell.getBackgroundColor();
          }
        }
      } catch {
        return null;
      }
      return null;
    });
  } catch {
    return null;
  }
}

type TableCellActionMenuProps = Readonly<{
  contextRef: { current: null | HTMLElement };
  tableCellNode: TableCellNode;
  cellMerge: boolean;
}>;

function TableActionMenu({
  tableCellNode: _tableCellNode,
  contextRef,
  cellMerge,
}: TableCellActionMenuProps) {
  const [editor] = useLexicalComposerContext();
  const dropDownRef = useRef<HTMLDivElement | null>(null);
  const [tableCellNode, updateTableCellNode] = useState(_tableCellNode);
  const [selectionCounts, updateSelectionCounts] = useState({
    columns: 1,
    rows: 1,
  });
  const [canMergeCells, setCanMergeCells] = useState(false);
  const [canUnmergeCell, setCanUnmergeCell] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState(
    () => currentCellBackgroundColor(editor) || ""
  );
  const [model, showModal] = useModal();


  useEffect(() => {
    return editor.registerMutationListener(
      TableCellNode,
      (nodeMutations) => {
        const nodeUpdated =
          nodeMutations.get(tableCellNode.getKey()) === "updated";

        if (nodeUpdated) {
          editor.getEditorState().read(() => {
            updateTableCellNode(tableCellNode.getLatest());
          });
          setBackgroundColor(currentCellBackgroundColor(editor) || "");
        }
      },
      { skipInitialization: true }
    );
  }, [editor, tableCellNode]);

  useEffect(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      // Merge cells
      if ($isTableSelection(selection)) {
        const currentSelectionCounts = computeSelectionCount(selection);
        updateSelectionCounts(computeSelectionCount(selection));
        setCanMergeCells(
          currentSelectionCounts.columns > 1 || currentSelectionCounts.rows > 1
        );
      }
      // Unmerge cell
      setCanUnmergeCell($canUnmerge());
    });
  }, [editor]);

  useEffect(() => {
    const menuButtonElement = contextRef.current;
    const dropDownElement = dropDownRef.current;
    const rootElement = editor.getRootElement();

    if (
      menuButtonElement != null &&
      dropDownElement != null &&
      rootElement != null
    ) {
      const rootEleRect = rootElement.getBoundingClientRect();
      const menuButtonRect = menuButtonElement.getBoundingClientRect();
      dropDownElement.style.opacity = "1";
      const dropDownElementRect = dropDownElement.getBoundingClientRect();
      const margin = 5;
      let leftPosition = menuButtonRect.right + margin;
      if (
        leftPosition + dropDownElementRect.width > window.innerWidth ||
        leftPosition + dropDownElementRect.width > rootEleRect.right
      ) {
        const position =
          menuButtonRect.left - dropDownElementRect.width - margin;
        leftPosition = (position < 0 ? margin : position) + window.pageXOffset;
      }
      dropDownElement.style.left = `${leftPosition + window.pageXOffset}px`;

      let topPosition = menuButtonRect.top;
      if (topPosition + dropDownElementRect.height > window.innerHeight) {
        const position = menuButtonRect.bottom - dropDownElementRect.height;
        topPosition = (position < 0 ? margin : position) + window.pageYOffset;
      }
      dropDownElement.style.top = `${topPosition + +window.pageYOffset}px`;
    }
  }, [contextRef, dropDownRef, editor]);

  const clearTableSelection = useCallback(() => {
    editor.update(() => {
      if (tableCellNode.isAttached()) {
        try {
          const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);
          const tableElement = getTableElement(
            tableNode,
            editor.getElementByKey(tableNode.getKey())
          );

          if (tableElement !== null) {
            const tableObserver = getTableObserverFromTableElement(tableElement);
            if (tableObserver !== null) {
              tableObserver.$clearHighlight();
            }
          }

          tableNode.markDirty();
          updateTableCellNode(tableCellNode.getLatest());
        } catch {}
      }

      const rootNode = $getRoot();
      rootNode.selectStart();
    });
  }, [editor, tableCellNode]);

  const mergeTableCellsAtSelection = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isTableSelection(selection)) {
        const { columns, rows } = computeSelectionCount(selection);
        const nodes = selection.getNodes();
        let firstCell: null | TableCellNode = null;
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];
          if ($isTableCellNode(node)) {
            if (firstCell === null) {
              node.setColSpan(columns).setRowSpan(rows);
              firstCell = node;
              const isEmpty = $cellContainsEmptyParagraph(node);
              let firstChild;
              if (
                isEmpty &&
                $isParagraphNode((firstChild = node.getFirstChild()))
              ) {
                firstChild.remove();
              }
            } else if ($isTableCellNode(firstCell)) {
              const isEmpty = $cellContainsEmptyParagraph(node);
              if (!isEmpty) {
                firstCell.append(...node.getChildren());
              }
              node.remove();
            }
          }
        }
        if (firstCell !== null) {
          if (firstCell.getChildrenSize() === 0) {
            firstCell.append($createParagraphNode());
          }
          $selectLastDescendant(firstCell);
        }
      }
    });
  };

  const unmergeTableCellsAtSelection = () => {
    editor.update(() => {
      $unmergeCell();
    });
  };

  const insertTableRowAtSelection = useCallback(
    (shouldInsertAfter: boolean) => {
      editor.update(() => {
        for (let i = 0; i < selectionCounts.rows; i++) {
          $insertTableRow__EXPERIMENTAL(shouldInsertAfter);
        }
      });
    },
    [editor, selectionCounts.rows]
  );

  const insertTableColumnAtSelection = useCallback(
    (shouldInsertAfter: boolean) => {
      editor.update(() => {
        for (let i = 0; i < selectionCounts.columns; i++) {
          $insertTableColumn__EXPERIMENTAL(shouldInsertAfter);
        }
      });
    },
    [editor, selectionCounts.columns]
  );

  const deleteTableRowAtSelection = useCallback(() => {
    editor.update(() => {
      $deleteTableRow__EXPERIMENTAL();
    });
  }, [editor]);

  const deleteTableAtSelection = useCallback(() => {
    editor.update(() => {
      try {
        if (tableCellNode.isAttached()) {
          const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);
          tableNode.remove();
        }
      } catch {}
      clearTableSelection();
    });
  }, [editor, tableCellNode, clearTableSelection]);

  const deleteTableColumnAtSelection = useCallback(() => {
    editor.update(() => {
      $deleteTableColumn__EXPERIMENTAL();
    });
  }, [editor]);

  const toggleTableRowIsHeader = useCallback(() => {
    editor.update(() => {
      const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);

      const tableRowIndex = $getTableRowIndexFromTableCellNode(tableCellNode);

      const tableRows = tableNode.getChildren();

      if (tableRowIndex >= tableRows.length || tableRowIndex < 0) {
        throw new Error("Expected table cell to be inside of table row.");
      }

      const tableRow = tableRows[tableRowIndex];

      if (!$isTableRowNode(tableRow)) {
        throw new Error("Expected table row");
      }

      const newStyle =
        tableCellNode.getHeaderStyles() ^ TableCellHeaderStates.ROW;
      tableRow.getChildren().forEach((tableCell) => {
        if (!$isTableCellNode(tableCell)) {
          throw new Error("Expected table cell");
        }

        tableCell.setHeaderStyles(newStyle, TableCellHeaderStates.ROW);
      });

      clearTableSelection();
    });
  }, [editor, tableCellNode, clearTableSelection]);

  const toggleTableColumnIsHeader = useCallback(() => {
    editor.update(() => {
      const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);

      const tableColumnIndex =
        $getTableColumnIndexFromTableCellNode(tableCellNode);

      const tableRows = tableNode.getChildren() as TableRowNode[];
      const maxRowsLength = Math.max(
        ...tableRows.map((row) => row.getChildren().length)
      );

      if (tableColumnIndex >= maxRowsLength || tableColumnIndex < 0) {
        throw new Error("Expected table cell to be inside of table row.");
      }

      const newStyle =
        tableCellNode.getHeaderStyles() ^ TableCellHeaderStates.COLUMN;
      for (let r = 0; r < tableRows.length; r++) {
        const tableRow = tableRows[r];

        if (!$isTableRowNode(tableRow)) {
          throw new Error("Expected table row");
        }

        const tableCells = tableRow.getChildren();
        if (tableColumnIndex >= tableCells.length) {
          // if cell is outside of bounds for the current row (for example various merge cell cases) we shouldn't highlight it
          continue;
        }

        const tableCell = tableCells[tableColumnIndex];

        if (!$isTableCellNode(tableCell)) {
          throw new Error("Expected table cell");
        }

        tableCell.setHeaderStyles(newStyle, TableCellHeaderStates.COLUMN);
      }
      clearTableSelection();
    });
  }, [editor, tableCellNode, clearTableSelection]);

  const toggleRowStriping = useCallback(() => {
    editor.update(() => {
      if (tableCellNode.isAttached()) {
        const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);
        if (tableNode) {
          tableNode.setRowStriping(!tableNode.getRowStriping());
        }
      }
      clearTableSelection();
    });
  }, [editor, tableCellNode, clearTableSelection]);

  const handleCellBackgroundColor = useCallback(
    (value: string) => {
      editor.update(() => {
        try {
          const selection = $getSelection();
          if ($isRangeSelection(selection) || $isTableSelection(selection)) {
            const [cell] = $getNodeTriplet(selection.anchor);
            if ($isTableCellNode(cell)) {
              cell.setBackgroundColor(value);
            }

            if ($isTableSelection(selection)) {
              const nodes = selection.getNodes();

              for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                if ($isTableCellNode(node)) {
                  node.setBackgroundColor(value);
                }
              }
            }
          } else if (tableCellNode && tableCellNode.isAttached()) {
            tableCellNode.setBackgroundColor(value);
          }
        } catch {
          if (tableCellNode && tableCellNode.isAttached()) {
            tableCellNode.setBackgroundColor(value);
          }
        }
      });
      setBackgroundColor(value);
    },
    [editor, tableCellNode]
  );

  const commands = React.useMemo(
    () => [
      {
        label: "Background",
        func: () => {
          showModal(
            "Background",
            "Select color",
            (onClose) => (
              <Compact
                style={{ background: "transparent", width: "100%" }}
                color={backgroundColor}
                onChange={(color) => {
                  handleCellBackgroundColor(color.hex)
                  onClose()
                }}
              />
            ),
            true
          );
        },
        icon: <PaintBucket />,
        style: { backgroundColor: `${currentCellBackgroundColor(editor)}` },
      },
      {
        label: "Insert Row Above",
        func: () => insertTableRowAtSelection(false),
        icon: <TableRowsSplit />,
      },
      {
        label: "Insert Row Below",
        func: () => insertTableRowAtSelection(true),
        icon: <TableRowsSplit />,
      },
      {
        label: "Insert Column Left",
        func: () => insertTableColumnAtSelection(false),
        icon: <TableColumnsSplit />,
      },
      {
        label: "Insert Column Right",
        func: () => insertTableColumnAtSelection(true),
        icon: <TableColumnsSplit />,
      },
      { label: "Delete Row", func: deleteTableRowAtSelection, icon: <Trash /> },
      {
        label: "Delete Column",
        func: deleteTableColumnAtSelection,
        icon: <Trash />,
      },
      { label: "Delete Table", func: deleteTableAtSelection, icon: <Trash /> },
      {
        label: "Toggle Row Header",
        func: toggleTableRowIsHeader,
        icon: <Table />,
      },
      {
        label: "Toggle Column Header",
        func: toggleTableColumnIsHeader,
        icon: <Table />,
      },
      { label: "Toggle Striping", func: toggleRowStriping, icon: <Table /> },
    ],
    [
      backgroundColor,
      canMergeCells,
      canUnmergeCell,
      insertTableRowAtSelection,
      insertTableColumnAtSelection,
      deleteTableRowAtSelection,
      deleteTableColumnAtSelection,
      deleteTableAtSelection,
      toggleTableRowIsHeader,
      toggleTableColumnIsHeader,
      toggleRowStriping,
      backgroundColor,
      editor,
      tableCellNode,
      cellMerge,
      selectionCounts,

    ]
  );
  if (cellMerge) {
    if (canMergeCells) {
      commands.push({
        label: "Merge Cells",
        func: mergeTableCellsAtSelection,
        icon: <Merge />,
      });
    } else if (canUnmergeCell) {
      commands.push({
        label: "Unmerge Cells",
        func: unmergeTableCellsAtSelection,
        icon: <Split />,
      });
    }
  }

  return (
    <div className="flex items-center gap-0.5 bg-white/95 dark:bg-zinc-900/95 border border-zinc-200 dark:border-zinc-700/80 rounded-xl px-2 py-1 shadow-xl backdrop-blur-md text-zinc-700 dark:text-zinc-300">
      <Popover modal={false}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors"
            title="Cell background color"
          >
            <PaintBucket className="w-4 h-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="center"
          sideOffset={8}
          className="p-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl w-44 z-50 text-zinc-900 dark:text-zinc-100"
        >
          <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-2">
            Cell Color
          </span>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { label: "Clear", color: "" },
              { label: "Zinc", color: "#18181b" },
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
                onClick={() => handleCellBackgroundColor(swatch.color)}
                className="w-7 h-7 rounded border border-zinc-200 dark:border-zinc-700 hover:scale-110 transition-transform relative flex items-center justify-center"
                style={{ backgroundColor: swatch.color || "transparent" }}
              >
                {!swatch.color && (
                  <span className="w-3.5 h-[1.5px] bg-red-500 rotate-45 block" />
                )}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <button
        type="button"
        onClick={toggleTableRowIsHeader}
        className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors"
        title="Toggle header row"
      >
        <TableIcon className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={deleteTableAtSelection}
        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        title="Delete table"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <div className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-700/80 mx-1" />

      <button
        type="button"
        onClick={() => insertTableRowAtSelection(false)}
        className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors"
        title="Insert row above"
      >
        <ArrowUp className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => insertTableRowAtSelection(true)}
        className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors"
        title="Insert row below"
      >
        <ArrowDown className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={deleteTableRowAtSelection}
        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        title="Delete row"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-700/80 mx-1" />

      <button
        type="button"
        onClick={() => insertTableColumnAtSelection(false)}
        className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors"
        title="Insert column left"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => insertTableColumnAtSelection(true)}
        className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors"
        title="Insert column right"
      >
        <ArrowRight className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={deleteTableColumnAtSelection}
        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        title="Delete column"
      >
        <X className="w-4 h-4" />
      </button>

      {canMergeCells && (
        <>
          <div className="w-[1px] h-4 bg-zinc-700/80 mx-1" />
          <button
            type="button"
            onClick={mergeTableCellsAtSelection}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
            title="Merge selected cells"
          >
            <Merge className="w-4 h-4 text-emerald-400" />
          </button>
        </>
      )}
      {canUnmergeCell && (
        <>
          <div className="w-[1px] h-4 bg-zinc-700/80 mx-1" />
          <button
            type="button"
            onClick={unmergeTableCellsAtSelection}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
            title="Unmerge cells"
          >
            <Split className="w-4 h-4 text-emerald-400" />
          </button>
        </>
      )}
    </div>
  );
}

function TableCellActionMenuContainer({
  anchorElem,
  cellMerge,
}: {
  anchorElem: HTMLElement;
  cellMerge: boolean;
}): React.JSX.Element {
  const [editor] = useLexicalComposerContext();

  const menuButtonRef = useRef<HTMLDivElement | null>(null);
  const menuRootRef = useRef<HTMLButtonElement | null>(null);

  const [tableCellNode, setTableMenuCellNode] = useState<TableCellNode | null>(
    null
  );

  const $moveMenu = useCallback(() => {
    const menu = menuButtonRef.current;
    const selection = $getSelection();
    const nativeSelection = getDOMSelection(editor._window);
    let activeElement;
    if (typeof window !== "undefined") {
      activeElement = document?.activeElement;
    }
    function disable() {
      if (menu) {
        menu.style.display = "none";
        menu.style.opacity = "0";
      }
      setTableMenuCellNode(null);
    }

    if (selection == null || menu == null) {
      return disable();
    }

    const rootElement = editor.getRootElement();
    let tableObserver: TableObserver | null = null;
    let tableCellParentNodeDOM: HTMLElement | null = null;

    if (
      $isRangeSelection(selection) &&
      rootElement !== null &&
      nativeSelection !== null &&
      rootElement.contains(nativeSelection.anchorNode)
    ) {
      const tableCellNodeFromSelection = $getTableCellNodeFromLexicalNode(
        selection.anchor.getNode()
      );

      if (tableCellNodeFromSelection == null) {
        return disable();
      }

      tableCellParentNodeDOM = editor.getElementByKey(
        tableCellNodeFromSelection.getKey()
      );

      if (
        tableCellParentNodeDOM == null ||
        !tableCellNodeFromSelection.isAttached()
      ) {
        return disable();
      }

      try {
        const tableNode = $getTableNodeFromLexicalNodeOrThrow(
          tableCellNodeFromSelection
        );
        const tableElement = getTableElement(
          tableNode,
          editor.getElementByKey(tableNode.getKey())
        );

        if (tableElement === null) {
          return disable();
        }

        tableObserver = getTableObserverFromTableElement(tableElement);
        setTableMenuCellNode(tableCellNodeFromSelection);
      } catch {
        return disable();
      }
    } else if ($isTableSelection(selection)) {
      try {
        const anchorNode = $getTableCellNodeFromLexicalNode(
          selection.anchor.getNode()
        );
        if (!$isTableCellNode(anchorNode)) {
          return disable();
        }
        const tableNode = $getTableNodeFromLexicalNodeOrThrow(anchorNode);
        const tableElement = getTableElement(
          tableNode,
          editor.getElementByKey(tableNode.getKey())
        );
        if (tableElement === null) {
          return disable();
        }
        tableObserver = getTableObserverFromTableElement(tableElement);
        tableCellParentNodeDOM = editor.getElementByKey(anchorNode.getKey());
        setTableMenuCellNode(anchorNode);
      } catch {
        return disable();
      }
    } else if (!activeElement) {
      return disable();
    }
    if (tableObserver === null || tableCellParentNodeDOM === null) {
      return disable();
    }
    const enabled = !tableObserver || !tableObserver.isSelecting;
    if (enabled) {
      menu.style.display = "block";
      menu.style.opacity = "1";
      const tableCellRect = tableCellParentNodeDOM.getBoundingClientRect();
      const anchorRect = anchorElem.getBoundingClientRect();
      let targetRect = tableCellRect;
      try {
        const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNodeFromSelection || (anchorNode as any));
        const tableDOM = getTableElement(tableNode, editor.getElementByKey(tableNode.getKey()));
        if (tableDOM) {
          targetRect = tableDOM.getBoundingClientRect();
        }
      } catch {}
      const top = Math.max(8, targetRect.top - anchorRect.top - 46);
      const left = Math.max(16, targetRect.left - anchorRect.left + (targetRect.width / 2) - 160);
      menu.style.transform = `translate(${left}px, ${top}px)`;
    } else {
      menu.style.display = "none";
      menu.style.opacity = "0";
    }
  }, [editor, anchorElem]);

  useEffect(() => {
    // We call the $moveMenu callback every time the selection changes,
    // once up front, and once after each mouseUp
    let timeoutId: ReturnType<typeof setTimeout> | undefined = undefined;
    const callback = () => {
      timeoutId = undefined;
      editor.getEditorState().read($moveMenu);
    };
    const delayedCallback = () => {
      if (timeoutId === undefined) {
        timeoutId = setTimeout(callback, 0);
      }
      return false;
    };
    return mergeRegister(
      editor.registerUpdateListener(delayedCallback),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        delayedCallback,
        COMMAND_PRIORITY_CRITICAL
      ),
      editor.registerRootListener((rootElement, prevRootElement) => {
        if (prevRootElement) {
          prevRootElement.removeEventListener("mouseup", delayedCallback);
        }
        if (rootElement) {
          rootElement.addEventListener("mouseup", delayedCallback);
          delayedCallback();
        }
      }),
      () => clearTimeout(timeoutId)
    );
  });

  const prevTableCellDOM = useRef(tableCellNode);

  useEffect(() => {
    prevTableCellDOM.current = tableCellNode;
  }, [prevTableCellDOM, tableCellNode]);

  return (
    <div
      className="absolute top-1 left-1 will-change-transform z-40 transition-opacity duration-150"
      ref={menuButtonRef}
    >
      {tableCellNode != null && (
        <TableActionMenu
          contextRef={menuRootRef}
          tableCellNode={tableCellNode}
          cellMerge={cellMerge}
        />
      )}
    </div>
  );
}

export default function TableActionMenuPlugin({
  anchorElem = document.body,
  cellMerge = false,
}: {
  anchorElem?: HTMLElement;
  cellMerge?: boolean;
}): null | ReactPortal {
  const isEditable = useLexicalEditable();

  return createPortal(
    isEditable ? (
      <TableCellActionMenuContainer
        anchorElem={anchorElem}
        cellMerge={cellMerge}
      />
    ) : null,
    anchorElem
  );
}
