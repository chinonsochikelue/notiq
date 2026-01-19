import {
  $createDynamicBlockNode,
  DynamicBlockNode
} from "./chunk-5BAKY5KN.mjs";
import {
  DialogActions,
  Select,
  TextInput
} from "./chunk-YPHOEJ46.mjs";
import {
  $createEquationNode,
  EquationNode,
  KatexRenderer
} from "./chunk-3JVFG7ER.mjs";
import {
  $createStoryBuilderNode,
  StoryBuilderNode
} from "./chunk-4MEDW3T6.mjs";
import {
  Button
} from "./chunk-BIU7WTLX.mjs";
import {
  React,
  __spreadProps,
  __spreadValues,
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/components/editor/plugins/StoryBuilderPlugin/index.tsx
init_react_shim();
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $wrapNodeInElement } from "@lexical/utils";
import {
  $createParagraphNode,
  $insertNodes,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_EDITOR,
  createCommand
} from "lexical";
import { useEffect } from "react";
var INSERT_STORY_BUILDER_COMMAND = createCommand("INSERT_STORY_BUILDER_COMMAND");
function StoryBuilderPlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (!editor.hasNodes([StoryBuilderNode])) {
      throw new Error("StoryBuilderPlugin: StoryBuilderNode not registered on editor");
    }
    return editor.registerCommand(
      INSERT_STORY_BUILDER_COMMAND,
      (payload) => {
        const storyBuilderNode = $createStoryBuilderNode(payload);
        $insertNodes([storyBuilderNode]);
        if ($isRootOrShadowRoot(storyBuilderNode.getParentOrThrow())) {
          $wrapNodeInElement(storyBuilderNode, $createParagraphNode).selectEnd();
        }
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor]);
  return null;
}

// src/components/editor/plugins/InlineImagePlugin/index.tsx
init_react_shim();
import { useLexicalComposerContext as useLexicalComposerContext2 } from "@lexical/react/LexicalComposerContext";
import { $wrapNodeInElement as $wrapNodeInElement2, mergeRegister } from "@lexical/utils";
import {
  $createParagraphNode as $createParagraphNode2,
  $createRangeSelection,
  $getSelection,
  $insertNodes as $insertNodes2,
  $isNodeSelection,
  $isRootOrShadowRoot as $isRootOrShadowRoot2,
  $setSelection,
  COMMAND_PRIORITY_EDITOR as COMMAND_PRIORITY_EDITOR2,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  createCommand as createCommand2,
  DRAGOVER_COMMAND,
  DRAGSTART_COMMAND,
  DROP_COMMAND,
  getDOMSelectionFromTarget,
  isHTMLElement as isHTMLElement2
} from "lexical";
import { useEffect as useEffect2, useRef, useState } from "react";

