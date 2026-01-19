import {
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/components/editor/plugins/ExportPlugin/index.tsx
init_react_shim();
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $convertToMarkdownString, TRANSFORMERS } from "@lexical/markdown";
import { COMMAND_PRIORITY_LOW, createCommand } from "lexical";
import { useEffect } from "react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
var EXPORT_MARKDOWN_COMMAND = createCommand("EXPORT_MARKDOWN_COMMAND");
var EXPORT_PDF_COMMAND = createCommand("EXPORT_PDF_COMMAND");
function ExportPlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    return editor.registerCommand(
      EXPORT_MARKDOWN_COMMAND,
      () => {
        editor.update(() => {
          const markdown = $convertToMarkdownString(TRANSFORMERS);
          const blob = new Blob([markdown], { type: "text/markdown" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `document-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.md`;
          link.click();
          URL.revokeObjectURL(url);
        });
        return true;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor]);
  useEffect(() => {
    return editor.registerCommand(
      EXPORT_PDF_COMMAND,
      () => {
        const rootElement = editor.getRootElement();
        if (rootElement) {
          toPng(rootElement, { cacheBust: true }).then((imgData) => {
            const pdf = new jsPDF("p", "mm", "a4");
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = imgProps.height * pdfWidth / imgProps.width;
            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`document-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.pdf`);
          }).catch((err) => {
            console.error("Failed to export PDF:", err);
          });
        }
        return true;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor]);
  return null;
}

export {
  EXPORT_MARKDOWN_COMMAND,
  EXPORT_PDF_COMMAND,
  ExportPlugin
};
