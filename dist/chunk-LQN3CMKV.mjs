import {
  Toggle
} from "./chunk-Z4EWP7BI.mjs";
import {
  getSelectedNode
} from "./chunk-4HBCVSE6.mjs";
import {
  BlockFormatDropDown
} from "./chunk-K36V4SIW.mjs";
import {
  Color
} from "./chunk-YMBXLRW5.mjs";
import {
  TextFormat
} from "./chunk-456TN7IM.mjs";
import {
  Font
} from "./chunk-7VUMHWWL.mjs";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from "./chunk-KJ6AJ44Q.mjs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "./chunk-64Z3FI7T.mjs";
import {
  FontSize
} from "./chunk-2FNEAMSP.mjs";
import {
  useAI
} from "./chunk-YUDCJRJM.mjs";
import {
  $createStepperNode
} from "./chunk-6RNZQOH2.mjs";
import {
  CollapsibleContainerNode,
  CollapsibleTitleNode
} from "./chunk-GXYD4VZM.mjs";
import {
  SHORTCUTS
} from "./chunk-ZB5LZQKC.mjs";
import {
  Separator
} from "./chunk-TCYK7DM7.mjs";
import {
  sanitizeUrl
} from "./chunk-4VWFVWYP.mjs";
import {
  cn
} from "./chunk-YHPNOWFH.mjs";
import {
  React,
  __objRest,
  __spreadProps,
  __spreadValues,
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/components/editor/plugins/FloatingTextFormatToolbarPlugin/index.tsx
init_react_shim();
import { $isCodeHighlightNode } from "@lexical/code";
import { $isLinkNode } from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $findMatchingParent,
  $getNearestNodeOfType,
  mergeRegister as mergeRegister2
} from "@lexical/utils";
import {
  $getSelection as $getSelection3,
  $isParagraphNode,
  $isRangeSelection as $isRangeSelection2,
  $isRootOrShadowRoot,
  $isTextNode as $isTextNode2,
  getDOMSelection as getDOMSelection2
} from "lexical";
import { useCallback as useCallback3, useEffect as useEffect5, useState as useState5 } from "react";
import * as React6 from "react";
import { createPortal } from "react-dom";
import {
  $getSelectionStyleValueForProperty
} from "@lexical/selection";
import { useRef as useRef4 } from "react";
import { $isTableNode } from "@lexical/table";
import { $isListNode, ListNode as ListNode2 } from "@lexical/list";
import { $isHeadingNode } from "@lexical/rich-text";

// src/components/ui/write/text-format-floting-toolbar.tsx
init_react_shim();
import {
  $getSelection as $getSelection2,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  getDOMSelection,
  SELECTION_CHANGE_COMMAND
} from "lexical";
import { useCallback as useCallback2, useEffect as useEffect4, useRef as useRef3 } from "react";
import { TOGGLE_LINK_COMMAND } from "@lexical/link";

// src/components/editor/utils/getDOMRangeRect.ts
init_react_shim();
function getDOMRangeRect(nativeSelection, rootElement) {
  const domRange = nativeSelection.getRangeAt(0);
  let rect;
  if (nativeSelection.anchorNode === rootElement) {
    let inner = rootElement;
    while (inner.firstElementChild != null) {
      inner = inner.firstElementChild;
    }
    rect = inner.getBoundingClientRect();
  } else {
    rect = domRange.getBoundingClientRect();
  }
  return rect;
}

