import {
  cn
} from "./chunk-YHPNOWFH.mjs";
import {
  __objRest,
  __spreadValues,
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/components/providers/UploadContext.tsx
init_react_shim();
import React, { createContext, useContext } from "react";
var UploadContext = createContext(void 0);
var useUpload = () => useContext(UploadContext);
var UploadProvider = ({
  config,
  children
}) => {
  return /* @__PURE__ */ React.createElement(UploadContext.Provider, { value: config || {} }, children);
};

// src/components/ui/progress.tsx
init_react_shim();
import * as React2 from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
var Progress = React2.forwardRef((_a, ref) => {
  var _b = _a, { className, value } = _b, props = __objRest(_b, ["className", "value"]);
  return /* @__PURE__ */ React2.createElement(
    ProgressPrimitive.Root,
    __spreadValues({
      ref,
      className: cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
        className
      )
    }, props),
    /* @__PURE__ */ React2.createElement(
      ProgressPrimitive.Indicator,
      {
        className: "h-full w-full flex-1 bg-primary transition-all",
        style: { transform: `translateX(-${100 - (value || 0)}%)` }
      }
    )
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export {
  Progress,
  useUpload,
  UploadProvider
};
