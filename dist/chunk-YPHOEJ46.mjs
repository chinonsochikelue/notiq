import {
  __objRest,
  __spreadProps,
  __spreadValues,
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/components/ui/TextInput.tsx
init_react_shim();
import * as React from "react";
function TextInput({
  label,
  value,
  onChange,
  placeholder = "",
  "data-test-id": dataTestId,
  type = "text"
}) {
  return /* @__PURE__ */ React.createElement("div", { className: "Input__wrapper" }, /* @__PURE__ */ React.createElement("label", { className: "Input__label" }, label), /* @__PURE__ */ React.createElement(
    "input",
    {
      type,
      className: "Input__input",
      placeholder,
      value,
      onChange: (e) => {
        onChange(e.target.value);
      },
      "data-test-id": dataTestId
    }
  ));
}

// src/components/ui/Select.tsx
init_react_shim();
import * as React2 from "react";
function Select(_a) {
  var _b = _a, {
    children,
    label,
    className
  } = _b, other = __objRest(_b, [
    "children",
    "label",
    "className"
  ]);
  return /* @__PURE__ */ React2.createElement("div", { className: "Input__wrapper" }, /* @__PURE__ */ React2.createElement("label", { style: { marginTop: "-1em" }, className: "Input__label" }, label), /* @__PURE__ */ React2.createElement("select", __spreadProps(__spreadValues({}, other), { className: className || "select" }), children));
}

// src/components/ui/dialog/Dialog.tsx
init_react_shim();
import * as React3 from "react";
function DialogActions({
  "data-test-id": dataTestId,
  children
}) {
  return /* @__PURE__ */ React3.createElement("div", { className: "DialogActions", "data-test-id": dataTestId }, children);
}

export {
  TextInput,
  Select,
  DialogActions
};