// src/components/editor/utils/setFloatingElemPosition.ts
init_react_shim();
var VERTICAL_GAP = 10;
var HORIZONTAL_OFFSET = 5;
function isKeyboardOpen() {
  if (typeof window === "undefined") return false;
  const isMobile = window.innerWidth < 768;
  if (!isMobile) return false;
  const activeElement = document.activeElement;
  const isInputFocused = activeElement && (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA" || activeElement instanceof HTMLElement && activeElement.contentEditable === "true" || activeElement.getAttribute("contenteditable") === "true");
  return !!isInputFocused;
}
function getKeyboardHeight() {
  if (typeof window === "undefined") return 0;
  const isMobile = window.innerWidth < 768;
  if (!isMobile) return 0;
  return 280;
}
function setFloatingElemPosition(targetRect, floatingElem, anchorElem, verticalGap = VERTICAL_GAP, horizontalOffset = HORIZONTAL_OFFSET) {
  const scrollerElem = anchorElem.parentElement;
  if (targetRect === null || !scrollerElem) {
    floatingElem.style.opacity = "0";
    floatingElem.style.transform = "translate(-10000px, -10000px)";
    return;
  }
  const floatingElemRect = floatingElem.getBoundingClientRect();
  const anchorElementRect = anchorElem.getBoundingClientRect();
  const editorScrollerRect = scrollerElem.getBoundingClientRect();
  const isMobile = window.innerWidth < 768;
  const keyboardOpen = isKeyboardOpen();
  const keyboardHeight = keyboardOpen ? getKeyboardHeight() : 0;
  let top = targetRect.bottom + verticalGap;
  let left = targetRect.left + horizontalOffset;
  if (isMobile && keyboardOpen) {
    const viewportHeight = window.innerHeight;
    const toolbarHeight = floatingElemRect.height;
    const keyboardTop = viewportHeight - keyboardHeight;
    top = keyboardTop - toolbarHeight - 20;
    left = (window.innerWidth - floatingElemRect.width) / 2;
    top -= anchorElementRect.top;
    left -= anchorElementRect.left;
  } else {
    if (top + floatingElemRect.height > editorScrollerRect.bottom) {
      top = targetRect.top - floatingElemRect.height - verticalGap;
    }
    if (left + floatingElemRect.width > editorScrollerRect.right) {
      left = editorScrollerRect.right - floatingElemRect.width - horizontalOffset;
    }
    if (left < editorScrollerRect.left) {
      left = editorScrollerRect.left + horizontalOffset;
    }
    top -= anchorElementRect.top;
    left -= anchorElementRect.left;
  }
  floatingElem.style.transition = "transform 0.2s ease-in-out, opacity 0.2s ease-in-out";
  floatingElem.style.opacity = "1";
  floatingElem.style.transform = `translate(${left}px, ${top}px)`;
}

// src/components/ui/write/text-format-floting-toolbar.tsx
import { mergeRegister } from "@lexical/utils";

// src/hooks/use-mobile.ts
init_react_shim();
import * as React2 from "react";
var MOBILE_BREAKPOINT = 768;
function useIsMobile() {
  const [isMobile, setIsMobile] = React2.useState(void 0);
  React2.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return !!isMobile;
}

// src/components/ui/write/text-format-floting-toolbar.tsx
import { Bold, Code, Italic, Link, UnderlineIcon } from "lucide-react";

// src/components/ui/ai/ai-button.tsx
init_react_shim();
import { Loader2, RotateCcw, StarsIcon, WandSparkles } from "lucide-react";
import React5, { useMemo, useState as useState4 } from "react";

// src/components/ui/hover-card.tsx
init_react_shim();
import * as React3 from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
var HoverCard = HoverCardPrimitive.Root;
var HoverCardTrigger = HoverCardPrimitive.Trigger;
var HoverCardContent = React3.forwardRef((_a, ref) => {
  var _b = _a, { className, align = "center", sideOffset = 4 } = _b, props = __objRest(_b, ["className", "align", "sideOffset"]);
  return /* @__PURE__ */ React3.createElement(
    HoverCardPrimitive.Content,
    __spreadValues({
      ref,
      align,
      sideOffset,
      className: cn(
        "z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )
    }, props)
  );
});
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName;

// src/components/ui/ai/border.tsx
init_react_shim();
import React4, { useState as useState2, useEffect as useEffect2 } from "react";
import { motion } from "framer-motion";
function HoverBorderGradient(_a) {
  var _b = _a, {
    children,
    containerClassName,
    className,
    as: Tag = "button",
    duration = 1,
    clockwise = true
  } = _b, props = __objRest(_b, [
    "children",
    "containerClassName",
    "className",
    "as",
    "duration",
    "clockwise"
  ]);
  const [hovered, setHovered] = useState2(false);
  const [direction, setDirection] = useState2("TOP");
  const rotateDirection = (currentDirection) => {
    const directions = ["TOP", "LEFT", "BOTTOM", "RIGHT"];
    const currentIndex = directions.indexOf(currentDirection);
    const nextIndex = clockwise ? (currentIndex - 1 + directions.length) % directions.length : (currentIndex + 1) % directions.length;
    return directions[nextIndex];
  };
  const movingMap = {
    TOP: "radial-gradient(20.7% 50% at 50% 0%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)",
    LEFT: "radial-gradient(16.6% 43.1% at 0% 50%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)",
    BOTTOM: "radial-gradient(20.7% 50% at 50% 100%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)",
    RIGHT: "radial-gradient(16.2% 41.199999999999996% at 100% 50%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)"
  };
  const highlight = "radial-gradient(75% 181.15942028985506% at 50% 50%, #3275F8 0%, rgba(255, 255, 255, 0) 100%)";
  useEffect2(() => {
    if (!hovered) {
      const interval = setInterval(() => {
        setDirection((prevState) => rotateDirection(prevState));
      }, duration * 1e3);
      return () => clearInterval(interval);
    }
  }, [hovered]);
  return /* @__PURE__ */ React4.createElement(
    Tag,
    __spreadValues({
      onMouseEnter: (event) => {
        setHovered(true);
      },
      onMouseLeave: () => setHovered(false),
      className: cn(
        "relative flex rounded-full border  content-center bg-black/20 hover:bg-black/10 transition duration-500 dark:bg-white/20 items-center flex-col flex-nowrap  justify-center overflow-visible p-px decoration-clone w-fit",
        containerClassName
      )
    }, props),
    /* @__PURE__ */ React4.createElement(
      "div",
      {
        className: cn(
          "w-auto text-white z-10 bg-black  rounded-[inherit]",
          className
        )
      },
      children
    ),
    /* @__PURE__ */ React4.createElement(
      motion.div,
      {
        className: cn(
          "flex-none inset-0 overflow-hidden absolute z-0 rounded-[inherit]"
        ),
        style: {
          filter: "blur(2px)",
          position: "absolute",
          width: "100%",
          height: "100%"
        },
        initial: { background: movingMap[direction] },
        animate: {
          background: hovered ? [movingMap[direction], highlight] : movingMap[direction]
        },
        transition: { ease: "linear", duration: duration != null ? duration : 1 }
      }
    ),
    /* @__PURE__ */ React4.createElement("div", { className: "bg-black absolute z-1 flex-none inset-[2px] rounded-[100px]" })
  );
}

// src/components/ui/ai/placeholder-input-vanish.tsx
init_react_shim();
import { AnimatePresence, motion as motion2 } from "framer-motion";
import { useCallback, useEffect as useEffect3, useRef as useRef2, useState as useState3 } from "react";
function PlaceholdersAndVanishInput({
  placeholders: placeholders2,
  onChange,
  onSubmit,
  disabled
}) {
  const [currentPlaceholder, setCurrentPlaceholder] = useState3(0);
  const intervalRef = useRef2(null);
  const startAnimation = () => {
    intervalRef.current = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders2.length);
    }, 3e3);
  };
  const handleVisibilityChange = () => {
    if (document.visibilityState !== "visible" && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    } else if (document.visibilityState === "visible") {
      startAnimation();
    }
  };
  useEffect3(() => {
    startAnimation();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [placeholders2]);
  const canvasRef = useRef2(null);
  const newDataRef = useRef2([]);
  const inputRef = useRef2(null);
  const [value, setValue] = useState3("");
  const [animating, setAnimating] = useState3(false);
  const draw = useCallback(() => {
    if (!inputRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = 800;
    canvas.height = 800;
    ctx.clearRect(0, 0, 800, 800);
    const computedStyles = getComputedStyle(inputRef.current);
    const fontSize = parseFloat(computedStyles.getPropertyValue("font-size"));
    ctx.font = `${fontSize * 2}px ${computedStyles.fontFamily}`;
    ctx.fillStyle = "#FFF";
    ctx.fillText(value, 16, 40);
    const imageData = ctx.getImageData(0, 0, 800, 800);
    const pixelData = imageData.data;
    const newData = [];
    for (let t = 0; t < 800; t++) {
      let i = 4 * t * 800;
      for (let n = 0; n < 800; n++) {
        let e = i + 4 * n;
        if (pixelData[e] !== 0 && pixelData[e + 1] !== 0 && pixelData[e + 2] !== 0) {
          newData.push({
            x: n,
            y: t,
            color: [
              pixelData[e],
              pixelData[e + 1],
              pixelData[e + 2],
              pixelData[e + 3]
            ]
          });
        }
      }
    }
    newDataRef.current = newData.map(({ x, y, color }) => ({
      x,
      y,
      r: 1,
      color: `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`
    }));
  }, [value]);
  useEffect3(() => {
    draw();
  }, [value, draw]);
  const animate = (start) => {
    const animateFrame = (pos = 0) => {
      requestAnimationFrame(() => {
        var _a;
        const newArr = [];
        for (let i = 0; i < newDataRef.current.length; i++) {
          const current = newDataRef.current[i];
          if (current.x < pos) {
            newArr.push(current);
          } else {
            if (current.r <= 0) {
              current.r = 0;
              continue;
            }
            current.x += Math.random() > 0.5 ? 1 : -1;
            current.y += Math.random() > 0.5 ? 1 : -1;
            current.r -= 0.05 * Math.random();
            newArr.push(current);
          }
        }
        newDataRef.current = newArr;
        const ctx = (_a = canvasRef.current) == null ? void 0 : _a.getContext("2d");
        if (ctx) {
          ctx.clearRect(pos, 0, 800, 800);
          newDataRef.current.forEach((t) => {
            const { x: n, y: i, r: s, color } = t;
            if (n > pos) {
              ctx.beginPath();
              ctx.rect(n, i, s, s);
              ctx.fillStyle = color;
              ctx.strokeStyle = color;
              ctx.stroke();
            }
          });
        }
        if (newDataRef.current.length > 0) {
          animateFrame(pos - 8);
        } else {
          setValue("");
          setAnimating(false);
        }
      });
    };
    animateFrame(start);
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !animating) {
      vanishAndSubmit();
    }
  };
  const vanishAndSubmit = () => {
    var _a;
    setAnimating(true);
    draw();
    const value2 = ((_a = inputRef.current) == null ? void 0 : _a.value) || "";
    if (value2 && inputRef.current) {
      const maxX = newDataRef.current.reduce(
        (prev, current) => current.x > prev ? current.x : prev,
        0
      );
      animate(maxX);
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    vanishAndSubmit();
    onSubmit && onSubmit(e);
  };
  return /* @__PURE__ */ React.createElement(
    "form",
    {
      suppressHydrationWarning: true,
      className: cn(
        "w-full relative max-w-xl mx-auto  h-9 rounded-sm overflow-hidden shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),_0px_1px_0px_0px_rgba(25,28,33,0.02),_0px_0px_0px_1px_rgba(25,28,33,0.08)] transition duration-200"
      ),
      onSubmit: handleSubmit
    },
    /* @__PURE__ */ React.createElement(
      "canvas",
      {
        className: cn(
          "absolute pointer-events-none  text-base transform scale-50 top-[20%] left-2 sm:left-8 origin-top-left filter invert dark:invert-0 pr-20",
          !animating ? "opacity-0" : "opacity-100"
        ),
        ref: canvasRef
      }
    ),
    /* @__PURE__ */ React.createElement(
      "input",
      {
        disabled,
        onChange: (e) => {
          if (!animating) {
            setValue(e.target.value);
            onChange && onChange(e);
          }
        },
        onKeyDown: handleKeyDown,
        ref: inputRef,
        value,
        type: "text",
        className: cn(
          "w-full relative text-sm sm:text-base z-50 border-none dark:text-white bg-transparent text-black h-full  focus:outline-none focus:ring-0 pl-4 sm:pl-10 pr-20",
          animating && "text-transparent dark:text-transparent"
        )
      }
    ),
    /* @__PURE__ */ React.createElement(
      "button",
      {
        disabled: !value || disabled,
        type: "submit",
        className: "absolute right-2 top-1/2 z-50 -translate-y-1/2 h-5 w-5 rounded-full disabled:bg-gray-100 bg-black dark:bg-zinc-900 dark:disabled:bg-zinc-800 transition duration-200 flex items-center justify-center"
      },
      /* @__PURE__ */ React.createElement(
        motion2.svg,
        {
          xmlns: "http://www.w3.org/2000/svg",
          width: "24",
          height: "24",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          className: "text-gray-300 h-4 w-4"
        },
        /* @__PURE__ */ React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }),
        /* @__PURE__ */ React.createElement(
          motion2.path,
          {
            d: "M5 12l14 0",
            initial: {
              strokeDasharray: "50%",
              strokeDashoffset: "50%"
            },
            animate: {
              strokeDashoffset: value ? 0 : "50%"
            },
            transition: {
              duration: 0.3,
              ease: "linear"
            }
          }
        ),
        /* @__PURE__ */ React.createElement("path", { d: "M13 18l6 -6" }),
        /* @__PURE__ */ React.createElement("path", { d: "M13 6l6 6" })
      )
    ),
    /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 flex items-center rounded-full pointer-events-none" }, /* @__PURE__ */ React.createElement(AnimatePresence, { mode: "wait" }, !value && /* @__PURE__ */ React.createElement(
      motion2.p,
      {
        initial: {
          y: 5,
          opacity: 0
        },
        key: `current-placeholder-${currentPlaceholder}`,
        animate: {
          y: 0,
          opacity: 1
        },
        exit: {
          y: -15,
          opacity: 0
        },
        transition: {
          duration: 0.3,
          ease: "linear"
        },
        className: "dark:text-zinc-500 text-sm sm:text-base font-normal text-neutral-500 pl-4 sm:pl-12 text-left w-[calc(100%-2rem)] truncate"
      },
      placeholders2[currentPlaceholder]
    )))
  );
}

