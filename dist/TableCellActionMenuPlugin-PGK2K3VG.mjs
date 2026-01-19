import {
  DropDown
} from "./chunk-EGMI62PP.mjs";
import "./chunk-KJ6AJ44Q.mjs";
import "./chunk-64Z3FI7T.mjs";
import {
  useModal
} from "./chunk-5QSNIVIG.mjs";
import "./chunk-WDG7J2DY.mjs";
import "./chunk-BIU7WTLX.mjs";
import "./chunk-YHPNOWFH.mjs";
import {
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/components/editor/plugins/TableCellActionMenuPlugin/index.tsx
init_react_shim();
import { Compact } from "@uiw/react-color";
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
  TableCellNode
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
  SELECTION_CHANGE_COMMAND
} from "lexical";
import * as React2 from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// src/components/editor/utils/invariant.ts
init_react_shim();
function invariant(cond, message) {
  if (cond) {
    return;
  }
  throw new Error(
    "Internal Lexical error: invariant() is meant to be replaced at compile time. There is no runtime version. Error: " + message
  );
}

// src/components/editor/plugins/TableCellActionMenuPlugin/index.tsx
import {
  Menu,
  Merge,
  PaintBucket,
  Split,
  Table,
  TableColumnsSplit,
  TableRowsSplit,
  Trash
} from "lucide-react";
function computeSelectionCount(selection) {
  const selectionShape = selection.getShape();
  return {
    columns: selectionShape.toX - selectionShape.fromX + 1,
    rows: selectionShape.toY - selectionShape.fromY + 1
  };
}
function $canUnmerge() {
  const selection = $getSelection();
  if ($isRangeSelection(selection) && !selection.isCollapsed() || $isTableSelection(selection) && !selection.anchor.is(selection.focus) || !$isRangeSelection(selection) && !$isTableSelection(selection)) {
    return false;
  }
  const [cell] = $getNodeTriplet(selection.anchor);
  return cell.__colSpan > 1 || cell.__rowSpan > 1;
}
function $cellContainsEmptyParagraph(cell) {
  if (cell.getChildrenSize() !== 1) {
    return false;
  }
  const firstChild = cell.getFirstChildOrThrow();
  if (!$isParagraphNode(firstChild) || !firstChild.isEmpty()) {
    return false;
  }
  return true;
}
function $selectLastDescendant(node) {
  const lastDescendant = node.getLastDescendant();
  if ($isTextNode(lastDescendant)) {
    lastDescendant.select();
  } else if ($isElementNode(lastDescendant)) {
    lastDescendant.selectEnd();
  } else if (lastDescendant !== null) {
    lastDescendant.selectNext();
  }
}
function currentCellBackgroundColor(editor) {
  return editor.getEditorState().read(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection) || $isTableSelection(selection)) {
      const [cell] = $getNodeTriplet(selection.anchor);
      if ($isTableCellNode(cell)) {
        return cell.getBackgroundColor();
      }
    }
    return null;
  });
}
function TableActionMenu({
  tableCellNode: _tableCellNode,
  contextRef,
  cellMerge
}) {
  const [editor] = useLexicalComposerContext();
  const dropDownRef = useRef(null);
  const [tableCellNode, updateTableCellNode] = useState(_tableCellNode);
  const [selectionCounts, updateSelectionCounts] = useState({
    columns: 1,
    rows: 1
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
        const nodeUpdated = nodeMutations.get(tableCellNode.getKey()) === "updated";
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
      if ($isTableSelection(selection)) {
        const currentSelectionCounts = computeSelectionCount(selection);
        updateSelectionCounts(computeSelectionCount(selection));
        setCanMergeCells(
          currentSelectionCounts.columns > 1 || currentSelectionCounts.rows > 1
        );
      }
      setCanUnmergeCell($canUnmerge());
    });
  }, [editor]);
  useEffect(() => {
    const menuButtonElement = contextRef.current;
    const dropDownElement = dropDownRef.current;
    const rootElement = editor.getRootElement();
    if (menuButtonElement != null && dropDownElement != null && rootElement != null) {
      const rootEleRect = rootElement.getBoundingClientRect();
      const menuButtonRect = menuButtonElement.getBoundingClientRect();
      dropDownElement.style.opacity = "1";
      const dropDownElementRect = dropDownElement.getBoundingClientRect();
      const margin = 5;
      let leftPosition = menuButtonRect.right + margin;
      if (leftPosition + dropDownElementRect.width > window.innerWidth || leftPosition + dropDownElementRect.width > rootEleRect.right) {
        const position = menuButtonRect.left - dropDownElementRect.width - margin;
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
        const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);
        const tableElement = getTableElement(
          tableNode,
          editor.getElementByKey(tableNode.getKey())
        );
        invariant(
          tableElement !== null,
          "TableActionMenu: Expected to find tableElement in DOM"
        );
        const tableObserver = getTableObserverFromTableElement(tableElement);
        if (tableObserver !== null) {
          tableObserver.$clearHighlight();
        }
        tableNode.markDirty();
        updateTableCellNode(tableCellNode.getLatest());
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
        let firstCell = null;
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];
          if ($isTableCellNode(node)) {
            if (firstCell === null) {
              node.setColSpan(columns).setRowSpan(rows);
              firstCell = node;
              const isEmpty = $cellContainsEmptyParagraph(node);
              let firstChild;
              if (isEmpty && $isParagraphNode(firstChild = node.getFirstChild())) {
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
    (shouldInsertAfter) => {
      editor.update(() => {
        for (let i = 0; i < selectionCounts.rows; i++) {
          $insertTableRow__EXPERIMENTAL(shouldInsertAfter);
        }
      });
    },
    [editor, selectionCounts.rows]
  );
  const insertTableColumnAtSelection = useCallback(
    (shouldInsertAfter) => {
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
      const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);
      tableNode.remove();
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
      const newStyle = tableCellNode.getHeaderStyles() ^ TableCellHeaderStates.ROW;
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
      const tableColumnIndex = $getTableColumnIndexFromTableCellNode(tableCellNode);
      const tableRows = tableNode.getChildren();
      const maxRowsLength = Math.max(
        ...tableRows.map((row) => row.getChildren().length)
      );
      if (tableColumnIndex >= maxRowsLength || tableColumnIndex < 0) {
        throw new Error("Expected table cell to be inside of table row.");
      }
      const newStyle = tableCellNode.getHeaderStyles() ^ TableCellHeaderStates.COLUMN;
      for (let r = 0; r < tableRows.length; r++) {
        const tableRow = tableRows[r];
        if (!$isTableRowNode(tableRow)) {
          throw new Error("Expected table row");
        }
        const tableCells = tableRow.getChildren();
        if (tableColumnIndex >= tableCells.length) {
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
    (value) => {
      editor.update(() => {
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
        }
      });
    },
    [editor]
  );
  const commands = React2.useMemo(
    () => [
      {
        label: "Background",
        func: () => {
          showModal(
            "Background",
            "Select color",
            (onClose) => /* @__PURE__ */ React2.createElement(
              Compact,
              {
                style: { background: "transparent", width: "100%" },
                color: backgroundColor,
                onChange: (color) => {
                  handleCellBackgroundColor(color.hex);
                  onClose();
                }
              }
            ),
            true
          );
        },
        icon: /* @__PURE__ */ React2.createElement(PaintBucket, null),
        style: { backgroundColor: `${currentCellBackgroundColor(editor)}` }
      },
      {
        label: "Insert Row Above",
        func: () => insertTableRowAtSelection(false),
        icon: /* @__PURE__ */ React2.createElement(TableRowsSplit, null)
      },
      {
        label: "Insert Row Below",
        func: () => insertTableRowAtSelection(true),
        icon: /* @__PURE__ */ React2.createElement(TableRowsSplit, null)
      },
      {
        label: "Insert Column Left",
        func: () => insertTableColumnAtSelection(false),
        icon: /* @__PURE__ */ React2.createElement(TableColumnsSplit, null)
      },
      {
        label: "Insert Column Right",
        func: () => insertTableColumnAtSelection(true),
        icon: /* @__PURE__ */ React2.createElement(TableColumnsSplit, null)
      },
      { label: "Delete Row", func: deleteTableRowAtSelection, icon: /* @__PURE__ */ React2.createElement(Trash, null) },
      {
        label: "Delete Column",
        func: deleteTableColumnAtSelection,
        icon: /* @__PURE__ */ React2.createElement(Trash, null)
      },
      { label: "Delete Table", func: deleteTableAtSelection, icon: /* @__PURE__ */ React2.createElement(Trash, null) },
      {
        label: "Toggle Row Header",
        func: toggleTableRowIsHeader,
        icon: /* @__PURE__ */ React2.createElement(Table, null)
      },
      {
        label: "Toggle Column Header",
        func: toggleTableColumnIsHeader,
        icon: /* @__PURE__ */ React2.createElement(Table, null)
      },
      { label: "Toggle Striping", func: toggleRowStriping, icon: /* @__PURE__ */ React2.createElement(Table, null) }
    ],
    [
      currentCellBackgroundColor(editor),
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
      selectionCounts
    ]
  );
  if (cellMerge) {
    if (canMergeCells) {
      commands.push({
        label: "Merge Cells",
        func: mergeTableCellsAtSelection,
        icon: /* @__PURE__ */ React2.createElement(Merge, null)
      });
    } else if (canUnmergeCell) {
      commands.push({
        label: "Unmerge Cells",
        func: unmergeTableCellsAtSelection,
        icon: /* @__PURE__ */ React2.createElement(Split, null)
      });
    }
  }
  return /* @__PURE__ */ React2.createElement(React2.Fragment, null, /* @__PURE__ */ React2.createElement(
    DropDown,
    {
      values: commands,
      TriggerLabel: /* @__PURE__ */ React2.createElement(Menu, { className: "w-4 h-4  " }),
      TriggerClassName: {
        height: "24px",
        padding: "0px 4px",
        position: "absolute",
        top: 0,
        right: "10px"
      },
      ShowChevronsUpDown: false,
      triggerVariants: "ghost",
      disabled: false
    }
  ), model);
}
function TableCellActionMenuContainer({
  anchorElem,
  cellMerge
}) {
  const [editor] = useLexicalComposerContext();
  const menuButtonRef = useRef(null);
  const menuRootRef = useRef(null);
  const [tableCellNode, setTableMenuCellNode] = useState(
    null
  );
  const $moveMenu = useCallback(() => {
    const menu = menuButtonRef.current;
    const selection = $getSelection();
    const nativeSelection = getDOMSelection(editor._window);
    let activeElement;
    if (typeof window !== "undefined") {
      activeElement = document == null ? void 0 : document.activeElement;
    }
    function disable() {
      if (menu) {
        menu.classList.remove("table-cell-action-button-container--active");
        menu.classList.add("table-cell-action-button-container--inactive");
      }
      setTableMenuCellNode(null);
    }
    if (selection == null || menu == null) {
      return disable();
    }
    const rootElement = editor.getRootElement();
    let tableObserver = null;
    let tableCellParentNodeDOM = null;
    if ($isRangeSelection(selection) && rootElement !== null && nativeSelection !== null && rootElement.contains(nativeSelection.anchorNode)) {
      const tableCellNodeFromSelection = $getTableCellNodeFromLexicalNode(
        selection.anchor.getNode()
      );
      if (tableCellNodeFromSelection == null) {
        return disable();
      }
      tableCellParentNodeDOM = editor.getElementByKey(
        tableCellNodeFromSelection.getKey()
      );
      if (tableCellParentNodeDOM == null || !tableCellNodeFromSelection.isAttached()) {
        return disable();
      }
      const tableNode = $getTableNodeFromLexicalNodeOrThrow(
        tableCellNodeFromSelection
      );
      const tableElement = getTableElement(
        tableNode,
        editor.getElementByKey(tableNode.getKey())
      );
      invariant(
        tableElement !== null,
        "TableActionMenu: Expected to find tableElement in DOM"
      );
      tableObserver = getTableObserverFromTableElement(tableElement);
      setTableMenuCellNode(tableCellNodeFromSelection);
    } else if ($isTableSelection(selection)) {
      const anchorNode = $getTableCellNodeFromLexicalNode(
        selection.anchor.getNode()
      );
      invariant(
        $isTableCellNode(anchorNode),
        "TableSelection anchorNode must be a TableCellNode"
      );
      const tableNode = $getTableNodeFromLexicalNodeOrThrow(anchorNode);
      const tableElement = getTableElement(
        tableNode,
        editor.getElementByKey(tableNode.getKey())
      );
      invariant(
        tableElement !== null,
        "TableActionMenu: Expected to find tableElement in DOM"
      );
      tableObserver = getTableObserverFromTableElement(tableElement);
      tableCellParentNodeDOM = editor.getElementByKey(anchorNode.getKey());
    } else if (!activeElement) {
      return disable();
    }
    if (tableObserver === null || tableCellParentNodeDOM === null) {
      return disable();
    }
    const enabled = !tableObserver || !tableObserver.isSelecting;
    menu.classList.toggle(
      "table-cell-action-button-container--active",
      enabled
    );
    menu.classList.toggle(
      "table-cell-action-button-container--inactive",
      !enabled
    );
    if (enabled) {
      const tableCellRect = tableCellParentNodeDOM.getBoundingClientRect();
      const anchorRect = anchorElem.getBoundingClientRect();
      const top = tableCellRect.top - anchorRect.top;
      const left = tableCellRect.right - anchorRect.left;
      menu.style.transform = `translate(${left}px, ${top}px)`;
    }
  }, [editor, anchorElem]);
  useEffect(() => {
    let timeoutId = void 0;
    const callback = () => {
      timeoutId = void 0;
      editor.getEditorState().read($moveMenu);
    };
    const delayedCallback = () => {
      if (timeoutId === void 0) {
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
  return /* @__PURE__ */ React2.createElement(
    "div",
    {
      className: " absolute  top-1 left-1 will-change-transform",
      ref: menuButtonRef
    },
    tableCellNode != null && /* @__PURE__ */ React2.createElement(
      TableActionMenu,
      {
        contextRef: menuRootRef,
        tableCellNode,
        cellMerge
      }
    )
  );
}
function TableActionMenuPlugin({
  anchorElem = document.body,
  cellMerge = false
}) {
  const isEditable = useLexicalEditable();
  return createPortal(
    isEditable ? /* @__PURE__ */ React2.createElement(
      TableCellActionMenuContainer,
      {
        anchorElem,
        cellMerge
      }
    ) : null,
    anchorElem
  );
}
export {
  TableActionMenuPlugin as default
};
