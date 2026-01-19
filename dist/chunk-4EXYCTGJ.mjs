import {
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/components/providers/SharedHistoryContext.tsx
init_react_shim();
import { createEmptyHistoryState } from "@lexical/react/LexicalHistoryPlugin";
import * as React from "react";
import { createContext, useContext, useMemo } from "react";
var Context = createContext({});
var SharedHistoryContext = ({
  children
}) => {
  const historyContext = useMemo(
    () => ({ historyState: createEmptyHistoryState() }),
    []
  );
  return /* @__PURE__ */ React.createElement(Context.Provider, { value: historyContext }, children);
};
var useSharedHistoryContext = () => {
  return useContext(Context);
};

export {
  SharedHistoryContext,
  useSharedHistoryContext
};
