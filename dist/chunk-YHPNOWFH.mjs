import {
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/lib/utils.ts
init_react_shim();
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export {
  cn
};
