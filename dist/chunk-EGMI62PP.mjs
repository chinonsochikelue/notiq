import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut
} from "./chunk-KJ6AJ44Q.mjs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "./chunk-64Z3FI7T.mjs";
import {
  Button
} from "./chunk-BIU7WTLX.mjs";
import {
  cn
} from "./chunk-YHPNOWFH.mjs";
import {
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/components/ui/drop-downs/index.tsx
init_react_shim();
import * as React from "react";
import { ChevronsUpDown } from "lucide-react";
function DropDown({
  className,
  TriggerLabel,
  TriggerClassName,
  values,
  disabled,
  PopoverContentClassName,
  triggerVariants = "outline",
  ShowChevronsUpDown = true,
  side = "bottom",
  sideOffset = 5
}) {
  const [value, setValue] = React.useState("");
  return /* @__PURE__ */ React.createElement(Popover, { modal: false }, /* @__PURE__ */ React.createElement(PopoverTrigger, { disabled, asChild: true }, /* @__PURE__ */ React.createElement(
    Button,
    {
      variant: triggerVariants,
      role: "combobox",
      size: "Toolbar",
      style: TriggerClassName,
      className
    },
    /* @__PURE__ */ React.createElement("div", { className: "flex  flex-row justify-center gap-x-3 items-center" }, TriggerLabel),
    ShowChevronsUpDown && /* @__PURE__ */ React.createElement(ChevronsUpDown, { className: "ml-2 h-4 w-4 shrink-0 opacity-50" })
  )), /* @__PURE__ */ React.createElement(
    PopoverContent,
    {
      side,
      sideOffset,
      style: PopoverContentClassName,
      className: "w-[200px] p-0 dropdown-portal"
    },
    /* @__PURE__ */ React.createElement(Command, null, /* @__PURE__ */ React.createElement(CommandInput, { placeholder: "Search..." }), /* @__PURE__ */ React.createElement(CommandList, null, /* @__PURE__ */ React.createElement(CommandEmpty, null, "No found."), /* @__PURE__ */ React.createElement(CommandGroup, null, values.map((framework) => /* @__PURE__ */ React.createElement(
      CommandItem,
      {
        key: framework.label,
        value: framework.label,
        style: framework.style,
        className: cn(
          "cursor-pointer",
          value === framework.label && "bg-gray-300/10"
        ),
        onSelect: (currentValue) => {
          setValue(currentValue === value ? "" : currentValue);
          if (framework.func) framework == null ? void 0 : framework.func();
        }
      },
      /* @__PURE__ */ React.createElement("div", { className: "flex w-full flex-row items-center justify-between" }, /* @__PURE__ */ React.createElement("div", { className: "flex  items-center gap-4 flex-row" }, framework.icon, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col" }, framework.label, /* @__PURE__ */ React.createElement("span", { className: "text-sm text-muted-foreground" }, framework.desc))), framework.shortcuts && /* @__PURE__ */ React.createElement(CommandShortcut, null, framework.shortcuts))
    )))))
  ));
}

export {
  DropDown
};
