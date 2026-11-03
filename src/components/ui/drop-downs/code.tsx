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
      TriggerClassName={{ maxWidth: "200px", minWidth: "60px", width: "130px" }}
      TriggerLabel={getLanguageFriendlyName(codeLanguage)}
    />
  );
}