// src/components/ui/ai/ai-button.tsx
import { motion as motion3 } from "framer-motion";

// src/components/editor/utils/ai.ts
init_react_shim();
import { $createCodeNode } from "@lexical/code";
import {
  $createParagraphNode,
  $createRangeSelection,
  $createTextNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  createEditor
} from "lexical";
import {
  $createHeadingNode
} from "@lexical/rich-text";
function getWordsBeforeSelection(editor, numWords) {
  let wordsBeforeSelection = "";
  editor.update(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) {
      console.warn("No valid text selection found.");
      return;
    }
    const anchor = selection.anchor;
    const firstTextNode = findFirstTextNode($getRoot());
    if (!firstTextNode) {
      console.warn("No text nodes found in the document.");
      return;
    }
    const range = $createRangeSelection();
    range.anchor.set(firstTextNode.__key, 0, "text");
    range.focus.set(anchor.key, anchor.offset, anchor.type);
    const textContent = range.getTextContent();
    const words = textContent.split(/\s+/).filter((word) => word.length > 0);
    const startIndex = Math.max(0, words.length - numWords);
    wordsBeforeSelection = words.slice(startIndex, words.length).join(" ");
  });
  return wordsBeforeSelection;
}
function findFirstTextNode(node) {
  if ($isTextNode(node)) {
    return node;
  }
  const children = node.getChildren();
  for (const child of children) {
    const result = findFirstTextNode(child);
    if (result) {
      return result;
    }
  }
  return null;
}
function isJSON(text) {
  try {
    JSON.parse(text);
    return true;
  } catch (err) {
    return false;
  }
}
function createEditorWithText(text) {
  const editor = createEditor();
  const editorState = editor.parseEditorState(
    JSON.stringify({
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text,
                type: "text",
                version: 1
              }
            ],
            direction: null,
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1,
            textFormat: 0,
            textStyle: ""
          }
        ],
        direction: null,
        format: "",
        indent: 0,
        type: "root",
        version: 1
      }
    })
  );
  editor.setEditorState(editorState);
  return editor;
}
function GenerateSteps(json, editor) {
  const stepsData = JSON.parse(json);
  const steps = stepsData.map((step) => {
    return {
      id: step.id,
      title: step.title,
      content: createEditorWithText(step.content)
    };
  });
  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const stepperNode = $createStepperNode(steps);
      selection.insertNodes([stepperNode]);
    }
    return;
  });
}
var getSelectedText = (editor, getMore) => {
  let selectedText = "";
  let context = getMore ? getWordsBeforeSelection(editor, getMore) : null;
  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const selectionText = selection.getTextContent();
      if (selectionText.length > 30) {
        selectedText = selectionText;
      } else {
        selectedText = context + selectionText;
      }
    }
  });
  return selectedText;
};
function applyStyles(AIString) {
  const pattern = /(```[\s\S]*?```)|(\*\*[\s\S]+?\*\*)|(`[\s\S]+?`)|(###\s+[\s\S]+?(?=\n|$))/g;
  let lastIndex = 0;
  const nodes = [];
  AIString.replace(
    pattern,
    (match, codeBlockMatch, boldMatch, codeMatch, headerMatch, offset) => {
      if (offset > lastIndex) {
        const plainText = AIString.slice(lastIndex, offset);
        nodes.push($createTextNode(plainText));
      }
      if (codeBlockMatch) {
        const matchContent = codeBlockMatch.slice(3, -3);
        let language = "";
        let content = matchContent;
        const firstNewLine = matchContent.indexOf("\n");
        if (firstNewLine !== -1) {
          const firstLine = matchContent.slice(0, firstNewLine).trim();
          if (firstLine.length > 0 && /^[a-zA-Z0-9_\-]+$/.test(firstLine)) {
            language = firstLine;
            content = matchContent.slice(firstNewLine + 1);
          }
        }
        const codeNode = $createCodeNode(language);
        codeNode.append($createTextNode(content));
        nodes.push(codeNode);
      } else if (boldMatch) {
        const content = boldMatch.slice(2, -2);
        const boldTextNode = $createTextNode(content);
        boldTextNode.setFormat("bold");
        nodes.push(boldTextNode);
      } else if (codeMatch) {
        const content = codeMatch.slice(1, -1);
        const codeTextNode = $createTextNode(content);
        codeTextNode.setFormat("code");
        nodes.push(codeTextNode);
      } else if (headerMatch) {
        const content = headerMatch.slice(4).trim();
        const headerNode = $createHeadingNode("h3");
        headerNode.append($createTextNode(content));
        nodes.push(headerNode);
      }
      lastIndex = offset + match.length;
      return match;
    }
  );
  if (lastIndex < AIString.length) {
    nodes.push($createTextNode(AIString.slice(lastIndex)));
  }
  return nodes;
}
function insertText(text, editor) {
  if (isJSON(text) || text.startsWith("json")) {
    GenerateSteps(text, editor);
    return;
  }
  editor.update(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection))
      return console.log("No valid text selection found.");
    const nodesInSelection = selection.getNodes();
    if (nodesInSelection.length > 0) {
      let insertionPoint = nodesInSelection[nodesInSelection.length - 1];
      const formattedNodes = applyStyles(text);
      formattedNodes.forEach((node) => {
        insertionPoint.insertAfter(node);
        insertionPoint = node;
      });
    }
  });
}
function replaceSelectedText(text, editor) {
  if (isJSON(text) || text.startsWith("json")) {
    GenerateSteps(text, editor);
    return;
  }
  editor.update(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) {
      console.warn("No valid text selection found.");
      return;
    }
    selection.removeText();
    const formattedNodes = applyStyles(text);
    selection.insertNodes(formattedNodes);
  });
}
function insertTextUnderSelected(text, editor) {
  if (isJSON(text) || text.startsWith("json")) {
    GenerateSteps(text, editor);
    return;
  }
  editor.update(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;
    const nodes = selection.getNodes();
    if (nodes.length > 0) {
      const lastNode = nodes[nodes.length - 1];
      const newParagraph = $createParagraphNode();
      const formattedNodes = applyStyles(text);
      newParagraph.append(...formattedNodes);
      lastNode.insertAfter(newParagraph);
    }
  });
}

// src/components/ui/ai/ai-button.tsx
import { useCompletion } from "@ai-sdk/react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

// src/components/editor/utils/extract-data.ts
init_react_shim();
import { $getRoot as $getRoot2, ElementNode as ElementNode2, ParagraphNode, TextNode as TextNode2 } from "lexical";
import { ListNode } from "@lexical/list";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableNode } from "@lexical/table";
import { CodeNode } from "@lexical/code";
function extractChildrenContent(nodes) {
  return nodes.filter((node) => node instanceof TextNode2).map((node) => node.getTextContent()).join(" ");
}
function processListItem(listItem) {
  let textContent = "";
  const children = [];
  listItem.getChildren().forEach((child) => {
    if (child instanceof TextNode2) {
      textContent += child.getTextContent();
    } else if (child instanceof ElementNode2) {
      textContent += extractChildrenContent(child.getChildren());
    }
    if (child instanceof ListNode) {
      children.push(...processList(child));
    }
  });
  return {
    blockType: "list-item",
    content: textContent.trim(),
    children: children.length > 0 ? children : void 0
  };
}
function processList(listNode) {
  const listType = listNode.getListType();
  return listNode.getChildren().map((child) => __spreadProps(__spreadValues({}, processListItem(child)), {
    attributes: { listType }
  }));
}
function processHeading(headingNode) {
  return {
    blockType: "heading",
    content: headingNode.getTextContent()
  };
}
function processTable(TableNode2) {
  return {
    blockType: "Table",
    content: TableNode2.getTextContent()
  };
}
function processCodeBlock(codeNode) {
  return {
    blockType: "code",
    content: codeNode.getTextContent()
  };
}
function ExtractData(editor) {
  const blocks = [];
  editor.update(() => {
    const root = $getRoot2();
    root.getChildren().forEach((node) => {
      try {
        if (node instanceof HeadingNode) {
          blocks.push(processHeading(node));
        } else if (node instanceof TableNode) {
          blocks.push(processTable(node));
        } else if (node instanceof ListNode) {
          blocks.push({
            blockType: "list",
            content: "",
            children: processList(node)
          });
        } else if (node instanceof CollapsibleContainerNode || node instanceof CollapsibleTitleNode) {
          let title = "";
          let content = "";
          if (node instanceof CollapsibleTitleNode) {
            title = node.getTextContent();
          }
          if (node instanceof CollapsibleContainerNode) {
            const children = node.getChildren();
            const titleNode = children.find((child) => child instanceof CollapsibleTitleNode);
            if (titleNode) {
              title = titleNode.getTextContent();
            }
            content = children.filter((child) => !(child instanceof CollapsibleTitleNode)).map((child) => child.getTextContent()).join("\n");
          }
          blocks.push({
            blockType: "Collapsible",
            content: title,
            // The collapsible title.
            children: [
              {
                blockType: "CollapsibleContent",
                content
                // The collapsible content.
              }
            ]
          });
        } else if (node instanceof ParagraphNode) {
          if (node.getTextContent() == "") return;
          blocks.push({
            blockType: "paragraph",
            content: node.getTextContent()
          });
        } else if (node instanceof CodeNode) {
          blocks.push(processCodeBlock(node));
        } else if (node instanceof QuoteNode) {
          blocks.push({
            blockType: "quote",
            content: node.getTextContent(),
            children: node.getChildren().length >= 2 ? node.getChildren().map((child) => ({
              blockType: "text",
              content: child.getTextContent()
            })) : void 0
          });
        } else if (node instanceof TextNode2) {
          blocks.push({
            blockType: "text",
            content: node.getTextContent()
          });
        }
      } catch (error) {
        console.warn("Error processing node:", error);
      }
    });
  });
  return JSON.stringify(blocks);
}