// src/components/editor/nodes/InlineImageNode/InlineImageNode.tsx
init_react_shim();
import {
  addClassNamesToElement,
  removeClassNamesFromElement
} from "@lexical/utils";
import {
  $applyNodeReplacement,
  createEditor,
  DecoratorNode,
  isHTMLElement
} from "lexical";
import * as React2 from "react";
var InlineImageComponent = React2.lazy(() => import("./InlineImageComponent-UWIUWBHI.mjs"));
function $convertInlineImageElement(domNode) {
  if (isHTMLElement(domNode) && domNode.nodeName === "IMG") {
    const { alt: altText, src, width, height } = domNode;
    const node = $createInlineImageNode({ altText, height, src, width });
    return { node };
  }
  return null;
}
function getPositionClass(position) {
  return typeof position === "string" ? `position-${position}` : void 0;
}
var InlineImageNode = class _InlineImageNode extends DecoratorNode {
  static getType() {
    return "inline-image";
  }
  static clone(node) {
    return new _InlineImageNode(
      node.__src,
      node.__altText,
      node.__position,
      node.__width,
      node.__height,
      node.__showCaption,
      node.__caption,
      node.__key
    );
  }
  static importJSON(serializedNode) {
    const { altText, height, width, src, showCaption, position } = serializedNode;
    return $createInlineImageNode({
      altText,
      height,
      position,
      showCaption,
      src,
      width
    }).updateFromJSON(serializedNode);
  }
  updateFromJSON(serializedNode) {
    const { caption } = serializedNode;
    const node = super.updateFromJSON(serializedNode);
    const nestedEditor = node.__caption;
    const editorState = nestedEditor.parseEditorState(caption.editorState);
    if (!editorState.isEmpty()) {
      nestedEditor.setEditorState(editorState);
    }
    return node;
  }
  static importDOM() {
    return {
      img: (node) => ({
        conversion: $convertInlineImageElement,
        priority: 0
      })
    };
  }
  constructor(src, altText, position, width, height, showCaption, caption, key) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__width = width || "inherit";
    this.__height = height || "inherit";
    this.__showCaption = showCaption || false;
    this.__caption = caption || createEditor();
    this.__position = position;
  }
  exportDOM() {
    const element = document.createElement("img");
    element.setAttribute("src", this.__src);
    element.setAttribute("alt", this.__altText);
    element.setAttribute("width", this.__width.toString());
    element.setAttribute("height", this.__height.toString());
    return { element };
  }
  exportJSON() {
    return __spreadProps(__spreadValues({}, super.exportJSON()), {
      altText: this.getAltText(),
      caption: this.__caption.toJSON(),
      height: this.__height === "inherit" ? 0 : this.__height,
      position: this.__position,
      showCaption: this.__showCaption,
      src: this.getSrc(),
      width: this.__width === "inherit" ? 0 : this.__width
    });
  }
  getSrc() {
    return this.__src;
  }
  getAltText() {
    return this.__altText;
  }
  setAltText(altText) {
    const writable = this.getWritable();
    writable.__altText = altText;
  }
  setWidthAndHeight(width, height) {
    const writable = this.getWritable();
    writable.__width = width;
    writable.__height = height;
  }
  getShowCaption() {
    return this.__showCaption;
  }
  setShowCaption(showCaption) {
    const writable = this.getWritable();
    writable.__showCaption = showCaption;
  }
  getPosition() {
    return this.__position;
  }
  setPosition(position) {
    const writable = this.getWritable();
    writable.__position = position;
  }
  update(payload) {
    const writable = this.getWritable();
    const { altText, showCaption, position } = payload;
    if (altText !== void 0) {
      writable.__altText = altText;
    }
    if (showCaption !== void 0) {
      writable.__showCaption = showCaption;
    }
    if (position !== void 0) {
      writable.__position = position;
    }
  }
  // View
  createDOM(config) {
    const span = document.createElement("span");
    for (const cls of [
      config.theme.inlineImage,
      getPositionClass(this.__position)
    ]) {
      if (cls) {
        addClassNamesToElement(span, cls);
      }
    }
    return span;
  }
  updateDOM(prevNode, dom, config) {
    const position = this.__position;
    if (position !== prevNode.__position) {
      removeClassNamesFromElement(dom, getPositionClass(prevNode.__position));
      addClassNamesToElement(dom, getPositionClass(position));
    }
    return false;
  }
  decorate() {
    return /* @__PURE__ */ React2.createElement(
      InlineImageComponent,
      {
        src: this.__src,
        altText: this.__altText,
        width: this.__width,
        height: this.__height,
        nodeKey: this.getKey(),
        showCaption: this.__showCaption,
        caption: this.__caption,
        position: this.__position
      }
    );
  }
};
function $createInlineImageNode({
  altText,
  position,
  height,
  src,
  width,
  showCaption,
  caption,
  key
}) {
  return $applyNodeReplacement(
    new InlineImageNode(
      src,
      altText,
      position,
      width,
      height,
      showCaption,
      caption,
      key
    )
  );
}
function $isInlineImageNode(node) {
  return node instanceof InlineImageNode;
}

// src/components/ui/FileInput.tsx
init_react_shim();
import * as React3 from "react";
function FileInput({
  accept,
  label,
  onChange,
  "data-test-id": dataTestId
}) {
  return /* @__PURE__ */ React3.createElement("div", { className: "Input__wrapper" }, /* @__PURE__ */ React3.createElement("label", { className: "Input__label" }, label), /* @__PURE__ */ React3.createElement(
    "input",
    {
      type: "file",
      accept,
      className: "Input__input",
      onChange: (e) => onChange(e.target.files),
      "data-test-id": dataTestId
    }
  ));
}

