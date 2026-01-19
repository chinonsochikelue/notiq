import {
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/components/editor/plugins/ShortcutsPlugin/shortcuts.ts
init_react_shim();

// src/components/editor/utils/environment.ts
init_react_shim();

// src/components/editor/utils/canUseDOM.ts
init_react_shim();
var CAN_USE_DOM = typeof window !== "undefined" && typeof window.document !== "undefined" && typeof window.document.createElement !== "undefined";

// src/components/editor/utils/environment.ts
var documentMode = CAN_USE_DOM && "documentMode" in document ? document.documentMode : null;
var IS_APPLE = CAN_USE_DOM && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
var IS_FIREFOX = CAN_USE_DOM && /^(?!.*Seamonkey)(?=.*Firefox).*/i.test(navigator.userAgent);
var CAN_USE_BEFORE_INPUT = CAN_USE_DOM && "InputEvent" in window && !documentMode ? "getTargetRanges" in new window.InputEvent("input") : false;
var IS_SAFARI = CAN_USE_DOM && /Version\/[\d.]+.*Safari/.test(navigator.userAgent);
var IS_IOS = CAN_USE_DOM && /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
var IS_ANDROID = CAN_USE_DOM && /Android/.test(navigator.userAgent);
var IS_CHROME = CAN_USE_DOM && /^(?=.*Chrome).*/i.test(navigator.userAgent);
var IS_APPLE_WEBKIT = CAN_USE_DOM && /AppleWebKit\/[\d.]+/.test(navigator.userAgent) && !IS_CHROME;

// src/components/editor/plugins/ShortcutsPlugin/shortcuts.ts
var SHORTCUTS = Object.freeze({
  // (Ctrl|⌘) + (Alt|Option) + <key> shortcuts
  NORMAL: IS_APPLE ? "\u2318+Opt+0" : "Ctrl+Alt+0",
  HEADING1: IS_APPLE ? "\u2318+Opt+1" : "Ctrl+Alt+1",
  HEADING2: IS_APPLE ? "\u2318+Opt+2" : "Ctrl+Alt+2",
  HEADING3: IS_APPLE ? "\u2318+Opt+3" : "Ctrl+Alt+3",
  BULLET_LIST: IS_APPLE ? "\u2318+Opt+4" : "Ctrl+Alt+4",
  NUMBERED_LIST: IS_APPLE ? "\u2318+Opt+5" : "Ctrl+Alt+5",
  CHECK_LIST: IS_APPLE ? "\u2318+Opt+6" : "Ctrl+Alt+6",
  CODE_BLOCK: IS_APPLE ? "\u2318+Opt+C" : "Ctrl+Alt+C",
  QUOTE: IS_APPLE ? "\u2318+Opt+Q" : "Ctrl+Alt+Q",
  // (Ctrl|⌘) + Shift + <key> shortcuts
  INCREASE_FONT_SIZE: IS_APPLE ? "\u2318+Shift+." : "Ctrl+Shift+.",
  DECREASE_FONT_SIZE: IS_APPLE ? "\u2318+Shift+," : "Ctrl+Shift+,",
  INSERT_CODE_BLOCK: IS_APPLE ? "\u2318+Shift+C" : "Ctrl+Shift+C",
  STRIKETHROUGH: IS_APPLE ? "\u2318+Shift+S" : "Ctrl+Shift+S",
  LOWERCASE: IS_APPLE ? "\u2318+Shift+1" : "Ctrl+Shift+1",
  UPPERCASE: IS_APPLE ? "\u2318+Shift+2" : "Ctrl+Shift+2",
  CAPITALIZE: IS_APPLE ? "\u2318+Shift+3" : "Ctrl+Shift+3",
  CENTER_ALIGN: IS_APPLE ? "\u2318+Shift+E" : "Ctrl+Shift+E",
  JUSTIFY_ALIGN: IS_APPLE ? "\u2318+Shift+J" : "Ctrl+Shift+J",
  LEFT_ALIGN: IS_APPLE ? "\u2318+Shift+L" : "Ctrl+Shift+L",
  RIGHT_ALIGN: IS_APPLE ? "\u2318+Shift+R" : "Ctrl+Shift+R",
  // (Ctrl|⌘) + <key> shortcuts
  SUBSCRIPT: IS_APPLE ? "\u2318+," : "Ctrl+,",
  SUPERSCRIPT: IS_APPLE ? "\u2318+." : "Ctrl+.",
  INDENT: IS_APPLE ? "\u2318+]" : "Ctrl+]",
  OUTDENT: IS_APPLE ? "\u2318+[" : "Ctrl+[",
  CLEAR_FORMATTING: IS_APPLE ? "\u2318+\\" : "Ctrl+\\",
  REDO: IS_APPLE ? "\u2318+Shift+Z" : "Ctrl+Y",
  UNDO: IS_APPLE ? "\u2318+Z" : "Ctrl+Z",
  BOLD: IS_APPLE ? "\u2318+B" : "Ctrl+B",
  ITALIC: IS_APPLE ? "\u2318+I" : "Ctrl+I",
  UNDERLINE: IS_APPLE ? "\u2318+U" : "Ctrl+U",
  INSERT_LINK: IS_APPLE ? "\u2318+K" : "Ctrl+K"
});
function controlOrMeta(metaKey, ctrlKey) {
  return IS_APPLE ? metaKey : ctrlKey;
}
function isFormatParagraph(event) {
  const { code, shiftKey, altKey, metaKey, ctrlKey } = event;
  return (code === "Numpad0" || code === "Digit0") && !shiftKey && altKey && controlOrMeta(metaKey, ctrlKey);
}
function isFormatHeading(event) {
  const { code, shiftKey, altKey, metaKey, ctrlKey } = event;
  const keyNumber = code[code.length - 1];
  return ["1", "2", "3"].includes(keyNumber) && !shiftKey && altKey && controlOrMeta(metaKey, ctrlKey);
}
function isFormatBulletList(event) {
  const { code, shiftKey, altKey, metaKey, ctrlKey } = event;
  return (code === "Numpad4" || code === "Digit4") && !shiftKey && altKey && controlOrMeta(metaKey, ctrlKey);
}
function isFormatNumberedList(event) {
  const { code, shiftKey, altKey, metaKey, ctrlKey } = event;
  return (code === "Numpad5" || code === "Digit5") && !shiftKey && altKey && controlOrMeta(metaKey, ctrlKey);
}
function isFormatCheckList(event) {
  const { code, shiftKey, altKey, metaKey, ctrlKey } = event;
  return (code === "Numpad6" || code === "Digit6") && !shiftKey && altKey && controlOrMeta(metaKey, ctrlKey);
}
function isFormatCode(event) {
  const { code, shiftKey, altKey, metaKey, ctrlKey } = event;
  return code === "KeyC" && !shiftKey && altKey && controlOrMeta(metaKey, ctrlKey);
}
function isFormatQuote(event) {
  const { code, shiftKey, altKey, metaKey, ctrlKey } = event;
  return code === "KeyQ" && !shiftKey && altKey && controlOrMeta(metaKey, ctrlKey);
}
function isLowercase(event) {
  const { code, shiftKey, altKey, metaKey, ctrlKey } = event;
  return (code === "Numpad1" || code === "Digit1") && shiftKey && !altKey && controlOrMeta(metaKey, ctrlKey);
}
function isUppercase(event) {
  const { code, shiftKey, altKey, metaKey, ctrlKey } = event;
  return (code === "Numpad2" || code === "Digit2") && shiftKey && !altKey && controlOrMeta(metaKey, ctrlKey);
}
function isCapitalize(event) {
  const { code, shiftKey, altKey, metaKey, ctrlKey } = event;
  return (code === "Numpad3" || code === "Digit3") && shiftKey && !altKey && controlOrMeta(metaKey, ctrlKey);
}
function isStrikeThrough(event) {
  const { code, shiftKey, altKey, metaKey, ctrlKey } = event;
  return code === "KeyS" && shiftKey && !altKey && controlOrMeta(metaKey, ctrlKey);
}
function isIndent(event) {
  const { code, shiftKey, altKey, metaKey, ctrlKey } = event;
  return code === "BracketRight" && !shiftKey && !altKey && controlOrMeta(metaKey, ctrlKey);
}
function isOutdent(event) {
  const { code, shiftKey, altKey, metaKey, ctrlKey } = event;
  return code === "BracketLeft" && !shiftKey && !altKey && controlOrMeta(metaKey, ctrlKey);
}
function isCenterAlign(event) {
  const { code, shiftKey, altKey, metaKey, ctrlKey } = event;
  return code === "KeyE" && shiftKey && !altKey && controlOrMeta(metaKey, ctrlKey);
}
function isLeftAlign(event) {
  const { code, shiftKey, altKey, metaKey, ctrlKey } = event;
  return code === "KeyL" && shiftKey && !altKey && controlOrMeta(metaKey, ctrlKey);
}
function isRightAlign(event) {
  const { code, shiftKey, altKey, metaKey, ctrlKey } = event;
  return code === "KeyR" && shiftKey && !altKey && controlOrMeta(metaKey, ctrlKey);
}
function isJustifyAlign(event) {
  const { code, shiftKey, altKey, metaKey, ctrlKey } = event;
  return code === "KeyJ" && shiftKey && !altKey && controlOrMeta(metaKey, ctrlKey);
}
function isSubscript(event) {
  const { code, shiftKey, altKey, metaKey, ctrlKey } = event;
  return code === "Comma" && !shiftKey && !altKey && controlOrMeta(metaKey, ctrlKey);
}
function isSuperscript(event) {
  const { code, shiftKey, altKey, metaKey, ctrlKey } = event;
  return code === "Period" && !shiftKey && !altKey && controlOrMeta(metaKey, ctrlKey);
}
function isInsertCodeBlock(event) {
  const { code, shiftKey, altKey, metaKey, ctrlKey } = event;
  return code === "KeyC" && shiftKey && !altKey && controlOrMeta(metaKey, ctrlKey);
}
function isIncreaseFontSize(event) {
  const { code, shiftKey, altKey, metaKey, ctrlKey } = event;
  return code === "Period" && shiftKey && !altKey && controlOrMeta(metaKey, ctrlKey);
}
function isDecreaseFontSize(event) {
  const { code, shiftKey, altKey, metaKey, ctrlKey } = event;
  return code === "Comma" && shiftKey && !altKey && controlOrMeta(metaKey, ctrlKey);
}
function isClearFormatting(event) {
  const { code, shiftKey, altKey, metaKey, ctrlKey } = event;
  return code === "Backslash" && !shiftKey && !altKey && controlOrMeta(metaKey, ctrlKey);
}
function isInsertLink(event) {
  const { code, shiftKey, altKey, metaKey, ctrlKey } = event;
  return code === "KeyK" && !shiftKey && !altKey && controlOrMeta(metaKey, ctrlKey);
}

export {
  CAN_USE_DOM,
  SHORTCUTS,
  isFormatParagraph,
  isFormatHeading,
  isFormatBulletList,
  isFormatNumberedList,
  isFormatCheckList,
  isFormatCode,
  isFormatQuote,
  isLowercase,
  isUppercase,
  isCapitalize,
  isStrikeThrough,
  isIndent,
  isOutdent,
  isCenterAlign,
  isLeftAlign,
  isRightAlign,
  isJustifyAlign,
  isSubscript,
  isSuperscript,
  isInsertCodeBlock,
  isIncreaseFontSize,
  isDecreaseFontSize,
  isClearFormatting,
  isInsertLink
};
