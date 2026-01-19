import {
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/components/editor/utils/getSelectedNode.ts
init_react_shim();
import { $isAtNodeEnd } from "@lexical/selection";
function getSelectedNode(selection) {
  const anchor = selection.anchor;
  const focus = selection.focus;
  const anchorNode = selection.anchor.getNode();
  const focusNode = selection.focus.getNode();
  if (anchorNode === focusNode) {
    return anchorNode;
  }
  const isBackward = selection.isBackward();
  if (isBackward) {
    return $isAtNodeEnd(focus) ? anchorNode : focusNode;
  } else {
    return $isAtNodeEnd(anchor) ? anchorNode : focusNode;
  }
}

export {
  getSelectedNode
};
