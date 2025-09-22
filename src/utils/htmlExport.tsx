'use client'
import { $getRoot } from "lexical"
import type { LexicalEditor } from "lexical"

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

      // element.removeAttribute("style")

      // Recursively clean child elements
      Array.from(element.children).forEach((child) => {
        cleanElement(child)
      })
    }

    cleanElement(clonedElement)

    // Return the cleaned HTML
    return clonedElement.innerHTML || "<div></div>"
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
