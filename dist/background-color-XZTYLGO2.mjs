import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "./chunk-64Z3FI7T.mjs";
import {
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "./chunk-3CPBODXA.mjs";
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
  __spreadProps,
  __spreadValues,
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/components/ui/drop-downs/background-color.tsx
init_react_shim();
import { $getSelection } from "lexical";
import React, { useCallback, useState } from "react";
import { $patchStyleText } from "@lexical/selection";
import { useTheme } from "next-themes";
import { PaintBucketIcon, XIcon } from "lucide-react";
function BackgroundColor({
  disabled,
  color,
  bgColor,
  editor,
  isTable = false,
  side = "bottom",
  sideOffset = 0,
  style
}) {
  const { theme } = useTheme();
  const [customBgColor, setCustomBgColor] = useState("#ffffff");
  const [activeTab, setActiveTab] = useState("palette");
  const [recentBgColors, setRecentBgColors] = useState([]);
  const applyStyleText = useCallback(
    (styles, skipHistoryStack) => {
      editor.update(
        () => {
          const selection = $getSelection();
          if (selection !== null) {
            $patchStyleText(selection, styles);
          }
        },
        skipHistoryStack ? { tag: "historic" } : {}
      );
    },
    [editor]
  );
  const onBgColorSelect = useCallback(
    (value, skipHistoryStack) => {
      applyStyleText({ "background-color": value }, skipHistoryStack);
      if (value && value !== "transparent" && !recentBgColors.includes(value) && !value.startsWith("var(--")) {
        setRecentBgColors((prev) => [value, ...prev.slice(0, 7)]);
      }
    },
    [applyStyleText, recentBgColors]
  );
  const resetBgColor = useCallback(() => {
    applyStyleText({ "background-color": "" }, true);
  }, [applyStyleText]);
  const handleCustomBgColorChange = useCallback((value) => {
    setCustomBgColor(value);
    onBgColorSelect(value, true);
  }, [onBgColorSelect]);
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };
  const generateShades = (baseColor) => {
    const rgb = hexToRgb(baseColor);
    if (!rgb) return [];
    const shades = [];
    for (let i = 10; i <= 90; i += 10) {
      const factor = i / 100;
      const r = Math.round(rgb.r * factor);
      const g = Math.round(rgb.g * factor);
      const b = Math.round(rgb.b * factor);
      shades.push(`rgb(${r}, ${g}, ${b})`);
    }
    return shades;
  };
  const generateTints = (baseColor) => {
    const rgb = hexToRgb(baseColor);
    if (!rgb) return [];
    const tints = [];
    for (let i = 10; i <= 90; i += 10) {
      const factor = i / 100;
      const r = Math.round(rgb.r + (255 - rgb.r) * factor);
      const g = Math.round(rgb.g + (255 - rgb.g) * factor);
      const b = Math.round(rgb.b + (255 - rgb.b) * factor);
      tints.push(`rgb(${r}, ${g}, ${b})`);
    }
    return tints;
  };
  const backgroundColorPalette = React.useMemo(() => ({
    basic: [
      { name: "None", value: "transparent", isDefault: true },
      { name: "Gray", value: "var(--background-gray)" },
      { name: "Brown", value: "var(--background-brown)" },
      { name: "Orange", value: "var(--background-orange)" },
      { name: "Yellow", value: "var(--background-yellow)" },
      { name: "Green", value: "var(--background-green)" },
      { name: "Blue", value: "var(--background-blue)" },
      { name: "Purple", value: "var(--background-purple)" },
      { name: "Pink", value: "var(--background-pink)" },
      { name: "Red", value: "var(--background-red)" }
    ],
    extended: [
      // Light backgrounds
      { name: "Light Red", value: "#ffebee" },
      { name: "Light Pink", value: "#fce4ec" },
      { name: "Light Purple", value: "#f3e5f5" },
      { name: "Light Blue", value: "#e3f2fd" },
      { name: "Light Cyan", value: "#e0f2f1" },
      { name: "Light Green", value: "#e8f5e8" },
      { name: "Light Yellow", value: "#fffde7" },
      { name: "Light Orange", value: "#fff3e0" },
      { name: "Light Brown", value: "#efebe9" },
      { name: "Light Gray", value: "#fafafa" },
      // Medium backgrounds
      { name: "Red", value: "#ffcdd2" },
      { name: "Pink", value: "#f8bbd9" },
      { name: "Purple", value: "#e1bee7" },
      { name: "Blue", value: "#bbdefb" },
      { name: "Cyan", value: "#b2dfdb" },
      { name: "Green", value: "#c8e6c9" },
      { name: "Yellow", value: "#fff9c4" },
      { name: "Orange", value: "#ffe0b2" },
      { name: "Brown", value: "#d7ccc8" },
      { name: "Gray", value: "#f5f5f5" },
      // Darker backgrounds
      { name: "Dark Red", value: "#ef9a9a" },
      { name: "Dark Pink", value: "#f48fb1" },
      { name: "Dark Purple", value: "#ce93d8" },
      { name: "Dark Blue", value: "#90caf9" },
      { name: "Dark Cyan", value: "#80cbc4" },
      { name: "Dark Green", value: "#a5d6a7" },
      { name: "Dark Yellow", value: "#fff59d" },
      { name: "Dark Orange", value: "#ffcc02" },
      { name: "Dark Brown", value: "#bcaaa4" },
      { name: "Dark Gray", value: "#eeeeee" },
      // Accent colors
      { name: "Mint", value: "#f0fff4" },
      { name: "Lavender", value: "#f0f8ff" },
      { name: "Peach", value: "#ffeee6" },
      { name: "Cream", value: "#fffdd0" },
      { name: "Rose", value: "#fff0f5" }
    ]
  }), []);
  const isActiveBgColor = (colorValue) => {
    return bgColor === colorValue || !bgColor && colorValue === "transparent";
  };
  return /* @__PURE__ */ React.createElement(Popover, null, /* @__PURE__ */ React.createElement(PopoverTrigger, { asChild: true, disabled }, !isTable ? /* @__PURE__ */ React.createElement(
    Button,
    {
      style: __spreadProps(__spreadValues({}, style), {
        backgroundColor: bgColor === "#fff" || !bgColor ? "transparent" : bgColor
      }),
      variant: "ghost",
      className: cn(
        "relative px-3 py-2 h-9 border border-transparent rounded-md",
        "hover:bg-accent hover:text-accent-foreground",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "transition-all duration-200"
      ),
      size: "sm",
      onMouseDown: (e) => e.preventDefault(),
      "aria-label": "Background color options"
    },
    /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1" }, /* @__PURE__ */ React.createElement(PaintBucketIcon, { className: "w-4 h-4" }), /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "w-3 h-1 rounded-sm border border-border/50 ml-1",
        style: {
          backgroundColor: bgColor || "transparent",
          backgroundImage: !bgColor || bgColor === "transparent" ? "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)" : void 0,
          backgroundSize: !bgColor || bgColor === "transparent" ? "4px 4px" : void 0,
          backgroundPosition: !bgColor || bgColor === "transparent" ? "0 0, 0 2px, 2px -2px, -2px 0px" : void 0
        }
      }
    ))
  ) : /* @__PURE__ */ React.createElement(
    "div",
    {
      style: __spreadProps(__spreadValues({}, style), {
        backgroundColor: bgColor === "#fff" ? "transparent" : bgColor
      }),
      onMouseDown: (e) => e.preventDefault(),
      className: "cursor-pointer px-2 py-1 rounded hover:bg-accent transition-colors"
    },
    "Background"
  )), /* @__PURE__ */ React.createElement(
    PopoverContent,
    {
      className: "w-60 p-4 z-[250] shadow-lg border-border/50",
      side,
      sideOffset
    },
    /* @__PURE__ */ React.createElement(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full" }, /* @__PURE__ */ React.createElement(TabsList, { className: "grid w-full grid-cols-4" }, /* @__PURE__ */ React.createElement(TabsTrigger, { value: "palette", className: "text-xs" }, "Basic"), /* @__PURE__ */ React.createElement(TabsTrigger, { value: "extended", className: "text-xs" }, "Extended"), /* @__PURE__ */ React.createElement(TabsTrigger, { value: "custom", className: "text-xs" }, "Custom"), /* @__PURE__ */ React.createElement(TabsTrigger, { value: "recent", className: "text-xs" }, "Recent")), /* @__PURE__ */ React.createElement("div", { className: "mt-4" }, /* @__PURE__ */ React.createElement(TabsContent, { value: "palette", className: "mt-0" }, /* @__PURE__ */ React.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("span", { className: "text-sm font-semibold text-foreground" }, "Basic Backgrounds"), /* @__PURE__ */ React.createElement(
      Button,
      {
        variant: "ghost",
        size: "sm",
        onClick: resetBgColor,
        className: "h-7 px-3 text-xs text-muted-foreground hover:text-foreground"
      },
      /* @__PURE__ */ React.createElement(XIcon, { className: "w-3 h-3 mr-1" }),
      "Remove"
    )), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-5 gap-2" }, backgroundColorPalette.basic.map((colorItem, index) => /* @__PURE__ */ React.createElement(
      Button,
      {
        key: `${colorItem.name}-${index}`,
        type: "button",
        onClick: () => onBgColorSelect(colorItem.value, true),
        className: cn(
          "w-8 h-8 p-0 rounded-lg border-2 transition-all duration-200",
          "hover:scale-110 hover:shadow-md",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          isActiveBgColor(colorItem.value) ? "border-ring shadow-md scale-105" : "border-border/30 hover:border-border"
        ),
        style: {
          backgroundColor: colorItem.value === "transparent" ? "transparent" : colorItem.value,
          backgroundImage: colorItem.value === "transparent" ? "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)" : void 0,
          backgroundSize: colorItem.value === "transparent" ? "8px 8px" : void 0,
          backgroundPosition: colorItem.value === "transparent" ? "0 0, 0 4px, 4px -4px, -4px 0px" : void 0
        },
        onMouseDown: (e) => e.preventDefault(),
        title: colorItem.name
      }
    ))))), /* @__PURE__ */ React.createElement(TabsContent, { value: "extended", className: "mt-0" }, /* @__PURE__ */ React.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("span", { className: "text-sm font-semibold text-foreground" }, "Extended Backgrounds"), /* @__PURE__ */ React.createElement(
      Button,
      {
        variant: "ghost",
        size: "sm",
        onClick: resetBgColor,
        className: "h-7 px-3 text-xs text-muted-foreground hover:text-foreground"
      },
      /* @__PURE__ */ React.createElement(XIcon, { className: "w-3 h-3 mr-1" }),
      "Remove"
    )), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-5 gap-1.5 max-h-48 overflow-y-auto scrollbar-none" }, backgroundColorPalette.extended.map((colorItem, index) => /* @__PURE__ */ React.createElement(
      Button,
      {
        key: `${colorItem.name}-ext-${index}`,
        type: "button",
        onClick: () => onBgColorSelect(colorItem.value, true),
        className: cn(
          "w-8 h-8 p-0 rounded-md border-2 transition-all duration-200",
          "hover:scale-110 hover:shadow-md",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          isActiveBgColor(colorItem.value) ? "border-ring shadow-md scale-105" : "border-border/30 hover:border-border"
        ),
        style: {
          backgroundColor: colorItem.value
        },
        onMouseDown: (e) => e.preventDefault(),
        title: colorItem.name
      }
    ))))), /* @__PURE__ */ React.createElement(TabsContent, { value: "custom", className: "mt-0" }, /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("span", { className: "text-sm font-semibold text-foreground" }, "Custom Background"), /* @__PURE__ */ React.createElement(
      Button,
      {
        variant: "ghost",
        size: "sm",
        onClick: resetBgColor,
        className: "h-7 px-3 text-xs text-muted-foreground hover:text-foreground"
      },
      /* @__PURE__ */ React.createElement(XIcon, { className: "w-3 h-3 mr-1" }),
      "Remove"
    )), /* @__PURE__ */ React.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ React.createElement(
      Input,
      {
        type: "color",
        value: customBgColor,
        onChange: (e) => handleCustomBgColorChange(e.target.value),
        className: "w-16 h-10 p-1 rounded-md cursor-pointer"
      }
    ), /* @__PURE__ */ React.createElement(
      Input,
      {
        type: "text",
        value: customBgColor,
        onChange: (e) => {
          setCustomBgColor(e.target.value);
          if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
            onBgColorSelect(e.target.value, true);
          }
        },
        placeholder: "#ffffff",
        className: "flex-1 font-mono text-sm"
      }
    )), customBgColor && /* @__PURE__ */ React.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ React.createElement(Label, { className: "text-xs text-muted-foreground" }, "Shades"), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-6 gap-1" }, generateShades(customBgColor).map((shade, index) => /* @__PURE__ */ React.createElement(
      Button,
      {
        key: `bg-shade-${index}`,
        type: "button",
        onClick: () => onBgColorSelect(shade, true),
        className: "w-6 h-6 p-0 rounded border hover:scale-110 transition-transform",
        style: { backgroundColor: shade },
        onMouseDown: (e) => e.preventDefault()
      }
    ))), /* @__PURE__ */ React.createElement(Label, { className: "text-xs text-muted-foreground" }, "Tints"), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-6 gap-1" }, generateTints(customBgColor).map((tint, index) => /* @__PURE__ */ React.createElement(
      Button,
      {
        key: `bg-tint-${index}`,
        type: "button",
        onClick: () => onBgColorSelect(tint, true),
        className: "w-6 h-6 p-0 rounded border hover:scale-110 transition-transform",
        style: { backgroundColor: tint },
        onMouseDown: (e) => e.preventDefault()
      }
    ))))))), /* @__PURE__ */ React.createElement(TabsContent, { value: "recent", className: "mt-0" }, /* @__PURE__ */ React.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("span", { className: "text-sm font-semibold text-foreground" }, "Recent Backgrounds"), /* @__PURE__ */ React.createElement(
      Button,
      {
        variant: "ghost",
        size: "sm",
        onClick: () => setRecentBgColors([]),
        className: "h-7 px-3 text-xs text-muted-foreground hover:text-foreground",
        disabled: recentBgColors.length === 0
      },
      "Clear"
    )), recentBgColors.length > 0 ? /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-4 gap-2" }, recentBgColors.map((recentColor, index) => /* @__PURE__ */ React.createElement(
      Button,
      {
        key: `recent-bg-${index}`,
        type: "button",
        onClick: () => onBgColorSelect(recentColor, true),
        className: cn(
          "w-12 h-12 p-0 rounded-lg border-2 transition-all duration-200",
          "hover:scale-110 hover:shadow-md",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          isActiveBgColor(recentColor) ? "border-ring shadow-md scale-105" : "border-border/30 hover:border-border"
        ),
        style: {
          backgroundColor: recentColor
        },
        onMouseDown: (e) => e.preventDefault(),
        title: recentColor
      }
    ))) : /* @__PURE__ */ React.createElement("div", { className: "text-center py-6 text-muted-foreground text-sm" }, "No recent background colors")))))
  ));
}
export {
  BackgroundColor as default
};
