import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $convertToMarkdownString } from "@lexical/markdown";
import { $getRoot, COMMAND_PRIORITY_LOW, createCommand, LexicalCommand } from "lexical";
import { useEffect, useState } from "react";
import { toCanvas } from "html-to-image";
import jsPDF from "jspdf";
import { toast } from "sonner";
import { NOTIQ_TRANSFORMERS } from "../../utils/markdownTransformers";
import { exportEditorToHTML, downloadHTML } from "../../../../utils/htmlExport";
import {
  importMarkdownToEditor,
  importHTMLToEditor,
  importJSONToEditor,
  importPlainTextToEditor,
  type ImportMode,
} from "../../utils/importUtils";
import ImportExportModal from "./ImportExportModal";

export const EXPORT_MARKDOWN_COMMAND: LexicalCommand<void> = createCommand("EXPORT_MARKDOWN_COMMAND");
export const EXPORT_PDF_COMMAND: LexicalCommand<void> = createCommand("EXPORT_PDF_COMMAND");
export const EXPORT_HTML_COMMAND: LexicalCommand<void> = createCommand("EXPORT_HTML_COMMAND");
export const EXPORT_JSON_COMMAND: LexicalCommand<void> = createCommand("EXPORT_JSON_COMMAND");
export const EXPORT_TEXT_COMMAND: LexicalCommand<void> = createCommand("EXPORT_TEXT_COMMAND");

export interface OpenImportExportPayload {
  defaultTab?: "export" | "import";
  initialFile?: File | null;
}

export const OPEN_IMPORT_EXPORT_MODAL_COMMAND: LexicalCommand<OpenImportExportPayload | undefined> =
  createCommand("OPEN_IMPORT_EXPORT_MODAL_COMMAND");

export const IMPORT_MARKDOWN_COMMAND: LexicalCommand<{ content: string; mode?: ImportMode }> =
  createCommand("IMPORT_MARKDOWN_COMMAND");
export const IMPORT_HTML_COMMAND: LexicalCommand<{ content: string; mode?: ImportMode }> =
  createCommand("IMPORT_HTML_COMMAND");
export const IMPORT_JSON_COMMAND: LexicalCommand<{ content: string | object }> =
  createCommand("IMPORT_JSON_COMMAND");
export const IMPORT_TEXT_COMMAND: LexicalCommand<{ content: string; mode?: ImportMode }> =
  createCommand("IMPORT_TEXT_COMMAND");

interface RestoredElement {
  original: HTMLElement;
  replacement: HTMLElement;
  parent: Node;
  nextSibling: Node | null;
}

