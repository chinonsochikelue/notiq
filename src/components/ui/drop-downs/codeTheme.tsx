import React from "react";
import { DropDown } from ".";
import { Palette } from "lucide-react";

export const POPULAR_CODE_THEMES: [string, string][] = [
  ["auto", "Auto (System)"],
  ["github-dark", "GitHub Dark"],
  ["github-light", "GitHub Light"],
  ["one-dark-pro", "One Dark Pro"],
  ["one-light", "One Light"],
  ["dracula", "Dracula"],
  ["nord", "Nord"],
  ["poimandres", "Poimandres"],
  ["catppuccin-mocha", "Catppuccin Mocha"],
  ["ayu-dark", "Ayu Dark"],
];

const friendlyNameMap = new Map<string, string>(POPULAR_CODE_THEMES);

export function getThemeFriendlyName(themeId: string): string {
  if (!themeId || themeId === "auto") return "Auto";
  return friendlyNameMap.get(themeId) || themeId;
}

export default function CodeThemeList({
  onCodeThemeSelect,
  disabled = false,
  codeTheme,
}: {
  onCodeThemeSelect: (theme: string) => void;
  disabled?: boolean;
  codeTheme: string;
}) {
  const themeButtons = POPULAR_CODE_THEMES.map(([id, label]) => ({
    label,
    isSelected: (!codeTheme && id === "auto") || codeTheme === id,
    func: () => onCodeThemeSelect(id),
  }));

  const activeLabel = getThemeFriendlyName(codeTheme);

  return (
    <DropDown
      values={themeButtons}
      disabled={disabled}
      triggerVariants="ghost"
      className="h-7 text-xs px-1.5 py-0 font-mono text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1"
      TriggerClassName={{ maxWidth: "140px", minWidth: "50px" }}
      TriggerLabel={
        <span className="flex items-center gap-1">
          <Palette className="h-3 w-3 opacity-70" />
          <span>{activeLabel}</span>
        </span>
      }
    />
  );
}
