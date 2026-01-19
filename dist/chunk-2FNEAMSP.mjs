import {
  SHORTCUTS
} from "./chunk-ZB5LZQKC.mjs";
import {
  updateFontSize,
  updateFontSizeInSelection
} from "./chunk-PZSUSXQG.mjs";
import {
  MAX_ALLOWED_FONT_SIZE,
  MIN_ALLOWED_FONT_SIZE
} from "./chunk-7NZAPJ4G.mjs";
import {
  Input
} from "./chunk-POGRR73N.mjs";
import {
  Button
} from "./chunk-BIU7WTLX.mjs";
import {
  cn
} from "./chunk-YHPNOWFH.mjs";
import {
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/components/ui/drop-downs/font-size.tsx
init_react_shim();
import * as React from "react";
import { Minus, Plus } from "lucide-react";
function parseAllowedFontSize(input) {
  const match = input.match(/^(\d+(?:\.\d+)?)px$/);
  if (match) {
    const n = Number(match[1]);
    if (n >= MIN_ALLOWED_FONT_SIZE && n <= MAX_ALLOWED_FONT_SIZE) {
      return input;
    }
  }
  return "";
}
function FontSize({
  selectionFontSize,
  disabled,
  editor,
  className,
  classNameContent
}) {
  const [inputValue, setInputValue] = React.useState(selectionFontSize);
  const [inputChangeFlag, setInputChangeFlag] = React.useState(false);
  const handleKeyPress = (e) => {
    const inputValueNumber = Number(inputValue);
    if (e.key === "Tab") {
      return;
    }
    if (["e", "E", "+", "-"].includes(e.key) || isNaN(inputValueNumber)) {
      e.preventDefault();
      setInputValue("");
      return;
    }
    setInputChangeFlag(true);
    if (e.key === "Enter" || e.key === "Escape") {
      e.preventDefault();
      updateFontSizeByInputValue(inputValueNumber);
    }
  };
  const handleInputBlur = () => {
    if (inputValue !== "" && inputChangeFlag) {
      const inputValueNumber = Number(inputValue);
      updateFontSizeByInputValue(inputValueNumber);
    }
  };
  const updateFontSizeByInputValue = (inputValueNumber) => {
    let updatedFontSize = inputValueNumber;
    if (inputValueNumber > MAX_ALLOWED_FONT_SIZE) {
      updatedFontSize = MAX_ALLOWED_FONT_SIZE;
    } else if (inputValueNumber < MIN_ALLOWED_FONT_SIZE) {
      updatedFontSize = MIN_ALLOWED_FONT_SIZE;
    }
    setInputValue(String(updatedFontSize));
    updateFontSizeInSelection(editor, String(updatedFontSize) + "px", null);
    setInputChangeFlag(false);
  };
  React.useEffect(() => {
    setInputValue(selectionFontSize);
  }, [selectionFontSize]);
  return /* @__PURE__ */ React.createElement("div", { className: cn("flex flex-row items-center gap-1", classNameContent) }, /* @__PURE__ */ React.createElement(
    Button,
    {
      type: "button",
      className: cn("h-7 min-w-[29px] w-[29px]  px-[6px] border-none cursor-pointer", className),
      tip: `decrement ${SHORTCUTS.INCREASE_FONT_SIZE}`,
      disabled: disabled || selectionFontSize !== "" && Number(inputValue) <= MIN_ALLOWED_FONT_SIZE,
      variant: "outline",
      size: "Toolbar",
      onClick: () => updateFontSize(editor, 2 /* decrement */, inputValue)
    },
    /* @__PURE__ */ React.createElement(Minus, { className: "w-[15px] h-[15px]" })
  ), /* @__PURE__ */ React.createElement(
    Input,
    {
      type: "number",
      value: inputValue,
      disabled,
      className: cn("h-7 min-w-[29px] w-[29px]  px-[6px] border-none cursor-text", className),
      min: MIN_ALLOWED_FONT_SIZE,
      max: MAX_ALLOWED_FONT_SIZE,
      onChange: (e) => setInputValue(e.target.value),
      onKeyDown: handleKeyPress,
      onBlur: handleInputBlur
    }
  ), /* @__PURE__ */ React.createElement(
    Button,
    {
      type: "button",
      tip: `increment ${SHORTCUTS.DECREASE_FONT_SIZE}`,
      className: cn("h-7 min-w-[29px] w-[29px]  px-[6px] border-none cursor-pointer", className),
      disabled: disabled || selectionFontSize !== "" && Number(inputValue) >= MAX_ALLOWED_FONT_SIZE,
      variant: "outline",
      size: "Toolbar",
      onClick: () => updateFontSize(editor, 1 /* increment */, inputValue)
    },
    /* @__PURE__ */ React.createElement(Plus, { className: "w-4 h-4" })
  ));
}

export {
  parseAllowedFontSize,
  FontSize
};
