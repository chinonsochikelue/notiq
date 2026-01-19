"use client";
import {
  DynamicBlockNode
} from "./chunk-5BAKY5KN.mjs";
import {
  Badge
} from "./chunk-FSM26655.mjs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "./chunk-3G37YKTV.mjs";
import {
  Button
} from "./chunk-BIU7WTLX.mjs";
import {
  cn
} from "./chunk-YHPNOWFH.mjs";
import {
  React,
  __spreadValues,
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/components/editor/nodes/DynamicBlockNode/DynamicBlockComponent.tsx
init_react_shim();
import { useState, useEffect, useRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNodeByKey } from "lexical";
import { Play, Pause, Settings, Eye, EyeOff, Zap } from "lucide-react";
function DynamicBlockComponent({ nodeKey, payload }) {
  var _a;
  const [editor] = useLexicalComposerContext();
  const [currentBlockId, setCurrentBlockId] = useState(payload.currentBlockId || ((_a = payload.blocks[0]) == null ? void 0 : _a.id));
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const containerRef = useRef(null);
  const timeoutRef = useRef(void 0);
  const currentBlock = payload.blocks.find((block) => block.id === currentBlockId);
  const activeTriggers = payload.triggers.filter(
    (trigger) => trigger.targetBlockId === currentBlockId || payload.blocks.some((block) => block.id === trigger.targetBlockId)
  );
  const executeTrigger = (trigger) => {
    const targetBlock = payload.blocks.find((block) => block.id === trigger.targetBlockId);
    if (!targetBlock) return;
    switch (trigger.action) {
      case "show":
      case "replace":
        setCurrentBlockId(trigger.targetBlockId);
        break;
      case "hide":
        setCurrentBlockId("");
        break;
      case "animate":
        setCurrentBlockId("");
        setTimeout(() => setCurrentBlockId(trigger.targetBlockId), 100);
        break;
    }
  };
  useEffect(() => {
    if (!isPreviewMode || !containerRef.current) return;
    const container = containerRef.current;
    const timeTriggers = activeTriggers.filter((t) => t.type === "time");
    const clickTriggers = activeTriggers.filter((t) => t.type === "click");
    const hoverTriggers = activeTriggers.filter((t) => t.type === "hover");
    if (isPlaying && timeTriggers.length > 0) {
      timeTriggers.forEach((trigger) => {
        const delay = typeof trigger.condition === "number" ? trigger.condition * 1e3 : 3e3;
        timeoutRef.current = setTimeout(() => executeTrigger(trigger), delay);
      });
    }
    const handleClick = () => {
      clickTriggers.forEach(executeTrigger);
    };
    const handleMouseEnter = () => {
      hoverTriggers.forEach(executeTrigger);
    };
    container.addEventListener("click", handleClick);
    container.addEventListener("mouseenter", handleMouseEnter);
    return () => {
      container.removeEventListener("click", handleClick);
      container.removeEventListener("mouseenter", handleMouseEnter);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isPreviewMode, isPlaying, activeTriggers, currentBlockId]);
  const updatePayload = (newPayload) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isDynamicBlockNode(node)) {
        node.updatePayload(__spreadValues(__spreadValues({}, payload), newPayload));
      }
    });
  };
  const renderContentBlock = (block) => {
    const animationClass = block.animation && block.animation !== "none" ? `animate-${block.animation === "fade" ? "fade-in" : block.animation === "slide" ? "slide-in-right" : "bounce-in"}` : "";
    switch (block.type) {
      case "text":
        return /* @__PURE__ */ React.createElement(
          "div",
          {
            className: cn("prose prose-sm max-w-none", animationClass),
            style: block.styles,
            dangerouslySetInnerHTML: { __html: block.content }
          }
        );
      case "image":
        return /* @__PURE__ */ React.createElement(
          "img",
          {
            src: block.content || "/placeholder.svg",
            alt: "Dynamic content",
            className: cn("max-w-full h-auto rounded-lg", animationClass),
            style: block.styles
          }
        );
      case "video":
        return /* @__PURE__ */ React.createElement(
          "video",
          {
            src: block.content,
            controls: true,
            className: cn("max-w-full h-auto rounded-lg", animationClass),
            style: block.styles
          }
        );
      case "html":
        return /* @__PURE__ */ React.createElement(
          "div",
          {
            className: cn("w-full", animationClass),
            style: block.styles,
            dangerouslySetInnerHTML: { __html: block.content }
          }
        );
      default:
        return /* @__PURE__ */ React.createElement("div", { className: "text-muted-foreground" }, "Unknown content type");
    }
  };
  return /* @__PURE__ */ React.createElement(Card, { className: "w-full my-4 border-2 border-dashed border-accent/30 bg-gradient-to-br from-background to-accent/5" }, /* @__PURE__ */ React.createElement(CardHeader, { className: "pb-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(Zap, { className: "w-5 h-5 text-accent" }), /* @__PURE__ */ React.createElement(CardTitle, { className: "text-lg font-semibold" }, payload.title), /* @__PURE__ */ React.createElement(Badge, { variant: "secondary", className: "text-xs" }, "Dynamic Block")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(Button, { variant: "ghost", size: "sm", onClick: () => setIsPreviewMode(!isPreviewMode), className: "h-8 px-2" }, isPreviewMode ? /* @__PURE__ */ React.createElement(EyeOff, { className: "w-4 h-4" }) : /* @__PURE__ */ React.createElement(Eye, { className: "w-4 h-4" }), isPreviewMode ? "Edit" : "Preview"), isPreviewMode && /* @__PURE__ */ React.createElement(Button, { variant: "ghost", size: "sm", onClick: () => setIsPlaying(!isPlaying), className: "h-8 px-2" }, isPlaying ? /* @__PURE__ */ React.createElement(Pause, { className: "w-4 h-4" }) : /* @__PURE__ */ React.createElement(Play, { className: "w-4 h-4" })), /* @__PURE__ */ React.createElement(Button, { variant: "ghost", size: "sm", onClick: () => setShowSettings(!showSettings), className: "h-8 px-2" }, /* @__PURE__ */ React.createElement(Settings, { className: "w-4 h-4" }))))), /* @__PURE__ */ React.createElement(CardContent, { ref: containerRef, className: "space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "min-h-[200px] p-4 rounded-lg border bg-card/50 relative overflow-hidden" }, currentBlock ? /* @__PURE__ */ React.createElement("div", { className: "transition-all duration-300 ease-in-out" }, renderContentBlock(currentBlock)) : /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-center h-full text-muted-foreground" }, /* @__PURE__ */ React.createElement("div", { className: "text-center" }, /* @__PURE__ */ React.createElement(Zap, { className: "w-12 h-12 mx-auto mb-2 opacity-50" }), /* @__PURE__ */ React.createElement("p", null, "No content block selected"), /* @__PURE__ */ React.createElement("p", { className: "text-sm" }, "Configure blocks and triggers below")))), !isPreviewMode && /* @__PURE__ */ React.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("h4", { className: "font-medium text-sm" }, "Content Blocks (", payload.blocks.length, ")"), /* @__PURE__ */ React.createElement(Button, { size: "sm", variant: "outline", className: "h-7 text-xs bg-transparent" }, "Add Block")), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-2" }, payload.blocks.map((block) => /* @__PURE__ */ React.createElement(
    Button,
    {
      key: block.id,
      variant: currentBlockId === block.id ? "default" : "outline",
      size: "sm",
      onClick: () => setCurrentBlockId(block.id),
      className: "h-auto p-2 flex flex-col items-start text-left"
    },
    /* @__PURE__ */ React.createElement("div", { className: "font-medium text-xs capitalize" }, block.type),
    /* @__PURE__ */ React.createElement("div", { className: "text-xs text-muted-foreground truncate w-full" }, block.content.substring(0, 30), "...")
  )))), !isPreviewMode && activeTriggers.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ React.createElement("h4", { className: "font-medium text-sm" }, "Active Triggers (", activeTriggers.length, ")"), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-2" }, activeTriggers.map((trigger) => /* @__PURE__ */ React.createElement(Badge, { key: trigger.id, variant: "outline", className: "text-xs" }, trigger.type, ": ", trigger.action, trigger.type === "time" && ` (${trigger.condition}s)`)))), isPreviewMode && /* @__PURE__ */ React.createElement("div", { className: "text-center p-3 bg-accent/10 rounded-lg border border-accent/20" }, /* @__PURE__ */ React.createElement("p", { className: "text-sm text-accent font-medium" }, "Preview Mode Active"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted-foreground mt-1" }, activeTriggers.some((t) => t.type === "click") && "Click to trigger interactions \u2022 ", activeTriggers.some((t) => t.type === "hover") && "Hover to trigger interactions \u2022 ", activeTriggers.some((t) => t.type === "time") && "Press play for time-based triggers"))));
}
function $isDynamicBlockNode(node) {
  return node instanceof DynamicBlockNode;
}
export {
  DynamicBlockComponent as default
};
