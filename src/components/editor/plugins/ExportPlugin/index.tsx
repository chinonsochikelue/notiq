import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $convertToMarkdownString, TRANSFORMERS } from "@lexical/markdown";
import { COMMAND_PRIORITY_LOW, createCommand, LexicalCommand } from "lexical";
import { useEffect } from "react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

export const EXPORT_MARKDOWN_COMMAND: LexicalCommand<void> = createCommand("EXPORT_MARKDOWN_COMMAND");
export const EXPORT_PDF_COMMAND: LexicalCommand<void> = createCommand("EXPORT_PDF_COMMAND");

export default function ExportPlugin(): null {
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
                    link.download = `document-${new Date().toISOString().slice(0, 10)}.md`;
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
                    toPng(rootElement, { cacheBust: true })
                        .then((imgData) => {
                            const pdf = new jsPDF("p", "mm", "a4");
                            const imgProps = pdf.getImageProperties(imgData);
                            const pdfWidth = pdf.internal.pageSize.getWidth();
                            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
                            pdf.save(`document-${new Date().toISOString().slice(0, 10)}.pdf`);
                        })
                        .catch((err) => {
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
