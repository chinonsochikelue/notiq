import {
  useModal
} from "./chunk-5QSNIVIG.mjs";
import {
  $createCollapsibleContainerNode,
  $createCollapsibleContentNode,
  $createCollapsibleTitleNode,
  $isCollapsibleContainerNode,
  $isCollapsibleContentNode,
  $isCollapsibleTitleNode,
  CollapsibleContainerNode,
  CollapsibleContentNode,
  CollapsibleTitleNode
} from "./chunk-GXYD4VZM.mjs";
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
  __spreadProps,
  __spreadValues,
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/components/editor/plugins/LayoutPlugin/index.tsx
init_react_shim();
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $findMatchingParent,
  $insertNodeToNearestRoot,
  mergeRegister
} from "@lexical/utils";
import {
  $createParagraphNode,
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_LOW,
  createCommand,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_LEFT_COMMAND,
  KEY_ARROW_RIGHT_COMMAND,
  KEY_ARROW_UP_COMMAND
} from "lexical";
import { useEffect } from "react";

// src/components/editor/nodes/LayoutNode/LayoutContainerNode.ts
init_react_shim();
import { addClassNamesToElement } from "@lexical/utils";
import { ElementNode } from "lexical";
function $convertLayoutContainerElement(domNode) {
  const styleAttributes = window.getComputedStyle(domNode);
  const templateColumns = styleAttributes.getPropertyValue(
    "grid-template-columns"
  );
  if (templateColumns) {
    const node = $createLayoutContainerNode(templateColumns);
    return { node };
  }
  return null;
}
var LayoutContainerNode = class _LayoutContainerNode extends ElementNode {
  constructor(templateColumns, key) {
    super(key);
    this.__templateColumns = templateColumns;
  }
  static getType() {
    return "layout-container";
  }
  static clone(node) {
    return new _LayoutContainerNode(node.__templateColumns, node.__key);
  }
  createDOM(config) {
    const dom = document.createElement("div");
    dom.style.gridTemplateColumns = this.__templateColumns;
    if (typeof config.theme.layoutContainer === "string") {
      addClassNamesToElement(dom, config.theme.layoutContainer);
    }
    return dom;
  }
  exportDOM() {
    const element = document.createElement("div");
    element.style.gridTemplateColumns = this.__templateColumns;
    element.setAttribute("data-lexical-layout-container", "true");
    return { element };
  }
  updateDOM(prevNode, dom) {
    if (prevNode.__templateColumns !== this.__templateColumns) {
      dom.style.gridTemplateColumns = this.__templateColumns;
    }
    return false;
  }
  static importDOM() {
    return {
      div: (domNode) => {
        if (!domNode.hasAttribute("data-lexical-layout-container")) {
          return null;
        }
        return {
          conversion: $convertLayoutContainerElement,
          priority: 2
        };
      }
    };
  }
  static importJSON(json) {
    return $createLayoutContainerNode().updateFromJSON(json);
  }
  updateFromJSON(serializedNode) {
    return super.updateFromJSON(serializedNode).setTemplateColumns(serializedNode.templateColumns);
  }
  isShadowRoot() {
    return true;
  }
  canBeEmpty() {
    return false;
  }
  exportJSON() {
    return __spreadProps(__spreadValues({}, super.exportJSON()), {
      templateColumns: this.__templateColumns
    });
  }
  getTemplateColumns() {
    return this.getLatest().__templateColumns;
  }
  setTemplateColumns(templateColumns) {
    const self = this.getWritable();
    self.__templateColumns = templateColumns;
    return self;
  }
};
function $createLayoutContainerNode(templateColumns = "") {
  return new LayoutContainerNode(templateColumns);
}
function $isLayoutContainerNode(node) {
  return node instanceof LayoutContainerNode;
}

// src/components/editor/nodes/LayoutNode/LayoutItemNode.ts
init_react_shim();
import { addClassNamesToElement as addClassNamesToElement2 } from "@lexical/utils";
import { ElementNode as ElementNode2 } from "lexical";
function $convertLayoutItemElement() {
  return { node: $createLayoutItemNode() };
}
var LayoutItemNode = class _LayoutItemNode extends ElementNode2 {
  static getType() {
    return "layout-item";
  }
  static clone(node) {
    return new _LayoutItemNode(node.__key);
  }
  createDOM(config) {
    const dom = document.createElement("div");
    dom.setAttribute("data-lexical-layout-item", "true");
    if (typeof config.theme.layoutItem === "string") {
      addClassNamesToElement2(dom, config.theme.layoutItem);
    }
    return dom;
  }
  updateDOM() {
    return false;
  }
  static importDOM() {
    return {
      div: (domNode) => {
        if (!domNode.hasAttribute("data-lexical-layout-item")) {
          return null;
        }
        return {
          conversion: $convertLayoutItemElement,
          priority: 2
        };
      }
    };
  }
  static importJSON(serializedNode) {
    return $createLayoutItemNode().updateFromJSON(serializedNode);
  }
  isShadowRoot() {
    return true;
  }
};
function $createLayoutItemNode() {
  return new LayoutItemNode();
}
function $isLayoutItemNode(node) {
  return node instanceof LayoutItemNode;
}

