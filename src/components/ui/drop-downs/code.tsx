import React from "react";
import { DropDown } from ".";
import {
  getCodeLanguageOptions,
  getLanguageFriendlyName,
} from "../../editor/utils/codeLanguages";

export default function CodeList({
  onCodeLanguageSelect,
  disabled = false,
  codeLanguage,
}: {
  onCodeLanguageSelect: (v: string) => void;
  disabled?: boolean;
  codeLanguage: string;
}) {
  const CODE_LANGUAGE_OPTIONS = getCodeLanguageOptions();

  const languageButtons = CODE_LANGUAGE_OPTIONS.map(([lang, friendlyName]) => ({
    label: friendlyName || lang,
    func: () => onCodeLanguageSelect(lang),
  }));

  return (
    <DropDown
      values={languageButtons}
      disabled={disabled}
      triggerVariants="ghost"
      className="h-7 text-xs px-2 py-0 font-mono text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
      TriggerClassName={{ maxWidth: "140px", minWidth: "60px" }}
      TriggerLabel={getLanguageFriendlyName(codeLanguage) || "Plain Text"}
    />
  );
}
