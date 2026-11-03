"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $convertToMarkdownString } from "@lexical/markdown";
import { $getRoot } from "lexical";
import { NOTIQ_TRANSFORMERS } from "../../utils/markdownTransformers";
import { exportEditorToHTML, downloadHTML } from "../../../../utils/htmlExport";
import {
  detectContentFormat,
  importContentToEditor,
  type ImportFormat,
  type ImportMode,
} from "../../utils/importUtils";
import {
  EXPORT_PDF_COMMAND,
} from "./index";
import { Button } from "../../../ui/button";
import { Tabs, TabsList, TabsTrigger } from "../../../ui/tabs";
import {
  FileText,
  FileCode2,
  FileJson,
  Code2,
  File,
  Download,
  Copy,
  Check,
  Upload,
  X,
  ArrowDownUp,
  Sparkles,
  AlertCircle,
  Eye,
  FileUp,
  FileDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "../../../../lib/utils";

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "export" | "import";
  initialImportFile?: File | null;
}

export default function ImportExportModal({
  isOpen,
  onClose,
  defaultTab = "export",
  initialImportFile = null,
}: ImportExportModalProps) {
  const [editor] = useLexicalComposerContext();
  const [activeTab, setActiveTab] = useState<"export" | "import">(defaultTab);

  // Export States
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [previewFormat, setPreviewFormat] = useState<"markdown" | "html" | "json" | "text" | null>(null);
  const [previewContent, setPreviewContent] = useState<string>("");

  // Import States
  const [importSource, setImportSource] = useState<"file" | "paste">("file");
  const [importFile, setImportFile] = useState<File | null>(initialImportFile);
  const [rawText, setRawText] = useState<string>("");
  const [detectedFormat, setDetectedFormat] = useState<ImportFormat>("markdown");
  const [importMode, setImportMode] = useState<ImportMode>("replace");
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const modalBackdropRef = useRef<HTMLDivElement | null>(null);

  // Sync defaultTab
  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      if (initialImportFile) {
        handleFileSelect(initialImportFile);
      }
    }
  }, [isOpen, defaultTab, initialImportFile]);

  // Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Format detection for raw text
  useEffect(() => {
    if (rawText.trim()) {
      setDetectedFormat(detectContentFormat(rawText));
    }
  }, [rawText]);

  // Read file content
  const handleFileSelect = (file: File) => {
    setImportFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) || "";
      setRawText(text);
      setDetectedFormat(detectContentFormat(text, file.name));
    };
    reader.readAsText(file);
  };

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileSelect(file);
    }
  };

  // Perform Document Import
  const handleExecuteImport = () => {
    if (!rawText.trim()) {
      toast.error("Please provide a file or text content to import.");
      return;
    }

    try {
      importContentToEditor(editor, rawText, detectedFormat, importMode);
      toast.success(
        `Imported ${detectedFormat.toUpperCase()} document successfully!`
      );
      onClose();
    } catch (err: any) {
      console.error("[Notiq Import Error]:", err);
      toast.error(`Import failed: ${err?.message || "Invalid file structure"}`);
    }
  };

  // --- Export Actions ---
  const getDocumentMarkdown = (): string => {
    return editor.getEditorState().read(() => {
      return $convertToMarkdownString(NOTIQ_TRANSFORMERS);
    });
  };

  const getDocumentHTML = (): string => {
    return exportEditorToHTML(editor);
  };

  const getDocumentJSON = (): string => {
    return editor.getEditorState().read(() => {
      return JSON.stringify(editor.getEditorState().toJSON(), null, 2);
    });
  };

  const getDocumentText = (): string => {
    return editor.getEditorState().read(() => {
      return $getRoot().getTextContent();
    });
  };

  const handleCopy = (format: "markdown" | "html" | "json" | "text", getter: () => string) => {
    try {
      const content = getter();
      navigator.clipboard.writeText(content);
      setCopiedFormat(format);
      toast.success(`Copied ${format.toUpperCase()} to clipboard!`);
      setTimeout(() => setCopiedFormat(null), 2000);
    } catch {
      toast.error("Failed to copy to clipboard.");
    }
  };

  const handleDownload = (
    filename: string,
    mimeType: string,
    content: string
  ) => {
    try {
      const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${filename}`);
    } catch {
      toast.error("Failed to download file.");
    }
  };

  const timestamp = new Date().toISOString().slice(0, 10);

  const togglePreview = (format: "markdown" | "html" | "json" | "text", getter: () => string) => {
    if (previewFormat === format) {
      setPreviewFormat(null);
      setPreviewContent("");
    } else {
      setPreviewFormat(format);
      setPreviewContent(getter());
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        ref={modalBackdropRef}
        onClick={(e) => {
          if (e.target === modalBackdropRef.current) onClose();
        }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-background/60 backdrop-blur-sm overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 14 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="w-full max-w-2xl bg-card border border-border/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden my-auto max-h-[92vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/60 bg-muted/20">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shadow-2xs">
                <ArrowDownUp className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span>Document Power Tools</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-primary/10 text-primary font-semibold">
                    Import & Export
                  </span>
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  Transform, migrate, and backup your document across multiple formats
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="px-5 pt-3 pb-2 border-b border-border/40 bg-muted/10">
            <Tabs
              value={activeTab}
              onValueChange={(val) => {
                setActiveTab(val as any);
                setPreviewFormat(null);
              }}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 h-9 p-1">
                <TabsTrigger
                  value="export"
                  className="flex items-center gap-2 text-xs font-semibold cursor-pointer"
                >
                  <FileDown className="h-3.5 w-3.5 text-primary" />
                  <span>Export Document</span>
                </TabsTrigger>
                <TabsTrigger
                  value="import"
                  className="flex items-center gap-2 text-xs font-semibold cursor-pointer"
                >
                  <FileUp className="h-3.5 w-3.5 text-blue-500" />
                  <span>Import Document</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {activeTab === "export" ? (
              /* --- EXPORT TAB --- */
              <div className="space-y-3">
                <div className="text-xs text-muted-foreground font-medium">
                  Select an export format to download or copy directly to clipboard:
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* 1. PDF Document */}
                  <div className="border border-border/80 hover:border-red-500/40 rounded-xl p-3 bg-card hover:bg-red-500/5 transition-all group flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-md bg-red-500/10 text-red-600 dark:text-red-400">
                            <FileText className="h-4 w-4" />
                          </span>
                          <span className="font-semibold text-xs text-foreground">
                            PDF Document
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground uppercase">
                          .pdf
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-snug mb-3">
                        High-DPI paginated PDF with smart block boundary breaks and footer.
                      </p>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => {
                        onClose();
                        editor.dispatchCommand(EXPORT_PDF_COMMAND, undefined);
                      }}
                      className="w-full text-xs h-7 gap-1.5 bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                    >
                      <Download className="h-3 w-3" />
                      Generate PDF
                    </Button>
                  </div>

                  {/* 2. Markdown */}
                  <div className="border border-border/80 hover:border-blue-500/40 rounded-xl p-3 bg-card hover:bg-blue-500/5 transition-all group flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            <FileCode2 className="h-4 w-4" />
                          </span>
                          <span className="font-semibold text-xs text-foreground">
                            Markdown (GFM)
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground uppercase">
                          .md
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-snug mb-3">
                        GitHub Flavored Markdown with embeds, math equations, and tables.
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleDownload(
                            `document-${timestamp}.md`,
                            "text/markdown",
                            getDocumentMarkdown()
                          )
                        }
                        className="flex-1 text-xs h-7 gap-1"
                      >
                        <Download className="h-3 w-3" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopy("markdown", getDocumentMarkdown)}
                        className="text-xs h-7 px-2.5"
                        title="Copy Markdown"
                      >
                        {copiedFormat === "markdown" ? (
                          <Check className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => togglePreview("markdown", getDocumentMarkdown)}
                        className={cn(
                          "text-xs h-7 px-2",
                          previewFormat === "markdown" && "bg-muted text-primary"
                        )}
                        title="Inspect preview"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* 3. Standalone HTML */}
                  <div className="border border-border/80 hover:border-orange-500/40 rounded-xl p-3 bg-card hover:bg-orange-500/5 transition-all group flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400">
                            <Code2 className="h-4 w-4" />
                          </span>
                          <span className="font-semibold text-xs text-foreground">
                            Standalone Webpage
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground uppercase">
                          .html
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-snug mb-3">
                        Self-contained offline HTML page with embedded fonts and styling.
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const html = getDocumentHTML();
                          downloadHTML(html, `document-${timestamp}.html`);
                          toast.success("Downloaded standalone HTML");
                        }}
                        className="flex-1 text-xs h-7 gap-1"
                      >
                        <Download className="h-3 w-3" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopy("html", getDocumentHTML)}
                        className="text-xs h-7 px-2.5"
                        title="Copy HTML"
                      >
                        {copiedFormat === "html" ? (
                          <Check className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => togglePreview("html", getDocumentHTML)}
                        className={cn(
                          "text-xs h-7 px-2",
                          previewFormat === "html" && "bg-muted text-primary"
                        )}
                        title="Inspect preview"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* 4. JSON Snapshot State */}
                  <div className="border border-border/80 hover:border-emerald-500/40 rounded-xl p-3 bg-card hover:bg-emerald-500/5 transition-all group flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <FileJson className="h-4 w-4" />
                          </span>
                          <span className="font-semibold text-xs text-foreground">
                            Document Backup State
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground uppercase">
                          .json
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-snug mb-3">
                        Full Lexical AST JSON for lossless restoring or version migration.
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleDownload(
                            `document-${timestamp}.json`,
                            "application/json",
                            getDocumentJSON()
                          )
                        }
                        className="flex-1 text-xs h-7 gap-1"
                      >
                        <Download className="h-3 w-3" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopy("json", getDocumentJSON)}
                        className="text-xs h-7 px-2.5"
                        title="Copy JSON"
                      >
                        {copiedFormat === "json" ? (
                          <Check className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => togglePreview("json", getDocumentJSON)}
                        className={cn(
                          "text-xs h-7 px-2",
                          previewFormat === "json" && "bg-muted text-primary"
                        )}
                        title="Inspect preview"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Collapsible Live Content Inspector */}
                {previewFormat && (
                  <div className="mt-3 p-3 rounded-xl border border-border/80 bg-muted/30 space-y-2 animate-in fade-in-50 duration-150">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <Sparkles className="h-3 w-3 text-primary" />
                        <span>Preview: {previewFormat.toUpperCase()}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setPreviewFormat(null)}
                        className="text-muted-foreground hover:text-foreground text-[10px]"
                      >
                        Hide
                      </button>
                    </div>
                    <pre className="text-[11px] font-mono p-2.5 rounded-lg bg-background border border-border/60 max-h-48 overflow-y-auto whitespace-pre-wrap select-all">
                      {previewContent.slice(0, 3000)}
                      {previewContent.length > 3000 ? "\n\n... (preview truncated)" : ""}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              /* --- IMPORT TAB --- */
              <div className="space-y-4">
                {/* Source Selection Toggle */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setImportSource("file")}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer",
                      importSource === "file"
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Upload File (.md, .json, .html, .txt)
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportSource("paste")}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer",
                      importSource === "paste"
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Paste Raw Text / Code
                  </button>
                </div>

                {importSource === "file" ? (
                  /* Drag & Drop File Zone */
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2",
                      isDragging
                        ? "border-primary bg-primary/5 scale-[1.01]"
                        : "border-border/80 hover:border-primary/50 hover:bg-muted/30"
                    )}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".md,.markdown,.html,.htm,.json,.txt,.lexical"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleFileSelect(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />

                    <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shadow-xs">
                      <Upload className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-foreground">
                        {importFile ? importFile.name : "Click to browse or drag & drop file"}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Supports Markdown (.md), HTML (.html), JSON State (.json), Plain Text (.txt)
                      </p>
                    </div>

                    {importFile && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-[10px] font-mono text-foreground font-medium mt-1">
                        <span>Format: {detectedFormat.toUpperCase()}</span>
                        <span>•</span>
                        <span>{(importFile.size / 1024).toFixed(1)} KB</span>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Raw Paste Textarea */
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-semibold text-foreground">
                        Paste Markdown, HTML, JSON, or Text
                      </label>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-muted font-medium text-foreground">
                        Detected: {detectedFormat.toUpperCase()}
                      </span>
                    </div>
                    <textarea
                      value={rawText}
                      onChange={(e) => setRawText(e.target.value)}
                      placeholder="# Type or paste Markdown or HTML here..."
                      rows={6}
                      className="w-full text-xs font-mono p-3 rounded-xl border border-border/80 bg-background focus:ring-1 focus:ring-primary focus:outline-none resize-none leading-relaxed"
                    />
                  </div>
                )}

                {/* Import Strategy / Mode */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Import Destination
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setImportMode("replace")}
                      className={cn(
                        "p-2.5 rounded-xl border text-left transition-all cursor-pointer",
                        importMode === "replace"
                          ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                          : "border-border/70 hover:border-border text-muted-foreground"
                      )}
                    >
                      <div className="text-xs font-semibold text-foreground">Replace</div>
                      <div className="text-[10px] text-muted-foreground leading-tight">
                        Clear and overwrite document
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setImportMode("append")}
                      className={cn(
                        "p-2.5 rounded-xl border text-left transition-all cursor-pointer",
                        importMode === "append"
                          ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                          : "border-border/70 hover:border-border text-muted-foreground"
                      )}
                    >
                      <div className="text-xs font-semibold text-foreground">Append</div>
                      <div className="text-[10px] text-muted-foreground leading-tight">
                        Add to end of document
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setImportMode("insert")}
                      className={cn(
                        "p-2.5 rounded-xl border text-left transition-all cursor-pointer",
                        importMode === "insert"
                          ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                          : "border-border/70 hover:border-border text-muted-foreground"
                      )}
                    >
                      <div className="text-xs font-semibold text-foreground">Insert at Cursor</div>
                      <div className="text-[10px] text-muted-foreground leading-tight">
                        Insert at caret position
                      </div>
                    </button>
                  </div>
                </div>

                {/* Warning note if replace */}
                {importMode === "replace" && rawText.trim() && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px]">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>
                      Replacing will overwrite current editor content. You can always use Undo (Ctrl+Z) or Version History to restore.
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-border/60 bg-muted/20">
            <span className="text-[11px] text-muted-foreground">
              {activeTab === "export"
                ? "Notiq exports keep all custom blocks & styling intact."
                : `${rawText.length} characters ready to import.`}
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 px-3 text-xs"
              >
                Close
              </Button>

              {activeTab === "import" && (
                <Button
                  size="sm"
                  disabled={!rawText.trim()}
                  onClick={handleExecuteImport}
                  className="h-8 px-4 text-xs gap-1.5 shadow-xs cursor-pointer"
                >
                  <FileUp className="h-3.5 w-3.5" />
                  Import into Editor
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
