import {
  cn
} from "./chunk-YHPNOWFH.mjs";
import {
  React,
  __spreadProps,
  __spreadValues,
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/components/ui/models/use-model.tsx
init_react_shim();
import { useCallback, useMemo, useState } from "react";

// src/components/ui/models/custom-dialog.tsx
init_react_shim();
import { AnimatePresence, motion } from "framer-motion";
import React2, { createContext, useContext, useEffect, useRef } from "react";
import { useId } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
var DialogContext = createContext(null);
var defaultVariants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: 20
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20
  }
};
var defaultTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30
};
var backdropVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};
function Dialog({
  children,
  variants = defaultVariants,
  transition = defaultTransition,
  defaultOpen,
  onOpenChange,
  open,
  size = "md"
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React2.useState(
    defaultOpen || false
  );
  const dialogRef = useRef(null);
  const isOpen = open !== void 0 ? open : uncontrolledOpen;
  const setIsOpen = React2.useCallback(
    (value) => {
      if (open === void 0) {
        setUncontrolledOpen(value);
      }
      onOpenChange == null ? void 0 : onOpenChange(value);
    },
    [open, onOpenChange]
  );
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen) {
      document.body.style.overflow = "hidden";
      dialog.showModal();
    } else {
      document.body.style.overflow = "";
      dialog.close();
    }
    const handleCancel = (e) => {
      e.preventDefault();
      setIsOpen(false);
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    dialog.addEventListener("cancel", handleCancel);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      dialog.removeEventListener("cancel", handleCancel);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, setIsOpen]);
  const handleTrigger = () => {
    setIsOpen(true);
  };
  const onAnimationComplete = (definition) => {
    var _a;
    if (definition === "exit" && !isOpen) {
      (_a = dialogRef.current) == null ? void 0 : _a.close();
    }
  };
  const baseId = useId();
  const ids = {
    dialog: `motion-ui-dialog-${baseId}`,
    title: `motion-ui-dialog-title-${baseId}`,
    description: `motion-ui-dialog-description-${baseId}`
  };
  return /* @__PURE__ */ React2.createElement(
    DialogContext.Provider,
    {
      value: {
        isOpen,
        setIsOpen,
        dialogRef,
        variants,
        transition,
        ids,
        onAnimationComplete,
        handleTrigger,
        size
      }
    },
    children
  );
}
function DialogPortal({ children }) {
  if (typeof window !== "undefined") {
    return createPortal(children, document.body);
  }
  return null;
}
function DialogContent({
  children,
  className,
  container,
  showClose = true
}) {
  const context = useContext(DialogContext);
  if (!context) throw new Error("DialogContent must be used within Dialog");
  const {
    isOpen,
    setIsOpen,
    dialogRef,
    variants,
    transition,
    ids,
    onAnimationComplete,
    size
  } = context;
  const sizeStyles = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-full mx-4"
  };
  const content = /* @__PURE__ */ React2.createElement(AnimatePresence, { mode: "wait" }, isOpen && /* @__PURE__ */ React2.createElement(React2.Fragment, null, /* @__PURE__ */ React2.createElement(
    motion.div,
    {
      className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm",
      initial: "initial",
      animate: "animate",
      exit: "exit",
      variants: backdropVariants,
      transition: { duration: 0.2 },
      onClick: () => setIsOpen(false)
    }
  ), /* @__PURE__ */ React2.createElement(
    motion.dialog,
    {
      key: ids.dialog,
      ref: dialogRef,
      id: ids.dialog,
      "aria-labelledby": ids.title,
      "aria-describedby": ids.description,
      "aria-modal": "true",
      role: "dialog",
      onClick: (e) => {
        if (e.target === dialogRef.current) {
          setIsOpen(false);
        }
      },
      initial: "initial",
      animate: "animate",
      exit: "exit",
      variants,
      transition,
      onAnimationComplete,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 w-full translate-x-[-50%] translate-y-[-50%]",
        "grid gap-4 border border-slate-200 bg-white p-6 shadow-lg",
        "duration-200 sm:rounded-lg dark:border-slate-800 dark:bg-slate-950",
        sizeStyles[size],
        className
      )
    },
    /* @__PURE__ */ React2.createElement("div", { className: "relative w-full" }, showClose && /* @__PURE__ */ React2.createElement(DialogClose, { className: "absolute right-0 top-0" }), children)
  )));
  return /* @__PURE__ */ React2.createElement(DialogPortal, { container }, content);
}
function DialogHeader({ children, className }) {
  return /* @__PURE__ */ React2.createElement("div", { className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className) }, children);
}
function DialogTitle({ children, className }) {
  const context = useContext(DialogContext);
  if (!context) throw new Error("DialogTitle must be used within Dialog");
  return /* @__PURE__ */ React2.createElement(
    "h2",
    {
      id: context.ids.title,
      className: cn("text-lg font-semibold leading-none tracking-tight", className)
    },
    children
  );
}
function DialogDescription({ children, className }) {
  const context = useContext(DialogContext);
  if (!context) throw new Error("DialogDescription must be used within Dialog");
  return /* @__PURE__ */ React2.createElement(
    "p",
    {
      id: context.ids.description,
      className: cn("text-sm text-slate-500 dark:text-slate-400", className)
    },
    children
  );
}
function DialogClose({
  className,
  children,
  disabled,
  variant = "outline",
  size = "icon",
  asChild = false
}) {
  const context = useContext(DialogContext);
  if (!context) throw new Error("DialogClose must be used within Dialog");
  const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300";
  const variants = {
    default: "bg-slate-900 text-slate-50 hover:bg-slate-900/90 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90",
    destructive: "bg-red-500 text-slate-50 hover:bg-red-500/90 dark:bg-red-900 dark:text-slate-50 dark:hover:bg-red-900/90",
    outline: "border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-100/80 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-800/80",
    ghost: "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50"
  };
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-6 w-6"
  };
  if (asChild && React2.isValidElement(children)) {
    return React2.cloneElement(children, __spreadProps(__spreadValues({}, children.props), {
      onClick: () => context.setIsOpen(false)
    }));
  }
  if (!children) {
    return /* @__PURE__ */ React2.createElement(
      "button",
      {
        onClick: () => context.setIsOpen(false),
        type: "button",
        "aria-label": "Close dialog",
        className: cn(
          "rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100",
          "focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2",
          "disabled:pointer-events-none data-[state=open]:bg-slate-100",
          "data-[state=open]:text-slate-500 dark:ring-offset-slate-950",
          "dark:focus:ring-slate-300 dark:data-[state=open]:bg-slate-800",
          "dark:data-[state=open]:text-slate-400",
          className
        ),
        disabled
      },
      /* @__PURE__ */ React2.createElement(X, { className: "h-4 w-4" }),
      /* @__PURE__ */ React2.createElement("span", { className: "sr-only" }, "Close")
    );
  }
  return /* @__PURE__ */ React2.createElement(
    "button",
    {
      onClick: () => context.setIsOpen(false),
      type: "button",
      className: cn(baseStyles, variants[variant], sizes[size], className),
      disabled
    },
    children
  );
}

