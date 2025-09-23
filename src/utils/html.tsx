import { $getRoot } from "lexical"
import type { LexicalEditor, LexicalNode } from "lexical"
import { $isPollNode, type PollNode } from "@/components/editor/nodes/PollNode"
import {
  $isStoryBuilderNode,
  type StoryBuilderNode,
  type StoryNode,
} from "@/components/editor/nodes/StoryBuilderNode/StoryBuilderNode"
import {
  $isDynamicBlockNode,
  type DynamicBlockNode,
  type DynamicContentBlock,
} from "@/components/editor/nodes/DynamicBlockNode/DynamicBlockNode"

/**
 * Converts the current editor content to HTML string
 */
export function exportEditorToHTML(editor: LexicalEditor): string {
  return editor.getEditorState().read(() => {
    const root = $getRoot()
    const rootElement = editor.getRootElement()

    if (!rootElement) {
      return "<div></div>"
    }

    const htmlContent = ""

    // Walk through all nodes in the editor state
    const processNode = (node: LexicalNode): string => {
      // Check if this is a special decorator node
      const specialHTML = convertSpecialNodeToHTML(node)
      if (specialHTML) {
        return specialHTML
      }

      // For regular nodes, we'll fall back to DOM processing
      return ""
    }

    // Get all top-level nodes
    const children = root.getChildren()
    const specialNodesHTML: string[] = []

    children.forEach((child) => {
      const specialHTML = convertSpecialNodeToHTML(child)
      if (specialHTML) {
        specialNodesHTML.push(specialHTML)
      }
    })

    // Clone the root element to avoid modifying the original
    const clonedElement = rootElement.cloneNode(true) as HTMLElement

    const cleanElement = (element: Element) => {
      // Only remove editor-specific interaction classes, keep visual styling
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
        "ease-in-out",
      )

      // Remove contenteditable and other editor attributes
      element.removeAttribute("contenteditable")
      element.removeAttribute("role")
      element.removeAttribute("spellcheck")
      element.removeAttribute("data-lexical-editor")

      // Recursively clean child elements
      Array.from(element.children).forEach((child) => {
        cleanElement(child)
      })
    }

    cleanElement(clonedElement)

    const regularHTML = clonedElement.innerHTML || "<div></div>"
    const combinedHTML =
      specialNodesHTML.length > 0 ? regularHTML + "\n\n" + specialNodesHTML.join("\n\n") : regularHTML

    return combinedHTML
  })
}

/**
 * Downloads the HTML content as a file
 */
export function downloadHTML(htmlContent: string, filename = "document.html") {
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
            transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
        }
        
        .story-node.hidden {
            display: none;
        }
        
        .story-choice:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
            // Hide all story nodes with fade out effect
            document.querySelectorAll('.story-node').forEach(node => {
                node.style.opacity = '0';
                setTimeout(() => {
                    node.classList.add('hidden');
                }, 150);
            });
            
            // Show target node with fade in effect
            setTimeout(() => {
                const targetNode = document.getElementById('story-node-' + nodeId);
                if (targetNode) {
                    targetNode.classList.remove('hidden');
                    targetNode.style.opacity = '0';
                    targetNode.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    
                    // Fade in the new node
                    setTimeout(() => {
                        targetNode.style.opacity = '1';
                    }, 100);
                }
            }, 200);
        };
        
        window.restartStory = function() {
            // Find the start node
            const startNode = document.querySelector('.story-node[data-node-id]');
            if (startNode) {
                const startNodeId = startNode.getAttribute('data-node-id');
                window.showStoryNode(startNodeId);
            }
        };
        
        // Dynamic block functionality
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
            // Ensure the first story node is visible and others are hidden
            const storyNodes = document.querySelectorAll('.story-node');
            if (storyNodes.length > 0) {
                storyNodes.forEach((node, index) => {
                    if (index === 0) {
                        node.classList.remove('hidden');
                        node.style.opacity = '1';
                    } else {
                        node.classList.add('hidden');
                        node.style.opacity = '0';
                    }
                });
            }
        });
    </script>
