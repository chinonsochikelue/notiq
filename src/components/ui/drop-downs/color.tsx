import { $getSelection, LexicalEditor } from "lexical";
import React, { useCallback } from "react";
import { $patchStyleText } from "@lexical/selection";
import { useTheme } from "next-themes";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { BaselineIcon } from "lucide-react";

export default function Color({
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
  const onFontColorSelect = useCallback(
    (value: string, skipHistoryStack: boolean) => {
      applyStyleText({ color: value }, skipHistoryStack);
    },
    [applyStyleText]
  );

  const onBgColorSelect = useCallback(
    (value: string, skipHistoryStack: boolean) => {
      applyStyleText({ "background-color": value }, skipHistoryStack);
    },
    [applyStyleText]
  );
  const dark = React.useMemo(
    () => ({
      font: {
        default: "white",
        Gray: "var(--font-gray)",
        Brown: "var(--font-brown)",
        Orange: "var(--font-orange)",
        Yellow: "var(--font-yellow)",
        Green: "var(--font-green)",
        Blue: "var(--font-blue)",
        Purple: "var(--font-purple)",
        Pink: "var(--font-pink)",
        Red: "var(--font-red)",
      },
      background: {
        default: "none",
        Gray: "var(--background-gray)",
        Brown: "var(--background-brown)",
        Orange: "var(--background-orange)",
        Yellow: "var(--background-yellow)",
        Green: "var(--background-green)",
        Blue: "var(--background-blue)",
        Purple: "var(--background-purple)",
        Pink: "var(--background-pink)",
        Red: "var(--background-red)",
      },
    }),
    []
  );

  const light = React.useMemo(
    () => ({
      font: {
        Gray: "var(--font-gray)",
        Brown: "var(--font-brown)",
        Orange: "var(--font-orange)",
        Yellow: "var(--font-yellow)",
        Green: "var(--font-green)",
        Blue: "var(--font-blue)",
        Purple: "var(--font-purple)",
        Pink: "var(--font-pink)",
        Red: "var(--font-red)",
      },
      background: {
        Gray: "var(--background-gray)",
        Brown: "var(--background-brown)",
        Orange: "var(--background-orange)",
        Yellow: "var(--background-yellow)",
        Green: "var(--background-green)",
        Blue: "var(--background-blue)",
        Purple: "var(--background-purple)",
        Pink: "var(--background-pink)",
        Red: "var(--background-red)",
      },
    }),
    []
  );

  const themeColor = React.useMemo(
    () => (theme === "dark" ? dark : light),
    [theme, dark, light]
  );


  return (
    <Popover>
      <PopoverTrigger asChild disabled={disabled}>
        {!isTable ? (
          <Button
            style={{
              ...style,
              color: theme === "dark" && color === "#000" ? "white" :
                theme !== "dark" && color === "#fff" ? "black" : color,
            }}
            variant={"transparent"}
            className="px-2 border-none cursor-pointer hover:dark-bg-accent hover:text-foreground"
            size="Toolbar"
            onMouseDown={(e) => e.preventDefault()}
          >
            <BaselineIcon />
          </Button>
        ) : (<></>)}
      </PopoverTrigger>
      <PopoverContent className="max-w-32 w-full p-2 z-[250]" side={side} sideOffset={sideOffset}>
        <div className="flex flex-col">
          {!isTable && (
            <div className="flex flex-col gap-y-1">
              <span className="text-[10px] cursor-default font-bold text-gray-500">
                Font color
              </span>
              <div className="w-full flex flex-wrap gap-1">
                {Object.entries(themeColor.font).map(
                  ([_, colorValue]) => (
                    <Button
                      key={colorValue}
                      type="button"
                      onClick={() => onFontColorSelect(colorValue, true)}
                      className={cn(
                        "w-[18px] p-0 h-[18px] rounded-[3px]",
                        colorValue === color && "ring-2 ring-offset-2"
                      )}
                      style={{ background: colorValue }}
                      onMouseDown={(e) => e.preventDefault()}
                    />
                  )
                )}
              </div>
              <Separator className="my-2 h-[1px]" />
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
