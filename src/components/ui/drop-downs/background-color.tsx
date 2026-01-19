import { $getSelection, LexicalEditor } from "lexical";
import React, { useCallback, useState } from "react";
import { $patchStyleText } from "@lexical/selection";
import { useTheme } from "next-themes";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../popover";
import { Button } from "../button";
import { Input } from "../input";
import { Label } from "../label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs";
import { cn } from "../../../lib/utils";
import { Separator } from "../separator";
import { PaintBucketIcon, PaletteIcon, XIcon } from "lucide-react";

export default function BackgroundColor({
  disabled,
  color,
  bgColor,
  editor,
  isTable = false,
  side = "bottom",
  sideOffset = 0,
  style,
}: {
  disabled: boolean;
  color?: string;
  bgColor?: string;
  editor: LexicalEditor;
  isTable?: boolean;
  style?: React.CSSProperties;
  side?: "bottom" | "left" | "right" | "top";
  sideOffset?: number;
}) {
  const { theme } = useTheme();
  const [customBgColor, setCustomBgColor] = useState("#ffffff");
  const [activeTab, setActiveTab] = useState("palette");
  const [recentBgColors, setRecentBgColors] = useState<string[]>([]);

  const applyStyleText = useCallback(
    (styles: Record<string, string>, skipHistoryStack?: boolean) => {
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
    (value: string, skipHistoryStack: boolean) => {
      applyStyleText({ "background-color": value }, skipHistoryStack);

      // Add to recent colors if it's not already there and not a default color
      if (value && value !== "transparent" && !recentBgColors.includes(value) && !value.startsWith('var(--')) {
        setRecentBgColors(prev => [value, ...prev.slice(0, 7)]); // Keep max 8 recent colors
      }
    },
    [applyStyleText, recentBgColors]
  );

  const resetBgColor = useCallback(() => {
    applyStyleText({ "background-color": "" }, true);
  }, [applyStyleText]);

  const handleCustomBgColorChange = useCallback((value: string) => {
    setCustomBgColor(value);
    onBgColorSelect(value, true);
  }, [onBgColorSelect]);

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const generateShades = (baseColor: string) => {
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

  const generateTints = (baseColor: string) => {
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
      { name: "Red", value: "var(--background-red)" },
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
      { name: "Rose", value: "#fff0f5" },
    ],
  }), []);

  const isActiveBgColor = (colorValue: string) => {
    return bgColor === colorValue || (!bgColor && colorValue === "transparent");
  };

  return (
    <Popover>
      <PopoverTrigger asChild disabled={disabled}>
        {!isTable ? (
          <Button
            style={{
              ...style,
              backgroundColor: bgColor === "#fff" || !bgColor ? "transparent" : bgColor,
            }}
            variant="ghost"
            className={cn(
              "relative px-3 py-2 h-9 border border-transparent rounded-md",
              "hover:bg-accent hover:text-accent-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              "disabled:pointer-events-none disabled:opacity-50",
              "transition-all duration-200"
            )}
            size="sm"
            onMouseDown={(e) => e.preventDefault()}
            aria-label="Background color options"
          >
            <div className="flex items-center gap-1">
              <PaintBucketIcon className="w-4 h-4" />
              {/* Background color indicator */}
              <div
                className="w-3 h-1 rounded-sm border border-border/50 ml-1"
                style={{
                  backgroundColor: bgColor || "transparent",
                  backgroundImage: (!bgColor || bgColor === "transparent")
                    ? "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)"
                    : undefined,
                  backgroundSize: (!bgColor || bgColor === "transparent") ? "4px 4px" : undefined,
                  backgroundPosition: (!bgColor || bgColor === "transparent") ? "0 0, 0 2px, 2px -2px, -2px 0px" : undefined
                }}
              />
            </div>
          </Button>
        ) : (
          <div
            style={{
              ...style,
              backgroundColor: bgColor === "#fff" ? "transparent" : bgColor,
            }}
            onMouseDown={(e) => e.preventDefault()}
            className="cursor-pointer px-2 py-1 rounded hover:bg-accent transition-colors"
          >
            Background
          </div>
        )}
      </PopoverTrigger>

      <PopoverContent
        className="w-60 p-4 z-[250] shadow-lg border-border/50"
        side={side}
        sideOffset={sideOffset}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="palette" className="text-xs">
              {/* <PaletteIcon className="w-3 h-3 mr-1" /> */}
              Basic
            </TabsTrigger>
            <TabsTrigger value="extended" className="text-xs">
              {/* <GradientIcon className="w-3 h-3 mr-1" /> */}
              Extended
            </TabsTrigger>
            <TabsTrigger value="custom" className="text-xs">
              {/* <EyeDropperIcon className="w-3 h-3 mr-1" /> */}
              Custom
            </TabsTrigger>
            <TabsTrigger value="recent" className="text-xs">
              Recent
            </TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <TabsContent value="palette" className="mt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">
                    Basic Backgrounds
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetBgColor}
                    className="h-7 px-3 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <XIcon className="w-3 h-3 mr-1" />
                    Remove
                  </Button>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {backgroundColorPalette.basic.map((colorItem, index) => (
                    <Button
                      key={`${colorItem.name}-${index}`}
                      type="button"
                      onClick={() => onBgColorSelect(colorItem.value, true)}
                      className={cn(
                        "w-8 h-8 p-0 rounded-lg border-2 transition-all duration-200",
                        "hover:scale-110 hover:shadow-md",
                        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                        isActiveBgColor(colorItem.value)
                          ? "border-ring shadow-md scale-105"
                          : "border-border/30 hover:border-border"
                      )}
                      style={{
                        backgroundColor: colorItem.value === "transparent" ? "transparent" : colorItem.value,
                        backgroundImage: colorItem.value === "transparent"
                          ? "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)"
                          : undefined,
                        backgroundSize: colorItem.value === "transparent" ? "8px 8px" : undefined,
                        backgroundPosition: colorItem.value === "transparent" ? "0 0, 0 4px, 4px -4px, -4px 0px" : undefined
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                      title={colorItem.name}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="extended" className="mt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">
                    Extended Backgrounds
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetBgColor}
                    className="h-7 px-3 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <XIcon className="w-3 h-3 mr-1" />
                    Remove
                  </Button>
                </div>

                <div className="grid grid-cols-5 gap-1.5 max-h-48 overflow-y-auto scrollbar-none">
                  {backgroundColorPalette.extended.map((colorItem, index) => (
                    <Button
                      key={`${colorItem.name}-ext-${index}`}
                      type="button"
                      onClick={() => onBgColorSelect(colorItem.value, true)}
                      className={cn(
                        "w-8 h-8 p-0 rounded-md border-2 transition-all duration-200",
                        "hover:scale-110 hover:shadow-md",
                        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                        isActiveBgColor(colorItem.value)
                          ? "border-ring shadow-md scale-105"
                          : "border-border/30 hover:border-border"
                      )}
                      style={{
                        backgroundColor: colorItem.value,
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                      title={colorItem.name}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="custom" className="mt-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">
                    Custom Background
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetBgColor}
                    className="h-7 px-3 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <XIcon className="w-3 h-3 mr-1" />
                    Remove
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={customBgColor}
                      onChange={(e) => handleCustomBgColorChange(e.target.value)}
                      className="w-16 h-10 p-1 rounded-md cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={customBgColor}
                      onChange={(e) => {
                        setCustomBgColor(e.target.value);
                        if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                          onBgColorSelect(e.target.value, true);
                        }
                      }}
                      placeholder="#ffffff"
                      className="flex-1 font-mono text-sm"
                    />
                  </div>

                  {/* Color shades */}
                  {customBgColor && (
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Shades</Label>
                      <div className="grid grid-cols-6 gap-1">
                        {generateShades(customBgColor).map((shade, index) => (
                          <Button
                            key={`bg-shade-${index}`}
                            type="button"
                            onClick={() => onBgColorSelect(shade, true)}
                            className="w-6 h-6 p-0 rounded border hover:scale-110 transition-transform"
                            style={{ backgroundColor: shade }}
                            onMouseDown={(e) => e.preventDefault()}
                          />
                        ))}
                      </div>

                      <Label className="text-xs text-muted-foreground">Tints</Label>
                      <div className="grid grid-cols-6 gap-1">
                        {generateTints(customBgColor).map((tint, index) => (
                          <Button
                            key={`bg-tint-${index}`}
                            type="button"
                            onClick={() => onBgColorSelect(tint, true)}
                            className="w-6 h-6 p-0 rounded border hover:scale-110 transition-transform"
                            style={{ backgroundColor: tint }}
                            onMouseDown={(e) => e.preventDefault()}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="recent" className="mt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">
                    Recent Backgrounds
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRecentBgColors([])}
                    className="h-7 px-3 text-xs text-muted-foreground hover:text-foreground"
                    disabled={recentBgColors.length === 0}
                  >
                    Clear
                  </Button>
                </div>

                {recentBgColors.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2">
                    {recentBgColors.map((recentColor, index) => (
                      <Button
                        key={`recent-bg-${index}`}
                        type="button"
                        onClick={() => onBgColorSelect(recentColor, true)}
                        className={cn(
                          "w-12 h-12 p-0 rounded-lg border-2 transition-all duration-200",
                          "hover:scale-110 hover:shadow-md",
                          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                          isActiveBgColor(recentColor)
                            ? "border-ring shadow-md scale-105"
                            : "border-border/30 hover:border-border"
                        )}
                        style={{
                          backgroundColor: recentColor,
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                        title={recentColor}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    No recent background colors
                  </div>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}