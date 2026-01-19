"use client";
import {
  Label,
  Tabs,
  TabsList,
  TabsTrigger
} from "./chunk-3CPBODXA.mjs";
import {
  $isStoryBuilderNode
} from "./chunk-4MEDW3T6.mjs";
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
  Input
} from "./chunk-POGRR73N.mjs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "./chunk-WDG7J2DY.mjs";
import {
  Button
} from "./chunk-BIU7WTLX.mjs";
import {
  cn
} from "./chunk-YHPNOWFH.mjs";
import {
  __objRest,
  __spreadProps,
  __spreadValues,
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/components/editor/nodes/StoryBuilderNode/StoryBuilderComponent.tsx
init_react_shim();
import React2, { useState, useCallback, useRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNodeByKey } from "lexical";

// src/components/ui/textarea.tsx
init_react_shim();
import * as React from "react";
var Textarea = React.forwardRef((_a, ref) => {
  var _b = _a, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ React.createElement(
    "textarea",
    __spreadValues({
      className: cn(
        "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      ),
      ref
    }, props)
  );
});
Textarea.displayName = "Textarea";

// src/components/editor/nodes/StoryBuilderNode/StoryBuilderComponent.tsx
import {
  Plus,
  Play,
  Edit3,
  Trash2,
  ArrowRight,
  BookOpen,
  GitBranch,
  Upload,
  Settings,
  Copy,
  Save,
  Share2,
  MapPin,
  Timer,
  Users,
  Target
} from "lucide-react";
function StoryBuilderComponent({ nodes, currentNodeId, title, nodeKey }) {
  const [editor] = useLexicalComposerContext();
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewNodeId, setPreviewNodeId] = useState("");
  const [editingNode, setEditingNode] = useState(null);
  const [storyTitle, setStoryTitle] = useState(title);
  const [showAdvancedEditor, setShowAdvancedEditor] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const fileInputRef = useRef(null);
  const moodColors = {
    neutral: { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-900" },
    happy: { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-900" },
    sad: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-900" },
    mysterious: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-900" },
    exciting: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-900" },
    dark: { bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-900" }
  };
  const initializeStory = useCallback(() => {
    if (nodes.length === 0) {
      const startNode = {
        id: "start",
        title: "The Beginning",
        content: "Your epic adventure begins here. The world awaits your decisions...",
        choices: [{
          id: "choice1",
          text: "Begin the adventure",
          targetId: "node1",
          consequence: "You step into the unknown",
          icon: "\u{1F680}"
        }],
        isStart: true,
        mood: "exciting",
        estimatedReadTime: 1,
        tags: ["beginning", "adventure"]
      };
      const secondNode = {
        id: "node1",
        title: "Chapter 1: The Journey",
        content: "The adventure continues as you face your first challenge...",
        choices: [],
        isEnd: true,
        mood: "neutral",
        estimatedReadTime: 2,
        tags: ["chapter1", "challenge"]
      };
      updateStoryBuilder({
        nodes: [startNode, secondNode],
        currentNodeId: "start",
        title: storyTitle
      });
    }
  }, [nodes.length, storyTitle]);
  const updateStoryBuilder = useCallback(
    (payload) => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isStoryBuilderNode(node)) {
          node.updateStory(payload);
        }
      });
    },
    [editor, nodeKey]
  );
  const addNewNode = useCallback(() => {
    const newNodeId = `node_${Date.now()}`;
    const newNode = {
      id: newNodeId,
      title: "New Chapter",
      content: "Write your story content here...",
      choices: [],
      mood: "neutral",
      estimatedReadTime: 1,
      tags: []
    };
    updateStoryBuilder({
      nodes: [...nodes, newNode],
      currentNodeId,
      title: storyTitle
    });
  }, [nodes, currentNodeId, storyTitle, updateStoryBuilder]);
  const updateNode = useCallback(
    (nodeId, updates) => {
      const updatedNodes = nodes.map((node) => node.id === nodeId ? __spreadValues(__spreadValues({}, node), updates) : node);
      updateStoryBuilder({
        nodes: updatedNodes,
        currentNodeId,
        title: storyTitle
      });
    },
    [nodes, currentNodeId, storyTitle, updateStoryBuilder]
  );
  const deleteNode = useCallback(
    (nodeId) => {
      var _a;
      const filteredNodes = nodes.filter((node) => node.id !== nodeId);
      const cleanedNodes = filteredNodes.map((node) => __spreadProps(__spreadValues({}, node), {
        choices: node.choices.filter((choice) => choice.targetId !== nodeId)
      }));
      updateStoryBuilder({
        nodes: cleanedNodes,
        currentNodeId: currentNodeId === nodeId ? ((_a = cleanedNodes[0]) == null ? void 0 : _a.id) || "" : currentNodeId,
        title: storyTitle
      });
    },
    [nodes, currentNodeId, storyTitle, updateStoryBuilder]
  );
  const addChoice = useCallback(
    (nodeId) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;
      const newChoice = {
        id: `choice_${Date.now()}`,
        text: "New choice",
        targetId: "",
        consequence: "Something happens...",
        probabilityWeight: 1,
        icon: "\u2B50"
      };
      updateNode(nodeId, {
        choices: [...node.choices, newChoice]
      });
    },
    [nodes, updateNode]
  );
  const updateChoice = useCallback(
    (nodeId, choiceId, updates) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;
      const updatedChoices = node.choices.map((choice) => choice.id === choiceId ? __spreadValues(__spreadValues({}, choice), updates) : choice);
      updateNode(nodeId, { choices: updatedChoices });
    },
    [nodes, updateNode]
  );
  const deleteChoice = useCallback(
    (nodeId, choiceId) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;
      const filteredChoices = node.choices.filter((choice) => choice.id !== choiceId);
      updateNode(nodeId, { choices: filteredChoices });
    },
    [nodes, updateNode]
  );
  const handleImageUpload = useCallback((nodeId, file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      var _a;
      const imageData = (_a = e.target) == null ? void 0 : _a.result;
      updateNode(nodeId, { image: imageData });
    };
    reader.readAsDataURL(file);
  }, [updateNode]);
  const duplicateNode = useCallback((nodeId) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;
    const newNodeId = `node_${Date.now()}`;
    const duplicatedNode = __spreadProps(__spreadValues({}, node), {
      id: newNodeId,
      title: `${node.title} (Copy)`,
      choices: node.choices.map((choice) => __spreadProps(__spreadValues({}, choice), {
        id: `choice_${Date.now()}_${Math.random()}`
      }))
    });
    updateStoryBuilder({
      nodes: [...nodes, duplicatedNode],
      currentNodeId,
      title: storyTitle
    });
  }, [nodes, currentNodeId, storyTitle, updateStoryBuilder]);
  const exportStory = useCallback(() => {
    const storyData = {
      title: storyTitle,
      nodes,
      metadata: {
        totalNodes: nodes.length,
        totalChoices: nodes.reduce((sum, node) => sum + node.choices.length, 0),
        estimatedTotalReadTime: nodes.reduce((sum, node) => sum + (node.estimatedReadTime || 1), 0),
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    };
    const blob = new Blob([JSON.stringify(storyData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${storyTitle.replace(/\s+/g, "_")}_story.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [storyTitle, nodes]);
  React2.useEffect(() => {
    initializeStory();
  }, [initializeStory]);
  const currentPreviewNode = nodes.find((n) => n.id === previewNodeId);
  if (isPreviewMode) {
    const nodeMood = (currentPreviewNode == null ? void 0 : currentPreviewNode.mood) || "neutral";
    const moodStyle = moodColors[nodeMood];
    return /* @__PURE__ */ React2.createElement(Card, { className: "w-full max-w-5xl mx-auto my-6 shadow-2xl border-0 overflow-hidden" }, /* @__PURE__ */ React2.createElement("div", { className: cn("relative", moodStyle.bg) }, (currentPreviewNode == null ? void 0 : currentPreviewNode.image) && /* @__PURE__ */ React2.createElement("div", { className: "relative h-64 w-full" }, /* @__PURE__ */ React2.createElement(
      "img",
      {
        src: currentPreviewNode.image,
        alt: currentPreviewNode.title,
        className: "w-full h-full object-cover"
      }
    ), /* @__PURE__ */ React2.createElement("div", { className: "absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" })), /* @__PURE__ */ React2.createElement(CardHeader, { className: "relative" }, /* @__PURE__ */ React2.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React2.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React2.createElement("div", { className: "p-3 bg-white/20 backdrop-blur-sm rounded-xl" }, /* @__PURE__ */ React2.createElement(Play, { className: "w-6 h-6 text-accent" })), /* @__PURE__ */ React2.createElement("div", null, /* @__PURE__ */ React2.createElement(CardTitle, { className: "text-2xl font-bold bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent" }, storyTitle), /* @__PURE__ */ React2.createElement("p", { className: "text-sm text-muted-foreground flex items-center gap-2 mt-1" }, /* @__PURE__ */ React2.createElement(Timer, { className: "w-4 h-4" }), (currentPreviewNode == null ? void 0 : currentPreviewNode.estimatedReadTime) || 1, " min read"))), /* @__PURE__ */ React2.createElement(Button, { variant: "outline", size: "sm", onClick: () => setIsPreviewMode(false), className: "backdrop-blur-sm bg-white/20" }, /* @__PURE__ */ React2.createElement(Edit3, { className: "w-4 h-4 mr-2" }), "Edit Story")))), /* @__PURE__ */ React2.createElement(CardContent, { className: "p-8" }, currentPreviewNode ? /* @__PURE__ */ React2.createElement("div", { className: "space-y-6" }, /* @__PURE__ */ React2.createElement("div", { className: "prose prose-xl max-w-none" }, /* @__PURE__ */ React2.createElement("h2", { className: "text-3xl font-bold mb-6 text-foreground" }, currentPreviewNode.title), /* @__PURE__ */ React2.createElement("div", { className: "text-lg leading-relaxed text-muted-foreground whitespace-pre-wrap" }, currentPreviewNode.content)), currentPreviewNode.tags && currentPreviewNode.tags.length > 0 && /* @__PURE__ */ React2.createElement("div", { className: "flex flex-wrap gap-2" }, currentPreviewNode.tags.map((tag, index) => /* @__PURE__ */ React2.createElement(Badge, { key: index, variant: "secondary", className: "text-xs" }, "#", tag))), currentPreviewNode.choices.length > 0 && /* @__PURE__ */ React2.createElement("div", { className: "space-y-4 mt-8" }, /* @__PURE__ */ React2.createElement("h3", { className: "font-bold text-xl flex items-center gap-2" }, /* @__PURE__ */ React2.createElement(Target, { className: "w-5 h-5 text-accent" }), "What's your next move?"), /* @__PURE__ */ React2.createElement("div", { className: "grid gap-3" }, currentPreviewNode.choices.map((choice, index) => /* @__PURE__ */ React2.createElement(
      Button,
      {
        key: choice.id,
        variant: "outline",
        className: cn(
          "w-full justify-start text-left h-auto p-6 group transition-all duration-300",
          "hover:shadow-lg hover:scale-[1.02] hover:border-accent/50 hover:bg-accent/5",
          "border-2 border-border/30"
        ),
        onClick: () => setPreviewNodeId(choice.targetId),
        disabled: !choice.targetId
      },
      /* @__PURE__ */ React2.createElement("div", { className: "flex items-start gap-4 w-full" }, /* @__PURE__ */ React2.createElement("div", { className: "text-2xl" }, choice.icon || "\u27A4"), /* @__PURE__ */ React2.createElement("div", { className: "flex-1" }, /* @__PURE__ */ React2.createElement("div", { className: "font-semibold text-base group-hover:text-accent transition-colors" }, choice.text), choice.consequence && /* @__PURE__ */ React2.createElement("p", { className: "text-sm text-muted-foreground mt-1 italic" }, "\u2192 ", choice.consequence)), /* @__PURE__ */ React2.createElement(ArrowRight, { className: "w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-accent" }))
    )))), currentPreviewNode.isEnd && /* @__PURE__ */ React2.createElement("div", { className: "text-center py-8 bg-gradient-to-r from-accent/10 to-secondary/10 rounded-2xl" }, /* @__PURE__ */ React2.createElement("div", { className: "text-6xl mb-4" }, "\u{1F3AD}"), /* @__PURE__ */ React2.createElement(Badge, { variant: "secondary", className: "text-lg px-6 py-3 rounded-full" }, "The End"), /* @__PURE__ */ React2.createElement("p", { className: "text-muted-foreground mt-4" }, "Thank you for experiencing this story!"))) : /* @__PURE__ */ React2.createElement("div", { className: "text-center py-12" }, /* @__PURE__ */ React2.createElement("div", { className: "text-8xl mb-6" }, "\u{1F4D6}"), /* @__PURE__ */ React2.createElement("h3", { className: "text-2xl font-bold mb-4" }, "Ready to Begin?"), /* @__PURE__ */ React2.createElement("p", { className: "text-muted-foreground mb-8 text-lg" }, "Select a starting point to experience the story"), /* @__PURE__ */ React2.createElement(
      Button,
      {
        size: "lg",
        className: "px-8 py-4 text-lg",
        onClick: () => {
          const startNode = nodes.find((n) => n.isStart) || nodes[0];
          if (startNode) setPreviewNodeId(startNode.id);
        }
      },
      /* @__PURE__ */ React2.createElement(Play, { className: "w-5 h-5 mr-2" }),
      "Start Adventure"
    ))));
  }
  return /* @__PURE__ */ React2.createElement("div", { className: "w-full max-w-7xl mx-auto my-6" }, /* @__PURE__ */ React2.createElement(Card, { className: "shadow-2xl border-0 overflow-hidden" }, /* @__PURE__ */ React2.createElement(CardHeader, { className: "bg-gradient-to-br from-accent/20 via-accent/10 to-secondary/10 border-b" }, /* @__PURE__ */ React2.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React2.createElement("div", { className: "flex items-center gap-4" }, /* @__PURE__ */ React2.createElement("div", { className: "p-3 bg-accent/20 rounded-2xl backdrop-blur-sm" }, /* @__PURE__ */ React2.createElement(GitBranch, { className: "w-8 h-8 text-accent" })), /* @__PURE__ */ React2.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ React2.createElement(
    Input,
    {
      value: storyTitle,
      onChange: (e) => setStoryTitle(e.target.value),
      onBlur: () => updateStoryBuilder({ nodes, currentNodeId, title: storyTitle }),
      className: "text-2xl font-bold bg-transparent border-none p-0 h-auto focus-visible:ring-0 text-foreground",
      placeholder: "Enter your story title..."
    }
  ), /* @__PURE__ */ React2.createElement("div", { className: "flex items-center gap-4 text-sm text-muted-foreground" }, /* @__PURE__ */ React2.createElement("span", { className: "flex items-center gap-1" }, /* @__PURE__ */ React2.createElement(BookOpen, { className: "w-4 h-4" }), "Interactive Story Builder"), /* @__PURE__ */ React2.createElement("span", { className: "flex items-center gap-1" }, /* @__PURE__ */ React2.createElement(MapPin, { className: "w-4 h-4" }), nodes.length, " Chapters"), /* @__PURE__ */ React2.createElement("span", { className: "flex items-center gap-1" }, /* @__PURE__ */ React2.createElement(Timer, { className: "w-4 h-4" }), "~", nodes.reduce((sum, node) => sum + (node.estimatedReadTime || 1), 0), " min")))), /* @__PURE__ */ React2.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React2.createElement(Tabs, { value: viewMode, onValueChange: (v) => setViewMode(v), className: "mr-4" }, /* @__PURE__ */ React2.createElement(TabsList, { className: "bg-white/50 backdrop-blur-sm" }, /* @__PURE__ */ React2.createElement(TabsTrigger, { value: "grid" }, "Grid"), /* @__PURE__ */ React2.createElement(TabsTrigger, { value: "list" }, "List"))), /* @__PURE__ */ React2.createElement(Button, { variant: "outline", size: "sm", onClick: exportStory }, /* @__PURE__ */ React2.createElement(Save, { className: "w-4 h-4 mr-2" }), "Export"), /* @__PURE__ */ React2.createElement(
    Button,
    {
      variant: "outline",
      size: "sm",
      onClick: () => {
        const startNode = nodes.find((n) => n.isStart) || nodes[0];
        if (startNode) {
          setPreviewNodeId(startNode.id);
          setIsPreviewMode(true);
        }
      },
      disabled: nodes.length === 0,
      className: "bg-accent/10 border-accent/30 hover:bg-accent/20"
    },
    /* @__PURE__ */ React2.createElement(Play, { className: "w-4 h-4 mr-2" }),
    "Preview"
  ), /* @__PURE__ */ React2.createElement(Button, { size: "sm", onClick: addNewNode, className: "bg-accent hover:bg-accent/90" }, /* @__PURE__ */ React2.createElement(Plus, { className: "w-4 h-4 mr-2" }), "Add Chapter")))), /* @__PURE__ */ React2.createElement(CardContent, { className: "p-6" }, nodes.length === 0 ? /* @__PURE__ */ React2.createElement("div", { className: "text-center py-16" }, /* @__PURE__ */ React2.createElement("div", { className: "text-8xl mb-6" }, "\u2728"), /* @__PURE__ */ React2.createElement("h3", { className: "text-3xl font-bold mb-4" }, "Create Your Interactive Story"), /* @__PURE__ */ React2.createElement("p", { className: "text-muted-foreground text-lg mb-8 max-w-2xl mx-auto" }, "Build immersive, branching narratives where every choice matters. Add images, set moods, and create unforgettable adventures."), /* @__PURE__ */ React2.createElement(Button, { size: "lg", onClick: addNewNode, className: "px-8 py-4 text-lg" }, /* @__PURE__ */ React2.createElement(Plus, { className: "w-5 h-5 mr-2" }), "Start Creating")) : /* @__PURE__ */ React2.createElement("div", { className: cn(
    "gap-6",
    viewMode === "grid" ? "grid md:grid-cols-2" : "space-y-4"
  ) }, nodes.map((node) => {
    var _a, _b;
    const nodeMood = node.mood || "neutral";
    const moodStyle = moodColors[nodeMood];
    return /* @__PURE__ */ React2.createElement(
      Card,
      {
        key: node.id,
        className: cn(
          "group relative transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-2",
          node.isStart && "ring-4 ring-accent/30 shadow-accent/20 shadow-lg",
          editingNode === node.id && "ring-4 ring-secondary/50",
          moodStyle.border,
          "overflow-hidden"
        )
      },
      node.image && /* @__PURE__ */ React2.createElement("div", { className: "relative h-32 w-full" }, /* @__PURE__ */ React2.createElement(
        "img",
        {
          src: node.image,
          alt: node.title,
          className: "w-full h-full object-cover"
        }
      ), /* @__PURE__ */ React2.createElement("div", { className: "absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" }), /* @__PURE__ */ React2.createElement(
        Button,
        {
          variant: "ghost",
          size: "sm",
          className: "absolute top-2 right-2 bg-white/20 backdrop-blur-sm hover:bg-white/30",
          onClick: () => updateNode(node.id, { image: void 0 })
        },
        /* @__PURE__ */ React2.createElement(Trash2, { className: "w-3 h-3 text-white" })
      )),
      /* @__PURE__ */ React2.createElement(CardHeader, { className: cn("pb-3", moodStyle.bg) }, /* @__PURE__ */ React2.createElement("div", { className: "flex items-start justify-between" }, /* @__PURE__ */ React2.createElement("div", { className: "flex items-center gap-2 flex-wrap" }, node.isStart && /* @__PURE__ */ React2.createElement(Badge, { className: "bg-accent text-accent-foreground" }, "\u{1F680} Start"), node.isEnd && /* @__PURE__ */ React2.createElement(Badge, { variant: "outline", className: "border-accent/50" }, "\u{1F3AF} End"), (_a = node.tags) == null ? void 0 : _a.map((tag, index) => /* @__PURE__ */ React2.createElement(Badge, { key: index, variant: "secondary", className: "text-xs" }, "#", tag))), /* @__PURE__ */ React2.createElement("div", { className: "flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" }, /* @__PURE__ */ React2.createElement(
        Button,
        {
          variant: "ghost",
          size: "sm",
          onClick: () => duplicateNode(node.id),
          className: "hover:bg-accent/20"
        },
        /* @__PURE__ */ React2.createElement(Copy, { className: "w-3 h-3" })
      ), /* @__PURE__ */ React2.createElement(
        Button,
        {
          variant: "ghost",
          size: "sm",
          onClick: () => setEditingNode(editingNode === node.id ? null : node.id),
          className: "hover:bg-accent/20"
        },
        /* @__PURE__ */ React2.createElement(Edit3, { className: "w-3 h-3" })
      ), /* @__PURE__ */ React2.createElement(
        Button,
        {
          variant: "ghost",
          size: "sm",
          onClick: () => deleteNode(node.id),
          className: "text-destructive hover:text-destructive hover:bg-destructive/10"
        },
        /* @__PURE__ */ React2.createElement(Trash2, { className: "w-3 h-3" })
      ))), editingNode === node.id ? /* @__PURE__ */ React2.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ React2.createElement(
        Input,
        {
          value: node.title,
          onChange: (e) => updateNode(node.id, { title: e.target.value }),
          className: "font-semibold text-lg",
          placeholder: "Chapter title"
        }
      ), /* @__PURE__ */ React2.createElement("div", { className: "grid grid-cols-2 gap-2" }, /* @__PURE__ */ React2.createElement("div", null, /* @__PURE__ */ React2.createElement(Label, { className: "text-xs" }, "Mood"), /* @__PURE__ */ React2.createElement(
        "select",
        {
          value: node.mood || "neutral",
          onChange: (e) => updateNode(node.id, { mood: e.target.value }),
          className: "w-full text-sm border rounded px-2 py-1 bg-background"
        },
        /* @__PURE__ */ React2.createElement("option", { value: "neutral" }, "\u{1F610} Neutral"),
        /* @__PURE__ */ React2.createElement("option", { value: "happy" }, "\u{1F60A} Happy"),
        /* @__PURE__ */ React2.createElement("option", { value: "sad" }, "\u{1F622} Sad"),
        /* @__PURE__ */ React2.createElement("option", { value: "mysterious" }, "\u{1F52E} Mysterious"),
        /* @__PURE__ */ React2.createElement("option", { value: "exciting" }, "\u{1F680} Exciting"),
        /* @__PURE__ */ React2.createElement("option", { value: "dark" }, "\u{1F319} Dark")
      )), /* @__PURE__ */ React2.createElement("div", null, /* @__PURE__ */ React2.createElement(Label, { className: "text-xs" }, "Read Time (min)"), /* @__PURE__ */ React2.createElement(
        Input,
        {
          type: "number",
          value: node.estimatedReadTime || 1,
          onChange: (e) => updateNode(node.id, { estimatedReadTime: parseInt(e.target.value) || 1 }),
          className: "text-sm",
          min: 1
        }
      ))), /* @__PURE__ */ React2.createElement("div", null, /* @__PURE__ */ React2.createElement(Label, { className: "text-xs" }, "Tags (comma-separated)"), /* @__PURE__ */ React2.createElement(
        Input,
        {
          value: ((_b = node.tags) == null ? void 0 : _b.join(", ")) || "",
          onChange: (e) => updateNode(node.id, { tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) }),
          placeholder: "adventure, fantasy, mystery",
          className: "text-sm"
        }
      ))) : /* @__PURE__ */ React2.createElement("div", null, /* @__PURE__ */ React2.createElement(CardTitle, { className: cn("text-xl mb-2", moodStyle.text) }, node.title), /* @__PURE__ */ React2.createElement("div", { className: "flex items-center gap-4 text-xs text-muted-foreground" }, /* @__PURE__ */ React2.createElement("span", { className: "flex items-center gap-1" }, /* @__PURE__ */ React2.createElement(Timer, { className: "w-3 h-3" }), node.estimatedReadTime || 1, "m"), /* @__PURE__ */ React2.createElement("span", { className: "flex items-center gap-1" }, /* @__PURE__ */ React2.createElement(Users, { className: "w-3 h-3" }), node.choices.length, " choices")))),
      /* @__PURE__ */ React2.createElement(CardContent, { className: "space-y-4 p-4" }, editingNode === node.id ? /* @__PURE__ */ React2.createElement(
        Textarea,
        {
          value: node.content,
          onChange: (e) => updateNode(node.id, { content: e.target.value }),
          placeholder: "Write your story content...",
          className: "min-h-[120px] resize-none text-sm"
        }
      ) : /* @__PURE__ */ React2.createElement("p", { className: "text-sm text-muted-foreground line-clamp-4 leading-relaxed" }, node.content), /* @__PURE__ */ React2.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ React2.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React2.createElement(Label, { className: "text-xs font-medium" }, "Scene Image"), /* @__PURE__ */ React2.createElement(
        "input",
        {
          ref: fileInputRef,
          type: "file",
          accept: "image/*",
          onChange: (e) => {
            var _a2;
            const file = (_a2 = e.target.files) == null ? void 0 : _a2[0];
            if (file) handleImageUpload(node.id, file);
          },
          className: "hidden"
        }
      ), /* @__PURE__ */ React2.createElement(
        Button,
        {
          variant: "ghost",
          size: "sm",
          onClick: () => {
            var _a2;
            return (_a2 = fileInputRef.current) == null ? void 0 : _a2.click();
          },
          className: "text-xs h-6 px-2"
        },
        /* @__PURE__ */ React2.createElement(Upload, { className: "w-3 h-3 mr-1" }),
        node.image ? "Change" : "Upload"
      ))), /* @__PURE__ */ React2.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ React2.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React2.createElement("span", { className: "text-sm font-medium flex items-center gap-1" }, /* @__PURE__ */ React2.createElement(GitBranch, { className: "w-3 h-3" }), "Choices (", node.choices.length, ")"), /* @__PURE__ */ React2.createElement(
        Button,
        {
          variant: "ghost",
          size: "sm",
          onClick: () => addChoice(node.id),
          className: "text-xs h-6 px-2 hover:bg-accent/20"
        },
        /* @__PURE__ */ React2.createElement(Plus, { className: "w-3 h-3" })
      )), node.choices.map((choice) => {
        return /* @__PURE__ */ React2.createElement("div", { key: choice.id, className: "space-y-2 p-3 bg-muted/30 rounded-lg border border-border/30" }, /* @__PURE__ */ React2.createElement("div", { className: "flex gap-2 items-start" }, /* @__PURE__ */ React2.createElement(
          Input,
          {
            value: choice.icon || "\u2B50",
            onChange: (e) => updateChoice(node.id, choice.id, { icon: e.target.value }),
            placeholder: "\u{1F3AD}",
            className: "w-12 h-8 text-center text-sm p-1"
          }
        ), /* @__PURE__ */ React2.createElement(
          Input,
          {
            value: choice.text,
            onChange: (e) => updateChoice(node.id, choice.id, { text: e.target.value }),
            placeholder: "Choice text",
            className: "flex-1 text-sm h-8"
          }
        ), /* @__PURE__ */ React2.createElement(
          "select",
          {
            value: choice.targetId,
            onChange: (e) => updateChoice(node.id, choice.id, { targetId: e.target.value }),
            className: "text-sm border rounded px-2 py-1 bg-background h-8 min-w-[120px]"
          },
          /* @__PURE__ */ React2.createElement("option", { value: "" }, "Select target"),
          nodes.filter((n) => n.id !== node.id).map((n) => /* @__PURE__ */ React2.createElement("option", { key: n.id, value: n.id }, n.title))
        ), /* @__PURE__ */ React2.createElement(
          Button,
          {
            variant: "ghost",
            size: "sm",
            onClick: () => deleteChoice(node.id, choice.id),
            className: "text-destructive hover:text-destructive p-1 h-8 w-8"
          },
          /* @__PURE__ */ React2.createElement(Trash2, { className: "w-3 h-3" })
        )), editingNode === node.id && /* @__PURE__ */ React2.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ React2.createElement(
          Input,
          {
            value: choice.consequence || "",
            onChange: (e) => updateChoice(node.id, choice.id, { consequence: e.target.value }),
            placeholder: "What happens when this choice is selected?",
            className: "text-xs text-muted-foreground italic"
          }
        ), /* @__PURE__ */ React2.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ React2.createElement(
          Input,
          {
            value: choice.requiredItem || "",
            onChange: (e) => updateChoice(node.id, choice.id, { requiredItem: e.target.value }),
            placeholder: "Required item (optional)",
            className: "text-xs flex-1"
          }
        ), /* @__PURE__ */ React2.createElement(
          Input,
          {
            type: "number",
            value: choice.probabilityWeight || 1,
            onChange: (e) => updateChoice(node.id, choice.id, { probabilityWeight: parseInt(e.target.value) || 1 }),
            placeholder: "Weight",
            className: "text-xs w-16",
            min: 1,
            max: 10
          }
        ))));
      })))
    );
  })))), /* @__PURE__ */ React2.createElement(Dialog, { open: showAdvancedEditor, onOpenChange: setShowAdvancedEditor }, /* @__PURE__ */ React2.createElement(DialogContent, { className: "max-w-2xl max-h-[80vh] overflow-y-auto" }, /* @__PURE__ */ React2.createElement(DialogHeader, null, /* @__PURE__ */ React2.createElement(DialogTitle, { className: "flex items-center gap-2" }, /* @__PURE__ */ React2.createElement(Settings, { className: "w-5 h-5" }), "Advanced Story Settings")), /* @__PURE__ */ React2.createElement("div", { className: "space-y-6" }, /* @__PURE__ */ React2.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ React2.createElement(Label, null, "Story Metadata"), /* @__PURE__ */ React2.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ React2.createElement("div", null, /* @__PURE__ */ React2.createElement(Label, { className: "text-xs" }, "Total Nodes"), /* @__PURE__ */ React2.createElement(Input, { value: nodes.length, disabled: true, className: "text-sm" })), /* @__PURE__ */ React2.createElement("div", null, /* @__PURE__ */ React2.createElement(Label, { className: "text-xs" }, "Total Choices"), /* @__PURE__ */ React2.createElement(
    Input,
    {
      value: nodes.reduce((sum, node) => sum + node.choices.length, 0),
      disabled: true,
      className: "text-sm"
    }
  )))), /* @__PURE__ */ React2.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ React2.createElement(Label, null, "Story Statistics"), /* @__PURE__ */ React2.createElement("div", { className: "grid grid-cols-3 gap-3" }, /* @__PURE__ */ React2.createElement("div", { className: "p-3 bg-accent/10 rounded-lg text-center" }, /* @__PURE__ */ React2.createElement("div", { className: "text-2xl font-bold text-accent" }, nodes.reduce((sum, node) => sum + (node.estimatedReadTime || 1), 0)), /* @__PURE__ */ React2.createElement("div", { className: "text-xs text-muted-foreground" }, "Total Minutes")), /* @__PURE__ */ React2.createElement("div", { className: "p-3 bg-secondary/10 rounded-lg text-center" }, /* @__PURE__ */ React2.createElement("div", { className: "text-2xl font-bold text-secondary" }, nodes.filter((node) => node.image).length), /* @__PURE__ */ React2.createElement("div", { className: "text-xs text-muted-foreground" }, "With Images")), /* @__PURE__ */ React2.createElement("div", { className: "p-3 bg-primary/10 rounded-lg text-center" }, /* @__PURE__ */ React2.createElement("div", { className: "text-2xl font-bold text-primary" }, new Set(nodes.flatMap((node) => node.tags || [])).size), /* @__PURE__ */ React2.createElement("div", { className: "text-xs text-muted-foreground" }, "Unique Tags")))), /* @__PURE__ */ React2.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ React2.createElement(Label, null, "Export Options"), /* @__PURE__ */ React2.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ React2.createElement(Button, { onClick: exportStory, className: "flex-1" }, /* @__PURE__ */ React2.createElement(Save, { className: "w-4 h-4 mr-2" }), "Export as JSON"), /* @__PURE__ */ React2.createElement(Button, { variant: "outline", className: "flex-1" }, /* @__PURE__ */ React2.createElement(Share2, { className: "w-4 h-4 mr-2" }), "Share Story"))), /* @__PURE__ */ React2.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ React2.createElement(Label, null, "Story Validation"), /* @__PURE__ */ React2.createElement("div", { className: "space-y-2 text-sm" }, nodes.some((node) => !node.isStart && !nodes.some((n) => n.choices.some((c) => c.targetId === node.id))) && /* @__PURE__ */ React2.createElement("div", { className: "p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800" }, "\u26A0\uFE0F Some nodes are unreachable from the start"), nodes.some((node) => node.choices.some((choice) => !choice.targetId)) && /* @__PURE__ */ React2.createElement("div", { className: "p-2 bg-red-50 border border-red-200 rounded text-red-800" }, "\u274C Some choices don't have target nodes"), !nodes.some((node) => node.isStart) && /* @__PURE__ */ React2.createElement("div", { className: "p-2 bg-red-50 border border-red-200 rounded text-red-800" }, "\u274C No starting node defined"), nodes.every((node) => node.choices.length > 0) && /* @__PURE__ */ React2.createElement("div", { className: "p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800" }, "\u26A0\uFE0F No ending nodes (all nodes have choices)")))))));
}
export {
  StoryBuilderComponent as default
};
