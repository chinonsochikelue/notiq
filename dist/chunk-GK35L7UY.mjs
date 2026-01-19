import {
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/components/editor/plugins/CodeActionMenuPlugin/utils.ts
init_react_shim();
import { debounce } from "lodash-es";
import { useMemo, useRef } from "react";
function useDebounce(fn, ms, maxWait) {
  const funcRef = useRef(null);
  funcRef.current = fn;
  return useMemo(
    () => debounce(
      (...args) => {
        if (funcRef.current) {
          funcRef.current(...args);
        }
      },
      ms,
      { maxWait }
    ),
    [ms, maxWait]
  );
}

export {
  useDebounce
};
