import {
  Separator
} from "./chunk-TCYK7DM7.mjs";
import {
  useSharedHistoryContext
} from "./chunk-4EXYCTGJ.mjs";
import {
  $isImageNode
} from "./chunk-N3WN46VL.mjs";
import {
  Skeleton
} from "./chunk-QEIFVK5M.mjs";
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

// src/components/ui/image/index.tsx
init_react_shim();
import { LinkNode } from "@lexical/link";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalNestedComposer } from "@lexical/react/LexicalNestedComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { useLexicalEditable } from "@lexical/react/useLexicalEditable";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import { mergeRegister } from "@lexical/utils";
import {
  $getNodeByKey as $getNodeByKey2,
  $getSelection,
  $isNodeSelection,
  $isRangeSelection,
  $setSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  createCommand,
  DRAGSTART_COMMAND,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
  LineBreakNode,
  ParagraphNode,
  RootNode,
  SELECTION_CHANGE_COMMAND,
  TextNode
} from "lexical";
import * as React5 from "react";
import { Suspense, useCallback as useCallback2, useEffect as useEffect4, useRef as useRef2, useState as useState4 } from "react";

// src/components/ui/image/error-image.tsx
init_react_shim();
import React2 from "react";
function ErrorImage() {
  return /* @__PURE__ */ React2.createElement(
    "img",
    {
      src: "https://cdn.mos.cms.futurecdn.net/Wh46bS2Gw8vUC6iQh2wEd6-1020-80.png",
      style: {
        height: 300,
        width: 300
      },
      draggable: "false"
    }
  );
}

// src/components/ui/image/index.tsx
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";

