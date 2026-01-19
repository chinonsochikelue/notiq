import {
  INSERT_POLL_COMMAND
} from "./chunk-U47ABU5Z.mjs";
import "./chunk-GZPNVR7L.mjs";
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

// src/components/ui/models/insert-poll.tsx
init_react_shim();
import { useState } from "react";
function InsertPoll({
  activeEditor,
  onClose
}) {
  const [question, setQuestion] = useState("");
  const onClick = () => {
    activeEditor.dispatchCommand(INSERT_POLL_COMMAND, question);
    onClose();
  };
  return /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React.createElement(Input, { placeholder: "Question?", onChange: (e) => setQuestion(e.target.value), value: question }), /* @__PURE__ */ React.createElement(Button, { disabled: question.trim() === "", onClick }, "Confirm"));
}
export {
  InsertPoll
};
