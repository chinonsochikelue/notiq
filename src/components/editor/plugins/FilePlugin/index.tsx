"use client";

import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $insertNodeToNearestRoot } from "@lexical/utils";
import { COMMAND_PRIORITY_EDITOR } from "lexical";
import {
  $createFileNode,
  FileNode,
  FilePayload,
  INSERT_FILE_COMMAND,
} from "../../nodes/FileNode";

export default function FilePlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([FileNode])) {
      throw new Error("FilePlugin: FileNode not registered on editor");
    }

    return editor.registerCommand<FilePayload>(
      INSERT_FILE_COMMAND,
      (payload) => {
        editor.update(() => {
          const fileNode = $createFileNode(payload);
          $insertNodeToNearestRoot(fileNode);
        });
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor]);

  return null;
}