// src/components/ui/ai/ai-button.tsx
var placeholders = [
  "Chat with what you are writing.",
  "Click on the stepper to generate tasks step by step.",
  "Click on autocomplete to complete sentences.",
  "Is your text too long? Do you want to make it shorter?"
];
function AiButton({ editor }) {
  const [actionType, setActionType] = useState4(null);
  const [streamedResponse, setStreamedResponse] = useState4("");
  const { apiEndpoint } = useAI();
  const { completion, isLoading, complete, handleInputChange, input } = useCompletion({
    api: apiEndpoint,
    onError: (err) => {
      toast.error(err.message);
    },
    onResponse: (response2) => {
      setStreamedResponse("");
    },
    onFinish: (prompt, completion2) => {
      if (actionType === "Steps") {
        setStreamedResponse(completion2);
      }
    }
  });
  const handleAction = async (action, payload) => {
    try {
      await complete("", {
        body: __spreadValues({
          action
        }, payload)
      });
      setActionType(action);
    } catch (err) {
      toast.error("Failed to process AI action. Please try again.");
    }
  };
  const handleRegeneration = async () => {
    if (!completion) {
      toast.error("No content to regenerate");
      return;
    }
    await handleAction("GenerateAgain", { prompt: completion });
  };
  const handleAutoComplete = async () => {
    const selectedText = getSelectedText(editor, 30);
    await handleAction("autoComplete", { prompt: selectedText });
  };
  const handleImproveWriting = async () => {
    const selectedText = getSelectedText(editor);
    await handleAction("ImproveWriting", { prompt: selectedText });
  };
  const handleSimplifyLanguage = async () => {
    const selectedText = getSelectedText(editor);
    await handleAction("SimplifyLanguage", { prompt: selectedText });
  };
  const handleMakeLong = async () => {
    const selectedText = getSelectedText(editor);
    await handleAction("MakeLong", { prompt: selectedText });
  };
  const handleMakeShort = async () => {
    const selectedText = getSelectedText(editor);
    await handleAction("MakeShort", { prompt: selectedText });
  };
  const handleFixSpellingGrammar = async () => {
    const selectedText = getSelectedText(editor);
    await handleAction("FixSpellingGrammar", { prompt: selectedText });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input) {
      toast.error("Please enter a question or instruction");
      return;
    }
    if (actionType === "Steps") {
      await handleAction("Steps", { prompt: input });
    } else {
      const data = ExtractData(editor);
      const selectedText = getSelectedText(editor, 30);
      if (!selectedText) {
        toast.error("Please select some text first");
        return;
      }
      await handleAction("ChatWithSelectedString", {
        prompt: input,
        context: data
      });
      setActionType(null);
    }
  };
  const renderSteps = () => {
    if (!streamedResponse) return null;
    try {
      const steps = JSON.parse(streamedResponse);
      return /* @__PURE__ */ React5.createElement("ul", { className: "list-none space-y-2" }, steps.map((step) => /* @__PURE__ */ React5.createElement("li", { key: step.id, className: "rounded-md shadow-md p-1" }, /* @__PURE__ */ React5.createElement("h3", { className: "font-semibold text-lg" }, step.id + 1, ". ", step.title), /* @__PURE__ */ React5.createElement("p", { className: "text-gray-600 dark:text-gray-300 mtx-2" }, step.content))));
    } catch (error) {
      return;
    }
  };
  const Actions = useMemo(
    () => ({
      suggestion: [
        {
          icon: /* @__PURE__ */ React5.createElement(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              className: "size-5 text-purple-500",
              viewBox: "0 0 24 24"
            },
            /* @__PURE__ */ React5.createElement(
              "path",
              {
                fill: "currentColor",
                d: "m19 9l-1.25-2.75L15 5l2.75-1.25L19 1l1.25 2.75L23 5l-2.75 1.25Zm0 14l-1.25-2.75L15 19l2.75-1.25L19 15l1.25 2.75L23 19l-2.75 1.25ZM4.8 16L8 7h2l3.2 9h-1.9l-.7-2H7.4l-.7 2Zm3.05-3.35h2.3L9 9ZM9 18q2.5 0 4.25-1.75T15 12q0-2.5-1.75-4.25T9 6Q6.5 6 4.75 7.75T3 12q0 2.5 1.75 4.25T9 18Zm0 2q-3.35 0-5.675-2.325Q1 15.35 1 12q0-3.35 2.325-5.675Q5.65 4 9 4q3.35 0 5.675 2.325Q17 8.65 17 12q0 3.35-2.325 5.675Q12.35 20 9 20Z"
              }
            )
          ),
          label: "auto compeletion",
          HoverCard: {
            desc: "Improve your sentences effortlessly\u2014just select the text you want to refine, and let AI work its magic! \u2728"
          },
          onClick: handleAutoComplete
        },
        {
          icon: /* @__PURE__ */ React5.createElement(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              className: "size-5 text-purple-500",
              viewBox: "0 0 24 24"
            },
            /* @__PURE__ */ React5.createElement(
              "path",
              {
                fill: "currentColor",
                d: "M7.5 5.6L10 7L8.6 4.5L10 2L7.5 3.4L5 2l1.4 2.5L5 7zm12 9.8L17 14l1.4 2.5L17 19l2.5-1.4L22 19l-1.4-2.5L22 14zM22 2l-2.5 1.4L17 2l1.4 2.5L17 7l2.5-1.4L22 7l-1.4-2.5zm-7.63 5.29a.996.996 0 0 0-1.41 0L1.29 18.96a.996.996 0 0 0 0 1.41l2.34 2.34c.39.39 1.02.39 1.41 0L16.7 11.05a.996.996 0 0 0 0-1.41zm-1.03 5.49l-2.12-2.12l2.44-2.44l2.12 2.12z"
              }
            )
          ),
          label: "Improve Writing",
          HoverCard: {
            desc: " Simply select the text you want, and let our AI refine your writing effortlessly! \u{1F4DD}\u{1F680}"
          },
          onClick: handleImproveWriting
        },
        {
          icon: /* @__PURE__ */ React5.createElement(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              className: "size-5 text-purple-500",
              viewBox: "0 0 24 24"
            },
            /* @__PURE__ */ React5.createElement(
              "path",
              {
                fill: "currentColor",
                d: "m9 16.2l-3.5-3.5a.984.984 0 0 0-1.4 0a.984.984 0 0 0 0 1.4l4.19 4.19c.39.39 1.02.39 1.41 0L20.3 7.7a.984.984 0 0 0 0-1.4a.984.984 0 0 0-1.4 0z"
              }
            )
          ),
          label: "Fix spelling & grammar",
          HoverCard: {
            desc: "\u{1F4DD} Select your messy text, and let AI transform it into perfection! \u{1F680}"
          },
          onClick: handleFixSpellingGrammar
        }
      ],
      Edit: [
        {
          icon: /* @__PURE__ */ React5.createElement(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              className: "h-4 flex-shrink-0 w-4 block text-green-400",
              viewBox: "0 0 20 20"
            },
            /* @__PURE__ */ React5.createElement(
              "path",
              {
                fill: "currentColor",
                d: "M3.5 5a.5.5 0 0 0 0 1h13a.5.5 0 0 0 0-1zm0 3a.5.5 0 0 0 0 1h13a.5.5 0 0 0 0-1zm0 7h7.002l.416-1H3.5a.5.5 0 0 0 0 1m8.668-4l-.416 1H3.5a.5.5 0 0 1 0-1zm-.667 6.012h1.75l-.59 2.363c-.121.485.462.828.826.488l4.873-4.556c.497-.466.169-1.301-.512-1.301H16.75l.781-2.347a.5.5 0 0 0-.474-.659h-3.473a.5.5 0 0 0-.462.308l-2.083 5.01a.5.5 0 0 0 .462.694"
              }
            )
          ),
          label: "Make longer",
          HoverCard: {
            desc: "Enhance your text by adding more detail and context. Let AI expand your ideas! \u{1F680}"
          },
          onClick: handleMakeLong
        },
        {
          icon: /* @__PURE__ */ React5.createElement(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              className: "h-4 flex-shrink-0 w-4 block text-green-400",
              viewBox: "0 0 32 32"
            },
            /* @__PURE__ */ React5.createElement("path", { fill: "currentColor", d: "M6 18h14v2H6zm0-6h20v2H6z" })
          ),
          label: "Make shorter",
          HoverCard: {
            desc: "Select your dummy short paragraph and let our AI expand it while preserving its original content! \u{1F680}\u2728"
          },
          onClick: handleMakeShort
        },
        {
          icon: /* @__PURE__ */ React5.createElement(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              className: "h-4 flex-shrink-0 w-4 block text-green-400",
              viewBox: "0 0 24 24"
            },
            /* @__PURE__ */ React5.createElement(
              "path",
              {
                fill: "currentColor",
                fillRule: "evenodd",
                d: "M12.75 18.96V22h-1.5v-3.04A7 7 0 0 1 5 12v-2h1.5v2a5.5 5.5 0 0 0 11 0v-2H19v2a7 7 0 0 1-6.25 6.96M8 6a4 4 0 1 1 8 0v6a4 4 0 1 1-8 0z"
              }
            )
          ),
          label: "Simplify Language",
          HoverCard: {
            desc: "If you're using overly complex language and want to simplify it for easier understanding, let our AI transform your text into clear, concise, and engaging content! \u{1F60A}\u2728"
          },
          onClick: handleSimplifyLanguage
        }
      ],
      format_block: [
        {
          icon: /* @__PURE__ */ React5.createElement(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              className: "size-5 text-yellow-400",
              viewBox: "0 0 24 24"
            },
            /* @__PURE__ */ React5.createElement("g", { fill: "none" }, /* @__PURE__ */ React5.createElement("path", { d: "m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" }), /* @__PURE__ */ React5.createElement(
              "path",
              {
                fill: "currentColor",
                d: "M5.436 16.72a1.466 1.466 0 0 1 1.22 2.275a1.466 1.466 0 0 1-1.22 2.275c-.587 0-1.134-.21-1.38-.79c-.153-.361-.112-.79.297-.963a.65.65 0 0 1 .852.344a.18.18 0 0 0 .165.11c.114-.003.23-.026.23-.168c0-.1-.073-.143-.156-.155l-.051-.003a.65.65 0 0 1-.112-1.29l.112-.01c.102 0 .207-.037.207-.158c0-.141-.116-.165-.23-.168a.18.18 0 0 0-.164.11a.65.65 0 0 1-.853.345c-.409-.174-.45-.603-.297-.963c.246-.58.793-.79 1.38-.79ZM20 17.5a1.5 1.5 0 0 1 0 3H9a1.5 1.5 0 0 1 0-3zM6.08 9.945a1.552 1.552 0 0 1 .43 2.442l-.554.593h.47a.65.65 0 1 1 0 1.3H4.573a.655.655 0 0 1-.655-.654c0-.207.029-.399.177-.557L5.559 11.5c.142-.152.03-.473-.203-.415c-.087.022-.123.089-.134.165l-.004.059a.65.65 0 1 1-1.3 0c0-.692.439-1.314 1.123-1.485c.35-.088.718-.04 1.04.121ZM20 10.5a1.5 1.5 0 0 1 .144 2.993L20 13.5H9a1.5 1.5 0 0 1-.144-2.993L9 10.5zM6.15 3.39v3.24a.65.65 0 0 1-1.3 0V4.523a.65.65 0 0 1-.46-1.184l.742-.494a.655.655 0 0 1 1.018.544ZM20 3.5a1.5 1.5 0 0 1 .144 2.993L20 6.5H9a1.5 1.5 0 0 1-.144-2.993L9 3.5z"
              }
            ))
          ),
          label: "Step-by-Step Guide",
          HoverCard: {
            desc: "Need a clear roadmap to programming mastery? step-by-step guide that breaks down complex topics into simple, actionable steps. Let it light your path to coding success! \u{1F680}\u{1F4BB}"
          },
          onClick: () => setActionType("Steps")
        }
      ]
    }),
    []
  );
  const response = useMemo(
    () => [
      {
        icon: /* @__PURE__ */ React5.createElement(
          "svg",
          {
            xmlns: "http://www.w3.org/2000/svg",
            className: "text-[#8d5bc1] size-5",
            viewBox: "0 0 16 16"
          },
          /* @__PURE__ */ React5.createElement(
            "path",
            {
              fill: "currentColor",
              fillRule: "evenodd",
              d: "M0 3.2c0-1.12 0-1.68.218-2.11C.41.714.716.408 1.092.216c.428-.218.988-.218 2.11-.218h.6c1.12 0 1.68 0 2.11.218c.376.192.682.498.874.874c.218.428.218.988.218 2.11v.6c0 1.12 0 1.68-.218 2.11a2 2 0 0 1-.874.874c-.428.218-.988.218-2.11.218h-.6c-1.12 0-1.68 0-2.11-.218a2 2 0 0 1-.874-.874C0 5.482 0 4.922 0 3.8zM3.2 1h.6c.577 0 .949 0 1.23.024c.272.022.372.06.422.085c.188.096.341.249.437.437c.025.05.063.15.085.422c.023.283.024.656.024 1.23v.6c0 .577 0 .949-.024 1.23c-.022.272-.06.372-.085.422a1 1 0 0 1-.437.437c-.05.025-.15.063-.422.085c-.283.023-.656.024-1.23.024h-.6c-.577 0-.949 0-1.23-.024c-.272-.022-.372-.06-.422-.085a1 1 0 0 1-.437-.437c-.025-.05-.063-.15-.085-.422a17 17 0 0 1-.024-1.23v-.6c0-.577 0-.949.024-1.23c.022-.272.06-.372.085-.422c.096-.188.249-.341.437-.437c.05-.025.15-.063.422-.085C2.253 1 2.626 1 3.2 1M9 12.2c0-1.12 0-1.68.218-2.11c.192-.376.498-.682.874-.874c.428-.218.988-.218 2.11-.218h.6c1.12 0 1.68 0 2.11.218c.376.192.682.498.874.874c.218.428.218.988.218 2.11v.6c0 1.12 0 1.68-.218 2.11a2 2 0 0 1-.874.874c-.428.218-.988.218-2.11.218h-.6c-1.12 0-1.68 0-2.11-.218a2 2 0 0 1-.874-.874C9 14.482 9 13.922 9 12.8zm3.8-2.2c.577 0 .949 0 1.23.024c.272.022.372.06.422.085c.188.096.341.249.437.437c.025.05.063.15.085.422c.023.283.024.656.024 1.23v.6c0 .577 0 .949-.024 1.23c-.022.272-.06.372-.085.422a1 1 0 0 1-.437.437c-.05.025-.15.063-.422.085c-.283.023-.656.024-1.23.024h-.6c-.577 0-.949 0-1.23-.024c-.272-.022-.372-.06-.422-.085a1 1 0 0 1-.437-.437c-.025-.05-.063-.15-.085-.422a17 17 0 0 1-.024-1.23v-.6c0-.577 0-.949.024-1.23c.022-.272.06-.372.085-.422c.096-.188.249-.341.437-.437c.05-.025.15-.063.422-.085c.283-.023.656-.024 1.23-.024z",
              clipRule: "evenodd"
            }
          ),
          /* @__PURE__ */ React5.createElement(
            "path",
            {
              fill: "currentColor",
              d: "M8 2.5a.5.5 0 0 1 .5-.5h2A2.5 2.5 0 0 1 13 4.5v1.79l1.15-1.15a.5.5 0 0 1 .707.707l-2 2a.5.5 0 0 1-.707 0l-2-2a.5.5 0 0 1 .707-.707l1.15 1.15V4.5a1.5 1.5 0 0 0-1.5-1.5h-2a.5.5 0 0 1-.5-.5zM3.31 8.04a.5.5 0 0 1 .188-.038h.006a.5.5 0 0 1 .351.146l2 2a.5.5 0 0 1-.707.707l-1.15-1.15v1.79a1.5 1.5 0 0 0 1.5 1.5h2a.5.5 0 0 1 0 1h-2a2.5 2.5 0 0 1-2.5-2.5v-1.79l-1.15 1.15a.5.5 0 0 1-.707-.707l2-2a.5.5 0 0 1 .162-.109z"
            }
          )
        ),
        label: "rplace text",
        HoverCard: {
          desc: "Select your text and let our AI replace it with a polished, enhanced version! \u{1F680}\u2728"
        },
        func: () => replaceSelectedText(completion, editor)
      },
      {
        icon: /* @__PURE__ */ React5.createElement(
          "svg",
          {
            xmlns: "http://www.w3.org/2000/svg",
            className: "text-[#8d5bc1] size-5",
            viewBox: "0 0 56 56"
          },
          /* @__PURE__ */ React5.createElement(
            "path",
            {
              fill: "currentColor",
              d: "M33.8 11.36h16.01c1.008 0 1.804-.774 1.804-1.782c0-.984-.797-1.758-1.804-1.758H33.8c-1.008 0-1.782.774-1.782 1.758c0 1.008.774 1.781 1.782 1.781M7.083 26.944c1.71 0 2.695-1.195 2.695-3.093v-4.477c0-.516.235-.82.797-.82h6.375v2.343c0 1.852 1.875 2.555 3.281 1.43l6.352-5.062c.96-.774.96-2.11 0-2.86L20.23 9.32c-1.453-1.195-3.28-.469-3.28 1.43v2.438h-6.891c-3.305 0-5.672 2.039-5.672 5.367v5.297c0 1.898.984 3.093 2.695 3.093m26.719-3.304h16.008c1.008 0 1.804-.774 1.804-1.782c0-.984-.797-1.758-1.804-1.758H33.8c-1.008 0-1.782.774-1.782 1.758c0 1.008.774 1.782 1.782 1.782M6.168 35.92h43.64a1.786 1.786 0 0 0 1.805-1.78c0-.985-.797-1.758-1.804-1.758H6.168c-1.008 0-1.781.773-1.781 1.758c0 .984.773 1.78 1.78 1.78m0 12.259h43.64c1.008 0 1.805-.774 1.805-1.758s-.797-1.781-1.804-1.781H6.168a1.766 1.766 0 0 0-1.781 1.78c0 .985.773 1.759 1.78 1.759"
            }
          )
        ),
        label: "insert text",
        HoverCard: {
          desc: "text will inserted immediately following your selection."
        },
        func: () => insertText(completion, editor)
      },
      {
        icon: /* @__PURE__ */ React5.createElement(
          "svg",
          {
            xmlns: "http://www.w3.org/2000/svg",
            className: "text-[#8d5bc1] size-5",
            viewBox: "0 0 14 14"
          },
          /* @__PURE__ */ React5.createElement(
            "g",
            {
              fill: "none",
              stroke: "currentColor",
              strokeLinecap: "round",
              strokeLinejoin: "round"
            },
            /* @__PURE__ */ React5.createElement("path", { d: "M9.5 6.5h-9m13-3H.5m13-3H.5" }),
            /* @__PURE__ */ React5.createElement(
              "rect",
              {
                width: "4",
                height: "13",
                x: "5",
                y: "5",
                rx: ".5",
                transform: "rotate(-90 7 11.5)"
              }
            )
          )
        ),
        label: "insert below",
        HoverCard: {
          desc: "text will inserted under your selection."
        },
        func: () => insertTextUnderSelected(completion, editor)
      },
      {
        icon: /* @__PURE__ */ React5.createElement(RotateCcw, { className: "text-[#8d5bc1] size-4" }),
        label: "try again",
        HoverCard: {
          desc: "you did not like the ai response? try it again with what do you want"
        },
        func: handleRegeneration
      }
    ],
    [completion]
  );
  return /* @__PURE__ */ React5.createElement(Popover, null, /* @__PURE__ */ React5.createElement(PopoverTrigger, { asChild: true }, /* @__PURE__ */ React5.createElement("button", { className: "inline-flex px-6 max-sm:py-2 max-sm:px-[5px]  h-6 animate-background-shine items-center justify-center rounded-md border border-gray-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%]   font-medium text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-50" }, /* @__PURE__ */ React5.createElement(WandSparkles, { className: " size-4 text-purple-400" }))), /* @__PURE__ */ React5.createElement(PopoverContent, { className: "absolute max-h-[300px] h-fit shadow-sm  shadow-black dark:shadow-gray-500  p-0 w-[420px] max-sm:w-[200px] min-w-[200px] max-w-[420px] top-[10px] max-sm:left-6 -left-7 AI-format" }, /* @__PURE__ */ React5.createElement("div", { className: "w-full relative" }, /* @__PURE__ */ React5.createElement("div", { className: "flex flex-col items-start justify-between" }, (completion || actionType === "Steps") && /* @__PURE__ */ React5.createElement(
    motion3.div,
    {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5, ease: "easeOut" },
      className: "cursor-text w-full p-2 z-20 break-words max-h-64 h-fit overflow-y-auto"
    },
    streamedResponse !== "" ? renderSteps() : /* @__PURE__ */ React5.createElement(ReactMarkdown, null, completion || "Ask for a step-by-step guide on any programming topic. Example: 'How can I become a backend developer?'")
  ), /* @__PURE__ */ React5.createElement("div", { className: "relative w-full" }, /* @__PURE__ */ React5.createElement("div", { className: " absolute top-1/2 -translate-y-1/2 left-2" }, /* @__PURE__ */ React5.createElement(
    HoverBorderGradient,
    {
      duration: 2,
      clockwise: false,
      containerClassName: "rounded-full border-0",
      as: "button",
      className: "dark:bg-white size-5  bg-black dark:text-white flex justify-center items-center"
    },
    isLoading ? /* @__PURE__ */ React5.createElement(Loader2, { className: "size-3 dark:text-black text-white animate-spin" }) : /* @__PURE__ */ React5.createElement(StarsIcon, { className: "dark:text-purple-600 text-purple-300 size-3" })
  )), /* @__PURE__ */ React5.createElement(
    PlaceholdersAndVanishInput,
    {
      placeholders,
      onChange: handleInputChange,
      onSubmit: handleSubmit,
      disabled: isLoading
    }
  ))), /* @__PURE__ */ React5.createElement("div", { className: "w-[200px] h-[180px] z-50 rounded border mt-2 fixed" }, !completion ? /* @__PURE__ */ React5.createElement(Command, { id: "toolbar", className: "w-full " }, /* @__PURE__ */ React5.createElement(CommandInput, { placeholder: "Type a command" }), /* @__PURE__ */ React5.createElement(CommandList, null, /* @__PURE__ */ React5.createElement(CommandEmpty, null, "No results found."), /* @__PURE__ */ React5.createElement(CommandGroup, { heading: "Suggested" }, Actions.suggestion.map((sug) => /* @__PURE__ */ React5.createElement(HoverCard, { key: sug.label }, /* @__PURE__ */ React5.createElement(
    HoverCardTrigger,
    {
      onClick: sug.onClick,
      className: "w-full p-0"
    },
    /* @__PURE__ */ React5.createElement(CommandItem, { className: "w-full" }, /* @__PURE__ */ React5.createElement("div", null, sug.icon), /* @__PURE__ */ React5.createElement("span", null, sug.label))
  ), /* @__PURE__ */ React5.createElement(
    HoverCardContent,
    {
      className: " p-2",
      side: "right",
      alignOffset: 60,
      sideOffset: 30
    },
    /* @__PURE__ */ React5.createElement("span", { className: "text-sm break-words   text-muted-foreground" }, sug.HoverCard.desc)
  )))), /* @__PURE__ */ React5.createElement(CommandSeparator, null), /* @__PURE__ */ React5.createElement(CommandGroup, { heading: "format block" }, Actions.format_block.map((sug) => /* @__PURE__ */ React5.createElement(HoverCard, { key: sug.label }, /* @__PURE__ */ React5.createElement(
    HoverCardTrigger,
    {
      onClick: sug.onClick,
      className: "w-full p-0"
    },
    /* @__PURE__ */ React5.createElement(CommandItem, { className: "w-full" }, /* @__PURE__ */ React5.createElement("div", null, sug.icon), /* @__PURE__ */ React5.createElement("span", null, sug.label))
  ), /* @__PURE__ */ React5.createElement(
    HoverCardContent,
    {
      className: " p-2",
      side: "right",
      alignOffset: 60,
      sideOffset: 30
    },
    /* @__PURE__ */ React5.createElement("span", { className: "text-sm break-words   text-muted-foreground" }, sug.HoverCard.desc)
  )))), /* @__PURE__ */ React5.createElement(CommandSeparator, null), /* @__PURE__ */ React5.createElement(CommandGroup, { heading: "Edit" }, Actions.Edit.map((sug) => /* @__PURE__ */ React5.createElement(HoverCard, { key: sug.label }, /* @__PURE__ */ React5.createElement(
    HoverCardTrigger,
    {
      onClick: sug.onClick,
      className: "w-full p-0"
    },
    /* @__PURE__ */ React5.createElement(CommandItem, { className: "w-full" }, /* @__PURE__ */ React5.createElement("div", null, sug.icon), /* @__PURE__ */ React5.createElement("span", null, sug.label))
  ), /* @__PURE__ */ React5.createElement(
    HoverCardContent,
    {
      className: "p-2",
      side: "right",
      alignOffset: 60,
      sideOffset: 30
    },
    /* @__PURE__ */ React5.createElement("span", { className: "text-sm  text-muted-foreground" }, sug.HoverCard.desc)
  )))))) : /* @__PURE__ */ React5.createElement(Command, { id: "toolbar", className: "w-full" }, /* @__PURE__ */ React5.createElement(CommandInput, { placeholder: "Type a command" }), /* @__PURE__ */ React5.createElement(CommandList, null, /* @__PURE__ */ React5.createElement(CommandEmpty, null, "No results found."), /* @__PURE__ */ React5.createElement(CommandGroup, null, response.map((sug) => /* @__PURE__ */ React5.createElement(HoverCard, { key: sug.label }, /* @__PURE__ */ React5.createElement(
    HoverCardTrigger,
    {
      onClick: sug.func,
      className: "w-full p-0"
    },
    /* @__PURE__ */ React5.createElement(CommandItem, { disabled: isLoading, className: "w-full" }, /* @__PURE__ */ React5.createElement("div", null, sug.icon), /* @__PURE__ */ React5.createElement("span", null, sug.label))
  ), /* @__PURE__ */ React5.createElement(
    HoverCardContent,
    {
      className: " p-2",
      side: "right",
      alignOffset: 60,
      sideOffset: 30
    },
    /* @__PURE__ */ React5.createElement("span", { className: "text-sm break-words   text-muted-foreground" }, sug.HoverCard.desc)
  ))))))))));
}

