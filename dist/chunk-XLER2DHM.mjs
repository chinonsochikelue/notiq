import {
  InlineImageNode
} from "./chunk-WJRHXI2C.mjs";
import {
  FigmaNode,
  LayoutContainerNode,
  LayoutItemNode,
  TweetNode,
  YouTubeNode
} from "./chunk-AMMKBSST.mjs";
import {
  DynamicBlockNode
} from "./chunk-5BAKY5KN.mjs";
import {
  StepperNode
} from "./chunk-6RNZQOH2.mjs";
import {
  CollapsibleContainerNode,
  CollapsibleContentNode,
  CollapsibleTitleNode
} from "./chunk-GXYD4VZM.mjs";
import {
  ImageNode
} from "./chunk-N3WN46VL.mjs";
import {
  PollNode
} from "./chunk-GZPNVR7L.mjs";
import {
  Hint
} from "./chunk-G53GLEAY.mjs";
import {
  ExcalidrawNode
} from "./chunk-KJV3FAZ7.mjs";
import {
  EquationNode
} from "./chunk-3JVFG7ER.mjs";
import {
  StoryBuilderNode
} from "./chunk-4MEDW3T6.mjs";
import {
  __spreadProps,
  __spreadValues,
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/components/editor/plugins/LinkWithMetaData/index.tsx
init_react_shim();
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  createCommand,
  ElementNode
} from "lexical";
import { $insertNodeToNearestRoot } from "@lexical/utils";
import { useEffect } from "react";
async function fetchMetadata(url) {
  var _a;
  try {
    const proxyUrl = "https://api.allorigins.win/get?url=";
    const response = await fetch(`${proxyUrl}${encodeURIComponent(url)}`);
    const data = await response.json();
    const html = data.contents;
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const getMetaTagContent = (property) => {
      const element = doc.querySelector(`meta[property="${property}"]`) || doc.querySelector(`meta[name="${property}"]`);
      return element ? element.getAttribute("content") : null;
    };
    const metadata = {
      title: ((_a = doc.querySelector("title")) == null ? void 0 : _a.textContent) || getMetaTagContent("og:title") || "No title",
      description: getMetaTagContent("og:description") || getMetaTagContent("description") || "No description",
      image: getMetaTagContent("og:image") || void 0,
      // Use a valid fallback image URL
      website: getMetaTagContent("og:site_name") || new URL(url).hostname
      // Use hostname as fallback
    };
    return metadata;
  } catch (error) {
    return {
      title: "No title",
      description: "No description",
      image: void 0,
      website: new URL(url).hostname
    };
  }
}
var LinkWithMetaDataNode = class _LinkWithMetaDataNode extends ElementNode {
  constructor(url, editor, key) {
    super(key);
    this.__metadata = null;
    this.__url = url;
    this.__editor = editor;
  }
  static clone(node) {
    return new _LinkWithMetaDataNode(node.__url, node.__editor, node.__key);
  }
  static importJSON(serializedNode) {
    const node = $createLinkNode(serializedNode.url, serializedNode.__editor);
    node.__metadata = serializedNode.metadata;
    node.__url = serializedNode.url;
    return node;
  }
  exportJSON() {
    return __spreadProps(__spreadValues({}, super.exportJSON()), {
      url: this.__url,
      metadata: this.__metadata,
      type: "link-with-metadata",
      version: 1
    });
  }
  static getType() {
    return "link-with-metadata";
  }
  // Method to update metadata
  setMetadata(metadata) {
    const writable = this.getWritable();
    writable.__metadata = metadata;
  }
  createDOM() {
    var _a, _b, _c;
    const elementDIV = document.createElement("div");
    elementDIV.className = "dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 border border-zinc-200 bg-white/90   text-zinc-950 shadow-md  w-full  cursor-pointer p-3 rounded-sm border flex flex-row items-center justify-between";
    elementDIV.setAttribute("contenteditable", "false");
    const container = document.createElement("div");
    container.className = "flex flex-row w-full max-sm:flex-col max-sm:gap-y-2 justify-between items-start gap-x-2";
    if ((_a = this.__metadata) == null ? void 0 : _a.image) {
      const leftContainer = document.createElement("div");
      leftContainer.className = "flex  w-full h-full max-w-[250px]  max-h-[100px] min-h-[100px] order-6";
      const image = document.createElement("img");
      image.src = this.__metadata.image;
      image.alt = `image for ${this.__metadata.title}`;
      image.className = "w-full h-[100px] rounded-lg object-cover";
      leftContainer.appendChild(image);
      container.appendChild(leftContainer);
    }
    const rightContainer = document.createElement("div");
    rightContainer.className = "flex flex-col flex-1 w-full flex-wrap items-start space-y-4";
    const titleLink = document.createElement("a");
    titleLink.className = "font-bold break-words hover:underline";
    titleLink.href = this.__url || "#";
    titleLink.textContent = this.__url || "No URL provided";
    titleLink.target = "_blank";
    rightContainer.appendChild(titleLink);
    const descriptionSmall = document.createElement("small");
    descriptionSmall.className = "font-[400] dark:text-gray-200 text-gray-500";
    descriptionSmall.textContent = ((_b = this.__metadata) == null ? void 0 : _b.description) || "Loading metadata...";
    rightContainer.appendChild(descriptionSmall);
    const sourceSmall = document.createElement("small");
    sourceSmall.className = "text-sm mt-4 font-[400] dark:text-gray-300 text-gray-500/50";
    sourceSmall.textContent = ((_c = this.__metadata) == null ? void 0 : _c.website) || "";
    rightContainer.appendChild(sourceSmall);
    container.appendChild(rightContainer);
    elementDIV.appendChild(container);
    if (this.__url && !this.__metadata) {
      fetchMetadata(this.__url).then((metadata) => {
        this.__editor.update(() => {
          this.setMetadata(metadata);
        });
      }).catch((error) => {
        console.error("Error fetching metadata:", error);
      });
    }
    return elementDIV;
  }
  updateDOM(prevNode, dom) {
    var _a, _b, _c, _d;
    if (this.__metadata !== prevNode.__metadata) {
      const container = dom.querySelector("div");
      const image = dom.querySelector("img");
      const titleLink = dom.querySelector("a");
      const descriptionSmall = dom.querySelector("small:nth-of-type(1)");
      const sourceSmall = dom.querySelector("small:nth-of-type(2)");
      if (titleLink && descriptionSmall && sourceSmall) {
        titleLink.href = this.__url || "#";
        titleLink.textContent = ((_a = this.__metadata) == null ? void 0 : _a.title) || this.__url || "No URL provided";
        descriptionSmall.textContent = ((_b = this.__metadata) == null ? void 0 : _b.description) || "Loading metadata...";
        sourceSmall.textContent = ((_c = this.__metadata) == null ? void 0 : _c.website) || "";
      }
      if ((_d = this.__metadata) == null ? void 0 : _d.image) {
        if (!image) {
          const leftContainer = document.createElement("div");
          leftContainer.className = "flex h-full flex-shrink-0 order-6";
          const newImage = document.createElement("img");
          newImage.src = this.__metadata.image;
          newImage.alt = "Custom Image";
          newImage.className = "w-24 min-h-24 max-[250px] h-[200px] rounded-lg object-fill";
          leftContainer.appendChild(newImage);
          container == null ? void 0 : container.insertBefore(leftContainer, container.firstChild);
        } else {
          image.src = this.__metadata.image;
        }
      } else if (image) {
        image.remove();
      }
      return true;
    }
    return false;
  }
};
function $createLinkNode(url, editor) {
  return new LinkWithMetaDataNode(url, editor);
}
var TOGGLE_LINK_COMMAND_LinkWithMetaDataNode = createCommand("toggleLink");
function LinkWithMetaDataPlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (!editor.hasNodes([LinkWithMetaDataNode])) {
      throw new Error("LinkWithMetaDataPlugin: LinkWithMetaDataNode not registered on editor");
    }
  }, [editor]);
  editor.registerCommand(
    TOGGLE_LINK_COMMAND_LinkWithMetaDataNode,
    (url) => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const linkNode = $createLinkNode(url, editor);
        $insertNodeToNearestRoot(linkNode);
      }
      return true;
    },
    COMMAND_PRIORITY_LOW
  );
  return null;
}

