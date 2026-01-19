import {
  getSelectedNode
} from "./chunk-4HBCVSE6.mjs";
import {
  sanitizeUrl
} from "./chunk-4VWFVWYP.mjs";
import {
  Input
} from "./chunk-POGRR73N.mjs";
import {
  Button
} from "./chunk-BIU7WTLX.mjs";
import {
  cn
} from "./chunk-YHPNOWFH.mjs";
import {
  React,
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/components/editor/plugins/FloatingLinkEditorPlugin/index.tsx
init_react_shim();
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  $createLinkNode,
  $isAutoLinkNode,
  $isLinkNode,
  TOGGLE_LINK_COMMAND
} from "@lexical/link";
import { $findMatchingParent, mergeRegister } from "@lexical/utils";
import {
  $getSelection,
  $isLineBreakNode,
  $isRangeSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  getDOMSelection,
  KEY_ESCAPE_COMMAND,
  SELECTION_CHANGE_COMMAND
} from "lexical";

// src/components/editor/utils/setFloatingElemPositionForLinkEditor.ts
init_react_shim();
var VERTICAL_GAP = 10;
var HORIZONTAL_OFFSET = 5;
function setFloatingElemPositionForLinkEditor(targetRect, floatingElem, anchorElem, verticalGap = VERTICAL_GAP, horizontalOffset = HORIZONTAL_OFFSET) {
  const scrollerElem = anchorElem.parentElement;
  if (targetRect === null || !scrollerElem) {
    floatingElem.style.opacity = "0";
    floatingElem.style.transform = "translate(-10000px, -10000px)";
    return;
  }
  const floatingElemRect = floatingElem.getBoundingClientRect();
  const anchorElementRect = anchorElem.getBoundingClientRect();
  const editorScrollerRect = scrollerElem.getBoundingClientRect();
  let top = targetRect.top - verticalGap;
  let left = targetRect.left - horizontalOffset;
  if (top < editorScrollerRect.top) {
    top += floatingElemRect.height + targetRect.height + verticalGap * 2;
  }
  if (left + floatingElemRect.width > editorScrollerRect.right) {
    left = editorScrollerRect.right - floatingElemRect.width - horizontalOffset;
  }
  top -= anchorElementRect.top;
  left -= anchorElementRect.left;
  floatingElem.style.opacity = "1";
  floatingElem.style.transform = `translate(${left}px, ${top}px)`;
}

