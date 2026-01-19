import {
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/components/providers/AIContext.tsx
init_react_shim();
import React, { createContext, useContext } from "react";
var AIContext = createContext({
  apiEndpoint: "/api/ai"
});
var useAI = () => useContext(AIContext);
var AIProvider = ({
  config,
  children
}) => {
  const value = React.useMemo(() => ({
    apiEndpoint: (config == null ? void 0 : config.apiEndpoint) || "/api/ai"
  }), [config]);
  return /* @__PURE__ */ React.createElement(AIContext.Provider, { value }, children);
};

export {
  useAI,
  AIProvider
};