// src/components/editor/plugins/LayoutPlugin/index.tsx
var INSERT_LAYOUT_COMMAND = createCommand();
var UPDATE_LAYOUT_COMMAND = createCommand();
function LayoutPlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (!editor.hasNodes([LayoutContainerNode, LayoutItemNode])) {
      throw new Error(
        "LayoutPlugin: LayoutContainerNode, or LayoutItemNode not registered on editor"
      );
    }
    const $onEscape = (before) => {
      var _a, _b;
      const selection = $getSelection();
      if ($isRangeSelection(selection) && selection.isCollapsed() && selection.anchor.offset === 0) {
        const container = $findMatchingParent(
          selection.anchor.getNode(),
          $isLayoutContainerNode
        );
        if ($isLayoutContainerNode(container)) {
          const parent = container.getParent();
          const child = parent && (before ? parent.getFirstChild() : parent == null ? void 0 : parent.getLastChild());
          const descendant = before ? (_a = container.getFirstDescendant()) == null ? void 0 : _a.getKey() : (_b = container.getLastDescendant()) == null ? void 0 : _b.getKey();
          if (parent !== null && child === container && selection.anchor.key === descendant) {
            if (before) {
              container.insertBefore($createParagraphNode());
            } else {
              container.insertAfter($createParagraphNode());
            }
          }
        }
      }
      return false;
    };
    const $fillLayoutItemIfEmpty = (node) => {
      if (node.isEmpty()) {
        node.append($createParagraphNode());
      }
    };
    const $removeIsolatedLayoutItem = (node) => {
      const parent = node.getParent();
      if (!$isLayoutContainerNode(parent)) {
        const children = node.getChildren();
        for (const child of children) {
          node.insertBefore(child);
        }
        node.remove();
        return true;
      }
      return false;
    };
    return mergeRegister(
      // When layout is the last child pressing down/right arrow will insert paragraph
      // below it to allow adding more content. It's similar what $insertBlockNode
      // (mainly for decorators), except it'll always be possible to continue adding
      // new content even if trailing paragraph is accidentally deleted
      editor.registerCommand(
        KEY_ARROW_DOWN_COMMAND,
        () => $onEscape(false),
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_ARROW_RIGHT_COMMAND,
        () => $onEscape(false),
        COMMAND_PRIORITY_LOW
      ),
      // When layout is the first child pressing up/left arrow will insert paragraph
      // above it to allow adding more content. It's similar what $insertBlockNode
      // (mainly for decorators), except it'll always be possible to continue adding
      // new content even if leading paragraph is accidentally deleted
      editor.registerCommand(
        KEY_ARROW_UP_COMMAND,
        () => $onEscape(true),
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_ARROW_LEFT_COMMAND,
        () => $onEscape(true),
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        INSERT_LAYOUT_COMMAND,
        (template) => {
          editor.update(() => {
            const container = $createLayoutContainerNode(template);
            const itemsCount = getItemsCountFromTemplate(template);
            for (let i = 0; i < itemsCount; i++) {
              container.append(
                $createLayoutItemNode().append($createParagraphNode())
              );
            }
            $insertNodeToNearestRoot(container);
            container.selectStart();
          });
          return true;
        },
        COMMAND_PRIORITY_EDITOR
      ),
      editor.registerCommand(
        UPDATE_LAYOUT_COMMAND,
        ({ template, nodeKey }) => {
          editor.update(() => {
            const container = $getNodeByKey(nodeKey);
            if (!$isLayoutContainerNode(container)) {
              return;
            }
            const itemsCount = getItemsCountFromTemplate(template);
            const prevItemsCount = getItemsCountFromTemplate(
              container.getTemplateColumns()
            );
            if (itemsCount > prevItemsCount) {
              for (let i = prevItemsCount; i < itemsCount; i++) {
                container.append(
                  $createLayoutItemNode().append($createParagraphNode())
                );
              }
            } else if (itemsCount < prevItemsCount) {
              for (let i = prevItemsCount - 1; i >= itemsCount; i--) {
                const layoutItem = container.getChildAtIndex(i);
                if ($isLayoutItemNode(layoutItem)) {
                  layoutItem.remove();
                }
              }
            }
            container.setTemplateColumns(template);
          });
          return true;
        },
        COMMAND_PRIORITY_EDITOR
      ),
      editor.registerNodeTransform(LayoutItemNode, (node) => {
        const isRemoved = $removeIsolatedLayoutItem(node);
        if (!isRemoved) {
          $fillLayoutItemIfEmpty(node);
        }
      }),
      editor.registerNodeTransform(LayoutContainerNode, (node) => {
        const children = node.getChildren();
        if (!children.every($isLayoutItemNode)) {
          for (const child of children) {
            node.insertBefore(child);
          }
          node.remove();
        }
      })
    );
  }, [editor]);
  return null;
}
function getItemsCountFromTemplate(template) {
  return template.trim().split(/\s+/).length;
}

