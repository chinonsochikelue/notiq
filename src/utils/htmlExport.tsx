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

    // Clean up editor-specific classes and attributes
    const cleanElement = (element: Element) => {
      // Remove editor-specific classes
      element.classList.remove(
        "editor-content",
        "relative",
        "z-20",
        "min-h-[80vh]",
        "md:p-12",
        "outline-none",
        "rounded-2xl",
        "focus:outline-none",
        "focus:ring-0",
        "text-foreground",
      )

      // Remove contenteditable and other editor attributes
      element.removeAttribute("contenteditable")
      element.removeAttribute("role")
      element.removeAttribute("spellcheck")
      element.removeAttribute("data-lexical-editor")
      element.removeAttribute("style")

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
  // Create a complete HTML document
  const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exported Document</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        h1, h2, h3, h4, h5, h6 {
            margin-top: 1.5em;
            margin-bottom: 0.5em;
        }
        p {
            margin-bottom: 1em;
        }
        ul, ol {
            margin-bottom: 1em;
            padding-left: 2em;
        }
        blockquote {
            border-left: 4px solid #ddd;
            margin: 1em 0;
            padding-left: 1em;
            color: #666;
        }
        code {
            background-color: #f5f5f5;
            padding: 2px 4px;
            border-radius: 3px;
            font-family: 'Monaco', 'Consolas', monospace;
        }
        pre {
            background-color: #f5f5f5;
            padding: 1em;
            border-radius: 5px;
            overflow-x: auto;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 1em;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f5f5f5;
        }
        img {
            max-width: 100%;
            height: auto;
        }
    </style>
</head>
<body>
    ${htmlContent}
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