// src/components/editor/plugins/AutoLinkPlugin/index.tsx
init_react_shim();
import { useLexicalComposerContext as useLexicalComposerContext2 } from "@lexical/react/LexicalComposerContext";
import { useEffect as useEffect2 } from "react";
import { $getSelection as $getSelection2, $isRangeSelection as $isRangeSelection2 } from "lexical";
import { $isCodeHighlightNode } from "@lexical/code";
var URL_REGEX = new RegExp("((https?:\\/\\/(www\\.)?)|(www\\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)(?<![-.+():%])");
function LexicalAutoLinkPlugin() {
  const [editor] = useLexicalComposerContext2();
  useEffect2(() => {
    const handlePaste = (event) => {
      var _a;
      const pastedText = (_a = event.clipboardData) == null ? void 0 : _a.getData("text/plain");
      if (pastedText && URL_REGEX.test(pastedText)) {
        event.preventDefault();
        pastedText.split(" ").map((TEXT) => {
          if (URL_REGEX.test(TEXT)) {
            editor.update(() => {
              const selection = $getSelection2();
              if ($isRangeSelection2(selection)) {
                const node = selection.anchor.getNode();
                if (!$isCodeHighlightNode(node)) {
                  if (node && node.getTextContent() === TEXT) {
                    node.remove();
                  }
                  editor.dispatchCommand(TOGGLE_LINK_COMMAND_LinkWithMetaDataNode, TEXT);
                }
              }
            });
          }
        });
      }
    };
    const rootElement = editor.getRootElement();
    if (rootElement) {
      rootElement.addEventListener("paste", handlePaste);
    }
    return () => {
      if (rootElement) {
        rootElement.removeEventListener("paste", handlePaste);
      }
    };
  }, [editor]);
  return null;
}

