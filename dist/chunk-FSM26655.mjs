import {
  cn
} from "./chunk-YHPNOWFH.mjs";
import {
  __objRest,
  __spreadValues,
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/components/ui/badge.tsx
init_react_shim();
import * as React from "react";
import { cva } from "class-variance-authority";
var badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Badge(_a) {
  var _b = _a, { className, variant } = _b, props = __objRest(_b, ["className", "variant"]);
  return /* @__PURE__ */ React.createElement("div", __spreadValues({ className: cn(badgeVariants({ variant }), className) }, props));
}

export {
  Badge
};