// src/components/ui/image/image-resizer.tsx
init_react_shim();
import * as React3 from "react";
import { useRef } from "react";
import { calculateZoomLevel } from "@lexical/utils";
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
var Direction = {
  east: 1 << 0,
  north: 1 << 3,
  south: 1 << 1,
  west: 1 << 2
};
function ImageResizer({
  onResizeStart,
  onResizeEnd,
  MediaRef,
  editor
}) {
  var _a, _b;
  const controlWrapperRef = useRef(null);
  const userSelect = useRef({
    priority: "",
    value: "default"
  });
  const positioningRef = useRef({
    currentHeight: 0,
    currentWidth: 0,
    direction: 0,
    isResizing: false,
    ratio: 0,
    startHeight: 0,
    startWidth: 0,
    startX: 0,
    startY: 0
  });
  const editorRootElement = editor.getRootElement();
  const maxWidthContainer = 950;
  const maxHeightContainer = editorRootElement !== null ? editorRootElement.getBoundingClientRect().height - 20 : 100;
  const minWidth = 100;
  const minHeight = 100;
  const setStartCursor = (direction) => {
    const ew = direction === Direction.east || direction === Direction.west;
    const ns = direction === Direction.north || direction === Direction.south;
    const nwse = direction & Direction.north && direction & Direction.west || direction & Direction.south && direction & Direction.east;
    const cursorDir = ew ? "ew" : ns ? "ns" : nwse ? "nwse" : "nesw";
    if (editorRootElement !== null) {
      editorRootElement.style.setProperty(
        "cursor",
        `${cursorDir}-resize`,
        "important"
      );
    }
    if (document.body !== null) {
      document.body.style.setProperty(
        "cursor",
        `${cursorDir}-resize`,
        "important"
      );
      userSelect.current.value = document.body.style.getPropertyValue(
        "-webkit-user-select"
      );
      userSelect.current.priority = document.body.style.getPropertyPriority(
        "-webkit-user-select"
      );
      document.body.style.setProperty(
        "-webkit-user-select",
        `none`,
        "important"
      );
    }
  };
  const setEndCursor = () => {
    if (editorRootElement !== null) {
      editorRootElement.style.setProperty("cursor", "text");
    }
    if (document.body !== null) {
      document.body.style.setProperty("cursor", "default");
      document.body.style.setProperty(
        "-webkit-user-select",
        userSelect.current.value,
        userSelect.current.priority
      );
    }
  };
  const handlePointerDown = (event, direction) => {
    if (!editor.isEditable()) {
      return;
    }
    const image = MediaRef.current;
    const controlWrapper = controlWrapperRef.current;
    if (image !== null && controlWrapper !== null) {
      event.preventDefault();
      const { width, height } = image.getBoundingClientRect();
      const zoom = calculateZoomLevel(image);
      const positioning = positioningRef.current;
      positioning.startWidth = width;
      positioning.startHeight = height;
      positioning.ratio = width / height;
      positioning.currentWidth = width;
      positioning.currentHeight = height;
      positioning.startX = event.clientX / zoom;
      positioning.startY = event.clientY / zoom;
      positioning.isResizing = true;
      positioning.direction = direction;
      setStartCursor(direction);
      onResizeStart();
      controlWrapper.classList.add("resizing");
      image.classList.add("resizing");
      document.addEventListener("pointermove", handlePointerMove);
      document.addEventListener("pointerup", handlePointerUp);
    }
  };
  const handlePointerMove = (event) => {
    const image = MediaRef.current;
    const positioning = positioningRef.current;
    const isHorizontal = positioning.direction & (Direction.east | Direction.west);
    const isVertical = positioning.direction & (Direction.south | Direction.north);
    if (image !== null && positioning.isResizing) {
      const zoom = calculateZoomLevel(image);
      if (isHorizontal && isVertical) {
        let diff = Math.floor(positioning.startX - event.clientX / zoom);
        diff = positioning.direction & Direction.east ? -diff : diff;
        const width = clamp(
          positioning.startWidth + diff,
          minWidth,
          maxWidthContainer
        );
        const height = width / positioning.ratio;
        image.style.width = `${width}px`;
        image.style.height = `${height}px`;
        positioning.currentHeight = height;
        positioning.currentWidth = width;
      } else if (isVertical) {
        let diff = Math.floor(positioning.startY - event.clientY / zoom);
        diff = positioning.direction & Direction.south ? -diff : diff;
        const height = clamp(
          positioning.startHeight + diff,
          minHeight,
          maxHeightContainer
        );
        image.style.height = `${height}px`;
        positioning.currentHeight = height;
      } else {
        let diff = Math.floor(positioning.startX - event.clientX / zoom);
        diff = positioning.direction & Direction.east ? -diff : diff;
        const width = clamp(
          positioning.startWidth + diff,
          minWidth,
          maxWidthContainer
        );
        image.style.width = `${width}px`;
        positioning.currentWidth = width;
      }
    }
  };
  const handlePointerUp = () => {
    const image = MediaRef.current;
    const positioning = positioningRef.current;
    const controlWrapper = controlWrapperRef.current;
    if (image !== null && controlWrapper !== null && positioning.isResizing) {
      const width = positioning.currentWidth;
      const height = positioning.currentHeight;
      positioning.startWidth = 0;
      positioning.startHeight = 0;
      positioning.ratio = 0;
      positioning.startX = 0;
      positioning.startY = 0;
      positioning.currentWidth = 0;
      positioning.currentHeight = 0;
      positioning.isResizing = false;
      controlWrapper.classList.remove("resizing");
      image.classList.remove("resizing");
      setEndCursor();
      onResizeEnd(width, height);
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
    }
  };
  return /* @__PURE__ */ React3.createElement(
    "div",
    {
      ref: controlWrapperRef,
      className: "absolute inset-0 z-10",
      style: {
        width: (_a = MediaRef.current) == null ? void 0 : _a.style.width,
        height: (_b = MediaRef.current) == null ? void 0 : _b.style.height
      }
    },
    /* @__PURE__ */ React3.createElement(
      "div",
      {
        className: "absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full cursor-n-resize",
        onPointerDown: (event) => {
          handlePointerDown(event, Direction.north);
        }
      }
    ),
    /* @__PURE__ */ React3.createElement(
      "div",
      {
        className: "absolute top-0 right-0 transform -translate-y-1/2 translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full cursor-ne-resize",
        onPointerDown: (event) => {
          handlePointerDown(event, Direction.north | Direction.east);
        }
      }
    ),
    /* @__PURE__ */ React3.createElement(
      "div",
      {
        className: "absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full cursor-e-resize",
        onPointerDown: (event) => {
          handlePointerDown(event, Direction.east);
        }
      }
    ),
    /* @__PURE__ */ React3.createElement(
      "div",
      {
        className: "absolute bottom-0 right-0 transform translate-x-1/2 translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full cursor-se-resize",
        onPointerDown: (event) => {
          handlePointerDown(event, Direction.south | Direction.east);
        }
      }
    ),
    /* @__PURE__ */ React3.createElement(
      "div",
      {
        className: "absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full cursor-s-resize",
        onPointerDown: (event) => {
          handlePointerDown(event, Direction.south);
        }
      }
    ),
    /* @__PURE__ */ React3.createElement(
      "div",
      {
        className: "absolute bottom-0 left-0 transform -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full cursor-sw-resize",
        onPointerDown: (event) => {
          handlePointerDown(event, Direction.south | Direction.west);
        }
      }
    ),
    /* @__PURE__ */ React3.createElement(
      "div",
      {
        className: "absolute top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full cursor-w-resize",
        onPointerDown: (event) => {
          handlePointerDown(event, Direction.west);
        }
      }
    ),
    /* @__PURE__ */ React3.createElement(
      "div",
      {
        className: "absolute top-0 left-0 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full cursor-nw-resize",
        onPointerDown: (event) => {
          handlePointerDown(event, Direction.north | Direction.west);
        }
      }
    )
  );
}

