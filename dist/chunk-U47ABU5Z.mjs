import {
  $createPollNode,
  PollNode,
  createPollOption
} from "./chunk-GZPNVR7L.mjs";
import {
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/components/editor/plugins/PollPlugin/index.tsx
init_react_shim();
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $wrapNodeInElement } from "@lexical/utils";
import {
  $createParagraphNode,
  $insertNodes,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_EDITOR,
  createCommand
} from "lexical";
import { useEffect } from "react";
var INSERT_POLL_COMMAND = createCommand(
  "INSERT_POLL_COMMAND"
);
function PollPlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (!editor.hasNodes([PollNode])) {
      throw new Error("PollPlugin: PollNode not registered on editor");
    }
    return editor.registerCommand(
      INSERT_POLL_COMMAND,
      (payload) => {
        const pollNode = $createPollNode(payload, [
          createPollOption(),
          createPollOption()
        ]);
        $insertNodes([pollNode]);
        if ($isRootOrShadowRoot(pollNode.getParentOrThrow())) {
          $wrapNodeInElement(pollNode, $createParagraphNode).selectEnd();
        }
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor]);
  return null;
}

export {
  INSERT_POLL_COMMAND,
  PollPlugin
};
