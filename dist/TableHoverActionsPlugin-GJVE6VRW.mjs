import {
  useDebounce
} from "./chunk-GK35L7UY.mjs";
import {
  Button
} from "./chunk-BIU7WTLX.mjs";
import "./chunk-YHPNOWFH.mjs";
import {
  __spreadValues,
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/components/editor/plugins/TableHoverActionsPlugin/index.tsx
init_react_shim();
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalEditable } from "@lexical/react/useLexicalEditable";
import {
  $getTableAndElementByKey,
  $getTableColumnIndexFromTableCellNode,
  $getTableRowIndexFromTableCellNode,
  $insertTableColumn__EXPERIMENTAL,
  $insertTableRow__EXPERIMENTAL,
  $isTableCellNode,
  $isTableNode,
  getTableElement,
  TableNode
} from "@lexical/table";
import { $findMatchingParent, mergeRegister } from "@lexical/utils";
import { $getNearestNodeFromDOMNode, isHTMLElement } from "lexical";
import { useEffect, useMemo, useRef, useState } from "react";
import * as React from "react";
import { createPortal } from "react-dom";
import { Plus } from "lucide-react";
var BUTTON_WIDTH_PX = 20;
function TableHoverActionsContainer({
  anchorElem
}) {
  const [editor] = useLexicalComposerContext();
  const isEditable = useLexicalEditable();
  const [isShownRow, setShownRow] = useState(false);
  const [isShownColumn, setShownColumn] = useState(false);
  const [shouldListenMouseMove, setShouldListenMouseMove] = useState(false);
  const [position, setPosition] = useState({});
  const tableSetRef = useRef(/* @__PURE__ */ new Set());
  const tableCellDOMNodeRef = useRef(null);
  const debouncedOnMouseMove = useDebounce(
    (event) => {
      const { isOutside, tableDOMNode } = getMouseInfo(event);
      if (isOutside) {
        setShownRow(false);
        setShownColumn(false);
        return;
      }
      if (!tableDOMNode) {
        return;
      }
      tableCellDOMNodeRef.current = tableDOMNode;
      let hoveredRowNode = null;
      let hoveredColumnNode = null;
      let tableDOMElement = null;
      editor.getEditorState().read(
        () => {
          var _a;
          const maybeTableCell = $getNearestNodeFromDOMNode(tableDOMNode);
          if ($isTableCellNode(maybeTableCell)) {
            const table = $findMatchingParent(
              maybeTableCell,
              (node) => $isTableNode(node)
            );
            if (!$isTableNode(table)) {
              return;
            }
            tableDOMElement = getTableElement(
              table,
              editor.getElementByKey(table.getKey())
            );
            if (tableDOMElement) {
              const rowCount = table.getChildrenSize();
              const colCount = (_a = table.getChildAtIndex(0)) == null ? void 0 : _a.getChildrenSize();
              const rowIndex = $getTableRowIndexFromTableCellNode(maybeTableCell);
              const colIndex = $getTableColumnIndexFromTableCellNode(maybeTableCell);
              if (rowIndex === rowCount - 1) {
                hoveredRowNode = maybeTableCell;
              } else if (colIndex === colCount - 1) {
                hoveredColumnNode = maybeTableCell;
              }
            }
          }
        },
        { editor }
      );
      if (tableDOMElement) {
        const {
          width: tableElemWidth,
          y: tableElemY,
          right: tableElemRight,
          left: tableElemLeft,
          bottom: tableElemBottom,
          height: tableElemHeight
        } = tableDOMElement.getBoundingClientRect();
        const parentElement = tableDOMElement.parentElement;
        let tableHasScroll = false;
        if (parentElement && parentElement.classList.contains(
          "PlaygroundEditorTheme__tableScrollableWrapper"
        )) {
          tableHasScroll = parentElement.scrollWidth > parentElement.clientWidth;
        }
        const { y: editorElemY, left: editorElemLeft } = anchorElem.getBoundingClientRect();
        if (hoveredRowNode) {
          setShownColumn(false);
          setShownRow(true);
          setPosition({
            height: BUTTON_WIDTH_PX,
            left: tableHasScroll && parentElement ? parentElement.offsetLeft : tableElemLeft - editorElemLeft,
            top: tableElemBottom - editorElemY + 5,
            width: tableHasScroll && parentElement ? parentElement.offsetWidth : tableElemWidth
          });
        } else if (hoveredColumnNode) {
          setShownColumn(true);
          setShownRow(false);
          setPosition({
            height: tableElemHeight,
            left: tableElemRight - editorElemLeft + 5,
            top: tableElemY - editorElemY,
            width: BUTTON_WIDTH_PX
          });
        }
      }
    },
    1e3,
    500
  );
  const tableResizeObserver = useMemo(() => {
    return new ResizeObserver(() => {
      setShownRow(false);
      setShownColumn(false);
    });
  }, []);
  useEffect(() => {
    if (!shouldListenMouseMove) {
      return;
    }
    document.addEventListener("mousemove", debouncedOnMouseMove);
    return () => {
      setShownRow(false);
      setShownColumn(false);
      debouncedOnMouseMove.cancel();
      document.removeEventListener("mousemove", debouncedOnMouseMove);
    };
  }, [shouldListenMouseMove, debouncedOnMouseMove]);
  useEffect(() => {
    return mergeRegister(
      editor.registerMutationListener(
        TableNode,
        (mutations) => {
          editor.getEditorState().read(
            () => {
              let resetObserver = false;
              for (const [key, type] of mutations) {
                switch (type) {
                  case "created": {
                    tableSetRef.current.add(key);
                    resetObserver = true;
                    break;
                  }
                  case "destroyed": {
                    tableSetRef.current.delete(key);
                    resetObserver = true;
                    break;
                  }
                  default:
                    break;
                }
              }
              if (resetObserver) {
                tableResizeObserver.disconnect();
                for (const tableKey of tableSetRef.current) {
                  const { tableElement } = $getTableAndElementByKey(tableKey);
                  tableResizeObserver.observe(tableElement);
                }
                setShouldListenMouseMove(tableSetRef.current.size > 0);
              }
            },
            { editor }
          );
        },
        { skipInitialization: false }
      )
    );
  }, [editor, tableResizeObserver]);
  const insertAction = (insertRow) => {
    editor.update(() => {
      if (tableCellDOMNodeRef.current) {
        const maybeTableNode = $getNearestNodeFromDOMNode(
          tableCellDOMNodeRef.current
        );
        maybeTableNode == null ? void 0 : maybeTableNode.selectEnd();
        if (insertRow) {
          $insertTableRow__EXPERIMENTAL();
          setShownRow(false);
        } else {
          $insertTableColumn__EXPERIMENTAL();
          setShownColumn(false);
        }
      }
    });
  };
  if (!isEditable) {
    return null;
  }
  return /* @__PURE__ */ React.createElement(React.Fragment, null, isShownRow && /* @__PURE__ */ React.createElement(
    Button,
    {
      size: "sm",
      className: "PlaygroundEditorTheme__tableAddRows",
      style: __spreadValues({}, position),
      onClick: () => insertAction(true)
    },
    /* @__PURE__ */ React.createElement(Plus, { className: "text-black" })
  ), isShownColumn && /* @__PURE__ */ React.createElement(
    Button,
    {
      size: "sm",
      className: "PlaygroundEditorTheme__tableAddColumns",
      style: __spreadValues({}, position),
      onClick: () => insertAction(false)
    },
    /* @__PURE__ */ React.createElement(Plus, { className: "text-black" })
  ));
}
function getMouseInfo(event) {
  const target = event.target;
  if (isHTMLElement(target)) {
    const tableDOMNode = target.closest(
      "td.PlaygroundEditorTheme__tableCell, th.PlaygroundEditorTheme__tableCell"
    );
    const isOutside = !(tableDOMNode || target.closest(
      "button.PlaygroundEditorTheme__tableAddRows"
    ) || target.closest(
      "button.PlaygroundEditorTheme__tableAddColumns"
    ) || target.closest("div.TableCellResizer__resizer"));
    return { isOutside, tableDOMNode };
  } else {
    return { isOutside: true, tableDOMNode: null };
  }
}
function TableHoverActionsPlugin({
  anchorElem = document.body
}) {
  const isEditable = useLexicalEditable();
  return isEditable ? createPortal(
    /* @__PURE__ */ React.createElement(TableHoverActionsContainer, { anchorElem }),
    anchorElem
  ) : null;
}
export {
  TableHoverActionsPlugin as default
};