// src/components/editor/plugins/CollapsiblePlugin/index.ts
init_react_shim();
import { useLexicalComposerContext as useLexicalComposerContext2 } from "@lexical/react/LexicalComposerContext";
import { $findMatchingParent as $findMatchingParent2, mergeRegister as mergeRegister2 } from "@lexical/utils";
import {
  $createParagraphNode as $createParagraphNode2,
  $getNodeByKey as $getNodeByKey2,
  $getPreviousSelection,
  $getSelection as $getSelection2,
  $isElementNode,
  $isRangeSelection as $isRangeSelection2,
  $setSelection,
  COMMAND_PRIORITY_EDITOR as COMMAND_PRIORITY_EDITOR2,
  COMMAND_PRIORITY_LOW as COMMAND_PRIORITY_LOW2,
  createCommand as createCommand2,
  DELETE_CHARACTER_COMMAND,
  INSERT_PARAGRAPH_COMMAND,
  KEY_ARROW_DOWN_COMMAND as KEY_ARROW_DOWN_COMMAND2
} from "lexical";
import { useEffect as useEffect2 } from "react";
var INSERT_COLLAPSIBLE_COMMAND = createCommand2();
var TOGGLE_COLLAPSIBLE_COMMAND = createCommand2();
function CollapsiblePlugin() {
  const [editor] = useLexicalComposerContext2();
  useEffect2(() => {
    if (!editor.hasNodes([
      CollapsibleContainerNode,
      CollapsibleTitleNode,
      CollapsibleContentNode
    ])) {
      throw new Error(
        "CollapsiblePlugin: CollapsibleContainerNode, CollapsibleTitleNode, or CollapsibleContentNode not registered on editor"
      );
    }
    return mergeRegister2(
      // Structure enforcing transformers for each node type. In case nesting structure is not
      // "Container > Title + Content" it'll unwrap nodes and convert it back
      // to regular content.
      editor.registerNodeTransform(CollapsibleContentNode, (node) => {
        const parent = node.getParent();
        if (!$isCollapsibleContainerNode(parent)) {
          const children = node.getChildren();
          for (const child of children) {
            node.insertAfter(child);
          }
          node.remove();
        }
      }),
      editor.registerNodeTransform(CollapsibleTitleNode, (node) => {
        const parent = node.getParent();
        if (!$isCollapsibleContainerNode(parent)) {
          node.replace($createParagraphNode2().append(...node.getChildren()));
        }
      }),
      editor.registerNodeTransform(CollapsibleContainerNode, (node) => {
        const children = node.getChildren();
        if (children.length !== 2 || !$isCollapsibleTitleNode(children[0]) || !$isCollapsibleContentNode(children[1])) {
          for (const child of children) {
            node.insertAfter(child);
          }
          node.remove();
        }
      }),
      // This handles the case when container is collapsed and we delete its previous sibling
      // into it, it would cause collapsed content deleted (since it's display: none, and selection
      // swallows it when deletes single char). Instead we expand container, which is although
      // not perfect, but avoids bigger problem
      editor.registerCommand(
        DELETE_CHARACTER_COMMAND,
        () => {
          const selection = $getSelection2();
          if (!$isRangeSelection2(selection) || !selection.isCollapsed() || selection.anchor.offset !== 0) {
            return false;
          }
          const anchorNode = selection.anchor.getNode();
          const topLevelElement = anchorNode.getTopLevelElement();
          if (topLevelElement === null) {
            return false;
          }
          const container = topLevelElement.getPreviousSibling();
          if (!$isCollapsibleContainerNode(container) || container.getOpen()) {
            return false;
          }
          container.setOpen(true);
          return true;
        },
        COMMAND_PRIORITY_LOW2
      ),
      // When collapsible is the last child pressing down arrow will insert paragraph
      // below it to allow adding more content. It's similar what $insertBlockNode
      // (mainly for decorators), except it'll always be possible to continue adding
      // new content even if trailing paragraph is accidentally deleted
      editor.registerCommand(
        KEY_ARROW_DOWN_COMMAND2,
        () => {
          const selection = $getSelection2();
          if (!$isRangeSelection2(selection) || !selection.isCollapsed()) {
            return false;
          }
          const container = $findMatchingParent2(
            selection.anchor.getNode(),
            $isCollapsibleContainerNode
          );
          if (container === null) {
            return false;
          }
          const parent = container.getParent();
          if (parent !== null && parent.getLastChild() === container) {
            parent.append($createParagraphNode2());
          }
          return false;
        },
        COMMAND_PRIORITY_LOW2
      ),
      // Handling CMD+Enter to toggle collapsible element collapsed state
      editor.registerCommand(
        INSERT_PARAGRAPH_COMMAND,
        () => {
          var _a;
          const windowEvent = (_a = editor._window) == null ? void 0 : _a.event;
          if (windowEvent && (windowEvent.ctrlKey || windowEvent.metaKey) && windowEvent.key === "Enter") {
            const selection = $getPreviousSelection();
            if ($isRangeSelection2(selection) && selection.isCollapsed()) {
              const parent = $findMatchingParent2(
                selection.anchor.getNode(),
                (node) => $isElementNode(node) && !node.isInline()
              );
              if ($isCollapsibleTitleNode(parent)) {
                const container = parent.getParent();
                if ($isCollapsibleContainerNode(container)) {
                  container.toggleOpen();
                  $setSelection(selection.clone());
                  return true;
                }
              }
            }
          }
          return false;
        },
        COMMAND_PRIORITY_LOW2
      ),
      editor.registerCommand(
        INSERT_COLLAPSIBLE_COMMAND,
        () => {
          editor.update(() => {
            const selection = $getSelection2();
            if (!$isRangeSelection2(selection)) {
              return;
            }
            const title = $createCollapsibleTitleNode();
            const content = $createCollapsibleContentNode().append(
              $createParagraphNode2()
            );
            const container = $createCollapsibleContainerNode().append(
              title,
              content
            );
            selection.insertNodes([container]);
            title.selectStart();
          });
          return true;
        },
        COMMAND_PRIORITY_EDITOR2
      ),
      editor.registerCommand(
        TOGGLE_COLLAPSIBLE_COMMAND,
        (key) => {
          editor.update(() => {
            const containerNode = $getNodeByKey2(key);
            if ($isCollapsibleContainerNode(containerNode)) {
              containerNode.toggleOpen();
            }
          });
          return true;
        },
        COMMAND_PRIORITY_EDITOR2
      )
    );
  }, [editor]);
  return null;
}

