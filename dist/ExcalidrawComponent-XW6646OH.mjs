import {
  ExcalidrawModal
} from "./chunk-XWC4TK2N.mjs";
import {
  $isExcalidrawNode
} from "./chunk-KJV3FAZ7.mjs";
import "./chunk-WDG7J2DY.mjs";
import "./chunk-BIU7WTLX.mjs";
import "./chunk-YHPNOWFH.mjs";
import {
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/components/editor/nodes/ExcalidrawNode/ExcalidrawComponent.tsx
init_react_shim();
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalEditable } from "@lexical/react/useLexicalEditable";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import { mergeRegister } from "@lexical/utils";
import {
  $getNodeByKey,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  isDOMNode
} from "lexical";
import { useCallback, useEffect as useEffect2, useMemo, useRef as useRef2, useState as useState2 } from "react";
import * as React3 from "react";

// src/components/editor/nodes/ExcalidrawNode/ExcalidrawImage.tsx
init_react_shim();
import { exportToSvg } from "@excalidraw/excalidraw";
import * as React from "react";
import { useEffect, useState } from "react";
var removeStyleFromSvg_HACK = (svg) => {
  var _a;
  const styleTag = (_a = svg == null ? void 0 : svg.firstElementChild) == null ? void 0 : _a.firstElementChild;
  const viewBox = svg.getAttribute("viewBox");
  if (viewBox != null) {
    const viewBoxDimensions = viewBox.split(" ");
    svg.setAttribute("width", viewBoxDimensions[2]);
    svg.setAttribute("height", viewBoxDimensions[3]);
  }
  if (styleTag && styleTag.tagName === "style") {
    styleTag.remove();
  }
};
function ExcalidrawImage({
  elements,
  files,
  imageContainerRef,
  appState,
  rootClassName = null,
  width = "inherit",
  height = "inherit"
}) {
  var _a;
  const [Svg, setSvg] = useState(null);
  useEffect(() => {
    const setContent = async () => {
      const svg = await exportToSvg({
        appState,
        elements,
        files
      });
      removeStyleFromSvg_HACK(svg);
      svg.setAttribute("width", "100%");
      svg.setAttribute("height", "100%");
      svg.setAttribute("display", "block");
      setSvg(svg);
    };
    setContent();
  }, [elements, files, appState]);
  const containerStyle = {};
  if (width !== "inherit") {
    containerStyle.width = `${width}px`;
  }
  if (height !== "inherit") {
    containerStyle.height = `${height}px`;
  }
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      ref: (node) => {
        if (node) {
          if (imageContainerRef) {
            imageContainerRef.current = node;
          }
        }
      },
      className: rootClassName != null ? rootClassName : "",
      style: containerStyle,
      dangerouslySetInnerHTML: { __html: (_a = Svg == null ? void 0 : Svg.outerHTML) != null ? _a : "" }
    }
  );
}

// src/components/editor/nodes/ExcalidrawNode/ImageResizer.tsx
init_react_shim();
import { calculateZoomLevel } from "@lexical/utils";
import * as React2 from "react";
import { useRef } from "react";
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
  buttonRef,
  imageRef,
  maxWidth,
  editor,
  showCaption,
  setShowCaption,
  captionsEnabled
}) {
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
  const maxWidthContainer = maxWidth ? maxWidth : editorRootElement !== null ? editorRootElement.getBoundingClientRect().width - 20 : 100;
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
    const image = imageRef.current;
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
      controlWrapper.classList.add("image-control-wrapper--resizing");
      image.style.height = `${height}px`;
      image.style.width = `${width}px`;
      document.addEventListener("pointermove", handlePointerMove);
      document.addEventListener("pointerup", handlePointerUp);
    }
  };
  const handlePointerMove = (event) => {
    const image = imageRef.current;
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
    const image = imageRef.current;
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
      controlWrapper.classList.remove("image-control-wrapper--resizing");
      setEndCursor();
      onResizeEnd(width, height);
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
    }
  };
  return /* @__PURE__ */ React2.createElement("div", { ref: controlWrapperRef }, !showCaption && captionsEnabled && /* @__PURE__ */ React2.createElement(
    "button",
    {
      className: "image-caption-button",
      ref: buttonRef,
      onClick: () => {
        setShowCaption(!showCaption);
      }
    },
    "Add Caption"
  ), /* @__PURE__ */ React2.createElement(
    "div",
    {
      className: "image-resizer image-resizer-n",
      onPointerDown: (event) => {
        handlePointerDown(event, Direction.north);
      }
    }
  ), /* @__PURE__ */ React2.createElement(
    "div",
    {
      className: "image-resizer image-resizer-ne",
      onPointerDown: (event) => {
        handlePointerDown(event, Direction.north | Direction.east);
      }
    }
  ), /* @__PURE__ */ React2.createElement(
    "div",
    {
      className: "image-resizer image-resizer-e",
      onPointerDown: (event) => {
        handlePointerDown(event, Direction.east);
      }
    }
  ), /* @__PURE__ */ React2.createElement(
    "div",
    {
      className: "image-resizer image-resizer-se",
      onPointerDown: (event) => {
        handlePointerDown(event, Direction.south | Direction.east);
      }
    }
  ), /* @__PURE__ */ React2.createElement(
    "div",
    {
      className: "image-resizer image-resizer-s",
      onPointerDown: (event) => {
        handlePointerDown(event, Direction.south);
      }
    }
  ), /* @__PURE__ */ React2.createElement(
    "div",
    {
      className: "image-resizer image-resizer-sw",
      onPointerDown: (event) => {
        handlePointerDown(event, Direction.south | Direction.west);
      }
    }
  ), /* @__PURE__ */ React2.createElement(
    "div",
    {
      className: "image-resizer image-resizer-w",
      onPointerDown: (event) => {
        handlePointerDown(event, Direction.west);
      }
    }
  ), /* @__PURE__ */ React2.createElement(
    "div",
    {
      className: "image-resizer image-resizer-nw",
      onPointerDown: (event) => {
        handlePointerDown(event, Direction.north | Direction.west);
      }
    }
  ));
}

