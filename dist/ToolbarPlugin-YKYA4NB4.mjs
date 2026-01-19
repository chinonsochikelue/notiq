import {
  CodeList
} from "./chunk-TTHQCW5F.mjs";
import {
  INSERT_TEMPLATE_COMMAND
} from "./chunk-YKC3SO4Z.mjs";
import {
  EXPORT_MARKDOWN_COMMAND,
  EXPORT_PDF_COMMAND
} from "./chunk-ZJRKATOJ.mjs";
import {
  Toggle
} from "./chunk-Z4EWP7BI.mjs";
import {
  getSelectedNode
} from "./chunk-4HBCVSE6.mjs";
import "./chunk-EGMI62PP.mjs";
import "./chunk-KJ6AJ44Q.mjs";
import "./chunk-64Z3FI7T.mjs";
import {
  SPEECH_TO_TEXT_COMMAND,
  SUPPORT_SPEECH_RECOGNITION
} from "./chunk-77UA6HYR.mjs";
import {
  $isDynamicBlockNode
} from "./chunk-5BAKY5KN.mjs";
import {
  SHORTCUTS
} from "./chunk-ZB5LZQKC.mjs";
import {
  blockTypeToBlockName,
  useToolbarState
} from "./chunk-7NZAPJ4G.mjs";
import {
  Separator
} from "./chunk-TCYK7DM7.mjs";
import {
  $isPollNode
} from "./chunk-GZPNVR7L.mjs";
import {
  sanitizeUrl
} from "./chunk-4VWFVWYP.mjs";
import {
  $isStoryBuilderNode
} from "./chunk-4MEDW3T6.mjs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "./chunk-WDG7J2DY.mjs";
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

// src/components/editor/plugins/ToolbarPlugin/index.tsx
init_react_shim();
import React2, { useCallback, useEffect, useState as useState2 } from "react";
import {
  $getNodeByKey,
  $getSelection,
  $isElementNode,
  $isLineBreakNode,
  $isRangeSelection,
  $isRootOrShadowRoot,
  BLUR_COMMAND,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  FOCUS_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND
} from "lexical";

// src/components/editor/plugins/TemplatePlugin/TemplateDialog.tsx
init_react_shim();
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LayoutTemplate } from "lucide-react";
import { useState } from "react";

// src/components/editor/templates/data.ts
init_react_shim();
var TEMPLATES = [
  {
    id: "meeting-notes",
    name: "Meeting Notes",
    description: "Standard meeting minutes format",
    content: `# Meeting Notes
Date: 
attendees: 

## Agenda
1. 
2. 

## Action Items
- [ ] 
- [ ] 
`
  },
  {
    id: "daily-journal",
    name: "Daily Journal",
    description: "Reflect on your day",
    content: `# Daily Journal
Date: 

## Highlights
- 

## Challenges
- 

## Plan for Tomorrow
- 
`
  },
  {
    id: "product-spec",
    name: "Product Specification",
    description: "Define a new feature or product",
    content: `# Product Spec: [Title]

## Problem Statement
What problem are we solving?

## Solution
Describe the solution.

## Requirements
- Requirement 1
- Requirement 2
`
  }
];

// src/components/editor/plugins/TemplatePlugin/TemplateDialog.tsx
function TemplateDialog() {
  const [editor] = useLexicalComposerContext();
  const [open, setOpen] = useState(false);
  const insertTemplate = (content) => {
    editor.dispatchCommand(INSERT_TEMPLATE_COMMAND, content);
    setOpen(false);
  };
  return /* @__PURE__ */ React.createElement(Dialog, { open, onOpenChange: setOpen }, /* @__PURE__ */ React.createElement(DialogTrigger, { asChild: true }, /* @__PURE__ */ React.createElement(Button, { variant: "outline", size: "Toolbar", className: "border-none", tip: "Insert Template" }, /* @__PURE__ */ React.createElement(LayoutTemplate, { className: "size-4" }))), /* @__PURE__ */ React.createElement(DialogContent, { className: "sm:max-w-[425px]" }, /* @__PURE__ */ React.createElement(DialogHeader, null, /* @__PURE__ */ React.createElement(DialogTitle, null, "Choose a Template"), /* @__PURE__ */ React.createElement(DialogDescription, null, "Select a template to get started quickly.")), /* @__PURE__ */ React.createElement("div", { className: "grid gap-4 py-4" }, TEMPLATES.map((template) => /* @__PURE__ */ React.createElement(
    Button,
    {
      key: template.id,
      variant: "outline",
      className: "justify-start h-auto flex-col items-start gap-1",
      onClick: () => insertTemplate(template.content)
    },
    /* @__PURE__ */ React.createElement("span", { className: "font-medium" }, template.name),
    /* @__PURE__ */ React.createElement("span", { className: "text-xs text-muted-foreground" }, template.description)
  )))));
}

// src/components/editor/plugins/ToolbarPlugin/index.tsx
import { Bold, Code, DownloadIcon, FileJson, FileText, Italic, Link, Mic, Redo2Icon, Underline, Undo2Icon } from "lucide-react";
import {
  $findMatchingParent,
  $getNearestNodeOfType,
  $isEditorIsNestedEditor,
  mergeRegister
} from "@lexical/utils";
import {
  $getSelectionStyleValueForProperty
} from "@lexical/selection";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { $isTableNode, $isTableSelection } from "@lexical/table";
import { $isListNode, ListNode } from "@lexical/list";
import { $isHeadingNode } from "@lexical/rich-text";
import { $isCodeNode, CODE_LANGUAGE_MAP } from "@lexical/code";
import dynamic from "next/dynamic.js";