// src/components/ui/write/text-format-floting-toolbar.tsx
function TextFormatFloatingToolbar({
  editor,
  anchorElem,
  isLink,
  isBold,
  isItalic,
  isUnderline,
  isUppercase,
  isLowercase,
  isCapitalize,
  isCode,
  fontColor,
  isStrikethrough,
  isSubscript,
  isSuperscript,
  bgColor,
  setIsLinkEditMode,
  blockType,
  fontFamily,
  rootType,
  textAlign,
  fontSize
}) {
  const popupCharStylesEditorRef = useRef3(null);
  const isSmall = useIsMobile();
  const insertLink = useCallback2(() => {
    if (!isLink) {
      setIsLinkEditMode(true);
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeUrl("https://"));
    } else {
      setIsLinkEditMode(false);
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, setIsLinkEditMode, isLink]);
  function mouseMoveListener(e) {
    if ((popupCharStylesEditorRef == null ? void 0 : popupCharStylesEditorRef.current) && (e.buttons === 1 || e.buttons === 3)) {
      if (popupCharStylesEditorRef.current.style.pointerEvents !== "none") {
        const x = e.clientX;
        const y = e.clientY;
        const elementUnderMouse = document.elementFromPoint(x, y);
        if (!popupCharStylesEditorRef.current.contains(elementUnderMouse)) {
          popupCharStylesEditorRef.current.style.pointerEvents = "none";
        }
      }
    }
  }
  function mouseUpListener(e) {
    if (popupCharStylesEditorRef == null ? void 0 : popupCharStylesEditorRef.current) {
      if (popupCharStylesEditorRef.current.style.pointerEvents !== "auto") {
        popupCharStylesEditorRef.current.style.pointerEvents = "auto";
      }
    }
  }
  useEffect4(() => {
    if (popupCharStylesEditorRef == null ? void 0 : popupCharStylesEditorRef.current) {
      popupCharStylesEditorRef.current.style.pointerEvents = "auto";
    }
  });
  useEffect4(() => {
    if (popupCharStylesEditorRef == null ? void 0 : popupCharStylesEditorRef.current) {
      document.addEventListener("mousemove", mouseMoveListener);
      document.addEventListener("mouseup", mouseUpListener);
      return () => {
        document.removeEventListener("mousemove", mouseMoveListener);
        document.removeEventListener("mouseup", mouseUpListener);
        if (popupCharStylesEditorRef.current) {
          popupCharStylesEditorRef.current.style.pointerEvents = "auto";
        }
      };
    }
  }, [popupCharStylesEditorRef]);
  const $updateTextFormatFloatingToolbar = useCallback2(() => {
    const selection = $getSelection2();
    const popupCharStylesEditorElem = popupCharStylesEditorRef.current;
    const nativeSelection = getDOMSelection(editor._window);
    if (!popupCharStylesEditorElem) return;
    const rootElement = editor.getRootElement();
    if (selection && nativeSelection && !nativeSelection.isCollapsed && rootElement && rootElement.contains(nativeSelection.anchorNode)) {
      const rangeRect = getDOMRangeRect(nativeSelection, rootElement);
      setFloatingElemPosition(rangeRect, popupCharStylesEditorElem, anchorElem);
    }
  }, [editor, anchorElem]);
  useEffect4(() => {
    const scrollerElem = anchorElem.parentElement;
    const update = () => {
      editor.getEditorState().read(() => {
        $updateTextFormatFloatingToolbar();
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
  }, [editor, $updateTextFormatFloatingToolbar, anchorElem]);
  useEffect4(() => {
    editor.getEditorState().read(() => {
      $updateTextFormatFloatingToolbar();
    });
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateTextFormatFloatingToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          $updateTextFormatFloatingToolbar();
          return false;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [editor, $updateTextFormatFloatingToolbar]);
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      id: "toolbar",
      ref: popupCharStylesEditorRef,
      className: `
            z-[50] h-[30px] p-1 px-2 max-sm:p-2   max-sm:h-[295px] max-sm:w-[32px]  max-sm:overflow-y-auto
            border dark:border-zinc-800 dark:bg-zinc-900  text-zinc-950 dark:text-zinc-50  border-zinc-200 bg-white/90 
            inline-flex flex-row max-sm:flex-col items-center shadow-md absolute top-0 left-0  text-sm rounded-[6px]
        `
    },
    /* @__PURE__ */ React.createElement(AiButton, { editor }),
    /* @__PURE__ */ React.createElement(
      Separator,
      {
        orientation: "vertical",
        className: "max-sm:h-[1px] max-sm:my-1 max-sm:w-5 h-5 mx-1"
      }
    ),
    /* @__PURE__ */ React.createElement(
      BlockFormatDropDown,
      {
        editor,
        blockType,
        style: { height: "25px" },
        ShowChevronsUpDown: false,
        side: isSmall ? "right" : "bottom",
        sideOffset: isSmall ? 10 : 5
      }
    ),
    /* @__PURE__ */ React.createElement(
      Separator,
      {
        orientation: "vertical",
        className: "max-sm:h-[1px] max-sm:my-1 max-sm:w-5 h-5 mx-1"
      }
    ),
    /* @__PURE__ */ React.createElement(
      FontSize,
      {
        selectionFontSize: fontSize.slice(0, -2),
        editor,
        disabled: false,
        className: "h-[25px]",
        classNameContent: "max-sm:flex-col"
      }
    ),
    /* @__PURE__ */ React.createElement(
      Separator,
      {
        orientation: "vertical",
        className: "max-sm:h-[1px] max-sm:my-1 max-sm:w-5 h-5 mx-1"
      }
    ),
    /* @__PURE__ */ React.createElement(
      Font,
      {
        disabled: false,
        style: { fontFamily, height: "25px", padding: "0px 13px" },
        value: fontFamily,
        editor,
        ShowChevronsUpDown: false,
        side: isSmall ? "right" : "bottom",
        sideOffset: isSmall ? 10 : 5
      }
    ),
    /* @__PURE__ */ React.createElement(
      Separator,
      {
        orientation: "vertical",
        className: "max-sm:h-[1px] max-sm:my-1 max-sm:w-5 h-5 mx-1"
      }
    ),
    /* @__PURE__ */ React.createElement("div", { className: "flex  flex-row max-sm:flex-col gap-1 items-center justify-center" }, /* @__PURE__ */ React.createElement(
      Toggle,
      {
        variant: "outline",
        size: "floting",
        pressed: isBold,
        onPressedChange: () => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
        },
        tip: `Bold ${SHORTCUTS.BOLD}`,
        "aria-label": `Format text as bold. Shortcut: ${SHORTCUTS.BOLD}`
      },
      /* @__PURE__ */ React.createElement(Bold, null)
    ), /* @__PURE__ */ React.createElement(
      Toggle,
      {
        variant: "outline",
        size: "floting",
        pressed: isItalic,
        onPressedChange: () => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
        },
        tip: `Italic (${SHORTCUTS.ITALIC})`,
        type: "button",
        "aria-label": `Format text as italics. Shortcut: ${SHORTCUTS.ITALIC}`
      },
      /* @__PURE__ */ React.createElement(Italic, null)
    ), /* @__PURE__ */ React.createElement(
      Toggle,
      {
        variant: "outline",
        size: "floting",
        pressed: isUnderline,
        onPressedChange: () => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
        },
        tip: `Underline (${SHORTCUTS.UNDERLINE})`,
        type: "button",
        "aria-label": `Format text to underlined. Shortcut: ${SHORTCUTS.UNDERLINE}`
      },
      /* @__PURE__ */ React.createElement(UnderlineIcon, null)
    ), /* @__PURE__ */ React.createElement(
      Toggle,
      {
        variant: "outline",
        size: "floting",
        pressed: isCode,
        onPressedChange: () => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code");
        },
        tip: `Insert code block (${SHORTCUTS.INSERT_CODE_BLOCK})`,
        type: "button",
        "aria-label": "Insert code block"
      },
      /* @__PURE__ */ React.createElement(Code, null)
    ), /* @__PURE__ */ React.createElement(
      Toggle,
      {
        variant: "outline",
        size: "floting",
        onPressedChange: insertLink,
        pressed: isLink,
        "aria-label": "Insert link",
        tip: `Insert link (${SHORTCUTS.INSERT_LINK})`,
        type: "button"
      },
      /* @__PURE__ */ React.createElement(Link, null)
    )),
    /* @__PURE__ */ React.createElement(
      Separator,
      {
        orientation: "vertical",
        className: "max-sm:h-[1px] max-sm:my-1 max-sm:w-5 h-5 mx-1"
      }
    ),
    /* @__PURE__ */ React.createElement(
      Color,
      {
        disabled: false,
        side: isSmall ? "right" : "bottom",
        sideOffset: isSmall ? 10 : 5,
        style: { height: "25px" },
        color: fontColor,
        bgColor,
        editor
      }
    ),
    /* @__PURE__ */ React.createElement(
      Separator,
      {
        orientation: "vertical",
        className: "max-sm:h-[1px] max-sm:my-1 max-sm:w-5 h-5 mx-1"
      }
    ),
    /* @__PURE__ */ React.createElement(
      TextFormat,
      {
        disabled: false,
        editor,
        ShowChevronsUpDown: false,
        side: isSmall ? "right" : "bottom",
        sideOffset: isSmall ? 10 : 5,
        style: { height: "2px" },
        toolbarState: {
          isLowercase,
          isUppercase,
          isCapitalize,
          isStrikethrough,
          isSubscript,
          isSuperscript
        }
      }
    )
  );
}