// src/components/editor/plugins/AutoEmbedPlugin/index.tsx
init_react_shim();
import {
  AutoEmbedOption,
  LexicalAutoEmbedPlugin,
  URL_MATCHER
} from "@lexical/react/LexicalAutoEmbedPlugin";
import { useLexicalComposerContext as useLexicalComposerContext6 } from "@lexical/react/LexicalComposerContext";
import { useMemo, useState as useState2 } from "react";
import * as React5 from "react";
import * as ReactDOM from "react-dom";

// src/components/editor/plugins/FigmaPlugin/index.tsx
init_react_shim();
import { useLexicalComposerContext as useLexicalComposerContext3 } from "@lexical/react/LexicalComposerContext";
import { $insertNodeToNearestRoot as $insertNodeToNearestRoot2 } from "@lexical/utils";
import { COMMAND_PRIORITY_EDITOR as COMMAND_PRIORITY_EDITOR3, createCommand as createCommand3 } from "lexical";
import { useEffect as useEffect3 } from "react";

// src/components/editor/nodes/FigmaNode/FigmaNode.tsx
init_react_shim();
import { BlockWithAlignableContents } from "@lexical/react/LexicalBlockWithAlignableContents";
import {
  DecoratorBlockNode
} from "@lexical/react/LexicalDecoratorBlockNode";
import * as React2 from "react";
function FigmaComponent({
  className,
  format,
  nodeKey,
  documentID
}) {
  return /* @__PURE__ */ React2.createElement(
    BlockWithAlignableContents,
    {
      className,
      format,
      nodeKey
    },
    /* @__PURE__ */ React2.createElement(
      "iframe",
      {
        width: "560",
        height: "315",
        src: `https://www.figma.com/embed?embed_host=lexical&url=        https://www.figma.com/file/${documentID}`,
        allowFullScreen: true
      }
    )
  );
}
var FigmaNode = class _FigmaNode extends DecoratorBlockNode {
  static getType() {
    return "figma";
  }
  static clone(node) {
    return new _FigmaNode(node.__id, node.__format, node.__key);
  }
  static importJSON(serializedNode) {
    return $createFigmaNode(serializedNode.documentID).updateFromJSON(
      serializedNode
    );
  }
  exportJSON() {
    return __spreadProps(__spreadValues({}, super.exportJSON()), {
      documentID: this.__id
    });
  }
  constructor(id, format, key) {
    super(format, key);
    this.__id = id;
  }
  updateDOM() {
    return false;
  }
  getId() {
    return this.__id;
  }
  getTextContent(_includeInert, _includeDirectionless) {
    return `https://www.figma.com/file/${this.__id}`;
  }
  decorate(_editor, config) {
    const embedBlockTheme = config.theme.embedBlock || {};
    const className = {
      base: embedBlockTheme.base || "",
      focus: embedBlockTheme.focus || ""
    };
    return /* @__PURE__ */ React2.createElement(
      FigmaComponent,
      {
        className,
        format: this.__format,
        nodeKey: this.getKey(),
        documentID: this.__id
      }
    );
  }
};
function $createFigmaNode(documentID) {
  return new FigmaNode(documentID);
}

