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

// src/components/ui/drop-downs/color.tsx
init_react_shim();
import { $getSelection } from "lexical";
import React, { useCallback, useState } from "react";
import { $patchStyleText } from "@lexical/selection";
import { useTheme } from "next-themes";
import { PaletteIcon } from "lucide-react";
function Color({
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
  const [customColor, setCustomColor] = useState("#000000");
  const [activeTab, setActiveTab] = useState("palette");
  const [recentColors, setRecentColors] = useState([]);
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
  const onFontColorSelect = useCallback(
    (value, skipHistoryStack) => {
      applyStyleText({ color: value }, skipHistoryStack);
      if (value && !recentColors.includes(value) && !value.startsWith("var(--")) {
        setRecentColors((prev) => [value, ...prev.slice(0, 7)]);
      }
    },
    [applyStyleText, recentColors]
  );
  const resetFontColor = useCallback(() => {
    applyStyleText({ color: "" }, true);
  }, [applyStyleText]);
  const handleCustomColorChange = useCallback((value) => {
    setCustomColor(value);
    onFontColorSelect(value, true);
  }, [onFontColorSelect]);
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };
  const rgbToHsl = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
        default:
          h = 0;
      }
      h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
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
  const colorPalette = React.useMemo(() => ({
    basic: [
      { name: "Default", value: theme === "dark" ? "white" : "black", isDefault: true },
      { name: "Gray", value: "var(--font-gray)" },
      { name: "Brown", value: "var(--font-brown)" },
      { name: "Orange", value: "var(--font-orange)" },
      { name: "Yellow", value: "var(--font-yellow)" },
      { name: "Green", value: "var(--font-green)" },
      { name: "Blue", value: "var(--font-blue)" },
      { name: "Purple", value: "var(--font-purple)" },
      { name: "Pink", value: "var(--font-pink)" },
      { name: "Red", value: "var(--font-red)" }
    ],
    extended: [
      // Reds
      { name: "Light Red", value: "#ffcccb" },
      { name: "Red", value: "#ff0000" },
      { name: "Dark Red", value: "#8b0000" },
      { name: "Crimson", value: "#dc143c" },
      { name: "Rose", value: "#ff69b4" },
      // Oranges
      { name: "Light Orange", value: "#ffd700" },
      { name: "Orange", value: "#ffa500" },
      { name: "Dark Orange", value: "#ff8c00" },
      { name: "Coral", value: "#ff7f50" },
      { name: "Peach", value: "#ffcba4" },
      // Yellows
      { name: "Light Yellow", value: "#ffffe0" },
      { name: "Yellow", value: "#ffff00" },
      { name: "Gold", value: "#ffd700" },
      { name: "Amber", value: "#ffbf00" },
      { name: "Khaki", value: "#f0e68c" },
      // Greens
      { name: "Light Green", value: "#90ee90" },
      { name: "Green", value: "#008000" },
      { name: "Dark Green", value: "#006400" },
      { name: "Forest", value: "#228b22" },
      { name: "Emerald", value: "#50c878" },
      // Blues
      { name: "Light Blue", value: "#add8e6" },
      { name: "Blue", value: "#0000ff" },
      { name: "Dark Blue", value: "#00008b" },
      { name: "Navy", value: "#000080" },
      { name: "Cyan", value: "#00ffff" },
      // Purples
      { name: "Light Purple", value: "#dda0dd" },
      { name: "Purple", value: "#800080" },
      { name: "Dark Purple", value: "#4b0082" },
      { name: "Violet", value: "#8a2be2" },
      { name: "Indigo", value: "#4b0082" },
      // Grays
      { name: "Light Gray", value: "#d3d3d3" },
      { name: "Gray", value: "#808080" },
      { name: "Dark Gray", value: "#696969" },
      { name: "Silver", value: "#c0c0c0" },
      { name: "Charcoal", value: "#36454f" }
    ]
  }), [theme]);
  const isActiveColor = (colorValue) => {
    return color === colorValue || !color && colorValue === (theme === "dark" ? "white" : "black");
  };
  return /* @__PURE__ */ React.createElement(Popover, null, /* @__PURE__ */ React.createElement(PopoverTrigger, { asChild: true, disabled }, !isTable ? /* @__PURE__ */ React.createElement(
    Button,
    {
      style: __spreadProps(__spreadValues({}, style), {
        color: theme === "dark" && color === "#000" ? "white" : theme !== "dark" && color === "#fff" ? "black" : color
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
      "aria-label": "Text color options"
    },
    /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1" }, /* @__PURE__ */ React.createElement(PaletteIcon, { className: "w-4 h-4 dark:text-white" }), /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "w-3 h-1 rounded-sm border border-border/50 ml-1",
        style: { backgroundColor: color || (theme === "dark" ? "white" : "black") }
      }
    ))
  ) : null), /* @__PURE__ */ React.createElement(
    PopoverContent,
    {
      className: "max-w-60 p-4 z-[250] shadow-lg border-border/50",
      side,
      sideOffset
    },
    /* @__PURE__ */ React.createElement(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full" }, /* @__PURE__ */ React.createElement(TabsList, { className: "grid w-full grid-cols-4" }, /* @__PURE__ */ React.createElement(TabsTrigger, { value: "palette", className: "text-xs" }, "Basic"), /* @__PURE__ */ React.createElement(TabsTrigger, { value: "extended", className: "text-xs" }, "Extended"), /* @__PURE__ */ React.createElement(TabsTrigger, { value: "custom", className: "text-xs" }, "Custom"), /* @__PURE__ */ React.createElement(TabsTrigger, { value: "recent", className: "text-xs" }, "Recent")), /* @__PURE__ */ React.createElement("div", { className: "mt-4" }, /* @__PURE__ */ React.createElement(TabsContent, { value: "palette", className: "mt-0" }, /* @__PURE__ */ React.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("span", { className: "text-sm font-semibold text-foreground" }, "Basic Colors"), /* @__PURE__ */ React.createElement(
      Button,
      {
        variant: "ghost",
        size: "sm",
        onClick: resetFontColor,
        className: "h-7 px-3 text-xs text-muted-foreground hover:text-foreground"
      },
      "Reset"
    )), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-5 gap-2" }, colorPalette.basic.map((colorItem, index) => /* @__PURE__ */ React.createElement(
      Button,
      {
        key: `${colorItem.name}-${index}`,
        type: "button",
        onClick: () => onFontColorSelect(colorItem.value, true),
        className: cn(
          "w-8 h-8 p-0 rounded-lg border-2 transition-all duration-200",
          "hover:scale-110 hover:shadow-md",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          isActiveColor(colorItem.value) ? "border-ring shadow-md scale-105" : "border-border/30 hover:border-border"
        ),
        style: {
          backgroundColor: colorItem.value
        },
        onMouseDown: (e) => e.preventDefault(),
        title: colorItem.name
      }
    ))))), /* @__PURE__ */ React.createElement(TabsContent, { value: "extended", className: "mt-0" }, /* @__PURE__ */ React.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("span", { className: "text-sm font-semibold text-foreground" }, "Extended Palette"), /* @__PURE__ */ React.createElement(
      Button,
      {
        variant: "ghost",
        size: "sm",
        onClick: resetFontColor,
        className: "h-7 px-3 text-xs text-muted-foreground hover:text-foreground"
      },
      "Reset"
    )), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-5 gap-1.5 max-h-48 overflow-y-auto scrollbar-none" }, colorPalette.extended.map((colorItem, index) => /* @__PURE__ */ React.createElement(
      Button,
      {
        key: `${colorItem.name}-ext-${index}`,
        type: "button",
        onClick: () => onFontColorSelect(colorItem.value, true),
        className: cn(
          "w-8 h-8 p-0 rounded-md border-2 transition-all duration-200",
          "hover:scale-110 hover:shadow-md",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          isActiveColor(colorItem.value) ? "border-ring shadow-md scale-105" : "border-border/30 hover:border-border"
        ),
        style: {
          backgroundColor: colorItem.value
        },
        onMouseDown: (e) => e.preventDefault(),
        title: colorItem.name
      }
    ))))), /* @__PURE__ */ React.createElement(TabsContent, { value: "custom", className: "mt-0" }, /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("span", { className: "text-sm font-semibold text-foreground" }, "Custom Color"), /* @__PURE__ */ React.createElement(
      Button,
      {
        variant: "ghost",
        size: "sm",
        onClick: resetFontColor,
        className: "h-7 px-3 text-xs text-muted-foreground hover:text-foreground"
      },
      "Reset"
    )), /* @__PURE__ */ React.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ React.createElement(
      Input,
      {
        type: "color",
        value: customColor,
        onChange: (e) => handleCustomColorChange(e.target.value),
        className: "w-16 h-10 p-1 rounded-md cursor-pointer"
      }
    ), /* @__PURE__ */ React.createElement(
      Input,
      {
        type: "text",
        value: customColor,
        onChange: (e) => {
          setCustomColor(e.target.value);
          if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
            onFontColorSelect(e.target.value, true);
          }
        },
        placeholder: "#000000",
        className: "flex-1 font-mono text-sm"
      }
    )), customColor && /* @__PURE__ */ React.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ React.createElement(Label, { className: "text-xs text-muted-foreground" }, "Shades"), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-6 gap-1" }, generateShades(customColor).map((shade, index) => /* @__PURE__ */ React.createElement(
      Button,
      {
        key: `shade-${index}`,
        type: "button",
        onClick: () => onFontColorSelect(shade, true),
        className: "w-6 h-6 p-0 rounded border hover:scale-110 transition-transform",
        style: { backgroundColor: shade },
        onMouseDown: (e) => e.preventDefault()
      }
    ))), /* @__PURE__ */ React.createElement(Label, { className: "text-xs text-muted-foreground" }, "Tints"), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-6 gap-1" }, generateTints(customColor).map((tint, index) => /* @__PURE__ */ React.createElement(
      Button,
      {
        key: `tint-${index}`,
        type: "button",
        onClick: () => onFontColorSelect(tint, true),
        className: "w-6 h-6 p-0 rounded border hover:scale-110 transition-transform",
        style: { backgroundColor: tint },
        onMouseDown: (e) => e.preventDefault()
      }
    ))))))), /* @__PURE__ */ React.createElement(TabsContent, { value: "recent", className: "mt-0" }, /* @__PURE__ */ React.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("span", { className: "text-sm font-semibold text-foreground" }, "Recent Colors"), /* @__PURE__ */ React.createElement(
      Button,
      {
        variant: "ghost",
        size: "sm",
        onClick: () => setRecentColors([]),
        className: "h-7 px-3 text-xs text-muted-foreground hover:text-foreground",
        disabled: recentColors.length === 0
      },
      "Clear"
    )), recentColors.length > 0 ? /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-4 gap-2" }, recentColors.map((recentColor, index) => /* @__PURE__ */ React.createElement(
      Button,
      {
        key: `recent-${index}`,
        type: "button",
        onClick: () => onFontColorSelect(recentColor, true),
        className: cn(
          "w-12 h-12 p-0 rounded-lg border-2 transition-all duration-200",
          "hover:scale-110 hover:shadow-md",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          isActiveColor(recentColor) ? "border-ring shadow-md scale-105" : "border-border/30 hover:border-border"
        ),
        style: {
          backgroundColor: recentColor
        },
        onMouseDown: (e) => e.preventDefault(),
        title: recentColor
      }
    ))) : /* @__PURE__ */ React.createElement("div", { className: "text-center py-6 text-muted-foreground text-sm" }, "No recent colors")))))
  ));
}

export {
  Color
};