// src/components/editor/plugins/InlineImagePlugin/index.tsx
var INSERT_INLINE_IMAGE_COMMAND = createCommand2("INSERT_INLINE_IMAGE_COMMAND");
function InsertInlineImageDialog({
  activeEditor,
  onClose
}) {
  const hasModifier = useRef(false);
  const [src, setSrc] = useState("");
  const [altText, setAltText] = useState("");
  const [showCaption, setShowCaption] = useState(false);
  const [position, setPosition] = useState("left");
  const isDisabled = src === "";
  const handleShowCaptionChange = (e) => {
    setShowCaption(e.target.checked);
  };
  const handlePositionChange = (e) => {
    setPosition(e.target.value);
  };
  const loadImage = (files) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setSrc(reader.result);
      }
      return "";
    };
    reader.onerror = () => {
      console.error("Error reading file");
      setSrc("");
    };
    if (files !== null && files.length > 0) {
      reader.readAsDataURL(files[0]);
    }
  };
  useEffect2(() => {
    hasModifier.current = false;
    const handler = (e) => {
      hasModifier.current = e.altKey;
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
    };
  }, [activeEditor]);
  const handleOnClick = () => {
    const payload = { altText, position, showCaption, src };
    activeEditor.dispatchCommand(INSERT_INLINE_IMAGE_COMMAND, payload);
    onClose();
  };
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "mb-4" }, /* @__PURE__ */ React.createElement(FileInput, { label: "Image Upload", onChange: loadImage, accept: "image/*", "data-test-id": "image-modal-file-upload" })), /* @__PURE__ */ React.createElement("div", { className: "mb-4" }, /* @__PURE__ */ React.createElement(
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
      className: "mb-4 w-72",
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
  ), /* @__PURE__ */ React.createElement("label", { htmlFor: "caption", className: "text-sm font-medium text-foreground cursor-pointer" }, "Show Caption")), /* @__PURE__ */ React.createElement(DialogActions, null, /* @__PURE__ */ React.createElement(Button, { "data-test-id": "image-modal-file-upload-btn", disabled: isDisabled, onClick: () => handleOnClick() }, "Confirm")));
}
function InlineImagePlugin() {
  const [editor] = useLexicalComposerContext2();
  useEffect2(() => {
    if (!editor.hasNodes([InlineImageNode])) {
      throw new Error("ImagesPlugin: ImageNode not registered on editor");
    }
    return mergeRegister(
      editor.registerCommand(
        INSERT_INLINE_IMAGE_COMMAND,
        (payload) => {
          const imageNode = $createInlineImageNode(payload);
          $insertNodes2([imageNode]);
          if ($isRootOrShadowRoot2(imageNode.getParentOrThrow())) {
            $wrapNodeInElement2(imageNode, $createParagraphNode2).selectEnd();
          }
          return true;
        },
        COMMAND_PRIORITY_EDITOR2
      ),
      editor.registerCommand(
        DRAGSTART_COMMAND,
        (event) => {
          return $onDragStart(event);
        },
        COMMAND_PRIORITY_HIGH
      ),
      editor.registerCommand(
        DRAGOVER_COMMAND,
        (event) => {
          return $onDragover(event);
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        DROP_COMMAND,
        (event) => {
          return $onDrop(event, editor);
        },
        COMMAND_PRIORITY_HIGH
      )
    );
  }, [editor]);
  return null;
}
var TRANSPARENT_IMAGE = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
var img = null;
if (typeof document !== "undefined") {
  img = document.createElement("img");
  img.src = TRANSPARENT_IMAGE;
}
function $onDragStart(event) {
  const node = $getImageNodeInSelection();
  if (!node) {
    return false;
  }
  const dataTransfer = event.dataTransfer;
  if (!dataTransfer) {
    return false;
  }
  dataTransfer.setData("text/plain", "_");
  if (img) {
    dataTransfer.setDragImage(img, 0, 0);
  }
  dataTransfer.setData(
    "application/x-lexical-drag",
    JSON.stringify({
      data: {
        altText: node.__altText,
        caption: node.__caption,
        height: node.__height,
        key: node.getKey(),
        showCaption: node.__showCaption,
        src: node.__src,
        width: node.__width
      },
      type: "image"
    })
  );
  return true;
}
function $onDragover(event) {
  const node = $getImageNodeInSelection();
  if (!node) {
    return false;
  }
  if (!canDropImage(event)) {
    event.preventDefault();
  }
  return true;
}
function $onDrop(event, editor) {
  const node = $getImageNodeInSelection();
  if (!node) {
    return false;
  }
  const data = getDragImageData(event);
  if (!data) {
    return false;
  }
  event.preventDefault();
  if (canDropImage(event)) {
    const range = getDragSelection(event);
    node.remove();
    const rangeSelection = $createRangeSelection();
    if (range !== null && range !== void 0) {
      rangeSelection.applyDOMRange(range);
    }
    $setSelection(rangeSelection);
    editor.dispatchCommand(INSERT_INLINE_IMAGE_COMMAND, data);
  }
  return true;
}
function $getImageNodeInSelection() {
  const selection = $getSelection();
  if (!$isNodeSelection(selection)) {
    return null;
  }
  const nodes = selection.getNodes();
  const node = nodes[0];
  return $isInlineImageNode(node) ? node : null;
}
function getDragImageData(event) {
  var _a;
  const dragData = (_a = event.dataTransfer) == null ? void 0 : _a.getData("application/x-lexical-drag");
  if (!dragData) {
    return null;
  }
  const { type, data } = JSON.parse(dragData);
  if (type !== "image") {
    return null;
  }
  return data;
}
function canDropImage(event) {
  const target = event.target;
  return !!(isHTMLElement2(target) && !target.closest("code, span.editor-image") && isHTMLElement2(target.parentElement) && target.parentElement.closest("div.ContentEditable__root"));
}
function getDragSelection(event) {
  let range;
  const domSelection = getDOMSelectionFromTarget(event.target);
  if (document.caretRangeFromPoint) {
    range = document.caretRangeFromPoint(event.clientX, event.clientY);
  } else if (event.rangeParent && domSelection !== null) {
    domSelection.collapse(event.rangeParent, event.rangeOffset || 0);
    range = domSelection.getRangeAt(0);
  } else {
    throw Error("Cannot get the selection when dragging");
  }
  return range;
}

// src/components/editor/plugins/EquationsPlugin/index.tsx
init_react_shim();
import "katex/dist/katex.css";
import { useLexicalComposerContext as useLexicalComposerContext4 } from "@lexical/react/LexicalComposerContext";
import { $wrapNodeInElement as $wrapNodeInElement3 } from "@lexical/utils";
import {
  $createParagraphNode as $createParagraphNode3,
  $insertNodes as $insertNodes3,
  $isRootOrShadowRoot as $isRootOrShadowRoot3,
  COMMAND_PRIORITY_EDITOR as COMMAND_PRIORITY_EDITOR3,
  createCommand as createCommand3
} from "lexical";
import { useCallback as useCallback2, useEffect as useEffect3 } from "react";
import * as React5 from "react";

// src/components/ui/equation/KatexEquationAlterer.tsx
init_react_shim();
import { useLexicalComposerContext as useLexicalComposerContext3 } from "@lexical/react/LexicalComposerContext";
import * as React4 from "react";
import { useCallback, useState as useState2 } from "react";
import { ErrorBoundary } from "react-error-boundary";
function KatexEquationAlterer({
  onConfirm,
  initialEquation = ""
}) {
  const [editor] = useLexicalComposerContext3();
  const [equation, setEquation] = useState2(initialEquation);
  const [inline, setInline] = useState2(true);
  const onClick = useCallback(() => {
    onConfirm(equation, inline);
  }, [onConfirm, equation, inline]);
  const onCheckboxChange = useCallback(() => {
    setInline(!inline);
  }, [setInline, inline]);
  return /* @__PURE__ */ React4.createElement(React4.Fragment, null, /* @__PURE__ */ React4.createElement("div", { className: "KatexEquationAlterer_defaultRow" }, "Inline", /* @__PURE__ */ React4.createElement("input", { type: "checkbox", checked: inline, onChange: onCheckboxChange })), /* @__PURE__ */ React4.createElement("div", { className: "KatexEquationAlterer_defaultRow" }, "Equation "), /* @__PURE__ */ React4.createElement("div", { className: "KatexEquationAlterer_centerRow" }, inline ? /* @__PURE__ */ React4.createElement(
    "input",
    {
      onChange: (event) => {
        setEquation(event.target.value);
      },
      value: equation,
      className: "KatexEquationAlterer_textArea"
    }
  ) : /* @__PURE__ */ React4.createElement(
    "textarea",
    {
      onChange: (event) => {
        setEquation(event.target.value);
      },
      value: equation,
      className: "KatexEquationAlterer_textArea"
    }
  )), /* @__PURE__ */ React4.createElement("div", { className: "KatexEquationAlterer_defaultRow" }, "Visualization "), /* @__PURE__ */ React4.createElement("div", { className: "KatexEquationAlterer_centerRow" }, /* @__PURE__ */ React4.createElement(ErrorBoundary, { onError: (e) => editor._onError(e), fallback: null }, /* @__PURE__ */ React4.createElement(
    KatexRenderer,
    {
      equation,
      inline: false,
      onDoubleClick: () => null
    }
  ))), /* @__PURE__ */ React4.createElement("div", { className: "KatexEquationAlterer_dialogActions" }, /* @__PURE__ */ React4.createElement(Button, { onClick }, "Confirm")));
}

// src/components/editor/plugins/EquationsPlugin/index.tsx
var INSERT_EQUATION_COMMAND = createCommand3("INSERT_EQUATION_COMMAND");
function InsertEquationDialog({
  activeEditor,
  onClose
}) {
  const onEquationConfirm = useCallback2(
    (equation, inline) => {
      activeEditor.dispatchCommand(INSERT_EQUATION_COMMAND, { equation, inline });
      onClose();
    },
    [activeEditor, onClose]
  );
  return /* @__PURE__ */ React5.createElement(KatexEquationAlterer, { onConfirm: onEquationConfirm });
}
function EquationsPlugin() {
  const [editor] = useLexicalComposerContext4();
  useEffect3(() => {
    if (!editor.hasNodes([EquationNode])) {
      throw new Error(
        "EquationsPlugins: EquationsNode not registered on editor"
      );
    }
    return editor.registerCommand(
      INSERT_EQUATION_COMMAND,
      (payload) => {
        const { equation, inline } = payload;
        const equationNode = $createEquationNode(equation, inline);
        $insertNodes3([equationNode]);
        if ($isRootOrShadowRoot3(equationNode.getParentOrThrow())) {
          $wrapNodeInElement3(equationNode, $createParagraphNode3).selectEnd();
        }
        return true;
      },
      COMMAND_PRIORITY_EDITOR3
    );
  }, [editor]);
  return null;
}

// src/components/editor/plugins/DynamicBlockPluggin/index.tsx
init_react_shim();
import { useLexicalComposerContext as useLexicalComposerContext5 } from "@lexical/react/LexicalComposerContext";
import { $insertNodeToNearestRoot } from "@lexical/utils";
import { COMMAND_PRIORITY_EDITOR as COMMAND_PRIORITY_EDITOR4, createCommand as createCommand4 } from "lexical";
import { useEffect as useEffect4 } from "react";
var INSERT_DYNAMIC_BLOCK_COMMAND = createCommand4("INSERT_DYNAMIC_BLOCK_COMMAND");
function DynamicBlockPlugin() {
  const [editor] = useLexicalComposerContext5();
  useEffect4(() => {
    if (!editor.hasNodes([DynamicBlockNode])) {
      throw new Error("DynamicBlockPlugin: DynamicBlockNode not registered on editor");
    }
    return editor.registerCommand(
      INSERT_DYNAMIC_BLOCK_COMMAND,
      (payload) => {
        const dynamicBlockNode = $createDynamicBlockNode(payload);
        $insertNodeToNearestRoot(dynamicBlockNode);
        return true;
      },
      COMMAND_PRIORITY_EDITOR4
    );
  }, [editor]);
  return null;
}
var createDefaultDynamicBlock = () => ({
  id: `dynamic-block-${Date.now()}`,
  title: "Interactive Content Block",
  currentBlockId: "block-1",
  blocks: [
    {
      id: "block-1",
      type: "text",
      content: "<h3>Welcome!</h3><p>This is your first dynamic content block. Click to see the magic happen!</p>",
      animation: "fade"
    },
    {
      id: "block-2",
      type: "text",
      content: "<h3>Amazing!</h3><p>You triggered the interaction! This content appeared because you clicked. Try hovering for more surprises.</p>",
      animation: "slide"
    },
    {
      id: "block-3",
      type: "text",
      content: "<h3>Incredible!</h3><p>Hover interactions work too! You can create time-based triggers, scroll triggers, and much more.</p>",
      animation: "bounce"
    }
  ],
  triggers: [
    {
      id: "trigger-1",
      type: "click",
      condition: "",
      targetBlockId: "block-2",
      action: "replace"
    },
    {
      id: "trigger-2",
      type: "hover",
      condition: "",
      targetBlockId: "block-3",
      action: "replace"
    },
    {
      id: "trigger-3",
      type: "time",
      condition: 3,
      targetBlockId: "block-2",
      action: "replace"
    }
  ]
});

export {
  InlineImageNode,
  INSERT_STORY_BUILDER_COMMAND,
  StoryBuilderPlugin,
  InsertInlineImageDialog,
  InlineImagePlugin,
  InsertEquationDialog,
  EquationsPlugin,
  INSERT_DYNAMIC_BLOCK_COMMAND,
  DynamicBlockPlugin,
  createDefaultDynamicBlock
};