// src/utils/htmlExport.tsx
init_react_shim();
import { $getRoot } from "lexical";
import { $generateHtmlFromNodes } from "@lexical/html";
function exportEditorToHTML(editor) {
  return editor.getEditorState().read(() => {
    const root = $getRoot();
    const rootElement = editor.getRootElement();
    if (!rootElement) {
      return "<div></div>";
    }
    const htmlString = $generateHtmlFromNodes(editor, null);
    const children = root.getChildren();
    const specialNodesHTML = [];
    children.forEach((child) => {
      const specialHTML = convertSpecialNodeToHTML(child);
      if (specialHTML) {
        specialNodesHTML.push(specialHTML);
      }
    });
    let finalHTML = htmlString;
    if (specialNodesHTML.length > 0) {
      const clonedElement = rootElement.cloneNode(true);
      const cleanElement = (element) => {
        element.classList.remove(
          "editor-content",
          "relative",
          "z-20",
          "outline-none",
          "focus:outline-none",
          "focus:ring-0",
          "selection:bg-blue-100",
          "dark:selection:bg-blue-900/30",
          "transition-all",
          "duration-200",
          "ease-in-out"
        );
        element.removeAttribute("contenteditable");
        element.removeAttribute("role");
        element.removeAttribute("spellcheck");
        element.removeAttribute("data-lexical-editor");
        Array.from(element.children).forEach((child) => {
          cleanElement(child);
        });
      };
      cleanElement(clonedElement);
      const regularHTML = clonedElement.innerHTML || "<div></div>";
      finalHTML = specialNodesHTML.length > 0 ? regularHTML + "\n\n" + specialNodesHTML.join("\n\n") : regularHTML;
    }
    return finalHTML;
  });
}
function downloadHTML(htmlContent, filename = "document.html") {
  const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exported Document</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        darkMode: 'class',
        theme: {
          extend: {
            colors: {
              background: 'oklch(1 0 0)',
              foreground: 'oklch(0.145 0 0)',
              card: 'oklch(1 0 0)',
              'card-foreground': 'oklch(0.145 0 0)',
              popover: 'oklch(1 0 0)',
              'popover-foreground': 'oklch(0.145 0 0)',
              primary: 'oklch(0.205 0 0)',
              'primary-foreground': 'oklch(0.985 0 0)',
              secondary: 'oklch(0.97 0 0)',
              'secondary-foreground': 'oklch(0.205 0 0)',
              muted: 'oklch(0.97 0 0)',
              'muted-foreground': 'oklch(0.556 0 0)',
              accent: 'oklch(0.97 0 0)',
              'accent-foreground': 'oklch(0.205 0 0)',
              destructive: 'oklch(0.577 0.245 27.325)',
              'destructive-foreground': 'oklch(0.577 0.245 27.325)',
              border: 'oklch(0.922 0 0)',
              input: 'oklch(0.922 0 0)',
              ring: 'oklch(0.708 0 0)',
            },
            fontFamily: {
              sans: ['Inter', 'system-ui', 'sans-serif'],
              mono: ['Monaco', 'Consolas', 'monospace'],
            },
            typography: {
              DEFAULT: {
                css: {
                  maxWidth: 'none',
                  color: 'oklch(0.145 0 0)',
                  lineHeight: '1.75',
                }
              }
            }
          }
        }
      }
    </script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        body {
            font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.75;
            color: oklch(0.145 0 0);
            background-color: oklch(1 0 0);
            font-weight: 400;
            letter-spacing: 0.025em;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        
        .dark body {
            color: oklch(0.985 0 0);
            background-color: oklch(0.145 0 0);
        }
        
        /* Preserve editor content styling */
        .editor-content,
        .prose {
            max-width: none !important;
            font-size: 1.125rem;
            line-height: 1.75;
            letter-spacing: 0.025em;
        }
        
        /* Typography styles matching the editor */
        h1, h2, h3, h4, h5, h6 {
            font-weight: 600;
            line-height: 1.25;
            margin-top: 2rem;
            margin-bottom: 1rem;
            letter-spacing: -0.025em;
        }
        
        h1 { font-size: 2.25rem; }
        h2 { font-size: 1.875rem; }
        h3 { font-size: 1.5rem; }
        h4 { font-size: 1.25rem; }
        h5 { font-size: 1.125rem; }
        h6 { font-size: 1rem; }
        
        p {
            margin-bottom: 1.25rem;
            line-height: 1.75;
        }
        
        /* List styles */
        ul, ol {
            margin-bottom: 1.25rem;
            padding-left: 1.75rem;
        }
        
        li {
            margin-bottom: 0.5rem;
            line-height: 1.75;
        }
        
        /* Blockquote styles */
        blockquote {
            border-left: 4px solid oklch(0.708 0 0);
            margin: 1.5rem 0;
            padding-left: 1.5rem;
            color: oklch(0.556 0 0);
            font-style: italic;
            font-size: 1.125rem;
        }
        
        /* Code styles */
        code {
            background-color: oklch(0.97 0 0);
            color: oklch(0.205 0 0);
            padding: 0.25rem 0.5rem;
            border-radius: 0.375rem;
            font-family: 'Monaco', 'Consolas', 'Courier New', monospace;
            font-size: 0.875rem;
        }
        
        pre {
            background-color: oklch(0.97 0 0);
            color: oklch(0.205 0 0);
            padding: 1.5rem;
            border-radius: 0.75rem;
            overflow-x: auto;
            margin: 1.5rem 0;
            font-family: 'Monaco', 'Consolas', 'Courier New', monospace;
            line-height: 1.5;
        }
        
        pre code {
            background: none;
            padding: 0;
            border-radius: 0;
            color: inherit;
        }
        
        /* Table styles */
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 1.5rem 0;
            border-radius: 0.5rem;
            overflow: hidden;
            border: 1px solid oklch(0.922 0 0);
        }
        
        th, td {
            border: 1px solid oklch(0.922 0 0);
            padding: 0.75rem 1rem;
            text-align: left;
            line-height: 1.5;
        }
        
        th {
            background-color: oklch(0.97 0 0);
            font-weight: 600;
            color: oklch(0.205 0 0);
        }
        
        /* Image styles */
        img {
            max-width: 100%;
            height: auto;
            border-radius: 0.5rem;
            margin: 1.5rem 0;
        }
        
        /* Link styles */
        a {
            color: oklch(0.488 0.243 264.376);
            text-decoration: underline;
            text-decoration-color: oklch(0.488 0.243 264.376 / 0.3);
            text-underline-offset: 0.25rem;
            transition: all 0.2s ease;
        }
        
        a:hover {
            text-decoration-color: oklch(0.488 0.243 264.376);
        }
        
        /* Enhanced styles for special components */
        /* Poll component styles */
        .poll-container {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 0.5rem;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
            margin: 1.5rem 0;
        }
        
        .poll-option {
            position: relative;
            overflow: hidden;
        }
        
        .poll-progress {
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            background: rgba(59, 130, 246, 0.3);
            border-radius: 0.375rem;
            transition: width 1s ease;
        }
        
        /* Story builder styles */
        .story-node {
            transition: opacity 0.4s ease-in-out, transform 0.4s ease-in-out;
            transform: translateY(0);
        }
        
        .story-node.hidden {
            display: none;
            opacity: 0;
            transform: translateY(20px);
        }
        
        .story-choice {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .story-choice:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }
        
        .story-choice:active {
            transform: translateY(-1px);
            transition: all 0.1s ease;
        }
        
        .story-choice:disabled {
            cursor: not-allowed;
            opacity: 0.5;
        }
        
        .story-choice:disabled:hover {
            transform: none;
            box-shadow: none;
        }
        
        /* Dynamic block styles */
        .dynamic-block-container {
            border: 2px dashed #93c5fd;
            background: linear-gradient(135deg, #ffffff 0%, #eff6ff 100%);
        }
        
        .block-selector {
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .block-selector:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        /* Dark mode styles */
        .dark code {
            background-color: oklch(0.269 0 0);
            color: oklch(0.985 0 0);
        }
        
        .dark pre {
            background-color: oklch(0.269 0 0);
            color: oklch(0.985 0 0);
        }
        
        .dark th {
            background-color: oklch(0.269 0 0);
            color: oklch(0.985 0 0);
        }
        
        .dark table,
        .dark th,
        .dark td {
            border-color: oklch(0.269 0 0);
        }
        
        .dark blockquote {
            border-left-color: oklch(0.439 0 0);
            color: oklch(0.708 0 0);
        }
        
        .dark .poll-container {
            background: #1f2937;
            border-color: #374151;
        }
        
        .dark .dynamic-block-container {
            border-color: #3b82f6;
            background: linear-gradient(135deg, #1f2937 0%, #1e3a8a 100%);
        }
        
        /* Container styling to match editor */
        .document-container {
            max-width: 80rem;
            margin: 0 auto;
            padding: 2rem 1rem;
            background-color: oklch(1 0 0);
            min-height: 100vh;
        }
        
        .dark .document-container {
            background-color: oklch(0.145 0 0);
        }
        
        @media (min-width: 768px) {
            .document-container {
                padding: 4rem 3rem;
                border-radius: 1rem;
                margin: 2rem auto;
                min-height: calc(100vh - 4rem);
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.05);
                border: 1px solid oklch(0.922 0 0 / 0.5);
            }
            
            .dark .document-container {
                border-color: oklch(0.269 0 0 / 0.5);
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.2);
            }
        }
        
        /* Print styles */
        @media print {
            .document-container {
                box-shadow: none;
                border: none;
                margin: 0;
                padding: 1rem;
            }
        }
    </style>
</head>
<body>
    <div class="document-container">
        ${htmlContent}
    </div>
    
    <script>
        // Dark mode detection
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark');
        }
        
        // Listen for dark mode changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            if (e.matches) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        });
        
        window.showStoryNode = function(nodeId) {
            console.log('[v0] Navigating to story node:', nodeId);
            
            // Hide all story nodes with smooth transition
            const allNodes = document.querySelectorAll('.story-node');
            allNodes.forEach(node => {
                node.style.opacity = '0';
                node.style.transform = 'translateY(20px)';
            });
            
            // After transition, hide nodes and show target
            setTimeout(() => {
                allNodes.forEach(node => {
                    node.classList.add('hidden');
                });
                
                const targetNode = document.getElementById('story-node-' + nodeId);
                if (targetNode) {
                    console.log('[v0] Found target node:', targetNode);
                    targetNode.classList.remove('hidden');
                    targetNode.style.opacity = '0';
                    targetNode.style.transform = 'translateY(20px)';
                    
                    // Scroll to the story container smoothly
                    const storyContainer = document.getElementById('story-container');
                    if (storyContainer) {
                        storyContainer.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'start',
                            inline: 'nearest'
                        });
                    }
                    
                    // Fade in the new node
                    setTimeout(() => {
                        targetNode.style.opacity = '1';
                        targetNode.style.transform = 'translateY(0)';
                    }, 100);
                } else {
                    console.error('[v0] Target node not found:', nodeId);
                }
            }, 200);
        };
        
        window.restartStory = function() {
            console.log('[v0] Restarting story');
            // Find the first story node (should be the start node)
            const firstNode = document.querySelector('.story-node[data-node-id]');
            if (firstNode) {
                const startNodeId = firstNode.getAttribute('data-node-id');
                console.log('[v0] Found start node:', startNodeId);
                window.showStoryNode(startNodeId);
            } else {
                console.error('[v0] No story nodes found');
            }
        };
        
        window.showDynamicBlock = function(containerId, blockId) {
            const container = document.getElementById('dynamic-content-' + containerId);
            if (container) {
                // Update active button styling
                container.parentElement.querySelectorAll('.block-selector').forEach(btn => {
                    btn.classList.remove('bg-blue-100', 'border-blue-500');
                    btn.classList.add('bg-gray-50', 'border-gray-200');
                });
                
                // Find and highlight the clicked button
                const clickedBtn = event.target.closest('.block-selector');
                if (clickedBtn) {
                    clickedBtn.classList.remove('bg-gray-50', 'border-gray-200');
                    clickedBtn.classList.add('bg-blue-100', 'border-blue-500');
                }
                
                // Simple content update (in a real implementation, you'd embed the actual block data)
                container.innerHTML = '<div class="text-center text-gray-500 p-8">Selected block: ' + blockId + '</div>';
            }
        };
        
        document.addEventListener('DOMContentLoaded', function() {
            console.log('[v0] DOM loaded, initializing story');
            
            // Ensure the first story node is visible and others are hidden
            const storyNodes = document.querySelectorAll('.story-node');
            console.log('[v0] Found story nodes:', storyNodes.length);
            
            if (storyNodes.length > 0) {
                storyNodes.forEach((node, index) => {
                    if (index === 0) {
                        console.log('[v0] Showing first node:', node.id);
                        node.classList.remove('hidden');
                        node.style.opacity = '1';
                        node.style.transform = 'translateY(0)';
                    } else {
                        console.log('[v0] Hiding node:', node.id);
                        node.classList.add('hidden');
                        node.style.opacity = '0';
                        node.style.transform = 'translateY(20px)';
                    }
                });
            }
        });
    </script>
