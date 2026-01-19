import {
  __spreadProps,
  __spreadValues,
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/components/providers/ToolbarContext.tsx
init_react_shim();
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
var MIN_ALLOWED_FONT_SIZE = 8;
var MAX_ALLOWED_FONT_SIZE = 72;
var DEFAULT_FONT_SIZE = 15;
var blockTypeToBlockName = {
  bullet: "Bulleted List",
  check: "Check List",
  code: "Code Block",
  h1: "Heading 1",
  h2: "Heading 2",
  h3: "Heading 3",
  h4: "Heading 4",
  h5: "Heading 5",
  h6: "Heading 6",
  number: "Numbered List",
  paragraph: "Normal",
  quote: "Quote"
};
var INITIAL_TOOLBAR_STATE = {
  bgColor: "#fff",
  blockType: "paragraph",
  canRedo: false,
  canUndo: false,
  codeLanguage: "",
  elementFormat: "left",
  fontColor: "#000",
  fontFamily: "Arial",
  // Current font size in px
  fontSize: `${DEFAULT_FONT_SIZE}px`,
  // Font size input value - for controlled input
  fontSizeInputValue: `${DEFAULT_FONT_SIZE}`,
  isBold: false,
  isCode: false,
  isImageCaption: false,
  isItalic: false,
  isLink: false,
  isRTL: false,
  isStrikethrough: false,
  isSubscript: false,
  isSuperscript: false,
  isUnderline: false,
  isLowercase: false,
  isUppercase: false,
  isCapitalize: false,
  rootType: "root"
};
var Context = createContext(void 0);
var ToolbarContext = ({
  children
}) => {
  const [toolbarState, setToolbarState] = useState(INITIAL_TOOLBAR_STATE);
  const selectionFontSize = toolbarState.fontSize;
  const updateToolbarState = useCallback(
    (key, value) => {
      setToolbarState((prev) => __spreadProps(__spreadValues({}, prev), {
        [key]: value
      }));
    },
    []
  );
  useEffect(() => {
    updateToolbarState("fontSizeInputValue", selectionFontSize.slice(0, -2));
  }, [selectionFontSize, updateToolbarState]);
  const contextValue = useMemo(() => {
    return {
      toolbarState,
      updateToolbarState
    };
  }, [toolbarState, updateToolbarState]);
  return /* @__PURE__ */ React.createElement(Context.Provider, { value: contextValue }, children);
};
var useToolbarState = () => {
  const context = useContext(Context);
  if (context === void 0) {
    throw new Error("useToolbarState must be used within a ToolbarProvider");
  }
  return context;
};

export {
  MIN_ALLOWED_FONT_SIZE,
  MAX_ALLOWED_FONT_SIZE,
  DEFAULT_FONT_SIZE,
  blockTypeToBlockName,
  ToolbarContext,
  useToolbarState
};