// src/components/editor/plugins/FloatingTextFormatToolbarPlugin/index.tsx
function useFloatingTextFormatToolbar(editor, anchorElem, setIsLinkEditMode) {
  const [isText, setIsText] = useState5(false);
  const [isLink, setIsLink] = useState5(false);
  const [isBold, setIsBold] = useState5(false);
  const [isItalic, setIsItalic] = useState5(false);
  const [isUnderline, setIsUnderline] = useState5(false);
  const [isStrikethrough, setIsStrikethrough] = useState5(false);
  const [isCode, setIsCode] = useState5(false);
  const [fontColor, setFontColor] = useState5("#000000");
  const [bgColor, setBgColor] = useState5("#ffffff");
  const [fontFamily, setFontFamily] = useState5("Arial");
  const [blockType, setBlockType] = useState5("paragraph");
  const [isUppercase, setIsUppercase] = useState5(false);
  const [isLowercase, setIsLowercase] = useState5(false);
  const [isCapitalize, setIsCapitalize] = useState5(false);
  const [isSubscript, setIsSubscript] = useState5(false);
  const [isSuperscript, setIsSuperscript] = useState5(false);
  const [rootType, setRootType] = useState5("root");
  const [textAlign, setTextAlign] = useState5(null);
  const [fontSize, setFontSize] = useState5("16px");
  const toolbarRef = useRef4(null);
  const updatePopup = useCallback3(() => {
    editor.getEditorState().read(() => {
      var _a;
      if (editor.isComposing()) {
        return;
      }
      const selection = $getSelection3();
      const nativeSelection = getDOMSelection2(editor._window);
      const rootElement = editor.getRootElement();
      const aiElement = document.querySelector(".AI-format");
      if (nativeSelection && nativeSelection.anchorNode instanceof HTMLElement && nativeSelection.anchorNode.closest(".dropdown-portal")) {
        return;
      }
      if (nativeSelection !== null && (!$isRangeSelection2(selection) || rootElement === null || !rootElement.contains(nativeSelection.anchorNode)) && !((_a = toolbarRef == null ? void 0 : toolbarRef.current) == null ? void 0 : _a.contains(nativeSelection.anchorNode)) && !(aiElement && aiElement.contains(nativeSelection.anchorNode))) {
        setIsText(false);
        return;
      }
      if (!$isRangeSelection2(selection)) {
        return;
      }
      const node = getSelectedNode(selection);
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
      setIsSubscript(selection.hasFormat("subscript"));
      setIsLowercase(selection.hasFormat("lowercase"));
      setIsUppercase(selection.hasFormat("uppercase"));
      setIsCapitalize(selection.hasFormat("capitalize"));
      setIsSubscript(selection.hasFormat("subscript"));
      setIsSuperscript(selection.hasFormat("superscript"));
      setIsCode(selection.hasFormat("code"));
      const size = $getSelectionStyleValueForProperty(
        selection,
        "font-size",
        "16px"
      );
      setFontSize(size);
      const alignment = $getSelectionStyleValueForProperty(
        selection,
        "text-align",
        "left"
      );
      setTextAlign(alignment);
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }
      if (!$isCodeHighlightNode(selection.anchor.getNode()) && selection.getTextContent() !== "") {
        setIsText($isTextNode2(node) || $isParagraphNode(node));
      } else {
        setIsText(false);
      }
      const rawTextContent = selection.getTextContent().replace(/\n/g, "");
      if (!selection.isCollapsed() && rawTextContent === "") {
        setIsText(false);
        return;
      }
      setFontFamily(
        $getSelectionStyleValueForProperty(selection, "font-family", "Arial")
      );
      setFontColor($getSelectionStyleValueForProperty(selection, "color"));
      setBgColor(
        $getSelectionStyleValueForProperty(selection, "background-color")
      );
      const tableNode = $findMatchingParent(node, $isTableNode);
      if ($isTableNode(tableNode)) {
        setRootType("table");
      } else {
        setRootType("root");
      }
      const anchorNode = selection.anchor.getNode();
      let element = anchorNode.getKey() === "root" ? anchorNode : $findMatchingParent(anchorNode, (e) => {
        const parent2 = e.getParent();
        return parent2 !== null && $isRootOrShadowRoot(parent2);
      });
      if ($isListNode(element)) {
        const parentList = $getNearestNodeOfType(
          anchorNode,
          ListNode2
        );
        const type = parentList ? parentList.getListType() : element.getListType();
        setBlockType(type);
      } else {
        const type = $isHeadingNode(element) ? element.getTag() : (
          // @ts-ignore
          element.getType()
        );
        setBlockType(type);
      }
    });
  }, [editor]);
  useEffect5(() => {
    const handleSelectionChange = () => {
      if (toolbarRef.current && toolbarRef.current.contains(document.activeElement)) {
        return;
      }
      updatePopup();
    };
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [updatePopup]);
  useEffect5(() => {
    return mergeRegister2(
      editor.registerUpdateListener(() => {
        updatePopup();
      }),
      editor.registerRootListener(() => {
        if (editor.getRootElement() === null) {
          setIsText(false);
        }
      })
    );
  }, [editor, updatePopup]);
  if (!isText) {
    return null;
  }
  return createPortal(
    /* @__PURE__ */ React6.createElement("div", { ref: toolbarRef }, /* @__PURE__ */ React6.createElement(
      TextFormatFloatingToolbar,
      {
        editor,
        anchorElem,
        isLink,
        isBold,
        isItalic,
        isStrikethrough,
        isUnderline,
        isCode,
        fontColor,
        bgColor,
        blockType,
        fontFamily,
        setIsLinkEditMode,
        isUppercase,
        rootType,
        textAlign,
        isLowercase,
        isCapitalize,
        isSubscript,
        fontSize,
        isSuperscript
      }
    )),
    anchorElem
  );
}
function FloatingTextFormatToolbarPlugin({
  anchorElem = document.body,
  setIsLinkEditMode
}) {
  const [editor] = useLexicalComposerContext();
  return useFloatingTextFormatToolbar(editor, anchorElem, setIsLinkEditMode);
}

export {
  FloatingTextFormatToolbarPlugin
};