</body>
</html>`;
  const blob = new Blob([fullHTML], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
function convertSpecialNodeToHTML(node) {
  if ($isPollNode(node)) {
    return convertPollNodeToHTML(node);
  }
  if ($isStoryBuilderNode(node)) {
    return convertStoryBuilderNodeToHTML(node);
  }
  if ($isDynamicBlockNode(node)) {
    return convertDynamicBlockNodeToHTML(node);
  }
  return null;
}
function convertPollNodeToHTML(node) {
  const question = node.exportJSON().question;
  const options = node.exportJSON().options;
  const optionsHTML = options.map((option, index) => {
    const totalVotes = options.reduce((sum, opt) => sum + opt.votes.length, 0);
    const votes = option.votes.length;
    const percentage = totalVotes > 0 ? votes / totalVotes * 100 : 0;
    return `
      <div class="poll-option flex flex-row items-center justify-center gap-x-2 mb-3">
        <div>
          <input type="checkbox" disabled class="rounded border-gray-300" />
        </div>
        <div class="flex relative overflow-hidden flex-1">
          <div 
            class="poll-progress h-9 overflow-hidden bg-blue-500/30 dark:bg-blue-300/50 rounded-md absolute top-0 left-0 w-full py-2 transition-all duration-1000"
            style="width: ${percentage}%"
          ></div>
          <span class="absolute text-xs font-bold right-2 top-1">
            ${votes > 0 ? votes === 1 ? "1 vote" : `${votes} votes` : ""}
          </span>
          <div class="overflow-hidden ring-0 outline-none bg-transparent border border-gray-300 rounded-md px-3 py-2 w-full">
            ${option.text}
          </div>
        </div>
      </div>
    `;
  }).join("");
  return `
    <div class="poll-container bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm my-6">
      <div class="p-6 text-center border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100">${question}</h3>
      </div>
      <div class="p-6 space-y-2">
        ${optionsHTML}
      </div>
    </div>
  `;
}
function convertStoryBuilderNodeToHTML(node) {
  const data = node.exportJSON();
  const { title, nodes } = data;
  const startNode = nodes.find((n) => n.isStart) || nodes[0];
  if (!startNode) {
    return `
      <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm my-6 p-6">
        <h3 class="text-xl font-semibold mb-4">${title}</h3>
        <p class="text-gray-600 dark:text-gray-400">No story content available.</p>
      </div>
    `;
  }
  const renderStoryNode = (storyNode, index) => {
    const choicesHTML = storyNode.choices.map((choice) => {
      const targetNode = nodes.find((n) => n.id === choice.targetId);
      return `
        <button 
          class="story-choice w-full justify-start text-left h-auto p-4 group transition-all duration-300 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-lg hover:scale-[1.02] mb-3 ${!targetNode ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}"
          onclick="${targetNode ? `window.showStoryNode('${choice.targetId}')` : ""}"
          ${!targetNode ? "disabled" : ""}
        >
          <div class="flex items-start gap-4 w-full">
            <div class="text-2xl">\u27A4</div>
            <div class="flex-1">
              <div class="font-semibold text-base group-hover:text-blue-600 transition-colors">
                ${choice.text}
              </div>
            </div>
            <svg class="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </div>
        </button>
      `;
    }).join("");
    return `
      <div id="story-node-${storyNode.id}" class="story-node ${storyNode.id !== startNode.id ? "hidden" : ""}" data-node-id="${storyNode.id}">
        <div class="prose prose-xl max-w-none mb-6">
          <h2 class="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
            ${storyNode.title}
          </h2>
          <div class="text-lg leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            ${storyNode.content}
          </div>
        </div>

        ${storyNode.choices.length > 0 ? `
          <div class="space-y-4 mt-8">
            <h3 class="font-bold text-xl flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <span class="text-blue-600">\u{1F3AF}</span>
              What's your next move?
            </h3>
            <div class="grid gap-3">
              ${choicesHTML}
            </div>
          </div>
        ` : ""}

        ${storyNode.isEnd ? `
          <div class="text-center py-8 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl mt-8">
            <div class="text-6xl mb-4">\u{1F3AD}</div>
            <span class="inline-flex items-center px-6 py-3 rounded-full text-lg font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
              The End
            </span>
            <p class="text-gray-600 dark:text-gray-400 mt-4">Thank you for experiencing this story!</p>
            <button 
              onclick="window.restartStory()" 
              class="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Over
            </button>
          </div>
        ` : ""}
      </div>
    `;
  };
  const allNodesHTML = nodes.map(renderStoryNode).join("");
  return `
    <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg my-6 overflow-hidden">
      <div class="bg-gradient-to-br from-blue-50 via-blue-25 to-purple-50 dark:from-blue-900/20 dark:via-blue-800/10 dark:to-purple-900/20 border-b border-gray-200 dark:border-gray-700 p-6">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-blue-100 dark:bg-blue-800 rounded-2xl">
            <svg class="w-8 h-8 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
          </div>
          <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">${title}</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Interactive Story \u2022 ${nodes.length} Chapters
            </p>
          </div>
        </div>
      </div>
      
      <div class="p-8" id="story-container">
        ${allNodesHTML}
      </div>
    </div>
  `;
}
function convertDynamicBlockNodeToHTML(node) {
  const payload = node.getPayload();
  const { title, blocks, currentBlockId } = payload;
  const currentBlock = blocks.find((block) => block.id === currentBlockId) || blocks[0];
  const renderContentBlock = (block) => {
    switch (block.type) {
      case "text":
        return `<div class="prose prose-sm max-w-none" ${block.styles ? `style="${Object.entries(block.styles).map(([k, v]) => `${k}: ${v}`).join("; ")}"` : ""}>${block.content}</div>`;
      case "image":
        return `<img src="${block.content || "/placeholder.svg"}" alt="Dynamic content" class="max-w-full h-auto rounded-lg" ${block.styles ? `style="${Object.entries(block.styles).map(([k, v]) => `${k}: ${v}`).join("; ")}"` : ""} />`;
      case "video":
        return `<video src="${block.content}" controls class="max-w-full h-auto rounded-lg" ${block.styles ? `style="${Object.entries(block.styles).map(([k, v]) => `${k}: ${v}`).join("; ")}"` : ""}></video>`;
      case "html":
        return `<div class="w-full" ${block.styles ? `style="${Object.entries(block.styles).map(([k, v]) => `${k}: ${v}`).join("; ")}"` : ""}>${block.content}</div>`;
      default:
        return '<div class="text-gray-500">Unknown content type</div>';
    }
  };
  const blocksHTML = blocks.map(
    (block, index) => `
    <button 
      class="block-selector ${(currentBlock == null ? void 0 : currentBlock.id) === block.id ? "bg-blue-100 border-blue-500" : "bg-gray-50 border-gray-200"} border-2 rounded-lg p-3 text-left transition-all hover:border-blue-400 mb-2"
      onclick="window.showDynamicBlock('${payload.id}', '${block.id}')"
    >
      <div class="font-medium text-xs capitalize">${block.type}</div>
      <div class="text-xs text-gray-500 truncate">
        ${block.content.substring(0, 30)}...
      </div>
    </button>
  `
  ).join("");
  return `
    <div class="dynamic-block-container bg-white dark:bg-gray-800 border-2 border-dashed border-blue-300 dark:border-blue-600 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-lg my-6">
      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">${title}</h3>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
            Dynamic Block
          </span>
        </div>
      </div>
      
      <div class="p-4 space-y-4">
         Content Display Area 
        <div class="min-h-[200px] p-4 rounded-lg border bg-gray-50 dark:bg-gray-700 relative overflow-hidden" id="dynamic-content-${payload.id}">
          ${currentBlock ? renderContentBlock(currentBlock) : `
            <div class="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <div class="text-center">
                <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                <p>No content block selected</p>
              </div>
            </div>
          `}
        </div>
        
         Block Selection 
        <div class="space-y-3">
          <h4 class="font-medium text-sm text-gray-900 dark:text-gray-100">Content Blocks (${blocks.length})</h4>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
            ${blocksHTML}
          </div>
        </div>
      </div>
    </div>
  `;
}

// src/components/editor/plugins/ToolbarPlugin/index.tsx
var BlockFormatDropDown = dynamic(
  () => import("./block-format-YJCV2DIY.mjs")
);
var MobileToolbar = dynamic(() => import("./MobileToolbar-BOOZAMQE.mjs"), { ssr: false });
var FontDropDown = dynamic(
  () => import("./font-FEZ3GKSF.mjs")
);
var FontSize = dynamic(
  () => import("./font-size-EK775WRH.mjs")
);
var Color = dynamic(() => import("./color-BPKOPQKN.mjs"));
var BackgroundColor = dynamic(() => import("./background-color-XZTYLGO2.mjs"));
var TextFormat = dynamic(
  () => import("./text-format-BG5WOOPZ.mjs")
);
var InsertNode = dynamic(
  () => import("./insert-node-5P2CRJ7S.mjs")
);
var TextAlign = dynamic(
  () => import("./text-align-VLECWO4H.mjs")
);
function ToolbarPlugin({
  editor,
  activeEditor,
  setActiveEditor,
  setIsLinkEditMode,
  toolbarConfig,
  className
}) {
  const [isEditable, setIsEditable] = useState2(() => editor.isEditable());
  const [isSpeechToText, setIsSpeechToText] = useState2(false);
  const [selectedElementKey, setSelectedElementKey] = useState2(
    null
  );
  const [isFocused, setIsFocused] = useState2(false);
  const { toolbarState, updateToolbarState } = useToolbarState();
  const $updateToolbar = useCallback(() => {
    const currentEditor = activeEditor || editor;
    if (!currentEditor) return;
    currentEditor.read(() => {
      var _a;
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        if (activeEditor !== editor && $isEditorIsNestedEditor(activeEditor)) {
          const rootElement = activeEditor.getRootElement();
          updateToolbarState(
            "isImageCaption",
            !!((_a = rootElement == null ? void 0 : rootElement.parentElement) == null ? void 0 : _a.classList.contains(
              "image-caption-container"
            ))
          );
        } else {
          updateToolbarState("isImageCaption", false);
        }
        const anchorNode = selection.anchor.getNode();
        let element = anchorNode.getKey() === "root" ? anchorNode : $findMatchingParent(anchorNode, (e) => {
          const parent2 = e.getParent();
          return parent2 !== null && $isRootOrShadowRoot(parent2);
        });
        if (element === null) {
          element = anchorNode.getTopLevelElementOrThrow();
        }
        const elementKey = element.getKey();
        const elementDOM = currentEditor.getElementByKey(elementKey);
        const node = getSelectedNode(selection);
        const parent = node.getParent();
        const isLink = $isLinkNode(parent) || $isLineBreakNode(node);
        updateToolbarState("isLink", isLink);
        const tableNode = $findMatchingParent(node, $isTableNode);
        if ($isTableNode(tableNode)) {
          updateToolbarState("rootType", "table");
        } else {
          updateToolbarState("rootType", "root");
        }
        if (elementDOM !== null) {
          setSelectedElementKey(elementKey);
          if ($isListNode(element)) {
            const parentList = $getNearestNodeOfType(anchorNode, ListNode);
            const type = parentList ? parentList.getListType() : element.getListType();
            updateToolbarState("blockType", type);
          } else {
            const type = $isHeadingNode(element) ? element.getTag() : element.getType();
            if (type in blockTypeToBlockName) {
              updateToolbarState(
                "blockType",
                type
              );
            }
            if ($isCodeNode(element)) {
              const language = element.getLanguage();
              updateToolbarState(
                "codeLanguage",
                language ? CODE_LANGUAGE_MAP[language] || language : ""
              );
              return;
            }
          }
        }
        updateToolbarState(
          "fontColor",
          $getSelectionStyleValueForProperty(selection, "color", "#000")
        );
        updateToolbarState(
          "bgColor",
          $getSelectionStyleValueForProperty(
            selection,
            "background-color",
            "#fff"
          )
        );
        updateToolbarState(
          "fontFamily",
          $getSelectionStyleValueForProperty(selection, "font-family", "Arial")
        );
        let matchingParent;
        if ($isLinkNode(parent)) {
          matchingParent = $findMatchingParent(
            node,
            (parentNode) => $isElementNode(parentNode) && !parentNode.isInline()
          );
        }
        updateToolbarState(
          "elementFormat",
          $isElementNode(matchingParent) ? matchingParent.getFormatType() : $isElementNode(node) ? node.getFormatType() : (parent == null ? void 0 : parent.getFormatType()) || "left"
        );
      }
      if ($isRangeSelection(selection) || $isTableSelection(selection)) {
        updateToolbarState("isBold", selection.hasFormat("bold"));
        updateToolbarState("isItalic", selection.hasFormat("italic"));
        updateToolbarState("isUnderline", selection.hasFormat("underline"));
        updateToolbarState("isStrikethrough", selection.hasFormat("strikethrough"));
        updateToolbarState("isSubscript", selection.hasFormat("subscript"));
        updateToolbarState("isSuperscript", selection.hasFormat("superscript"));
        updateToolbarState("isCode", selection.hasFormat("code"));
        updateToolbarState(
          "fontSize",
          $getSelectionStyleValueForProperty(selection, "font-size", "15px")
        );
        updateToolbarState("isLowercase", selection.hasFormat("lowercase"));
        updateToolbarState("isUppercase", selection.hasFormat("uppercase"));
        updateToolbarState("isCapitalize", selection.hasFormat("capitalize"));
      }
    });
  }, [activeEditor, editor, updateToolbarState]);
  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        setActiveEditor(newEditor);
        $updateToolbar();
        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor, $updateToolbar, setActiveEditor]);
  useEffect(() => {
    activeEditor.getEditorState().read(() => {
      $updateToolbar();
    });
  }, [activeEditor, $updateToolbar]);
  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        FOCUS_COMMAND,
        () => {
          setIsFocused(true);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      editor.registerCommand(
        BLUR_COMMAND,
        () => {
          setIsFocused(false);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      editor.registerEditableListener((editable) => {
        setIsEditable(editable);
      }),
      activeEditor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      activeEditor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          updateToolbarState("canUndo", payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      activeEditor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          updateToolbarState("canRedo", payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      )
    );
  }, [$updateToolbar, activeEditor, editor, updateToolbarState]);
  const insertLink = useCallback(() => {
    if (!toolbarState.isLink) {
      setIsLinkEditMode(true);
      activeEditor.dispatchCommand(
        TOGGLE_LINK_COMMAND,
        sanitizeUrl("https://")
      );
    } else {
      setIsLinkEditMode(false);
      activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [activeEditor, setIsLinkEditMode, toolbarState.isLink]);
  const onCodeLanguageSelect = useCallback(
    (value) => {
      activeEditor.update(() => {
        if (selectedElementKey !== null) {
          const node = $getNodeByKey(selectedElementKey);
          if ($isCodeNode(node)) {
            node.setLanguage(value);
          }
        }
      });
    },
    [activeEditor, selectedElementKey]
  );
  const handleDownloadHTML = useCallback(() => {
    try {
      const htmlContent = exportEditorToHTML(activeEditor);
      const timestamp = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace(/:/g, "-");
      downloadHTML(htmlContent, `document-${timestamp}.html`);
    } catch (error) {
      console.error("Failed to export HTML:", error);
    }
  }, [activeEditor]);
  const DEFAULT_TOOLBAR_ITEMS = [
    "undo",
    "redo",
    "separator",
    "block-format",
    "separator",
    "font-family",
    "separator",
    "font-size",
    "separator",
    "bold",
    "italic",
    "underline",
    "code",
    "link",
    "separator",
    "color",
    "bg-color",
    "separator",
    "text-format",
    "separator",
    "insert",
    "separator",
    "align",
    "separator",
    "speech",
    "template",
    "download",
    "separator",
    "export-md",
    "export-pdf"
  ];
  const itemsToRender = (toolbarConfig == null ? void 0 : toolbarConfig.items) || DEFAULT_TOOLBAR_ITEMS;
  const customClassName = (toolbarConfig == null ? void 0 : toolbarConfig.className) || className;
  const itemClassName = toolbarConfig == null ? void 0 : toolbarConfig.itemClassName;
  const activeItemClassName = toolbarConfig == null ? void 0 : toolbarConfig.activeItemClassName;
  const renderItem = (item, index) => {
    switch (item) {
      case "undo":
        return /* @__PURE__ */ React2.createElement(
          Button,
          {
            key: `undo-${index}`,
            size: "Toolbar",
            variant: "outline",
            disabled: !toolbarState.canUndo || !isEditable,
            onClick: () => {
              activeEditor.dispatchCommand(UNDO_COMMAND, void 0);
            },
            tip: false ? "Undo (\u2318Z)" : "Undo (Ctrl+Z)",
            type: "button",
            "aria-label": "Undo",
            className: cn("border-none", itemClassName)
          },
          /* @__PURE__ */ React2.createElement(Undo2Icon, { className: " size-4" })
        );
      case "redo":
        return /* @__PURE__ */ React2.createElement(
          Button,
          {
            key: `redo-${index}`,
            variant: "outline",
            size: "Toolbar",
            disabled: !toolbarState.canRedo || !isEditable,
            onClick: () => {
              activeEditor.dispatchCommand(REDO_COMMAND, void 0);
            },
            tip: false ? "Redo (\u21E7\u2318Z)" : "Redo (Ctrl+Y)",
            type: "button",
            className: cn("toolbar-item border-none", itemClassName),
            "aria-label": "Redo"
          },
          /* @__PURE__ */ React2.createElement(Redo2Icon, { className: " size-4" })
        );
      case "separator":
        return /* @__PURE__ */ React2.createElement(Separator, { key: `sep-${index}`, className: "h-6 mx-2", orientation: "vertical" });
      case "block-format":
        return toolbarState.blockType in blockTypeToBlockName && activeEditor === editor ? /* @__PURE__ */ React2.createElement("div", { key: `block-${index}`, className: "flex flex-row gap-x-[5px] items-center" }, /* @__PURE__ */ React2.createElement(
          BlockFormatDropDown,
          {
            disabled: !isEditable,
            blockType: toolbarState.blockType,
            editor: activeEditor
          }
        )) : null;
      case "font-family":
        return /* @__PURE__ */ React2.createElement(
          FontDropDown,
          {
            key: `font-${index}`,
            disabled: !isEditable,
            style: { fontFamily: toolbarState.fontFamily },
            value: toolbarState.fontFamily,
            editor: activeEditor
          }
        );
      case "font-size":
        return /* @__PURE__ */ React2.createElement(
          FontSize,
          {
            key: `size-${index}`,
            selectionFontSize: toolbarState.fontSize.slice(0, -2),
            editor: activeEditor,
            disabled: !isEditable
          }
        );
      case "bold":
        return /* @__PURE__ */ React2.createElement(
          Toggle,
          {
            key: `bold-${index}`,
            disabled: !isEditable,
            variant: "outline",
            size: "Toolbar",
            pressed: toolbarState.isBold,
            onPressedChange: () => {
              activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
            },
            tip: `Bold ${SHORTCUTS.BOLD}`,
            "aria-label": `Format text as bold. Shortcut: ${SHORTCUTS.BOLD}`,
            className: cn(itemClassName, toolbarState.isBold && activeItemClassName)
          },
          /* @__PURE__ */ React2.createElement(Bold, { size: 16 })
        );
      case "italic":
        return /* @__PURE__ */ React2.createElement(
          Toggle,
          {
            key: `italic-${index}`,
            variant: "outline",
            size: "Toolbar",
            disabled: !isEditable,
            pressed: toolbarState.isItalic,
            onPressedChange: () => {
              activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
            },
            tip: `Italic (${SHORTCUTS.ITALIC})`,
            type: "button",
            "aria-label": `Format text as italics. Shortcut: ${SHORTCUTS.ITALIC}`,
            className: cn(itemClassName, toolbarState.isItalic && activeItemClassName)
          },
          /* @__PURE__ */ React2.createElement(Italic, { size: 16 })
        );
      case "underline":
        return /* @__PURE__ */ React2.createElement(
          Toggle,
          {
            key: `underline-${index}`,
            disabled: !isEditable,
            variant: "outline",
            size: "Toolbar",
            pressed: toolbarState.isUnderline,
            onPressedChange: () => {
              activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
            },
            tip: `Underline (${SHORTCUTS.UNDERLINE})`,
            type: "button",
            "aria-label": `Format text to underlined. Shortcut: ${SHORTCUTS.UNDERLINE}`,
            className: cn(itemClassName, toolbarState.isUnderline && activeItemClassName)
          },
          /* @__PURE__ */ React2.createElement(Underline, { size: 16 })
        );
      case "code":
        return /* @__PURE__ */ React2.createElement(
          Toggle,
          {
            key: `code-${index}`,
            disabled: !isEditable,
            variant: "outline",
            size: "Toolbar",
            pressed: toolbarState.isCode,
            onPressedChange: () => {
              activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "code");
            },
            tip: `Insert code block (${SHORTCUTS.INSERT_CODE_BLOCK})`,
            type: "button",
            "aria-label": "Insert code block",
            className: cn(itemClassName, toolbarState.isCode && activeItemClassName)
          },
          /* @__PURE__ */ React2.createElement(Code, { size: 16 })
        );
      case "link":
        return /* @__PURE__ */ React2.createElement(
          Toggle,
          {
            key: `link-${index}`,
            variant: "outline",
            size: "Toolbar",
            disabled: !isEditable,
            onPressedChange: insertLink,
            pressed: toolbarState.isLink,
            "aria-label": "Insert link",
            tip: `Insert link (${SHORTCUTS.INSERT_LINK})`,
            type: "button",
            className: cn(itemClassName, toolbarState.isLink && activeItemClassName)
          },
          /* @__PURE__ */ React2.createElement(Link, { size: 16 })
        );
      case "color":
        return /* @__PURE__ */ React2.createElement(
          Color,
          {
            key: `color-${index}`,
            disabled: !isEditable,
            color: toolbarState.fontColor,
            bgColor: toolbarState.bgColor,
            editor
          }
        );
      case "bg-color":
        return /* @__PURE__ */ React2.createElement(
          BackgroundColor,
          {
            key: `bg-${index}`,
            disabled: !isEditable,
            color: toolbarState.fontColor,
            bgColor: toolbarState.bgColor,
            editor
          }
        );
      case "text-format":
        return /* @__PURE__ */ React2.createElement(
          TextFormat,
          {
            key: `format-${index}`,
            disabled: !isEditable,
            editor,
            toolbarState
          }
        );
      case "insert":
        return /* @__PURE__ */ React2.createElement(InsertNode, { key: `insert-${index}`, disabled: !isEditable, editor });
      case "align":
        return /* @__PURE__ */ React2.createElement(
          TextAlign,
          {
            key: `align-${index}`,
            disabled: !isEditable,
            value: toolbarState.elementFormat,
            editor: activeEditor,
            isRTL: toolbarState.isRTL
          }
        );
      case "speech":
        return SUPPORT_SPEECH_RECOGNITION ? /* @__PURE__ */ React2.createElement(
          Button,
          {
            key: `speech-${index}`,
            variant: "outline",
            size: "Toolbar",
            type: "button",
            onClick: () => {
              editor.dispatchCommand(SPEECH_TO_TEXT_COMMAND, !isSpeechToText);
              setIsSpeechToText(!isSpeechToText);
            },
            className: cn(
              "relative inline-flex items-center justify-center p-3 rounded-lg border-none font-medium transition-all duration-300 ease-in-out active:scale-95",
              isSpeechToText ? "animate-pulse bg-gray-800" : "bg-transparent hover:bg-gray-900 cursor-pointer shadow-sm hover:shadow-md",
              itemClassName
            ),
            title: "Speech To Text",
            "aria-label": `${isSpeechToText ? "Disable" : "Enable"} speech to text`
          },
          /* @__PURE__ */ React2.createElement(Mic, { className: cn("w-4 h-4 transition-all duration-300", isSpeechToText && "animate-bounce") })
        ) : null;
      case "template":
        return /* @__PURE__ */ React2.createElement(TemplateDialog, { key: `template-${index}` });
      case "download":
        return /* @__PURE__ */ React2.createElement(
          Button,
          {
            key: `download-${index}`,
            variant: "outline",
            size: "Toolbar",
            type: "button",
            onClick: handleDownloadHTML,
            tip: "Download as HTML",
            "aria-label": "Download document as HTML file",
            className: cn("border-none", itemClassName)
          },
          /* @__PURE__ */ React2.createElement(DownloadIcon, { className: "size-4" })
        );
      case "export-md":
        return /* @__PURE__ */ React2.createElement(
          Button,
          {
            key: `md-${index}`,
            variant: "outline",
            size: "Toolbar",
            type: "button",
            onClick: () => {
              editor.dispatchCommand(EXPORT_MARKDOWN_COMMAND, void 0);
            },
            tip: "Export to Markdown",
            "aria-label": "Export document to Markdown",
            className: cn("border-none", itemClassName)
          },
          /* @__PURE__ */ React2.createElement(FileJson, { className: "size-4" })
        );
      case "export-pdf":
        return /* @__PURE__ */ React2.createElement(
          Button,
          {
            key: `pdf-${index}`,
            variant: "outline",
            size: "Toolbar",
            type: "button",
            onClick: () => {
              editor.dispatchCommand(EXPORT_PDF_COMMAND, void 0);
            },
            tip: "Export to PDF",
            "aria-label": "Export document to PDF",
            className: cn("border-none", itemClassName)
          },
          /* @__PURE__ */ React2.createElement(FileText, { className: "size-4" })
        );
      default:
        return null;
    }
  };
  return /* @__PURE__ */ React2.createElement(React2.Fragment, null, /* @__PURE__ */ React2.createElement(
    "nav",
    {
      className: cn(
        "z-40 left-0 w-full hidden md:block"
        // Hide on mobile, show on desktop
      )
    },
    /* @__PURE__ */ React2.createElement("div", { className: "flex justify-center pt-4" }, /* @__PURE__ */ React2.createElement(
      "div",
      {
        className: cn(
          "group flex flex-row items-center bg-background/70 gap-x-2 dark:border dark:border-gray-500/20",
          "md:rounded-2xl rounded-md h-14 px-4 py-2 shadow-md",
          "overflow-x-auto whitespace-nowrap max-w-[90%] scrollbar-none",
          "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
          customClassName
        )
      },
      toolbarState.blockType === "code" ? /* @__PURE__ */ React2.createElement(
        CodeList,
        {
          onCodeLanguageSelect,
          codeLanguage: toolbarState.codeLanguage,
          disabled: !isEditable
        }
      ) : itemsToRender.map((item, index) => renderItem(item, index))
    ))
  ), /* @__PURE__ */ React2.createElement(
    MobileToolbar,
    {
      editor,
      activeEditor,
      toolbarState,
      setIsLinkEditMode,
      isVisible: isFocused,
      toolbarConfig
    }
  ));
}
export {
  ToolbarPlugin as default
};
