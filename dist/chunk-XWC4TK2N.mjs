import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "./chunk-WDG7J2DY.mjs";
import {
  Button
} from "./chunk-BIU7WTLX.mjs";
import {
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/components/ui/excalidraw/ExcalidrawModal.tsx
init_react_shim();
import { Excalidraw } from "@excalidraw/excalidraw";
import { isDOMNode } from "lexical";
import * as React from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Save, X, Trash2, AlertTriangle, Palette } from "lucide-react";
var modalVariants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: 20
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: 0.2
    }
  }
};
var backdropVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 }
  }
};
var actionsVariants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.2, duration: 0.3 }
  }
};
function ExcalidrawModal({
  closeOnClickOutside = false,
  onSave,
  initialElements,
  initialAppState,
  initialFiles,
  isShown = false,
  onDelete,
  onClose
}) {
  const excaliDrawModelRef = useRef(null);
  const [excalidrawAPI, setExcalidrawAPI] = useState(null);
  const [discardModalOpen, setDiscardModalOpen] = useState(false);
  const [elements, setElements] = useState(initialElements);
  const [files, setFiles] = useState(initialFiles);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  useEffect(() => {
    var _a;
    (_a = excaliDrawModelRef.current) == null ? void 0 : _a.focus();
  }, []);
  useEffect(() => {
    var _a;
    let modalOverlayElement = null;
    const clickOutsideHandler = (event) => {
      const target = event.target;
      if (excaliDrawModelRef.current !== null && isDOMNode(target) && !excaliDrawModelRef.current.contains(target) && closeOnClickOutside) {
        if (hasUnsavedChanges) {
          setDiscardModalOpen(true);
        } else {
          onDelete();
        }
      }
    };
    if (excaliDrawModelRef.current !== null) {
      modalOverlayElement = (_a = excaliDrawModelRef.current) == null ? void 0 : _a.parentElement;
      modalOverlayElement == null ? void 0 : modalOverlayElement.addEventListener("click", clickOutsideHandler);
    }
    return () => {
      modalOverlayElement == null ? void 0 : modalOverlayElement.removeEventListener("click", clickOutsideHandler);
    };
  }, [closeOnClickOutside, onDelete, hasUnsavedChanges]);
  useLayoutEffect(() => {
    const currentModalRef = excaliDrawModelRef.current;
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (hasUnsavedChanges) {
          setDiscardModalOpen(true);
        } else {
          onDelete();
        }
      }
      if (event.ctrlKey || event.metaKey) {
        if (event.key === "s") {
          event.preventDefault();
          save();
        }
      }
    };
    currentModalRef == null ? void 0 : currentModalRef.addEventListener("keydown", onKeyDown);
    return () => {
      currentModalRef == null ? void 0 : currentModalRef.removeEventListener("keydown", onKeyDown);
    };
  }, [elements, files, onDelete, hasUnsavedChanges]);
  const save = () => {
    if (elements == null ? void 0 : elements.some((el) => !el.isDeleted)) {
      const appState = excalidrawAPI == null ? void 0 : excalidrawAPI.getAppState();
      const partialState = {
        exportBackground: appState == null ? void 0 : appState.exportBackground,
        exportScale: appState == null ? void 0 : appState.exportScale,
        exportWithDarkMode: (appState == null ? void 0 : appState.theme) === "dark",
        isBindingEnabled: appState == null ? void 0 : appState.isBindingEnabled,
        isLoading: appState == null ? void 0 : appState.isLoading,
        name: appState == null ? void 0 : appState.name,
        theme: appState == null ? void 0 : appState.theme,
        viewBackgroundColor: appState == null ? void 0 : appState.viewBackgroundColor,
        viewModeEnabled: appState == null ? void 0 : appState.viewModeEnabled,
        zenModeEnabled: appState == null ? void 0 : appState.zenModeEnabled,
        zoom: appState == null ? void 0 : appState.zoom
      };
      onSave(elements, partialState, files);
      setHasUnsavedChanges(false);
    } else {
      onDelete();
    }
  };
  const discard = () => {
    if (hasUnsavedChanges) {
      setDiscardModalOpen(true);
    } else {
      onClose();
    }
  };
  const handleConfirmDiscard = () => {
    setDiscardModalOpen(false);
    setHasUnsavedChanges(false);
    onClose();
  };
  function DiscardConfirmationDialog() {
    return /* @__PURE__ */ React.createElement(Dialog, { open: discardModalOpen, onOpenChange: setDiscardModalOpen }, /* @__PURE__ */ React.createElement(DialogContent, { className: "sm:max-w-md" }, /* @__PURE__ */ React.createElement(DialogHeader, { className: "text-center sm:text-center" }, /* @__PURE__ */ React.createElement("div", { className: "mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20" }, /* @__PURE__ */ React.createElement(AlertTriangle, { className: "h-6 w-6 text-red-600 dark:text-red-400" })), /* @__PURE__ */ React.createElement(DialogTitle, { className: "text-lg font-semibold text-gray-900 dark:text-gray-100" }, "Discard Changes?"), /* @__PURE__ */ React.createElement(DialogDescription, { className: "text-sm text-gray-500 dark:text-gray-400" }, "You have unsaved changes in your drawing. Are you sure you want to discard them? This action cannot be undone.")), /* @__PURE__ */ React.createElement(DialogFooter, { className: "gap-3 pt-6" }, /* @__PURE__ */ React.createElement(
      Button,
      {
        variant: "outline",
        onClick: () => setDiscardModalOpen(false),
        className: "flex-1 sm:flex-none"
      },
      "Cancel"
    ), /* @__PURE__ */ React.createElement(
      Button,
      {
        variant: "destructive",
        onClick: handleConfirmDiscard,
        className: "flex-1 sm:flex-none"
      },
      /* @__PURE__ */ React.createElement(Trash2, { className: "mr-2 h-4 w-4" }),
      "Discard"
    ))));
  }
  if (isShown === false) {
    return null;
  }
  const onChange = (els, _, fls) => {
    setElements(els);
    setFiles(fls);
    const hasChanges = els && initialElements ? els.length !== initialElements.length || els.some((el, idx) => JSON.stringify(el) !== JSON.stringify(initialElements[idx])) : els !== initialElements;
    setHasUnsavedChanges(hasChanges);
  };
  const hasContent = elements == null ? void 0 : elements.some((el) => !el.isDeleted);
  return createPortal(
    /* @__PURE__ */ React.createElement(AnimatePresence, { mode: "wait" }, /* @__PURE__ */ React.createElement(
      motion.div,
      {
        className: "fixed inset-0 z-[250] flex items-center justify-center",
        initial: "initial",
        animate: "animate",
        exit: "exit",
        variants: backdropVariants
      },
      /* @__PURE__ */ React.createElement(
        motion.div,
        {
          className: "absolute inset-0 bg-black/60 backdrop-blur-sm",
          onClick: () => {
            if (closeOnClickOutside) {
              if (hasUnsavedChanges) {
                setDiscardModalOpen(true);
              } else {
                onDelete();
              }
            }
          }
        }
      ),
      /* @__PURE__ */ React.createElement(
        motion.div,
        {
          className: "relative z-10 mx-4 flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900",
          ref: excaliDrawModelRef,
          tabIndex: -1,
          variants: modalVariants,
          role: "dialog",
          "aria-modal": "true",
          "aria-labelledby": "excalidraw-title",
          "aria-describedby": "excalidraw-description"
        },
        /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-800/50" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center space-x-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20" }, /* @__PURE__ */ React.createElement(Palette, { className: "h-5 w-5 text-blue-600 dark:text-blue-400" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(
          "h2",
          {
            id: "excalidraw-title",
            className: "text-lg font-semibold text-gray-900 dark:text-gray-100"
          },
          "Drawing Editor"
        ), /* @__PURE__ */ React.createElement(
          "p",
          {
            id: "excalidraw-description",
            className: "text-sm text-gray-500 dark:text-gray-400"
          },
          "Create and edit your drawings with Excalidraw",
          hasUnsavedChanges && /* @__PURE__ */ React.createElement("span", { className: "ml-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900/20 dark:text-amber-400" }, "Unsaved changes")
        ))), /* @__PURE__ */ React.createElement(
          Button,
          {
            variant: "ghost",
            size: "icon",
            onClick: () => {
              if (hasUnsavedChanges) {
                setDiscardModalOpen(true);
              } else {
                onDelete();
              }
            },
            className: "h-8 w-8",
            "aria-label": "Close drawing editor"
          },
          /* @__PURE__ */ React.createElement(X, { className: "h-4 w-4" })
        )),
        /* @__PURE__ */ React.createElement("div", { className: "flex-1 overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "h-full w-full" }, /* @__PURE__ */ React.createElement(
          Excalidraw,
          {
            onChange,
            excalidrawAPI: setExcalidrawAPI,
            initialData: {
              appState: initialAppState || { isLoading: false },
              elements: initialElements,
              files: initialFiles
            },
            theme: "light"
          }
        ))),
        /* @__PURE__ */ React.createElement(
          motion.div,
          {
            className: "flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-800/50",
            variants: actionsVariants
          },
          /* @__PURE__ */ React.createElement("div", { className: "flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center space-x-1" }, /* @__PURE__ */ React.createElement("kbd", { className: "rounded bg-gray-200 px-2 py-1 text-xs font-mono dark:bg-gray-700" }, "Ctrl"), /* @__PURE__ */ React.createElement("span", null, "+"), /* @__PURE__ */ React.createElement("kbd", { className: "rounded bg-gray-200 px-2 py-1 text-xs font-mono dark:bg-gray-700" }, "S"), /* @__PURE__ */ React.createElement("span", { className: "ml-1" }, "to save")), /* @__PURE__ */ React.createElement("span", { className: "text-gray-300 dark:text-gray-600" }, "\u2022"), /* @__PURE__ */ React.createElement("div", { className: "flex items-center space-x-1" }, /* @__PURE__ */ React.createElement("kbd", { className: "rounded bg-gray-200 px-2 py-1 text-xs font-mono dark:bg-gray-700" }, "Esc"), /* @__PURE__ */ React.createElement("span", { className: "ml-1" }, "to close"))),
          /* @__PURE__ */ React.createElement("div", { className: "flex items-center space-x-3" }, /* @__PURE__ */ React.createElement(
            Button,
            {
              variant: "outline",
              onClick: discard,
              className: "min-w-[100px]"
            },
            /* @__PURE__ */ React.createElement(X, { className: "mr-2 h-4 w-4" }),
            hasUnsavedChanges ? "Discard" : "Close"
          ), /* @__PURE__ */ React.createElement(
            Button,
            {
              onClick: save,
              disabled: !hasContent,
              className: "min-w-[100px]"
            },
            /* @__PURE__ */ React.createElement(Save, { className: "mr-2 h-4 w-4" }),
            "Save Drawing"
          ))
        )
      ),
      discardModalOpen && /* @__PURE__ */ React.createElement(DiscardConfirmationDialog, null)
    )),
    document.body
  );
}

export {
  ExcalidrawModal
};