// src/components/editor/plugins/FloatingLinkEditorPlugin/index.tsx
import { Check, Edit2Icon, Link, X } from "lucide-react";
function preventDefault(event) {
  event.preventDefault();
}
function FloatingLinkEditor({
  editor,
  isLink,
  setIsLink,
  anchorElem,
  isLinkEditMode,
  setIsLinkEditMode
}) {
  const editorRef = useRef(null);
  const inputRef = useRef(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [editedLinkUrl, setEditedLinkUrl] = useState("https://");
  const [lastSelection, setLastSelection] = useState(
    null
  );
  const [urlLogo, setUrlLogo] = useState(null);
  const $updateLinkEditor = useCallback(() => {
    var _a, _b;
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      const linkParent = $findMatchingParent(node, $isLinkNode);
      if (linkParent) {
        setLinkUrl(linkParent.getURL());
      } else if ($isLinkNode(node)) {
        setLinkUrl(node.getURL());
      } else {
        setLinkUrl("");
      }
      if (isLinkEditMode) {
        setEditedLinkUrl(linkUrl);
      }
    }
    const editorElem = editorRef.current;
    const nativeSelection = getDOMSelection(editor._window);
    const activeElement = document.activeElement;
    if (editorElem === null) {
      return;
    }
    const rootElement = editor.getRootElement();
    if (selection !== null && nativeSelection !== null && rootElement !== null && rootElement.contains(nativeSelection.anchorNode) && editor.isEditable()) {
      const domRect = (_b = (_a = nativeSelection.focusNode) == null ? void 0 : _a.parentElement) == null ? void 0 : _b.getBoundingClientRect();
      if (domRect) {
        domRect.y += 40;
        setFloatingElemPositionForLinkEditor(domRect, editorElem, anchorElem);
      }
      setLastSelection(selection);
    } else if (!activeElement || activeElement.className !== "link-input") {
      if (rootElement !== null) {
        setFloatingElemPositionForLinkEditor(null, editorElem, anchorElem);
      }
      setLastSelection(null);
      setIsLinkEditMode(false);
      setLinkUrl("");
    }
    return true;
  }, [anchorElem, editor, setIsLinkEditMode, isLinkEditMode, linkUrl]);
  useEffect(() => {
    const scrollerElem = anchorElem.parentElement;
    const update = () => {
      editor.getEditorState().read(() => {
        $updateLinkEditor();
      });
    };
    window.addEventListener("resize", update);
    if (scrollerElem) {
      scrollerElem.addEventListener("scroll", update);
    }
    return () => {
      window.removeEventListener("resize", update);
      if (scrollerElem) {
        scrollerElem.removeEventListener("scroll", update);
      }
    };
  }, [anchorElem.parentElement, editor, $updateLinkEditor]);
  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateLinkEditor();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          $updateLinkEditor();
          return true;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        () => {
          if (isLink) {
            setIsLink(false);
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_HIGH
      )
    );
  }, [editor, $updateLinkEditor, setIsLink, isLink]);
  useEffect(() => {
    editor.getEditorState().read(() => {
      $updateLinkEditor();
    });
  }, [editor, $updateLinkEditor]);
  useEffect(() => {
    if (isLinkEditMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLinkEditMode, isLink]);
  const monitorInputInteraction = (event) => {
    if (event.key === "Enter") {
      handleLinkSubmission(event);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setIsLinkEditMode(false);
    }
  };
  const handleLinkSubmission = (event) => {
    event.preventDefault();
    if (lastSelection !== null) {
      if (linkUrl !== "") {
        editor.update(() => {
          editor.dispatchCommand(
            TOGGLE_LINK_COMMAND,
            sanitizeUrl(editedLinkUrl)
          );
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const parent = getSelectedNode(selection).getParent();
            if ($isAutoLinkNode(parent)) {
              const linkNode = $createLinkNode(parent.getURL(), {
                rel: parent.__rel,
                target: parent.__target,
                title: parent.__title
              });
              parent.replace(linkNode, true);
            }
          }
        });
      }
      setEditedLinkUrl("https://");
      setIsLinkEditMode(false);
    }
  };
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      ref: editorRef,
      className: " absolute max-w-96 bg-background max-sm:mx-1 w-full  border-0 top-0 left-0"
    },
    isLinkEditMode ? /* @__PURE__ */ React.createElement("div", { className: " relative w-full" }, /* @__PURE__ */ React.createElement(
      Link,
      {
        className: cn(
          "size-[14px] text-muted-foreground absolute  transition-colors duration-500 transform -translate-x-1/2 -translate-y-1/2 left-4 top-1/2",
          !!editedLinkUrl && "text-black dark:text-white"
        )
      }
    ), /* @__PURE__ */ React.createElement(
      Input,
      {
        placeholder: "https://",
        value: editedLinkUrl,
        onChange: (event) => {
          setEditedLinkUrl(event.target.value);
        },
        onKeyDown: (event) => {
          monitorInputInteraction(event);
        },
        ref: inputRef,
        className: "text-gray-900 pl-7 dark:text-gray-100 rounded-xl placeholder-gray-400 dark:placeholder-gray-500"
      }
    ), /* @__PURE__ */ React.createElement("div", { className: " absolute  bg-background rounded-xl  flex flex-row  gap-x-1 items-center  transition-colors duration-500 transform -translate-y-1/2 right-2 top-1/2" }, /* @__PURE__ */ React.createElement(
      Button,
      {
        className: " rounded-xl h-6 w-6 flex items-center",
        role: "button",
        variant: "destructive",
        size: "Toolbar",
        tip: "delete link",
        tabIndex: 0,
        onMouseDown: preventDefault,
        onClick: () => {
          setIsLinkEditMode(false);
        }
      },
      /* @__PURE__ */ React.createElement(X, null)
    ), /* @__PURE__ */ React.createElement(
      Button,
      {
        className: " rounded-xl h-6 w-6 flex items-center",
        role: "button",
        tabIndex: 0,
        tip: "confirm link",
        onMouseDown: preventDefault,
        onClick: handleLinkSubmission,
        size: "Toolbar"
      },
      /* @__PURE__ */ React.createElement(Check, null)
    ))) : /* @__PURE__ */ React.createElement("div", { className: "w-full border-input border rounded-xl h-9 flex items-center justify-between px-3 py-1 text-base shadow-sm " }, /* @__PURE__ */ React.createElement(
      Link,
      {
        className: cn(
          "size-[14px] text-muted-foreground absolute  transition-colors duration-500 transform -translate-x-1/2 -translate-y-1/2 left-4 top-1/2",
          !!editedLinkUrl && "text-black dark:text-white"
        )
      }
    ), /* @__PURE__ */ React.createElement(
      "a",
      {
        href: sanitizeUrl(linkUrl),
        target: "_blank",
        rel: "noopener noreferrer",
        className: "pl-4 mb-[1px]"
      },
      linkUrl
    ), /* @__PURE__ */ React.createElement("div", { className: " absolute  bg-background rounded-xl  flex flex-row  gap-x-1 items-center  transition-colors duration-500 transform -translate-y-1/2 right-2 top-1/2" }, /* @__PURE__ */ React.createElement(
      Button,
      {
        className: " rounded-xl z-50 h-6 w-6 flex items-center",
        role: "button",
        size: "Toolbar",
        tip: "edit link",
        tabIndex: 0,
        onMouseDown: preventDefault,
        onClick: (event) => {
          event.preventDefault();
          setEditedLinkUrl(linkUrl);
          setIsLinkEditMode(true);
        }
      },
      /* @__PURE__ */ React.createElement(Edit2Icon, { className: "size-4" })
    ), /* @__PURE__ */ React.createElement(
      Button,
      {
        className: " rounded-xl h-6 w-6 flex items-center",
        role: "button",
        tabIndex: 0,
        variant: "secondary",
        tip: "delet link",
        size: "Toolbar",
        onMouseDown: preventDefault,
        onClick: () => {
          editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
        }
      },
      /* @__PURE__ */ React.createElement(X, null)
    )))
  );
}
function useFloatingLinkEditorToolbar(editor, anchorElem, isLinkEditMode, setIsLinkEditMode) {
  const [activeEditor, setActiveEditor] = useState(editor);
  const [isLink, setIsLink] = useState(false);
  useEffect(() => {
    function $updateToolbar() {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const focusNode = getSelectedNode(selection);
        const focusLinkNode = $findMatchingParent(focusNode, $isLinkNode);
        const focusAutoLinkNode = $findMatchingParent(
          focusNode,
          $isAutoLinkNode
        );
        if (!(focusLinkNode || focusAutoLinkNode)) {
          setIsLink(false);
          return;
        }
        const badNode = selection.getNodes().filter((node) => !$isLineBreakNode(node)).find((node) => {
          const linkNode = $findMatchingParent(node, $isLinkNode);
          const autoLinkNode = $findMatchingParent(node, $isAutoLinkNode);
          return focusLinkNode && !focusLinkNode.is(linkNode) || linkNode && !linkNode.is(focusLinkNode) || focusAutoLinkNode && !focusAutoLinkNode.is(autoLinkNode) || autoLinkNode && (!autoLinkNode.is(focusAutoLinkNode) || autoLinkNode.getIsUnlinked());
        });
        if (!badNode) {
          setIsLink(true);
        } else {
          setIsLink(false);
        }
      }
    }
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, newEditor) => {
          $updateToolbar();
          setActiveEditor(newEditor);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      editor.registerCommand(
        CLICK_COMMAND,
        (payload) => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const node = getSelectedNode(selection);
            const linkNode = $findMatchingParent(node, $isLinkNode);
            if ($isLinkNode(linkNode) && (payload.metaKey || payload.ctrlKey)) {
              window.open(linkNode.getURL(), "_blank");
              return true;
            }
          }
          return false;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [editor]);
  if (!isLink) return null;
  return createPortal(
    /* @__PURE__ */ React.createElement(
      FloatingLinkEditor,
      {
        editor: activeEditor,
        isLink,
        anchorElem,
        setIsLink,
        isLinkEditMode,
        setIsLinkEditMode
      }
    ),
    anchorElem
  );
}
function FloatingLinkEditorPlugin({
  anchorElem = document.body,
  isLinkEditMode,
  setIsLinkEditMode
}) {
  const [editor] = useLexicalComposerContext();
  return useFloatingLinkEditorToolbar(
    editor,
    anchorElem,
    isLinkEditMode,
    setIsLinkEditMode
  );
}

export {
  FloatingLinkEditorPlugin
};