// src/components/editor/plugins/FigmaPlugin/index.tsx
var INSERT_FIGMA_COMMAND = createCommand3(
  "INSERT_FIGMA_COMMAND"
);
function FigmaPlugin() {
  const [editor] = useLexicalComposerContext3();
  useEffect3(() => {
    if (!editor.hasNodes([FigmaNode])) {
      throw new Error("FigmaPlugin: FigmaNode not registered on editor");
    }
    return editor.registerCommand(
      INSERT_FIGMA_COMMAND,
      (payload) => {
        const figmaNode = $createFigmaNode(payload);
        $insertNodeToNearestRoot2(figmaNode);
        return true;
      },
      COMMAND_PRIORITY_EDITOR3
    );
  }, [editor]);
  return null;
}

// src/components/editor/plugins/YouTubePlugin/index.ts
init_react_shim();
import { useLexicalComposerContext as useLexicalComposerContext4 } from "@lexical/react/LexicalComposerContext";
import { $insertNodeToNearestRoot as $insertNodeToNearestRoot3 } from "@lexical/utils";
import { COMMAND_PRIORITY_EDITOR as COMMAND_PRIORITY_EDITOR4, createCommand as createCommand4 } from "lexical";
import { useEffect as useEffect4 } from "react";

// src/components/editor/plugins/YouTubeNode/index.tsx
init_react_shim();
import { BlockWithAlignableContents as BlockWithAlignableContents2 } from "@lexical/react/LexicalBlockWithAlignableContents";
import {
  DecoratorBlockNode as DecoratorBlockNode2
} from "@lexical/react/LexicalDecoratorBlockNode";
import * as React3 from "react";
function YouTubeComponent({
  className,
  format,
  nodeKey,
  videoID
}) {
  return /* @__PURE__ */ React3.createElement(
    BlockWithAlignableContents2,
    {
      className,
      format,
      nodeKey
    },
    /* @__PURE__ */ React3.createElement(
      "iframe",
      {
        width: "560",
        height: "315",
        style: {
          width: "100%",
          aspectRatio: "16/9",
          borderRadius: "8px",
          border: "4px solid #e6c10aff"
        },
        src: `https://www.youtube-nocookie.com/embed/${videoID}`,
        frameBorder: "0",
        allow: "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture",
        allowFullScreen: true,
        title: "YouTube video"
      }
    )
  );
}
function $convertYoutubeElement(domNode) {
  const videoID = domNode.getAttribute("data-lexical-youtube");
  if (videoID) {
    const node = $createYouTubeNode(videoID);
    return { node };
  }
  return null;
}
var YouTubeNode = class _YouTubeNode extends DecoratorBlockNode2 {
  static getType() {
    return "youtube";
  }
  static clone(node) {
    return new _YouTubeNode(node.__id, node.__format, node.__key);
  }
  static importJSON(serializedNode) {
    return $createYouTubeNode(serializedNode.videoID).updateFromJSON(
      serializedNode
    );
  }
  exportJSON() {
    return __spreadProps(__spreadValues({}, super.exportJSON()), {
      videoID: this.__id
    });
  }
  constructor(id, format, key) {
    super(format, key);
    this.__id = id;
  }
  exportDOM() {
    const element = document.createElement("iframe");
    element.setAttribute("data-lexical-youtube", this.__id);
    element.setAttribute("width", "560");
    element.setAttribute("height", "315");
    element.setAttribute(
      "src",
      `https://www.youtube-nocookie.com/embed/${this.__id}`
    );
    element.setAttribute("frameborder", "0");
    element.setAttribute(
      "allow",
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    );
    element.setAttribute("allowfullscreen", "true");
    element.setAttribute("title", "YouTube video");
    return { element };
  }
  static importDOM() {
    return {
      iframe: (domNode) => {
        if (!domNode.hasAttribute("data-lexical-youtube")) {
          return null;
        }
        return {
          conversion: $convertYoutubeElement,
          priority: 1
        };
      }
    };
  }
  updateDOM() {
    return false;
  }
  getId() {
    return this.__id;
  }
  getTextContent() {
    return `https://www.youtube.com/watch?v=${this.__id}`;
  }
  decorate(_editor, config) {
    const embedBlockTheme = config.theme.embedBlock || {};
    const className = {
      base: embedBlockTheme.base || "",
      focus: embedBlockTheme.focus || ""
    };
    return /* @__PURE__ */ React3.createElement(
      YouTubeComponent,
      {
        className,
        format: this.__format,
        nodeKey: this.getKey(),
        videoID: this.__id
      }
    );
  }
};
function $createYouTubeNode(videoID) {
  return new YouTubeNode(videoID);
}

