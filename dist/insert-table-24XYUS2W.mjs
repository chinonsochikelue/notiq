import {
  Input
} from "./chunk-POGRR73N.mjs";
import {
  Button
} from "./chunk-BIU7WTLX.mjs";
import "./chunk-YHPNOWFH.mjs";
import {
  React,
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/components/ui/models/insert-table.tsx
init_react_shim();
import { INSERT_TABLE_COMMAND } from "@lexical/table";
import { useEffect, useState } from "react";
function InsertTable({
  activeEditor,
  onClose
}) {
  const [rows, setRows] = useState("5");
  const [columns, setColumns] = useState("5");
  const [isDisabled, setIsDisabled] = useState(true);
  useEffect(() => {
    const row = Number(rows);
    const column = Number(columns);
    if (row && row > 0 && row <= 500 && column && column > 0 && column <= 50) {
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
    }
  }, [rows, columns]);
  const onClick = () => {
    activeEditor.dispatchCommand(INSERT_TABLE_COMMAND, {
      columns,
      rows
    });
    onClose();
  };
  return /* @__PURE__ */ React.createElement("div", { className: "flex flex-col gap-y-2  " }, /* @__PURE__ */ React.createElement(
    Input,
    {
      placeholder: "# of rows (1-500)",
      onChange: (e) => {
        setRows(e.target.value);
      },
      value: rows,
      "data-test-id": "table-modal-rows",
      type: "number"
    }
  ), /* @__PURE__ */ React.createElement(
    Input,
    {
      placeholder: "# of columns (1-50)",
      onChange: (e) => {
        setColumns(e.target.value);
      },
      value: columns,
      "data-test-id": "table-modal-columns",
      type: "number"
    }
  ), /* @__PURE__ */ React.createElement(Button, { className: "w-full", disabled: isDisabled, onClick }, "Confirm"));
}
export {
  InsertTable
};
