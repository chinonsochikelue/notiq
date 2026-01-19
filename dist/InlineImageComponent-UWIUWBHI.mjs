"use client";
import {
  DialogActions,
  Select,
  TextInput
} from "./chunk-YPHOEJ46.mjs";
import {
  validateUrl
} from "./chunk-4VWFVWYP.mjs";
import {
  Button
} from "./chunk-BIU7WTLX.mjs";
import "./chunk-YHPNOWFH.mjs";
import {
  React,
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/components/editor/nodes/InlineImageNode/InlineImageComponent.tsx
init_react_shim();
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { LexicalNestedComposer } from "@lexical/react/LexicalNestedComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { useLexicalEditable } from "@lexical/react/useLexicalEditable";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import { mergeRegister } from "@lexical/utils";
import {
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  $setSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  DRAGSTART_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
  SELECTION_CHANGE_COMMAND
} from "lexical";
import { Suspense, useCallback as useCallback2, useEffect as useEffect2, useRef as useRef2, useState as useState2 } from "react";

// src/hooks/useModal.tsx
init_react_shim();
import { useCallback, useMemo, useState } from "react";
import * as React3 from "react";

// src/components/ui/Modal.tsx
init_react_shim();
import { isDOMNode } from "lexical";
import * as React2 from "react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
function PortalImpl({
  onClose,
  children,
  title,
  closeOnClickOutside
}) {
  const modalRef = useRef(null);
  useEffect(() => {
    if (modalRef.current !== null) {
      modalRef.current.focus();
    }
  }, []);
  useEffect(() => {
    let modalOverlayElement = null;
    const handler = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    const clickOutsideHandler = (event) => {
      const target = event.target;
      if (modalRef.current !== null && isDOMNode(target) && !modalRef.current.contains(target) && closeOnClickOutside) {
        onClose();
      }
    };
    const modelElement = modalRef.current;
    if (modelElement !== null) {
      modalOverlayElement = modelElement.parentElement;
      if (modalOverlayElement !== null) {
        modalOverlayElement.addEventListener("click", clickOutsideHandler);
      }
    }
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      if (modalOverlayElement !== null) {
        modalOverlayElement == null ? void 0 : modalOverlayElement.removeEventListener("click", clickOutsideHandler);
      }
    };
  }, [closeOnClickOutside, onClose]);
  return /* @__PURE__ */ React2.createElement("div", { className: "Modal__overlay", role: "dialog" }, /* @__PURE__ */ React2.createElement("div", { className: "Modal__modal", tabIndex: -1, ref: modalRef }, /* @__PURE__ */ React2.createElement("h2", { className: "Modal__title" }, title), /* @__PURE__ */ React2.createElement(
    "button",
    {
      className: "Modal__closeButton",
      "aria-label": "Close modal",
      type: "button",
      onClick: onClose
    },
    "X"
  ), /* @__PURE__ */ React2.createElement("div", { className: "Modal__content" }, children)));
}
function Modal({
  onClose,
  children,
  title,
  closeOnClickOutside = false
}) {
  return createPortal(
    /* @__PURE__ */ React2.createElement(
      PortalImpl,
      {
        onClose,
        title,
        closeOnClickOutside
      },
      children
    ),
    document.body
  );
}

// src/hooks/useModal.tsx
function useModal() {
  const [modalContent, setModalContent] = useState(null);
  const onClose = useCallback(() => {
    setModalContent(null);
  }, []);
  const modal = useMemo(() => {
    if (modalContent === null) {
      return null;
    }
    const { title, content, closeOnClickOutside } = modalContent;
    return /* @__PURE__ */ React3.createElement(
      Modal,
      {
        onClose,
        title,
        closeOnClickOutside
      },
      content
    );
  }, [modalContent, onClose]);
  const showModal = useCallback(
    (title, getContent, closeOnClickOutside = false) => {
      setModalContent({
        closeOnClickOutside,
        content: getContent(onClose),
        title
      });
    },
    [onClose]
  );
  return [modal, showModal];
}