// src/components/ui/image/lazy-image.tsx
init_react_shim();
import { useEffect, useState } from "react";
var imageCache = /* @__PURE__ */ new Set();
function LazyImage({
  altText,
  style,
  imageRef,
  src,
  onError
}) {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (imageCache.has(src)) {
      setIsLoading(false);
      return;
    }
    const img = new Image();
    img.src = src;
    img.onload = () => {
      imageCache.add(src);
      setIsLoading(false);
    };
    img.onerror = () => {
      imageCache.add(src);
      setIsLoading(false);
      onError();
    };
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, onError]);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, isLoading && /* @__PURE__ */ React.createElement(
    Skeleton,
    {
      style
    }
  ), /* @__PURE__ */ React.createElement(
    "img",
    {
      className: cn("max-w-full transition-opacity border-amber-500 border-2", isLoading ? "opacity-0" : "opacity-100"),
      src,
      alt: altText,
      ref: imageRef,
      style,
      onError,
      draggable: "false"
    }
  ));
}

// src/components/ui/image/lazy-video.tsx
init_react_shim();
import { useEffect as useEffect2, useState as useState2 } from "react";
var videoCache = /* @__PURE__ */ new Set();
function LazyVideo({
  videoRef,
  src,
  style,
  onError,
  rounded,
  controls = true
}) {
  const [isLoading, setIsLoading] = useState2(true);
  useEffect2(() => {
    if (videoCache.has(src)) {
      setIsLoading(false);
      return;
    }
    const video = document.createElement("video");
    video.src = src;
    video.onloadeddata = () => {
      videoCache.add(src);
      setIsLoading(false);
    };
    video.onerror = () => {
      videoCache.add(src);
      setIsLoading(false);
      onError();
    };
    return () => {
      video.onloadeddata = null;
      video.onerror = null;
    };
  }, [src, onError]);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, isLoading && /* @__PURE__ */ React.createElement(
    Skeleton,
    {
      style
    }
  ), /* @__PURE__ */ React.createElement(
    "video",
    {
      className: cn(" transition-opacity", isLoading ? "opacity-0" : "opacity-100"),
      src,
      ref: videoRef,
      style,
      onError,
      controls,
      draggable: "false"
    }
  ));
}

