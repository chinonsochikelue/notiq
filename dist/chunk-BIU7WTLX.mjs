import {
  cn
} from "./chunk-YHPNOWFH.mjs";
import {
  __objRest,
  __spreadValues,
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/components/ui/button.tsx
init_react_shim();
import * as React2 from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

// src/components/ui/tooltip.tsx
init_react_shim();
import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
var TooltipProvider = TooltipPrimitive.Provider;
var Tooltip = TooltipPrimitive.Root;
var TooltipTrigger = TooltipPrimitive.Trigger;
var TooltipContent = React.forwardRef((_a, ref) => {
  var _b = _a, { className, sideOffset = 4 } = _b, props = __objRest(_b, ["className", "sideOffset"]);
  return /* @__PURE__ */ React.createElement(TooltipPrimitive.Portal, null, /* @__PURE__ */ React.createElement(
    TooltipPrimitive.Content,
    __spreadValues({
      ref,
      sideOffset,
      className: cn(
        "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )
    }, props)
  ));
});
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

// src/components/ui/button.tsx
var buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        transparent: "bg-transparent border border-input"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
        Toolbar: "h-7 w-7 p-3 ",
        custom: ""
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
var Button = React2.forwardRef(
  (_a, ref) => {
    var _b = _a, { className, variant, tip, size, asChild = false } = _b, props = __objRest(_b, ["className", "variant", "tip", "size", "asChild"]);
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ React2.createElement(React2.Fragment, null, !!tip ? /* @__PURE__ */ React2.createElement(TooltipProvider, null, /* @__PURE__ */ React2.createElement(Tooltip, null, /* @__PURE__ */ React2.createElement(TooltipTrigger, { asChild: true }, /* @__PURE__ */ React2.createElement(
      Comp,
      __spreadValues({
        className: cn(buttonVariants({ variant, size, className })),
        ref
      }, props)
    )), /* @__PURE__ */ React2.createElement(TooltipContent, null, /* @__PURE__ */ React2.createElement("p", null, tip)))) : /* @__PURE__ */ React2.createElement(
      Comp,
      __spreadValues({
        className: cn(buttonVariants({ variant, size, className })),
        ref
      }, props)
    ));
  }
);
Button.displayName = "Button";

export {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  Button
};
