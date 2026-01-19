import {
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/components/editor/utils/url.ts
init_react_shim();
var SUPPORTED_URL_PROTOCOLS = /* @__PURE__ */ new Set([
  "http:",
  "https:",
  "mailto:",
  "sms:",
  "tel:",
  "ftp:"
]);
function sanitizeUrl(url) {
  try {
    const parsedUrl = new URL(url);
    if (!SUPPORTED_URL_PROTOCOLS.has(parsedUrl.protocol)) {
      return "about:blank";
    }
  } catch (e) {
    return url;
  }
  return url;
}
var urlRegExp = new RegExp(
  /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[\w]*))?)/
);
function validateUrl(url) {
  return url === "https://" || urlRegExp.test(url);
}

export {
  sanitizeUrl,
  validateUrl
};