// src/components/editor/plugins/YouTubePlugin/index.ts
var INSERT_YOUTUBE_COMMAND = createCommand4(
  "INSERT_YOUTUBE_COMMAND"
);
function YouTubePlugin() {
  const [editor] = useLexicalComposerContext4();
  useEffect4(() => {
    if (!editor.hasNodes([YouTubeNode])) {
      throw new Error("YouTubePlugin: YouTubeNode not registered on editor");
    }
    return editor.registerCommand(
      INSERT_YOUTUBE_COMMAND,
      (payload) => {
        const youTubeNode = $createYouTubeNode(payload);
        $insertNodeToNearestRoot3(youTubeNode);
        return true;
      },
      COMMAND_PRIORITY_EDITOR4
    );
  }, [editor]);
  return null;
}

// src/components/editor/plugins/TwitterPlugin/index.ts
init_react_shim();
import { useLexicalComposerContext as useLexicalComposerContext5 } from "@lexical/react/LexicalComposerContext";
import { $insertNodeToNearestRoot as $insertNodeToNearestRoot4 } from "@lexical/utils";
import { COMMAND_PRIORITY_EDITOR as COMMAND_PRIORITY_EDITOR5, createCommand as createCommand5 } from "lexical";
import { useEffect as useEffect6 } from "react";

// src/components/editor/nodes/TweetNode/index.tsx
init_react_shim();
import { BlockWithAlignableContents as BlockWithAlignableContents3 } from "@lexical/react/LexicalBlockWithAlignableContents";
import {
  DecoratorBlockNode as DecoratorBlockNode3
} from "@lexical/react/LexicalDecoratorBlockNode";
import * as React4 from "react";
import { useCallback, useEffect as useEffect5, useRef, useState } from "react";
var WIDGET_SCRIPT_URL = "https://platform.twitter.com/widgets.js";
function $convertTweetElement(domNode) {
  const id = domNode.getAttribute("data-lexical-tweet-id");
  if (id) {
    const node = $createTweetNode(id);
    return { node };
  }
  return null;
}
var isTwitterScriptLoading = true;
function TweetComponent({
  className,
  format,
  nodeKey,
  onError,
  onLoad,
  tweetID
}) {
  const containerRef = useRef(null);
  const previousTweetIDRef = useRef("");
  const [isTweetLoading, setIsTweetLoading] = useState(false);
  const createTweet = useCallback(async () => {
    try {
      await window.twttr.widgets.createTweet(tweetID, containerRef.current);
      setIsTweetLoading(false);
      isTwitterScriptLoading = false;
      if (onLoad) {
        onLoad();
      }
    } catch (error) {
      if (onError) {
        onError(String(error));
      }
    }
  }, [onError, onLoad, tweetID]);
  useEffect5(() => {
    var _a;
    if (tweetID !== previousTweetIDRef.current) {
      setIsTweetLoading(true);
      if (isTwitterScriptLoading) {
        const script = document.createElement("script");
        script.src = WIDGET_SCRIPT_URL;
        script.async = true;
        (_a = document.body) == null ? void 0 : _a.appendChild(script);
        script.onload = createTweet;
        if (onError) {
          script.onerror = onError;
        }
      } else {
        createTweet();
      }
      if (previousTweetIDRef) {
        previousTweetIDRef.current = tweetID;
      }
    }
  }, [createTweet, onError, tweetID]);
  return /* @__PURE__ */ React4.createElement(
    BlockWithAlignableContents3,
    {
      className,
      format,
      nodeKey
    },
    isTweetLoading ? /* @__PURE__ */ React4.createElement(Skeleton, { className: "max-h-[200px] w-full h-full max-w-[400px]" }) : null,
    /* @__PURE__ */ React4.createElement(
      "div",
      {
        style: {
          display: "inline-block",
          width: "100%"
        },
        ref: containerRef
      }
    )
  );
}
var TweetNode = class _TweetNode extends DecoratorBlockNode3 {
  static getType() {
    return "tweet";
  }
  static clone(node) {
    return new _TweetNode(node.__id, node.__format, node.__key);
  }
  static importJSON(serializedNode) {
    return $createTweetNode(serializedNode.id).updateFromJSON(serializedNode);
  }
  exportJSON() {
    return __spreadProps(__spreadValues({}, super.exportJSON()), {
      id: this.getId()
    });
  }
  static importDOM() {
    return {
      div: (domNode) => {
        if (!domNode.hasAttribute("data-lexical-tweet-id")) {
          return null;
        }
        return {
          conversion: $convertTweetElement,
          priority: 2
        };
      }
    };
  }
  exportDOM() {
    const element = document.createElement("div");
    element.setAttribute("data-lexical-tweet-id", this.__id);
    const text = document.createTextNode(this.getTextContent());
    element.append(text);
    return { element };
  }
  constructor(id, format, key) {
    super(format, key);
    this.__id = id;
  }
  getId() {
    return this.__id;
  }
  getTextContent() {
    return `https://x.com/i/web/status/${this.__id}`;
  }
  decorate(editor, config) {
    const embedBlockTheme = config.theme.embedBlock || {};
    const className = {
      base: embedBlockTheme.base || "",
      focus: embedBlockTheme.focus || ""
    };
    return /* @__PURE__ */ React4.createElement(
      TweetComponent,
      {
        className,
        format: this.__format,
        loadingComponent: "Loading...",
        nodeKey: this.getKey(),
        tweetID: this.__id
      }
    );
  }
};
function $createTweetNode(tweetID) {
  return new TweetNode(tweetID);
}