</body>
</html>`

  // Create blob and download
  const blob = new Blob([fullHTML], { type: "text/html" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Clean up the URL object
  URL.revokeObjectURL(url)
}

// Converts special Lexical nodes to HTML representations
function convertSpecialNodeToHTML(node: LexicalNode): string | null {
  if ($isPollNode(node)) {
    return convertPollNodeToHTML(node)
  }

  if ($isStoryBuilderNode(node)) {
    return convertStoryBuilderNodeToHTML(node)
  }

  if ($isDynamicBlockNode(node)) {
    return convertDynamicBlockNodeToHTML(node)
  }

  return null
}

function convertPollNodeToHTML(node: PollNode): string {
  const question = node.exportJSON().question
  const options = node.exportJSON().options

  const optionsHTML = options
    .map((option, index) => {
      const totalVotes = options.reduce((sum, opt) => sum + opt.votes.length, 0)
      const votes = option.votes.length
      const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0

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
            ${votes > 0 ? (votes === 1 ? "1 vote" : `${votes} votes`) : ""}
          </span>
          <div class="overflow-hidden ring-0 outline-none bg-transparent border border-gray-300 rounded-md px-3 py-2 w-full">
            ${option.text}
          </div>
        </div>
      </div>
    `
    })
    .join("")

  return `
    <div class="poll-container bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm my-6">
      <div class="p-6 text-center border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100">${question}</h3>
      </div>
      <div class="p-6 space-y-2">
        ${optionsHTML}
      </div>
    </div>
  `
}