// src/components/editor/nodes/ExcalidrawNode/ExcalidrawComponent.tsx
function ExcalidrawComponent({
  nodeKey,
  data,
  width,
  height
}) {
  const [editor] = useLexicalComposerContext();
  const isEditable = useLexicalEditable();
  const [isModalOpen, setModalOpen] = useState2(
    data === "[]" && editor.isEditable()
  );
  const imageContainerRef = useRef2(null);
  const buttonRef = useRef2(null);
  const captionButtonRef = useRef2(null);
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
  const [isResizing, setIsResizing] = useState2(false);
  useEffect2(() => {
    if (!isEditable) {
      if (isSelected) {
        clearSelection();
      }
      return;
    }
    return mergeRegister(
      editor.registerCommand(
        CLICK_COMMAND,
        (event) => {
          const buttonElem = buttonRef.current;
          const eventTarget = event.target;
          if (isResizing) {
            return true;
          }
          if (buttonElem !== null && isDOMNode(eventTarget) && buttonElem.contains(eventTarget)) {
            if (!event.shiftKey) {
              clearSelection();
            }
            setSelected(!isSelected);
            if (event.detail > 1) {
              setModalOpen(true);
            }
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [clearSelection, editor, isSelected, isResizing, setSelected, isEditable]);
  const deleteNode = useCallback(() => {
    setModalOpen(false);
    return editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (node) {
        node.remove();
      }
    });
  }, [editor, nodeKey]);
  const setData = (els, aps, fls) => {
    return editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isExcalidrawNode(node)) {
        if (els && els.length > 0 || Object.keys(fls).length > 0) {
          node.setData(
            JSON.stringify({
              appState: aps,
              elements: els,
              files: fls
            })
          );
        } else {
          node.remove();
        }
      }
    });
  };
  const onResizeStart = () => {
    setIsResizing(true);
  };
  const onResizeEnd = (nextWidth, nextHeight) => {
    setTimeout(() => {
      setIsResizing(false);
    }, 200);
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isExcalidrawNode(node)) {
        node.setWidth(nextWidth);
        node.setHeight(nextHeight);
      }
    });
  };
  const openModal = useCallback(() => {
    setModalOpen(true);
  }, []);
  const {
    elements = [],
    files = {},
    appState = {}
  } = useMemo(() => JSON.parse(data), [data]);
  const closeModal = useCallback(() => {
    setModalOpen(false);
    if (elements.length === 0) {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if (node) {
          node.remove();
        }
      });
    }
  }, [editor, nodeKey, elements.length]);
  return /* @__PURE__ */ React3.createElement(React3.Fragment, null, isEditable && isModalOpen && /* @__PURE__ */ React3.createElement(
    ExcalidrawModal,
    {
      initialElements: elements,
      initialFiles: files,
      initialAppState: appState,
      isShown: isModalOpen,
      onDelete: deleteNode,
      onClose: closeModal,
      onSave: (els, aps, fls) => {
        setData(els, aps, fls);
        setModalOpen(false);
      },
      closeOnClickOutside: false
    }
  ), elements.length > 0 && /* @__PURE__ */ React3.createElement(
    "button",
    {
      ref: buttonRef,
      className: `excalidraw-button ${isSelected ? "selected" : ""}`
    },
    /* @__PURE__ */ React3.createElement(
      ExcalidrawImage,
      {
        imageContainerRef,
        className: "image",
        elements,
        files,
        appState,
        width,
        height
      }
    ),
    isSelected && isEditable && /* @__PURE__ */ React3.createElement(
      "div",
      {
        className: "image-edit-button",
        role: "button",
        tabIndex: 0,
        onMouseDown: (event) => event.preventDefault(),
        onClick: openModal
      }
    ),
    (isSelected || isResizing) && isEditable && /* @__PURE__ */ React3.createElement(
      ImageResizer,
      {
        buttonRef: captionButtonRef,
        showCaption: true,
        setShowCaption: () => null,
        imageRef: imageContainerRef,
        editor,
        onResizeStart,
        onResizeEnd,
        captionsEnabled: true
      }
    )
  ));
}
export {
  ExcalidrawComponent as default
};
