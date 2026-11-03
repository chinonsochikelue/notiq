import {
  getCodeLanguageOptions as getShikiOptions,
  normalizeCodeLanguage,
} from "@lexical/code-shiki";

const options = getShikiOptions();
const friendlyNameMap = new Map<string, string>(options);

export function getCodeLanguageOptions(): [string, string][] {
  return options;
}

export function getLanguageFriendlyName(lang: string): string {
  if (!lang) return "Plain Text";
  const normalized = normalizeCodeLanguage(lang) || lang;
  return friendlyNameMap.get(normalized) || friendlyNameMap.get(lang) || lang;
}

export function normalizeCodeLang(lang: string): string {
  if (!lang) return "";
  return normalizeCodeLanguage(lang) || lang;
}
