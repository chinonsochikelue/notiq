"use client";

import React, { useState } from "react";
import type { LexicalEditor } from "lexical";
import { INSERT_FILE_COMMAND } from "../../editor/nodes/FileNode";
import { FileText, UploadCloud, Sparkles, Link as LinkIcon } from "lucide-react";
import { Button } from "../button";
import { Input } from "../input";
import { Label } from "../label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs";

const SAMPLE_FILES = [
  {
    title: "Q4_Product_Roadmap.pdf",
    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    size: "1.4 MB",
    extension: "pdf",
  },
  {
    title: "API_Specification_v2.json",
    url: "https://raw.githubusercontent.com/OAI/OpenAPI-Specification/main/examples/v3.0/petstore.json",
    size: "420 KB",
    extension: "json",
  },
  {
    title: "Quarterly_Financial_Report.xlsx",
    url: "https://file-examples.com/wp-content/storage/2017/02/file_example_XLSX_10.xlsx",
    size: "2.8 MB",
    extension: "xlsx",
  },
];

export function InsertFileDialog({
  activeEditor,
  onClose,
}: {
  activeEditor: LexicalEditor;
  onClose: () => void;
}) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [size, setSize] = useState("");

  const handleInsert = (
    fileUrl: string,
    fileTitle?: string,
    fileSize?: string,
    fileExt?: string
  ) => {
    if (!fileUrl.trim()) return;
    const inferredExt =
      fileExt ||
      fileUrl.split("?")[0].split("#")[0].split(".").pop() ||
      "file";

    activeEditor.dispatchCommand(INSERT_FILE_COMMAND, {
      url: fileUrl.trim(),
      title: fileTitle?.trim() || "Attached File",
      size: fileSize?.trim() || "File",
      extension: inferredExt,
    });
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    const fileName = file.name;
    const fileExt = fileName.split(".").pop() || "";
    const formattedSize =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    handleInsert(fileUrl, fileName, formattedSize, fileExt);
  };

  return (
    <div className="w-full max-w-md p-2 space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <FileText className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Attach File</h3>
          <p className="text-xs text-muted-foreground">
            Embed a downloadable document card into your page
          </p>
        </div>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid grid-cols-3 w-full h-8 text-xs">
          <TabsTrigger value="upload" className="text-xs">Upload File</TabsTrigger>
          <TabsTrigger value="url" className="text-xs">Link / URL</TabsTrigger>
          <TabsTrigger value="samples" className="text-xs">Demo Samples</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-3 pt-3">
          <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-xl hover:border-primary/60 transition-colors cursor-pointer bg-muted/20">
            <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-xs font-semibold text-foreground">Click to upload document</span>
            <span className="text-[11px] text-muted-foreground">
              PDF, Word, Excel, ZIP, Code, or any file
            </span>
            <input
              type="file"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </TabsContent>

        <TabsContent value="url" className="space-y-3 pt-3">
          <div className="space-y-1">
            <Label htmlFor="file-url" className="text-xs">Document URL</Label>
            <div className="relative">
              <LinkIcon className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                id="file-url"
                placeholder="https://example.com/document.pdf"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pl-8 text-xs h-8"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="file-title" className="text-xs">Display Title</Label>
              <Input
                id="file-title"
                placeholder="e.g. Annual Report.pdf"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xs h-8"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="file-size" className="text-xs">Size (Optional)</Label>
              <Input
                id="file-size"
                placeholder="e.g. 2.4 MB"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="text-xs h-8"
              />
            </div>
          </div>

          <Button
            onClick={() => handleInsert(url, title, size)}
            disabled={!url.trim()}
            className="w-full text-xs h-8"
          >
            Attach Document
          </Button>
        </TabsContent>

        <TabsContent value="samples" className="space-y-2 pt-3">
          <p className="text-xs text-muted-foreground">Click any document to attach instantly:</p>
          <div className="space-y-1.5">
            {SAMPLE_FILES.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleInsert(sample.url, sample.title, sample.size, sample.extension)}
                className="w-full flex items-center justify-between p-2 rounded-lg border border-border/70 hover:border-primary/50 hover:bg-muted/50 transition-all text-left group"
              >
                <div>
                  <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                    {sample.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{sample.size} • {sample.extension.toUpperCase()}</p>
                </div>
                <Sparkles className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
              </button>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
export default InsertFileDialog;
