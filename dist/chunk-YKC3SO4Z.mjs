import {
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/components/editor/plugins/TemplatePlugin/index.tsx
init_react_shim();
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $convertFromMarkdownString, TRANSFORMERS } from "@lexical/markdown";
import { COMMAND_PRIORITY_EDITOR, createCommand } from "lexical";
import { useEffect } from "react";
var INSERT_TEMPLATE_COMMAND = createCommand("INSERT_TEMPLATE_COMMAND");
function TemplatePlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    return editor.registerCommand(
      INSERT_TEMPLATE_COMMAND,
      (markdownContent) => {
        editor.update(() => {
          $convertFromMarkdownString(markdownContent, TRANSFORMERS);
        });
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor]);
  return null;
}

export {
  INSERT_TEMPLATE_COMMAND,
  TemplatePlugin
};