// src/components/editor/plugins/CodeHighlightPlugin/index.ts
init_react_shim();
import { registerCodeHighlighting } from "@lexical/code";
import { useLexicalComposerContext as useLexicalComposerContext3 } from "@lexical/react/LexicalComposerContext";
import { useEffect as useEffect3 } from "react";
function CodeHighlightPlugin() {
  const [editor] = useLexicalComposerContext3();
  useEffect3(() => {
    return registerCodeHighlighting(editor);
  }, [editor]);
  return null;
}

// src/components/editor/nodes/index.ts
init_react_shim();
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { MarkNode } from "@lexical/mark";
import { OverflowNode } from "@lexical/overflow";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
var nodes = [
  HeadingNode,
  ListNode,
  ListItemNode,
  QuoteNode,
  CodeNode,
  TableNode,
  TableCellNode,
  TableRowNode,
  CodeHighlightNode,
  StepperNode,
  AutoLinkNode,
  YouTubeNode,
  Hint,
  TweetNode,
  LinkNode,
  OverflowNode,
  HorizontalRuleNode,
  MarkNode,
  ImageNode,
  PollNode,
  LayoutItemNode,
  LayoutContainerNode,
  CollapsibleContainerNode,
  CollapsibleContentNode,
  CollapsibleTitleNode,
  LinkWithMetaDataNode,
  InlineImageNode,
  ExcalidrawNode,
  FigmaNode,
  EquationNode,
  StoryBuilderNode,
  DynamicBlockNode
];
var nestedNodes = [
  HeadingNode,
  ListNode,
  ListItemNode,
  LinkNode,
  CodeHighlightNode,
  QuoteNode,
  CodeNode,
  StepperNode,
  LinkWithMetaDataNode,
  ImageNode,
  InlineImageNode,
  ExcalidrawNode,
  FigmaNode,
  EquationNode,
  StoryBuilderNode,
  DynamicBlockNode
];
var nodes_default = nodes;

export {
  LinkWithMetaDataPlugin,
  LexicalAutoLinkPlugin,
  CodeHighlightPlugin,
  nestedNodes,
  nodes_default
};
