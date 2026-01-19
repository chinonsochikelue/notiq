import {
  DropDown
} from "./chunk-EGMI62PP.mjs";
import {
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/components/ui/drop-downs/code.tsx
init_react_shim();
import React from "react";
import {
  CODE_LANGUAGE_FRIENDLY_NAME_MAP,
  getLanguageFriendlyName
} from "@lexical/code";
function getCodeLanguageOptions() {
  const options = [];
  for (const [lang, friendlyName] of Object.entries(
    CODE_LANGUAGE_FRIENDLY_NAME_MAP
  )) {
    options.push([lang, friendlyName]);
  }
  return options;
}
function CodeList({
  onCodeLanguageSelect,
  disabled = false,
  codeLanguage
}) {
  const CODE_LANGUAGE_OPTIONS = getCodeLanguageOptions();
  const languageButtons = CODE_LANGUAGE_OPTIONS.map(([lang]) => ({
    label: lang,
    func: () => onCodeLanguageSelect(lang)
  }));
  return /* @__PURE__ */ React.createElement(
    DropDown,
    {
      values: languageButtons,
      disabled,
      TriggerClassName: { maxWidth: "200px", minWidth: "60px", width: "130px" },
      TriggerLabel: getLanguageFriendlyName(codeLanguage)
    }
  );
}

export {
  CodeList
};