// src/components/ui/image/image-toolbar.tsx
init_react_shim();
import { $getNodeByKey } from "lexical";
import React4, { useCallback, useEffect as useEffect3, useState as useState3 } from "react";
import {
  AlignCenterVertical,
  CaptionsIcon,
  Fullscreen,
  PanelLeftClose,
  Radius
} from "lucide-react";
function ImageToolBar({
  editor,
  nodeKey,
  height,
  width
}) {
  const [showResizeInput, setShowResizeInput] = useState3(false);
  const [widthInput, setWidthInput] = useState3(String(width));
  const [heightInput, setHeightInput] = useState3(String(height));
  const [showInput, setShowInput] = useState3(false);
  const toggleResizeInput = useCallback(() => {
    setShowResizeInput((prev) => !prev);
  }, []);
  const setShowCaption = () => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isImageNode(node)) {
        const currentState = node.__showCaption;
        node.setShowCaption(!currentState);
      }
    });
  };
  const updateWidthAndHeight = useCallback(() => {
    const newWidth = Number(widthInput);
    const newHeight = Number(heightInput);
    console.log("update", newWidth, newHeight);
    if (isNaN(newWidth) || isNaN(newHeight)) return;
    if (newWidth > 990 || newHeight > 1800) return;
    if (newWidth < 140 || newHeight < 90) return;
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isImageNode(node)) {
        node.setWidthAndHeight(newWidth, newHeight);
      }
    });
  }, [editor, nodeKey, widthInput, heightInput]);
  useEffect3(() => {
    const debounceTimeout = setTimeout(() => {
      updateWidthAndHeight();
    }, 500);
    return () => clearTimeout(debounceTimeout);
  }, [widthInput, heightInput, updateWidthAndHeight]);
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        updateWidthAndHeight();
      }
    },
    [updateWidthAndHeight]
  );
  const handleWidthChange = useCallback(
    (e) => {
      setWidthInput(e.target.value);
    },
    []
  );
  const handleHeightChange = useCallback(
    (e) => {
      setHeightInput(e.target.value);
    },
    []
  );
  useEffect3(() => {
    setWidthInput(String(width));
    setHeightInput(String(height));
  }, [height, width]);
  const ChangeSideToLeft = useCallback(() => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isImageNode(node)) {
        node.setAlignment("start");
      }
    });
  }, [editor, nodeKey]);
  const ChangeSideToCenter = useCallback(() => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isImageNode(node)) {
        node.setAlignment("center");
      }
    });
  }, [editor, nodeKey]);
  const ChangeSideToRight = useCallback(() => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isImageNode(node)) {
        node.setAlignment("end");
      }
    });
  }, [editor, nodeKey]);
  const ChangeRounded = useCallback(
    (event) => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isImageNode(node)) {
          const roundedValue = parseInt(event.target.value);
          node.setRounded(roundedValue);
        }
      });
    },
    [editor, nodeKey]
  );
  return /* @__PURE__ */ React4.createElement("div", { className: "flex flex-row items-center z-50 gap-x-2 absolute top-1 left-1 group-hover:opacity-100 duration-500 opacity-0 transition-all" }, /* @__PURE__ */ React4.createElement("div", { className: "p-1 rounded-sm bg-background/40 flex flex-row items-center justify-between" }, /* @__PURE__ */ React4.createElement("div", { className: "flex flex-row items-center" }, /* @__PURE__ */ React4.createElement(
    Button,
    {
      onClick: toggleResizeInput,
      tip: "Resize image",
      variant: "ghost",
      size: "sm",
      className: "p-1 w-6 h-6 "
    },
    /* @__PURE__ */ React4.createElement(Fullscreen, { className: "size-2" })
  ), /* @__PURE__ */ React4.createElement(
    "div",
    {
      className: cn(
        "transition-all duration-500  ease-in-out",
        showResizeInput ? "w-[30px] mx-1" : "w-0"
      )
    },
    /* @__PURE__ */ React4.createElement(
      Input,
      {
        type: "number",
        placeholder: "0px",
        max: 990,
        min: 120,
        value: widthInput,
        onChange: handleWidthChange,
        onKeyDown: handleKeyDown,
        className: cn(
          "h-5 px-0.5 w-full rounded-sm text-xs outline-none transition-opacity duration-300 ease-in-out",
          showResizeInput ? "opacity-100" : "opacity-0"
        )
      }
    )
  ), /* @__PURE__ */ React4.createElement(
    "div",
    {
      className: cn(
        "transition-all duration-500 ease-in-out",
        showResizeInput ? "w-[30px]" : "w-0"
      )
    },
    /* @__PURE__ */ React4.createElement(
      Input,
      {
        type: "number",
        placeholder: "0px",
        max: 1800,
        min: 120,
        value: heightInput,
        onChange: handleHeightChange,
        onKeyDown: handleKeyDown,
        className: cn(
          "h-5 px-0.5 w-full text-xs rounded-sm outline-none transition-opacity duration-300 ease-in-out",
          showResizeInput ? "opacity-100" : "opacity-0"
        )
      }
    )
  )), /* @__PURE__ */ React4.createElement(Separator, { orientation: "vertical", className: "mx-1 h-5" }), /* @__PURE__ */ React4.createElement("div", { className: "flex flex-row items-center gap-x-1" }, /* @__PURE__ */ React4.createElement(
    Button,
    {
      onClick: ChangeSideToLeft,
      variant: "ghost",
      size: "sm",
      tip: "move left",
      className: "w-6 h-6 p-1 "
    },
    /* @__PURE__ */ React4.createElement(PanelLeftClose, null)
  ), /* @__PURE__ */ React4.createElement(
    Button,
    {
      size: "sm",
      variant: "ghost",
      onClick: ChangeSideToCenter,
      className: " mx-1 w-6 h-6 p-1 opacity-[0.70] hover:opacity-100 transition-opacity",
      tip: "move center"
    },
    /* @__PURE__ */ React4.createElement(AlignCenterVertical, null)
  ), /* @__PURE__ */ React4.createElement(
    Button,
    {
      size: "sm",
      variant: "ghost",
      onClick: ChangeSideToRight,
      className: "  w-6 h-6 p-1 opacity-[0.70] hover:opacity-100 transition-opacity",
      tip: "move right"
    },
    /* @__PURE__ */ React4.createElement(PanelLeftClose, null)
  )), /* @__PURE__ */ React4.createElement(Separator, { orientation: "vertical", className: "mx-1 h-5" }), /* @__PURE__ */ React4.createElement(
    Button,
    {
      size: "sm",
      variant: "ghost",
      onClick: () => {
        setShowInput(!showInput);
      },
      className: "  w-6 h-6 p-1 opacity-[0.70] hover:opacity-100 transition-opacity",
      tip: "border radius"
    },
    /* @__PURE__ */ React4.createElement(Radius, null)
  ), /* @__PURE__ */ React4.createElement(
    "div",
    {
      className: cn(
        "overflow-hidden transition-all duration-500 ease-in-out ",
        showInput ? "w-[60px]" : "w-0"
      )
    },
    /* @__PURE__ */ React4.createElement(
      Input,
      {
        type: "range",
        min: "0",
        max: "120",
        defaultValue: "0",
        onChange: ChangeRounded,
        className: cn(
          "h-5 px-1 py-0 transition-opacity duration-300 ease-in-out",
          showInput ? "opacity-100" : "opacity-0"
        )
      }
    )
  ), /* @__PURE__ */ React4.createElement(Separator, { orientation: "vertical", className: "mx-1 h-5" }), /* @__PURE__ */ React4.createElement(
    Button,
    {
      size: "sm",
      variant: "ghost",
      onClick: setShowCaption,
      className: "  w-6 h-6 p-1 opacity-[0.70] hover:opacity-100 transition-opacity",
      tip: "add caption"
    },
    /* @__PURE__ */ React4.createElement(CaptionsIcon, null)
  )));
}