// src/components/editor/plugins/TwitterPlugin/index.ts
var INSERT_TWEET_COMMAND = createCommand5(
  "INSERT_TWEET_COMMAND"
);
function TwitterPlugin() {
  const [editor] = useLexicalComposerContext5();
  useEffect6(() => {
    if (!editor.hasNodes([TweetNode])) {
      throw new Error("TwitterPlugin: TweetNode not registered on editor");
    }
    return editor.registerCommand(
      INSERT_TWEET_COMMAND,
      (payload) => {
        const tweetNode = $createTweetNode(payload);
        $insertNodeToNearestRoot4(tweetNode);
        return true;
      },
      COMMAND_PRIORITY_EDITOR5
    );
  }, [editor]);
  return null;
}

// src/components/editor/plugins/AutoEmbedPlugin/index.tsx
import { Twitter, Youtube, Figma } from "lucide-react";
var YoutubeEmbedConfig = {
  contentName: "Youtube Video",
  exampleUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
  // Icon for display.
  icon: /* @__PURE__ */ React5.createElement(Youtube, { className: "h-4 w-4" }),
  insertNode: (editor, result) => {
    editor.dispatchCommand(INSERT_YOUTUBE_COMMAND, result.id);
  },
  keywords: ["youtube", "video"],
  // Determine if a given URL is a match and return url data.
  parseUrl: async (url) => {
    const match = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/.exec(url);
    const id = match ? (match == null ? void 0 : match[2].length) === 11 ? match[2] : null : null;
    if (id != null) {
      return {
        id,
        url
      };
    }
    return null;
  },
  type: "youtube-video"
};
var TwitterEmbedConfig = {
  // e.g. Tweet or Google Map.
  contentName: "Tweet",
  exampleUrl: "https://twitter.com/jack/status/20",
  // Icon for display.
  icon: /* @__PURE__ */ React5.createElement(Twitter, { className: "h-4 w-4" }),
  // Create the Lexical embed node from the url data.
  insertNode: (editor, result) => {
    editor.dispatchCommand(INSERT_TWEET_COMMAND, result.id);
  },
  // For extra searching.
  keywords: ["tweet", "twitter"],
  // Determine if a given URL is a match and return url data.
  parseUrl: (text) => {
    const match = /^https:\/\/(twitter|x)\.com\/(#!\/)?(\w+)\/status(es)*\/(\d+)/.exec(
      text
    );
    if (match != null) {
      return {
        id: match[5],
        url: match[1]
      };
    }
    return null;
  },
  type: "tweet"
};
var FigmaEmbedConfig = {
  contentName: "Figma Document",
  exampleUrl: "https://www.figma.com/file/LKQ4FJ4bTnCSjedbRpk931/Sample-File",
  icon: /* @__PURE__ */ React5.createElement(Figma, { className: "h-4 w-4" }),
  insertNode: (editor, result) => {
    editor.dispatchCommand(INSERT_FIGMA_COMMAND, result.id);
  },
  keywords: ["figma", "figma.com", "mock-up"],
  // Determine if a given URL is a match and return url data.
  parseUrl: (text) => {
    const match = /https:\/\/([\w.-]+\.)?figma.com\/(file|proto)\/([0-9a-zA-Z]{22,128})(?:\/.*)?$/.exec(
      text
    );
    if (match != null) {
      return {
        id: match[3],
        url: match[0]
      };
    }
    return null;
  },
  type: "figma"
};
var EmbedConfigs = [
  TwitterEmbedConfig,
  YoutubeEmbedConfig,
  FigmaEmbedConfig
];
function AutoEmbedMenuItem({
  index,
  isSelected,
  onClick,
  onMouseEnter,
  option
}) {
  let className = "item";
  if (isSelected) {
    className += " selected";
  }
  return /* @__PURE__ */ React5.createElement(
    "li",
    {
      key: option.key,
      tabIndex: -1,
      className,
      ref: option.setRefElement,
      role: "option",
      "aria-selected": isSelected,
      id: "typeahead-item-" + index,
      onMouseEnter,
      onClick
    },
    /* @__PURE__ */ React5.createElement("span", { className: "text" }, option.title)
  );
}
function AutoEmbedMenu({
  options,
  selectedItemIndex,
  onOptionClick,
  onOptionMouseEnter
}) {
  return /* @__PURE__ */ React5.createElement("div", { className: "typeahead-popover" }, /* @__PURE__ */ React5.createElement("ul", null, options.map((option, i) => /* @__PURE__ */ React5.createElement(
    AutoEmbedMenuItem,
    {
      index: i,
      isSelected: selectedItemIndex === i,
      onClick: () => onOptionClick(option, i),
      onMouseEnter: () => onOptionMouseEnter(i),
      key: option.key,
      option
    }
  ))));
}
var debounce = (callback, delay) => {
  let timeoutId;
  return (text) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      callback(text);
    }, delay);
  };
};
function AutoEmbedDialog({
  embedConfig,
  onClose
}) {
  const [text, setText] = useState2("");
  const [editor] = useLexicalComposerContext6();
  const [embedResult, setEmbedResult] = useState2(null);
  const validateText = useMemo(
    () => debounce((inputText) => {
      const urlMatch = URL_MATCHER.exec(inputText);
      if (embedConfig != null && inputText != null && urlMatch != null) {
        Promise.resolve(embedConfig.parseUrl(inputText)).then(
          (parseResult) => {
            setEmbedResult(parseResult);
          }
        );
      } else if (embedResult != null) {
        setEmbedResult(null);
      }
    }, 200),
    [embedConfig, embedResult]
  );
  const onClick = () => {
    if (embedResult != null) {
      embedConfig.insertNode(editor, embedResult);
      onClose();
    }
  };
  return /* @__PURE__ */ React5.createElement("div", { className: "flex items-center justify-center flex-col space-y-3" }, /* @__PURE__ */ React5.createElement("div", null, /* @__PURE__ */ React5.createElement(
    Input,
    {
      type: "text",
      className: "Input__input",
      placeholder: embedConfig.exampleUrl,
      value: text,
      "data-test-id": `${embedConfig.type}-embed-modal-url`,
      onChange: (e) => {
        const { value } = e.target;
        setText(value);
        validateText(value);
      }
    }
  )), /* @__PURE__ */ React5.createElement(
    Button,
    {
      disabled: !embedResult,
      onClick,
      "data-test-id": `${embedConfig.type}-embed-modal-submit-btn`
    },
    "Embed"
  ));
}
function AutoEmbedPlugin() {
  const [modal, showModal] = useModal();
  const openEmbedModal = (embedConfig) => {
    showModal(`Embed ${embedConfig.contentName}`, "type the url", (onClose) => /* @__PURE__ */ React5.createElement(AutoEmbedDialog, { embedConfig, onClose }));
  };
  const getMenuOptions = (activeEmbedConfig, embedFn, dismissFn) => {
    return [
      new AutoEmbedOption("Dismiss", {
        onSelect: dismissFn
      }),
      new AutoEmbedOption(`Embed ${activeEmbedConfig.contentName}`, {
        onSelect: embedFn
      })
    ];
  };
  return /* @__PURE__ */ React5.createElement(React5.Fragment, null, modal, /* @__PURE__ */ React5.createElement(
    LexicalAutoEmbedPlugin,
    {
      embedConfigs: EmbedConfigs,
      onOpenEmbedModalForConfig: openEmbedModal,
      getMenuOptions,
      menuRenderFn: (anchorElementRef, { selectedIndex, options, selectOptionAndCleanUp, setHighlightedIndex }) => anchorElementRef.current ? ReactDOM.createPortal(
        /* @__PURE__ */ React5.createElement(
          "div",
          {
            className: "typeahead-popover flex items-center auto-embed-menu",
            style: {
              marginLeft: `${Math.max(
                parseFloat(anchorElementRef.current.style.width) - 200,
                0
              )}px`,
              width: 200
            }
          },
          /* @__PURE__ */ React5.createElement(
            AutoEmbedMenu,
            {
              options,
              selectedItemIndex: selectedIndex,
              onOptionClick: (option, index) => {
                setHighlightedIndex(index);
                selectOptionAndCleanUp(option);
              },
              onOptionMouseEnter: (index) => {
                setHighlightedIndex(index);
              }
            }
          )
        ),
        anchorElementRef.current
      ) : null
    }
  ));
}

export {
  LayoutContainerNode,
  LayoutItemNode,
  INSERT_LAYOUT_COMMAND,
  LayoutPlugin,
  INSERT_COLLAPSIBLE_COMMAND,
  CollapsiblePlugin,
  TweetNode,
  TwitterPlugin,
  FigmaNode,
  FigmaPlugin,
  YouTubeNode,
  YouTubePlugin,
  YoutubeEmbedConfig,
  TwitterEmbedConfig,
  FigmaEmbedConfig,
  AutoEmbedDialog,
  AutoEmbedPlugin
};