async function prepareDOMForPDF(rootElement: HTMLElement, isDark: boolean): Promise<() => void> {
  const restoredElements: RestoredElement[] = [];

  // 1. Ensure all <img> tags have crossOrigin set and wait for pending loads
  const images = Array.from(rootElement.querySelectorAll("img"));
  images.forEach((img) => {
    if (!img.crossOrigin) {
      img.crossOrigin = "anonymous";
    }
  });

  const pendingImages = images.filter((img) => !img.complete && img.src);
  if (pendingImages.length > 0) {
    await Promise.all(
      pendingImages.map(
        (img) =>
          new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
            setTimeout(resolve, 1500); // 1.5s max wait
          })
      )
    );
  }

  // 2. Replace cross-origin YouTube, Twitter, and Figma iframes with high-DPI visual cards
  const iframes = Array.from(rootElement.querySelectorAll("iframe"));
  iframes.forEach((iframe) => {
    const parent = iframe.parentNode;
    if (!parent) return;
    const src = iframe.src || iframe.getAttribute("src") || "";

    // A. YouTube
    let ytId: string | null = null;
    const ytContainer = iframe.closest("[data-lexical-youtube]");
    if (ytContainer) {
      ytId = ytContainer.getAttribute("data-lexical-youtube");
    } else {
      const match = src.match(/(?:embed\/|watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      if (match) ytId = match[1];
    }

    if (ytId) {
      const card = document.createElement("div");
      card.className = "notiq-pdf-youtube-card";
      card.style.cssText =
        "width: 100%; aspect-ratio: 16/9; max-width: 650px; margin: 16px auto; background: #000; border-radius: 12px; overflow: hidden; position: relative; border: 3px solid #eab308; box-shadow: 0 4px 16px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;";
      card.innerHTML = `
        <img src="https://img.youtube.com/vi/${ytId}/hqdefault.jpg" crossorigin="anonymous" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.9;" />
        <div style="position: absolute; width: 64px; height: 44px; background: #ff0000; border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0,0,0,0.5);">
          <div style="width: 0; height: 0; border-left: 16px solid #ffffff; border-top: 10px solid transparent; border-bottom: 10px solid transparent; margin-left: 3px;"></div>
        </div>
        <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.85)); padding: 8px 12px; color: #ffffff; font-size: 13px; font-weight: 600; font-family: system-ui, -apple-system, sans-serif; display: flex; justify-content: space-between; align-items: center;">
          <span>▶ YouTube Video</span>
          <span style="opacity: 0.85; font-size: 11px;">https://www.youtube.com/watch?v=${ytId}</span>
        </div>
      `;
      const nextSibling = iframe.nextSibling;
      parent.replaceChild(card, iframe);
      restoredElements.push({ original: iframe, replacement: card, parent, nextSibling });
      return;
    }

    // B. Figma Embeds
    if (src.includes("figma.com")) {
      const card = document.createElement("div");
      card.className = "notiq-pdf-figma-card";
      card.style.cssText = `width: 100%; max-width: 650px; margin: 16px auto; padding: 18px; background: ${
        isDark ? "#18181b" : "#fafafa"
      }; border-radius: 12px; border: 1.5px solid ${
        isDark ? "#3f3f46" : "#e4e4e7"
      }; color: ${isDark ? "#f4f4f5" : "#18181b"}; font-family: system-ui, sans-serif;`;
      card.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
          <span style="font-size: 18px;">📐</span>
          <span style="font-size: 14px; font-weight: 700; color: #f43f5e;">Figma Design</span>
        </div>
        <div style="font-size: 12px; color: #71717a; word-break: break-all;">
          ${src.replace(/&amp;/g, "&")}
        </div>
      `;
      const nextSibling = iframe.nextSibling;
      parent.replaceChild(card, iframe);
      restoredElements.push({ original: iframe, replacement: card, parent, nextSibling });
      return;
    }

    // C. Twitter / X Widget
    if (src.includes("platform.twitter.com") || iframe.closest("[data-lexical-tweet-id]")) {
      const tweetId =
        iframe.closest("[data-lexical-tweet-id]")?.getAttribute("data-lexical-tweet-id") || "";
      const card = document.createElement("div");
      card.className = "notiq-pdf-tweet-card";
      card.style.cssText = `width: 100%; max-width: 520px; margin: 16px auto; padding: 18px; background: ${
        isDark ? "#0f172a" : "#f8fafc"
      }; border-radius: 12px; border: 1.5px solid ${
        isDark ? "#334155" : "#e2e8f0"
      }; color: ${isDark ? "#f8fafc" : "#0f172a"}; font-family: system-ui, sans-serif;`;
      card.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 18px; font-weight: 900;">𝕏</span>
            <span style="font-size: 14px; font-weight: 700;">Post on X</span>
          </div>
          <span style="font-size: 11px; color: #64748b;">${tweetId ? `ID: ${tweetId}` : ""}</span>
        </div>
        <div style="font-size: 12px; color: #0284c7; word-break: break-all;">
          ${tweetId ? `https://x.com/i/web/status/${tweetId}` : "Tweet Embed"}
        </div>
      `;
      const nextSibling = iframe.nextSibling;
      parent.replaceChild(card, iframe);
      restoredElements.push({ original: iframe, replacement: card, parent, nextSibling });
      return;
    }
  });

  // Also replace any empty [data-lexical-tweet-id] containers that didn't render an iframe
  const tweetContainers = Array.from(rootElement.querySelectorAll("[data-lexical-tweet-id]"));
  tweetContainers.forEach((container) => {
    if (container.querySelector(".notiq-pdf-tweet-card")) return;
    const tweetId = container.getAttribute("data-lexical-tweet-id") || "";
    const parent = container.parentNode;
    if (!parent) return;

    const card = document.createElement("div");
    card.className = "notiq-pdf-tweet-card";
    card.style.cssText = `width: 100%; max-width: 520px; margin: 16px auto; padding: 18px; background: ${
      isDark ? "#0f172a" : "#f8fafc"
    }; border-radius: 12px; border: 1.5px solid ${
      isDark ? "#334155" : "#e2e8f0"
    }; color: ${isDark ? "#f8fafc" : "#0f172a"}; font-family: system-ui, sans-serif;`;
    card.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 18px; font-weight: 900;">𝕏</span>
          <span style="font-size: 14px; font-weight: 700;">Post on X</span>
        </div>
        <span style="font-size: 11px; color: #64748b;">${tweetId ? `ID: ${tweetId}` : ""}</span>
      </div>
      <div style="font-size: 12px; color: #0284c7; word-break: break-all;">
        ${tweetId ? `https://x.com/i/web/status/${tweetId}` : "Tweet Embed"}
      </div>
    `;
    const nextSibling = container.nextSibling;
    parent.replaceChild(card, container);
    restoredElements.push({ original: container as HTMLElement, replacement: card, parent, nextSibling });
  });

  // Return restore function
  return () => {
    restoredElements.forEach(({ original, replacement, parent }) => {
      try {
        if (replacement.parentNode === parent) {
          parent.replaceChild(original, replacement);
        }
      } catch (err) {
        console.warn("Failed to restore original DOM element after PDF capture:", err);
      }
    });
  };
}

async function generatePaginatedPDF(rootElement: HTMLElement): Promise<jsPDF> {
  const isDark = document.documentElement.classList.contains("dark");
  const bgColorHex = isDark ? "#0b0f19" : "#ffffff";
  const bgR = isDark ? 11 : 255;
  const bgG = isDark ? 15 : 255;
  const bgB = isDark ? 25 : 255;

  // Prepare DOM elements (replace cross-origin iframes with high-DPI cards & ensure CORS on images)
  const restoreDOM = await prepareDOMForPDF(rootElement, isDark);

  let fullCanvas: HTMLCanvasElement;
  try {
    // 1. High-resolution canvas rendering of the editor content
    fullCanvas = await toCanvas(rootElement, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: bgColorHex,
      imagePlaceholder:
        "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Crect width='18' height='18' x='3' y='3' rx='2' ry='2'/%3E%3Ccircle cx='9' cy='9' r='2'/%3E%3Cpath d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/%3E%3C/svg%3E",
      filter: (node) => {
        if (node instanceof HTMLElement) {
          if (
            node.classList.contains("no-export") ||
            node.classList.contains("AI-format") ||
            node.getAttribute("role") === "tooltip" ||
            node.classList.contains("pointer-events-none")
          ) {
            return false;
          }
        }
        return true;
      },
    });
  } finally {
    // Always restore the interactive DOM elements for the live editor
    restoreDOM();
  }

  const fullWidth = fullCanvas.width;
  const fullHeight = fullCanvas.height;

  // 2. A4 Page Dimensions (mm)
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = 210;
  const pageHeight = 297;
  const marginTop = 16;
  const marginBottom = 20; // Room for clean footer
  const marginLeft = 14;
  const marginRight = 14;

  const printableWidth = pageWidth - marginLeft - marginRight; // 182mm
  const printableHeight = pageHeight - marginTop - marginBottom; // 261mm

  const mmPerPx = printableWidth / fullWidth;
  const maxPageHeightPx = Math.floor(printableHeight / mmPerPx);

  // 3. Collect element boundary coordinates to prevent cutting text in half
  const rootRect = rootElement.getBoundingClientRect();
  const scale = fullHeight / (rootRect.height || 1);

  const breakPoints: number[] = [];
  const candidateElements = rootElement.querySelectorAll(
    "p, h1, h2, h3, h4, h5, h6, blockquote, ul > li, ol > li, table tr, hr, pre, .poll-container, .story-node, .dynamic-block-container"
  );

  candidateElements.forEach((el) => {
    const rect = el.getBoundingClientRect();
    const topPx = Math.round((rect.top - rootRect.top) * scale);
    const bottomPx = Math.round((rect.bottom - rootRect.top) * scale);
    if (topPx > 0 && topPx < fullHeight) breakPoints.push(topPx);
    if (bottomPx > 0 && bottomPx < fullHeight) breakPoints.push(bottomPx);
  });

  const uniqueBreakPoints = Array.from(new Set(breakPoints)).sort((a, b) => a - b);

  // 4. Fallback scanline analyzer for empty whitespace between text lines
  const ctx = fullCanvas.getContext("2d", { willReadFrequently: true });
  function findBlankRowInRange(minY: number, maxY: number): number | null {
    if (!ctx) return null;
    const clampedMinY = Math.max(0, Math.floor(minY));
    const clampedMaxY = Math.min(fullHeight - 1, Math.floor(maxY));
    if (clampedMaxY <= clampedMinY) return null;

    const rowHeight = clampedMaxY - clampedMinY + 1;
    const sampleStartX = Math.floor(fullWidth * 0.2);
    const sampleWidth = Math.floor(fullWidth * 0.6);

    try {
      const imgData = ctx.getImageData(sampleStartX, clampedMinY, sampleWidth, rowHeight);
      const data = imgData.data;

      for (let relY = rowHeight - 1; relY >= 0; relY--) {
        let isBlank = true;
        for (let x = 0; x < sampleWidth; x += 12) {
          const idx = (relY * sampleWidth + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          if (Math.abs(r - bgR) > 12 || Math.abs(g - bgG) > 12 || Math.abs(b - bgB) > 12) {
            isBlank = false;
            break;
          }
        }
        if (isBlank) {
          return clampedMinY + relY;
        }
      }
    } catch {
      // Ignore and fallback
    }
    return null;
  }

  // 5. Intelligent Slice Slicing: Page N+1 starts EXACTLY where Page N ended
  const pageCanvases: { canvas: HTMLCanvasElement; heightMm: number }[] = [];
  let currentY = 0;

  while (currentY < fullHeight) {
    const remainingPx = fullHeight - currentY;
    if (remainingPx <= maxPageHeightPx) {
      // Last page fits completely
      const sliceHeightPx = remainingPx;
      const sliceCanvas = document.createElement("canvas");
      sliceCanvas.width = fullWidth;
      sliceCanvas.height = sliceHeightPx;
      const sCtx = sliceCanvas.getContext("2d");
      if (sCtx) {
        sCtx.fillStyle = bgColorHex;
        sCtx.fillRect(0, 0, fullWidth, sliceHeightPx);
        sCtx.drawImage(fullCanvas, 0, currentY, fullWidth, sliceHeightPx, 0, 0, fullWidth, sliceHeightPx);
      }
      pageCanvases.push({ canvas: sliceCanvas, heightMm: sliceHeightPx * mmPerPx });
      break;
    }

    const idealEndY = currentY + maxPageHeightPx;
    const minSearchY = currentY + Math.floor(maxPageHeightPx * 0.75); // Look in bottom 25% of page
    let chosenBreakY: number | null = null;

    // Search for a DOM break boundary
    for (let i = uniqueBreakPoints.length - 1; i >= 0; i--) {
      const bp = uniqueBreakPoints[i];
      if (bp <= idealEndY && bp >= minSearchY) {
        chosenBreakY = bp;
        break;
      }
    }

    // If no DOM element boundary was found, search for an empty whitespace scanline between lines
    if (!chosenBreakY) {
      chosenBreakY = findBlankRowInRange(idealEndY - 100, idealEndY);
    }

    // Final fallback
    const finalEndY = chosenBreakY && chosenBreakY > currentY + 100 ? chosenBreakY : idealEndY;
    const sliceHeightPx = finalEndY - currentY;

    const sliceCanvas = document.createElement("canvas");
    sliceCanvas.width = fullWidth;
    sliceCanvas.height = sliceHeightPx;
    const sCtx = sliceCanvas.getContext("2d");
    if (sCtx) {
      sCtx.fillStyle = bgColorHex;
      sCtx.fillRect(0, 0, fullWidth, sliceHeightPx);
      sCtx.drawImage(fullCanvas, 0, currentY, fullWidth, sliceHeightPx, 0, 0, fullWidth, sliceHeightPx);
    }
    pageCanvases.push({ canvas: sliceCanvas, heightMm: sliceHeightPx * mmPerPx });

    // Advance currentY by the exact slice height so no pixels are duplicated
    currentY = finalEndY;
  }

  // 6. Draw each sliced canvas with seamless background & uncolliding footer
  const totalPages = pageCanvases.length;
  pageCanvases.forEach((pageItem, index) => {
    if (index > 0) {
      pdf.addPage();
    }

    // Fill entire page background color so margins & footer are unified
    pdf.setFillColor(bgR, bgG, bgB);
    pdf.rect(0, 0, pageWidth, pageHeight, "F");

    // Add crisp page slice image
    const imgData = pageItem.canvas.toDataURL("image/png");
    pdf.addImage(
      imgData,
      "PNG",
      marginLeft,
      marginTop,
      printableWidth,
      pageItem.heightMm,
      undefined,
      "FAST"
    );

    // Add page number footer with ample buffer
    pdf.setFontSize(8);
    pdf.setTextColor(isDark ? 160 : 130, isDark ? 160 : 130, isDark ? 160 : 130);
    pdf.text(
      `Page ${index + 1} of ${totalPages}  •  Exported from Notiq`,
      pageWidth / 2,
      pageHeight - 8,
      { align: "center" }
    );
  });

  return pdf;
}

export default function ExportPlugin(): React.JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"export" | "import">("export");
  const [initialFile, setInitialFile] = useState<File | null>(null);

  // 1. Open Import/Export Modal Command & Window Event
  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent<{ defaultTab?: "export" | "import" }>;
      setModalTab(customEvent.detail?.defaultTab || "export");
      setInitialFile(null);
      setIsModalOpen(true);
    };

    window.addEventListener("notiq:open-import-export", handleOpen);

    const unregister = editor.registerCommand(
      OPEN_IMPORT_EXPORT_MODAL_COMMAND,
      (payload) => {
        setModalTab(payload?.defaultTab || "export");
        setInitialFile(payload?.initialFile || null);
        setIsModalOpen(true);
        return true;
      },
      COMMAND_PRIORITY_LOW
    );

    return () => {
      window.removeEventListener("notiq:open-import-export", handleOpen);
      unregister();
    };
  }, [editor]);

  // 2. Keyboard shortcuts: Ctrl+Shift+E (Export) and Ctrl+Shift+I (Import)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
        if (e.key === "E" || e.key === "e") {
          e.preventDefault();
          setModalTab("export");
          setInitialFile(null);
          setIsModalOpen(true);
        } else if (e.key === "I" || e.key === "i") {
          e.preventDefault();
          setModalTab("import");
          setInitialFile(null);
          setIsModalOpen(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 3. Native File Drag-and-Drop on Editor Canvas
  useEffect(() => {
    const rootElement = editor.getRootElement();
    if (!rootElement) return;

    const handleDragOver = (e: DragEvent) => {
      if (e.dataTransfer?.types.includes("Files")) {
        e.preventDefault();
      }
    };

    const handleDrop = (e: DragEvent) => {
      const files = e.dataTransfer?.files;
      if (!files || files.length === 0) return;

      const file = files[0];
      const name = file.name.toLowerCase();
      const isDocumentFile =
        name.endsWith(".md") ||
        name.endsWith(".markdown") ||
        name.endsWith(".html") ||
        name.endsWith(".htm") ||
        name.endsWith(".json") ||
        name.endsWith(".lexical") ||
        name.endsWith(".txt");

      if (isDocumentFile) {
        e.preventDefault();
        e.stopPropagation();
        setModalTab("import");
        setInitialFile(file);
        setIsModalOpen(true);
      }
    };

    rootElement.addEventListener("dragover", handleDragOver);
    rootElement.addEventListener("drop", handleDrop);

    return () => {
      rootElement.removeEventListener("dragover", handleDragOver);
      rootElement.removeEventListener("drop", handleDrop);
    };
  }, [editor]);

  // 4. Markdown Export Command
  useEffect(() => {
    return editor.registerCommand(
      EXPORT_MARKDOWN_COMMAND,
      () => {
        try {
          editor.getEditorState().read(() => {
            const markdown = $convertToMarkdownString(NOTIQ_TRANSFORMERS);
            const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            const timestamp = new Date().toISOString().slice(0, 10);
            link.href = url;
            link.download = `document-${timestamp}.md`;
            link.click();
            URL.revokeObjectURL(url);
            toast.success("Document exported as Markdown (.md)");
          });
        } catch (err) {
          console.error("[Notiq Export MD Error]:", err);
          toast.error("Failed to export Markdown.");
        }
        return true;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor]);

  // 5. High-Quality Multi-Page PDF Export Command
  useEffect(() => {
    return editor.registerCommand(
      EXPORT_PDF_COMMAND,
      () => {
        const rootElement = editor.getRootElement();
        if (!rootElement) {
          toast.error("Document content not found for PDF export.");
          return true;
        }

        const toastId = toast.loading("Generating print-ready PDF...");

        generatePaginatedPDF(rootElement)
          .then((pdf) => {
            const timestamp = new Date().toISOString().slice(0, 10);
            pdf.save(`document-${timestamp}.pdf`);
            toast.success("PDF document exported successfully!", { id: toastId });
          })
          .catch((err) => {
            console.error("[Notiq Export PDF Error]:", err);
            toast.error("Failed to generate PDF. Please try again.", { id: toastId });
          });

        return true;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor]);

  // 6. Standalone HTML Export Command
  useEffect(() => {
    return editor.registerCommand(
      EXPORT_HTML_COMMAND,
      () => {
        try {
          const htmlContent = exportEditorToHTML(editor);
          const timestamp = new Date().toISOString().slice(0, 10);
          downloadHTML(htmlContent, `document-${timestamp}.html`);
          toast.success("Standalone HTML document exported!");
        } catch (err) {
          console.error("[Notiq Export HTML Error]:", err);
          toast.error("Failed to export HTML.");
        }
        return true;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor]);

  // 7. JSON State Export Command
  useEffect(() => {
    return editor.registerCommand(
      EXPORT_JSON_COMMAND,
      () => {
        try {
          editor.getEditorState().read(() => {
            const jsonStr = JSON.stringify(editor.getEditorState().toJSON(), null, 2);
            const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            const timestamp = new Date().toISOString().slice(0, 10);
            link.href = url;
            link.download = `document-backup-${timestamp}.json`;
            link.click();
            URL.revokeObjectURL(url);
            toast.success("Document state exported as JSON (.json)");
          });
        } catch (err) {
          console.error("[Notiq Export JSON Error]:", err);
          toast.error("Failed to export JSON state.");
        }
        return true;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor]);

  // 8. Plain Text Export Command
  useEffect(() => {
    return editor.registerCommand(
      EXPORT_TEXT_COMMAND,
      () => {
        try {
          editor.getEditorState().read(() => {
            const text = $getRoot().getTextContent();
            const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            const timestamp = new Date().toISOString().slice(0, 10);
            link.href = url;
            link.download = `document-${timestamp}.txt`;
            link.click();
            URL.revokeObjectURL(url);
            toast.success("Document exported as Plain Text (.txt)");
          });
        } catch (err) {
          console.error("[Notiq Export Text Error]:", err);
          toast.error("Failed to export plain text.");
        }
        return true;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor]);

  // 9. Import Markdown Command
  useEffect(() => {
    return editor.registerCommand(
      IMPORT_MARKDOWN_COMMAND,
      ({ content, mode }) => {
        try {
          importMarkdownToEditor(editor, content, mode || "replace");
          toast.success("Markdown content imported successfully");
        } catch (err) {
          console.error("[Notiq Import Markdown Error]:", err);
          toast.error("Failed to import Markdown.");
        }
        return true;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor]);

  // 10. Import HTML Command
  useEffect(() => {
    return editor.registerCommand(
      IMPORT_HTML_COMMAND,
      ({ content, mode }) => {
        try {
          importHTMLToEditor(editor, content, mode || "replace");
          toast.success("HTML content imported successfully");
        } catch (err) {
          console.error("[Notiq Import HTML Error]:", err);
          toast.error("Failed to import HTML.");
        }
        return true;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor]);

  // 11. Import JSON Command
  useEffect(() => {
    return editor.registerCommand(
      IMPORT_JSON_COMMAND,
      ({ content }) => {
        try {
          importJSONToEditor(editor, content);
          toast.success("Document JSON state imported successfully");
        } catch (err) {
          console.error("[Notiq Import JSON Error]:", err);
          toast.error("Failed to import JSON state.");
        }
        return true;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor]);

  // 12. Import Text Command
  useEffect(() => {
    return editor.registerCommand(
      IMPORT_TEXT_COMMAND,
      ({ content, mode }) => {
        try {
          importPlainTextToEditor(editor, content, mode || "replace");
          toast.success("Plain text imported successfully");
        } catch (err) {
          console.error("[Notiq Import Text Error]:", err);
          toast.error("Failed to import plain text.");
        }
        return true;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor]);

  return (
    <ImportExportModal
      isOpen={isModalOpen}
      onClose={() => {
        setIsModalOpen(false);
        setInitialFile(null);
      }}
      defaultTab={modalTab}
      initialImportFile={initialFile}
    />
  );
}