function convertStoryBuilderNodeToHTML(node: StoryBuilderNode): string {
  const data = node.exportJSON()
  const { title, nodes } = data

  const startNode = nodes.find((n) => n.isStart) || nodes[0]
  if (!startNode) {
    return `
      <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm my-6 p-6">
        <h3 class="text-xl font-semibold mb-4">${title}</h3>
        <p class="text-gray-600 dark:text-gray-400">No story content available.</p>
      </div>
    `
  }

  const renderStoryNode = (storyNode: StoryNode, index: number): string => {
    const enhancedNode = storyNode as any // Cast to access enhanced properties
    const choicesHTML = storyNode.choices
      .map((choice) => {
        const targetNode = nodes.find((n) => n.id === choice.targetId)
        const enhancedChoice = choice as any // Cast to access enhanced properties
        return `
        <button 
          class="story-choice w-full justify-start text-left h-auto p-6 group transition-all duration-300 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-lg hover:scale-[1.02] mb-3 ${!targetNode ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}"
          onclick="${targetNode ? `window.showStoryNode('${choice.targetId}')` : ""}"
          ${!targetNode ? "disabled" : ""}
        >
          <div class="flex items-start gap-4 w-full">
            <div class="text-2xl">${enhancedChoice.icon || storyNode.icon || "➤"}</div>
            <div class="flex-1">
              <div class="font-semibold text-base group-hover:text-blue-600 transition-colors">
                ${choice.text}
              </div>
              ${
                enhancedChoice.consequence || storyNode.consequence
                  ? `
                <p class="text-sm text-gray-500 mt-1 italic">
                  → ${enhancedChoice.consequence || storyNode.consequence}
                </p>
              `
                  : ""
              }
            </div>
            <svg class="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </div>
        </button>
      `
      })
      .join("")

    // Determine mood styling
    const mood = enhancedNode.mood || "neutral"
    const moodColors = {
      neutral: {
        bg: "bg-gray-50 dark:bg-gray-800",
        border: "border-gray-200 dark:border-gray-700",
        text: "text-gray-900 dark:text-gray-100",
      },
      happy: {
        bg: "bg-yellow-50 dark:bg-yellow-900/20",
        border: "border-yellow-200 dark:border-yellow-700",
        text: "text-yellow-900 dark:text-yellow-100",
      },
      sad: {
        bg: "bg-blue-50 dark:bg-blue-900/20",
        border: "border-blue-200 dark:border-blue-700",
        text: "text-blue-900 dark:text-blue-100",
      },
      mysterious: {
        bg: "bg-purple-50 dark:bg-purple-900/20",
        border: "border-purple-200 dark:border-purple-700",
        text: "text-purple-900 dark:text-purple-100",
      },
      exciting: {
        bg: "bg-orange-50 dark:bg-orange-900/20",
        border: "border-orange-200 dark:border-orange-700",
        text: "text-orange-900 dark:text-orange-100",
      },
      dark: {
        bg: "bg-slate-50 dark:bg-slate-900/20",
        border: "border-slate-200 dark:border-slate-700",
        text: "text-slate-900 dark:text-slate-100",
      },
    }
    const moodStyle = moodColors[mood] || moodColors.neutral

    return `
      <div id="story-node-${storyNode.id}" class="story-node ${storyNode.id !== startNode.id ? "hidden" : ""}" data-node-id="${storyNode.id}">
        ${
          enhancedNode.image
            ? `
          <div class="relative h-64 w-full mb-6 rounded-lg overflow-hidden">
            <img src="${enhancedNode.image}" alt="${storyNode.title}" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          </div>
        `
            : ""
        }
        
        <div class="prose prose-xl max-w-none mb-6">
          <h2 class="text-3xl font-bold mb-6 ${moodStyle.text}">
            ${storyNode.title}
          </h2>
          <div class="text-lg leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            ${storyNode.content}
          </div>
        </div>

        ${
          enhancedNode.tags && enhancedNode.tags.length > 0
            ? `
          <div class="flex flex-wrap gap-2 mb-6">
            ${enhancedNode.tags
              .map(
                (tag) => `
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                #${tag}
              </span>
            `,
              )
              .join("")}
          </div>
        `
            : ""
        }

        ${
          enhancedNode.estimatedReadTime
            ? `
          <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            ${enhancedNode.estimatedReadTime} min read
          </div>
        `
            : ""
        }

        ${
          storyNode.choices.length > 0
            ? `
          <div class="space-y-4 mt-8">
            <h3 class="font-bold text-xl flex items-center gap-2 ${moodStyle.text}">
              <span class="text-blue-600">🎯</span>
              What's your next move?
            </h3>
            <div class="grid gap-3">
              ${choicesHTML}
            </div>
          </div>
        `
            : ""
        }

        ${
          storyNode.isEnd
            ? `
          <div class="text-center py-8 ${moodStyle.bg} ${moodStyle.border} border-2 rounded-2xl mt-8">
            <div class="text-6xl mb-4">🎭</div>
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
        `
            : ""
        }
      </div>
    `
  }

  const allNodesHTML = nodes.map(renderStoryNode).join("")

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
              Interactive Story • ${nodes.length} Chapters
            </p>
          </div>
        </div>
      </div>
      
      <div class="p-8" id="story-container">
        ${allNodesHTML}
      </div>
    </div>
  `
}

function convertDynamicBlockNodeToHTML(node: DynamicBlockNode): string {
  const payload = node.getPayload()
  const { title, blocks, currentBlockId } = payload

  const currentBlock = blocks.find((block) => block.id === currentBlockId) || blocks[0]

  const renderContentBlock = (block: DynamicContentBlock): string => {
    switch (block.type) {
      case "text":
        return `<div class="prose prose-sm max-w-none" ${
          block.styles
            ? `style="${Object.entries(block.styles)
                .map(([k, v]) => `${k}: ${v}`)
                .join("; ")}"`
            : ""
        }>${block.content}</div>`
      case "image":
        return `<img src="${block.content || "/placeholder.svg"}" alt="Dynamic content" class="max-w-full h-auto rounded-lg" ${
          block.styles
            ? `style="${Object.entries(block.styles)
                .map(([k, v]) => `${k}: ${v}`)
                .join("; ")}"`
            : ""
        } />`
      case "video":
        return `<video src="${block.content}" controls class="max-w-full h-auto rounded-lg" ${
          block.styles
            ? `style="${Object.entries(block.styles)
                .map(([k, v]) => `${k}: ${v}`)
                .join("; ")}"`
            : ""
        }></video>`
      case "html":
        return `<div class="w-full" ${
          block.styles
            ? `style="${Object.entries(block.styles)
                .map(([k, v]) => `${k}: ${v}`)
                .join("; ")}"`
            : ""
        }>${block.content}</div>`
      default:
        return '<div class="text-gray-500">Unknown content type</div>'
    }
  }

  const blocksHTML = blocks
    .map(
      (block, index) => `
    <button 
      class="block-selector ${currentBlock?.id === block.id ? "bg-blue-100 border-blue-500" : "bg-gray-50 border-gray-200"} border-2 rounded-lg p-3 text-left transition-all hover:border-blue-400 mb-2"
      onclick="window.showDynamicBlock('${payload.id}', '${block.id}')"
    >
      <div class="font-medium text-xs capitalize">${block.type}</div>
      <div class="text-xs text-gray-500 truncate">
        ${block.content.substring(0, 30)}...
      </div>
    </button>
  `,
    )
    .join("")

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
          ${
            currentBlock
              ? renderContentBlock(currentBlock)
              : `
            <div class="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <div class="text-center">
                <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                <p>No content block selected</p>
              </div>
            </div>
          `
          }
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
  `
}