// src/components/ui/models/use-model.tsx
function useModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const onClose = useCallback(() => {
    setIsOpen(false);
    setModalContent(null);
  }, []);
  const showModal = useCallback(
    (title, description, getContent, isDilog) => {
      setIsOpen(true);
      setModalContent({
        title,
        description,
        content: getContent ? getContent(onClose) : void 0,
        isDilog
      });
    },
    [onClose]
  );
  const modal = useMemo(() => {
    if (!isOpen || !modalContent) {
      return null;
    }
    const { title, description, content, isDilog } = modalContent;
    if (!isDilog) {
      return /* @__PURE__ */ React.createElement(React.Fragment, null, content);
    }
    return /* @__PURE__ */ React.createElement(Dialog, { open: isOpen, onOpenChange: setIsOpen }, /* @__PURE__ */ React.createElement(DialogContent, { className: "w-full max-w-md bg-white p-6 dark:bg-zinc-900" }, (title || description) && /* @__PURE__ */ React.createElement(DialogHeader, null, title && /* @__PURE__ */ React.createElement(DialogTitle, { className: "text-zinc-900 dark:text-white" }, title), description && /* @__PURE__ */ React.createElement(DialogDescription, { className: "text-zinc-600 dark:text-zinc-400" }, description)), /* @__PURE__ */ React.createElement("div", { className: "mt-2" }, content), /* @__PURE__ */ React.createElement(DialogClose, null)));
  }, [isOpen, modalContent]);
  return [modal, showModal, isOpen];
}

export {
  useModal
};
