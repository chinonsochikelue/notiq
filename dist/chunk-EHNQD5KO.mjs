import {
  ExcalidrawModal
} from "./chunk-XWC4TK2N.mjs";
import {
  $createExcalidrawNode,
  ExcalidrawNode
} from "./chunk-KJV3FAZ7.mjs";
import {
  React,
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/components/editor/plugins/ExcalidrawPlugin/index.tsx
init_react_shim();
import "@excalidraw/excalidraw/index.css";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $wrapNodeInElement } from "@lexical/utils";
import {
  $createParagraphNode,
  $insertNodes,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_EDITOR,
  createCommand
} from "lexical";
import { useEffect, useState } from "react";
var INSERT_EXCALIDRAW_COMMAND = createCommand(
  "INSERT_EXCALIDRAW_COMMAND"
);
function ExcalidrawPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isModalOpen, setModalOpen] = useState(false);
  useEffect(() => {
    if (!editor.hasNodes([ExcalidrawNode])) {
      throw new Error(
        "ExcalidrawPlugin: ExcalidrawNode not registered on editor"
      );
    }
    return editor.registerCommand(
      INSERT_EXCALIDRAW_COMMAND,
      () => {
        setModalOpen(true);
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor]);
  const onClose = () => {
    setModalOpen(false);
  };
  const onDelete = () => {
    setModalOpen(false);
  };
  const onSave = (elements, appState, files) => {
    editor.update(() => {
      const excalidrawNode = $createExcalidrawNode();
      excalidrawNode.setData(
        JSON.stringify({
          appState,
          elements,
          files
        })
      );
      $insertNodes([excalidrawNode]);
      if ($isRootOrShadowRoot(excalidrawNode.getParentOrThrow())) {
        $wrapNodeInElement(excalidrawNode, $createParagraphNode).selectEnd();
      }
    });
    setModalOpen(false);
  };
  return isModalOpen ? /* @__PURE__ */ React.createElement(
    ExcalidrawModal,
    {
      initialElements: [],
      initialAppState: {},
      initialFiles: {},
      isShown: isModalOpen,
      onDelete,
      onClose,
      onSave,
      closeOnClickOutside: false
    }
  ) : null;
}

export {
  INSERT_EXCALIDRAW_COMMAND,
  ExcalidrawPlugin
};