// src/components/ui/image/index.tsx
var RIGHT_CLICK_IMAGE_COMMAND = createCommand("RIGHT_CLICK_IMAGE_COMMAND");
function ImageComponent({
  src,
  altText,
  nodeKey,
  width,
  height,
  maxWidth,
  resizable,
  showCaption,
  caption,
  rounded
}) {
  const MediaRef = useRef2(null);
  const buttonRef = useRef2(null);
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
  const [isResizing, setIsResizing] = useState4(false);
  const [editor] = useLexicalComposerContext();
  const [selection, setSelection] = useState4(null);
  const activeEditorRef = useRef2(null);
  const [isLoadError, setIsLoadError] = useState4(false);
  const isEditable = useLexicalEditable();
  const [MediaType, setMediaType] = useState4("IMAGE");
  const $onDelete = useCallback2(
    (payload) => {
      const deleteSelection = $getSelection();
      if (isSelected && $isNodeSelection(deleteSelection)) {
        const event = payload;
        event.preventDefault();
        deleteSelection.getNodes().forEach((node) => {
          if ($isImageNode(node)) {
            node.remove();
          }
        });
      }
      return false;
    },
    [isSelected]
  );
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
  const onClick = useCallback2(
    (payload) => {
      const event = payload;
      if (isResizing) {
        return true;
      }
      if (event.target === MediaRef.current) {
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
    [isResizing, isSelected, setSelected, clearSelection]
  );
  const onRightClick = useCallback2(
    (event) => {
      editor.getEditorState().read(() => {
        const latestSelection = $getSelection();
        const domElement = event.target;
        if ((domElement.tagName === "IMG" || domElement.tagName === "VIDEO") && $isRangeSelection(latestSelection) && latestSelection.getNodes().length === 1) {
          editor.dispatchCommand(
            RIGHT_CLICK_IMAGE_COMMAND,
            event
          );
        }
      });
    },
    [editor]
  );
  useEffect4(() => {
    let isMounted = true;
    const rootElement = editor.getRootElement();
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
        onClick,
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        RIGHT_CLICK_IMAGE_COMMAND,
        onClick,
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        DRAGSTART_COMMAND,
        (event) => {
          if (event.target === MediaRef.current) {
            event.preventDefault();
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_DELETE_COMMAND,
        $onDelete,
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_BACKSPACE_COMMAND,
        $onDelete,
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(KEY_ENTER_COMMAND, $onEnter, COMMAND_PRIORITY_LOW),
      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        $onEscape,
        COMMAND_PRIORITY_LOW
      )
    );
    rootElement == null ? void 0 : rootElement.addEventListener("contextmenu", onRightClick);
    return () => {
      isMounted = false;
      unregister();
      rootElement == null ? void 0 : rootElement.removeEventListener("contextmenu", onRightClick);
    };
  }, [
    clearSelection,
    editor,
    isResizing,
    isSelected,
    nodeKey,
    $onDelete,
    $onEnter,
    $onEscape,
    onClick,
    onRightClick,
    setSelected
  ]);
  useEffect4(() => {
    if (src.endsWith(".mp4")) {
      setMediaType("VIDEO");
    } else if (src.endsWith(".jpg") || src.endsWith(".jpeg") || src.endsWith(".png")) {
      setMediaType("IMAGE");
    }
  }, [src]);
  const onResizeEnd = (nextWidth, nextHeight) => {
    setTimeout(() => {
      setIsResizing(false);
    }, 200);
    editor.update(() => {
      const node = $getNodeByKey2(nodeKey);
      if ($isImageNode(node)) {
        node.setWidthAndHeight(nextWidth, nextHeight);
      }
    });
  };
  const onResizeStart = () => {
    setIsResizing(true);
  };
  const { historyState } = useSharedHistoryContext();
  const draggable = isSelected && $isNodeSelection(selection) && !isResizing;
  const isFocused = (isSelected || isResizing) && isEditable;
  return /* @__PURE__ */ React5.createElement(Suspense, { fallback: null }, /* @__PURE__ */ React5.createElement("div", { className: "relative inline-block group" }, /* @__PURE__ */ React5.createElement("div", { draggable }, isLoadError ? /* @__PURE__ */ React5.createElement(ErrorImage, null) : /* @__PURE__ */ React5.createElement(React5.Fragment, null, MediaType === "IMAGE" ? /* @__PURE__ */ React5.createElement(
    LazyImage,
    {
      style: {
        width: width === "inherit" ? "400px" : `${width}px`,
        height: height === "inherit" ? "400px" : `${height}px`,
        borderRadius: `${rounded}px`
      },
      src,
      altText,
      imageRef: MediaRef,
      onError: () => setIsLoadError(true)
    }
  ) : /* @__PURE__ */ React5.createElement(
    LazyVideo,
    {
      src,
      style: {
        width: width === "inherit" ? "800px" : `${width}px`,
        height: height === "inherit" ? "450px" : `${height}px`,
        borderRadius: `${rounded}px`
      },
      videoRef: MediaRef,
      onError: () => setIsLoadError(true),
      rounded,
      controls: true
    }
  ))), showCaption && /* @__PURE__ */ React5.createElement("div", null, /* @__PURE__ */ React5.createElement(
    LexicalNestedComposer,
    {
      initialEditor: caption,
      initialNodes: [
        RootNode,
        TextNode,
        LineBreakNode,
        ParagraphNode,
        LinkNode
      ]
    },
    /* @__PURE__ */ React5.createElement(AutoFocusPlugin, null),
    /* @__PURE__ */ React5.createElement(LinkPlugin, null),
    /* @__PURE__ */ React5.createElement(HistoryPlugin, { externalHistoryState: historyState }),
    /* @__PURE__ */ React5.createElement(
      RichTextPlugin,
      {
        contentEditable: /* @__PURE__ */ React5.createElement(
          ContentEditable,
          {
            "aria-placeholder": "Enter a caption...",
            placeholder: () => /* @__PURE__ */ React5.createElement(
              "span",
              {
                className: "\r\n                        color-[#999] text-xs overflow-hidden absolute  text-ellipsis\r\n                        select-none text-nowrap inline-block pointer-events-none\r\n                         transform -translate-x-1/2 -translate-y-1/2 bottom-[-8px]\r\n                        "
              },
              "Enter a caption..."
            ),
            className: "text-center relative text-xs text-muted-foreground  outline-none"
          }
        ),
        ErrorBoundary: LexicalErrorBoundary
      }
    )
  )), isEditable && !isResizing && /* @__PURE__ */ React5.createElement(
    ImageToolBar,
    {
      width,
      height,
      editor,
      nodeKey
    }
  ), resizable && $isNodeSelection(selection) && isFocused && /* @__PURE__ */ React5.createElement(
    ImageResizer,
    {
      editor,
      MediaRef,
      onResizeStart,
      onResizeEnd
    }
  )));
}
export {
  RIGHT_CLICK_IMAGE_COMMAND,
  ImageComponent as default
};