// src/components/editor/plugins/LinkPlugin/index.tsx
init_react_shim();
import { LinkPlugin as LexicalLinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import * as React4 from "react";
function LinkPlugin({
  hasLinkAttributes = false
}) {
  return /* @__PURE__ */ React4.createElement(
    LexicalLinkPlugin,
    {
      validateUrl,
      attributes: hasLinkAttributes ? {
        rel: "noopener noreferrer",
        target: "_blank"
      } : void 0
    }
  );
}

// src/components/ui/ContentEditable.tsx
init_react_shim();
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import * as React5 from "react";
function LexicalContentEditable({
  className,
  placeholder,
  placeholderClassName
}) {
  return /* @__PURE__ */ React5.createElement(
    ContentEditable,
    {
      className: className != null ? className : "ContentEditable__root",
      "aria-placeholder": placeholder,
      placeholder: /* @__PURE__ */ React5.createElement("div", { className: placeholderClassName != null ? placeholderClassName : "ContentEditable__placeholder" }, placeholder)
    }
  );
}

// src/components/editor/nodes/InlineImageNode/InlineImageComponent.tsx
var imageCache = /* @__PURE__ */ new Set();
function useSuspenseImage(src) {
  if (!imageCache.has(src)) {
    throw new Promise((resolve) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        imageCache.add(src);
        resolve(null);
      };
      img.onerror = () => {
        imageCache.add(src);
        resolve(null);
      };
    });
  }
}
function LazyImage({
  altText,
  className,
  imageRef,
  src,
  width,
  height,
  position
}) {
  useSuspenseImage(src);
  return /* @__PURE__ */ React.createElement(
    "img",
    {
      className: `block ${className || ""}`,
      src: src || "/placeholder.svg",
      alt: altText,
      ref: imageRef,
      "data-position": position,
      style: {
        height,
        width
      },
      draggable: "false"
    }
  );
}
function UpdateInlineImageDialog({
  activeEditor,
  nodeKey,
  onClose
}) {
  const editorState = activeEditor.getEditorState();
  const node = editorState.read(() => $getNodeByKey(nodeKey));
  const [altText, setAltText] = useState2(node.getAltText());
  const [showCaption, setShowCaption] = useState2(node.getShowCaption());
  const [position, setPosition] = useState2(node.getPosition());
  const handleShowCaptionChange = (e) => {
    setShowCaption(e.target.checked);
  };
  const handlePositionChange = (e) => {
    setPosition(e.target.value);
  };
  const handleOnConfirm = () => {
    const payload = { altText, position, showCaption };
    if (node) {
      activeEditor.update(() => {
        node.update(payload);
      });
    }
    onClose();
  };
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "mb-4" }, /* @__PURE__ */ React.createElement(
    TextInput,
    {
      label: "Alt Text",
      placeholder: "Descriptive alternative text",
      onChange: setAltText,
      value: altText,
      "data-test-id": "image-modal-alt-text-input"
    }
  )), /* @__PURE__ */ React.createElement(
    Select,
    {
      className: "mb-4 w-52",
      value: position,
      label: "Position",
      name: "position",
      id: "position-select",
      onChange: handlePositionChange
    },
    /* @__PURE__ */ React.createElement("option", { value: "left" }, "Left"),
    /* @__PURE__ */ React.createElement("option", { value: "right" }, "Right"),
    /* @__PURE__ */ React.createElement("option", { value: "full" }, "Full Width")
  ), /* @__PURE__ */ React.createElement("div", { className: "flex items-center space-x-2 mb-4" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      id: "caption",
      type: "checkbox",
      checked: showCaption,
      onChange: handleShowCaptionChange,
      className: "w-4 h-4 text-primary bg-background border-border rounded focus:ring-ring focus:ring-2"
    }
  ), /* @__PURE__ */ React.createElement("label", { htmlFor: "caption", className: "text-sm font-medium text-foreground cursor-pointer" }, "Show Caption")), /* @__PURE__ */ React.createElement(DialogActions, null, /* @__PURE__ */ React.createElement(Button, { "data-test-id": "image-modal-file-upload-btn", onClick: () => handleOnConfirm() }, "Confirm")));
}
function InlineImageComponent({
  src,
  altText,
  nodeKey,
  width,
  height,
  showCaption,
  caption,
  position
}) {
  const [modal, showModal] = useModal();
  const imageRef = useRef2(null);
  const buttonRef = useRef2(null);
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
  const [editor] = useLexicalComposerContext();
  const [selection, setSelection] = useState2(null);
  const activeEditorRef = useRef2(null);
  const isEditable = useLexicalEditable();
  const $onEnter = useCallback2(
    (event) => {
      const latestSelection = $getSelection();
      const buttonElem = buttonRef.current;
      if (isSelected && $isNodeSelection(latestSelection) && latestSelection.getNodes().length === 1) {
        if (showCaption) {
          $setSelection(null);
          event.preventDefault();
          caption.focus();
          return true;
        } else if (buttonElem !== null && buttonElem !== document.activeElement) {
          event.preventDefault();
          buttonElem.focus();
          return true;
        }
      }
      return false;
    },
    [caption, isSelected, showCaption]
  );
  const $onEscape = useCallback2(
    (event) => {
      if (activeEditorRef.current === caption || buttonRef.current === event.target) {
        $setSelection(null);
        editor.update(() => {
          setSelected(true);
          const parentRootElement = editor.getRootElement();
          if (parentRootElement !== null) {
            parentRootElement.focus();
          }
        });
        return true;
      }
      return false;
    },
    [caption, editor, setSelected]
  );
  useEffect2(() => {
    let isMounted = true;
    const unregister = mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        if (isMounted) {
          setSelection(editorState.read(() => $getSelection()));
        }
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_, activeEditor) => {
          activeEditorRef.current = activeEditor;
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        CLICK_COMMAND,
        (payload) => {
          const event = payload;
          if (event.target === imageRef.current) {
            if (event.shiftKey) {
              setSelected(!isSelected);
            } else {
              clearSelection();
              setSelected(true);
            }
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        DRAGSTART_COMMAND,
        (event) => {
          if (event.target === imageRef.current) {
            const dataTransfer = event.dataTransfer;
            if (dataTransfer) {
              dataTransfer.setData("text/plain", "_");
              if (imageRef.current) {
                dataTransfer.setDragImage(imageRef.current, 0, 0);
              }
            }
            return false;
          }
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(KEY_ENTER_COMMAND, $onEnter, COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_ESCAPE_COMMAND, $onEscape, COMMAND_PRIORITY_LOW)
    );
    return () => {
      isMounted = false;
      unregister();
    };
  }, [clearSelection, editor, isSelected, nodeKey, $onEnter, $onEscape, setSelected]);
  const draggable = isSelected && $isNodeSelection(selection);
  const isFocused = isSelected && isEditable;
  return /* @__PURE__ */ React.createElement(Suspense, { fallback: null }, /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { draggable, className: "relative inline-block" }, isEditable && /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "absolute top-2 right-2 z-10 px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors",
      ref: buttonRef,
      onClick: () => {
        showModal("Update Inline Image", (onClose) => /* @__PURE__ */ React.createElement(UpdateInlineImageDialog, { activeEditor: editor, nodeKey, onClose }));
      }
    },
    "Edit"
  ), /* @__PURE__ */ React.createElement(
    LazyImage,
    {
      className: isFocused ? `ring-2 ring-ring ring-offset-2 ${$isNodeSelection(selection) ? "cursor-move" : ""}` : null,
      src,
      altText,
      imageRef,
      width,
      height,
      position
    }
  )), showCaption && /* @__PURE__ */ React.createElement("span", { className: "block mt-2 p-2 border border-border rounded-md bg-muted/50" }, /* @__PURE__ */ React.createElement(LexicalNestedComposer, { initialEditor: caption }, /* @__PURE__ */ React.createElement(AutoFocusPlugin, null), /* @__PURE__ */ React.createElement(LinkPlugin, null), /* @__PURE__ */ React.createElement(
    RichTextPlugin,
    {
      contentEditable: /* @__PURE__ */ React.createElement(
        LexicalContentEditable,
        {
          placeholder: "Enter a caption...",
          placeholderClassName: "text-xs text-muted-foreground absolute bottom-2.5 left-2.5 pointer-events-none select-none whitespace-nowrap inline-block overflow-hidden text-ellipsis",
          className: "min-h-5 border-0 resize-none cursor-text block relative outline-none p-2.5 select-text text-sm leading-relaxed w-full whitespace-pre-wrap break-words"
        }
      ),
      ErrorBoundary: LexicalErrorBoundary
    }
  )))), modal);
}
export {
  UpdateInlineImageDialog,
  InlineImageComponent as default
};
