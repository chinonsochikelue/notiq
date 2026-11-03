"use client";

import React, { useState, useCallback } from "react";
import { BlockWithAlignableContents } from "@lexical/react/LexicalBlockWithAlignableContents";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNodeByKey, type ElementFormatType, type NodeKey } from "lexical";
import {
  FileText,
  FileSpreadsheet,
  FileCode,
  FileArchive,
  FileAudio,
  FileVideo,
  File,
  Download,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { cn } from "../../../../lib/utils";
import { $isFileNode } from "./index";

interface FileComponentProps {
  className: Readonly<{
    base: string;
    focus: string;
  }>;
  format: ElementFormatType | null;
  nodeKey: NodeKey;
  url: string;
  title: string;
  size?: string;
  extension?: string;
}

function getFileCategory(ext?: string): {
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  badgeLabel: string;
} {
  const cleanExt = (ext || "").toLowerCase().replace(/^\./, "");

  if (["pdf"].includes(cleanExt)) {
    return {
      icon: FileText,
      colorClass: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
      badgeLabel: "PDF",
    };
  }
  if (["doc", "docx", "txt", "rtf", "odt"].includes(cleanExt)) {
    return {
      icon: FileText,
      colorClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      badgeLabel: cleanExt.toUpperCase() || "DOC",
    };
  }
  if (["xls", "xlsx", "csv", "tsv", "ods"].includes(cleanExt)) {
    return {
      icon: FileSpreadsheet,
      colorClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      badgeLabel: cleanExt.toUpperCase() || "SHEET",
    };
  }
  if (["zip", "rar", "7z", "tar", "gz"].includes(cleanExt)) {
    return {
      icon: FileArchive,
      colorClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      badgeLabel: cleanExt.toUpperCase() || "ARCHIVE",
    };
  }
  if (["js", "ts", "jsx", "tsx", "py", "json", "html", "css", "rs", "go", "cpp", "c"].includes(cleanExt)) {
    return {
      icon: FileCode,
      colorClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      badgeLabel: cleanExt.toUpperCase() || "CODE",
    };
  }
  if (["mp3", "wav", "aac", "ogg", "flac", "m4a"].includes(cleanExt)) {
    return {
      icon: FileAudio,
      colorClass: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
      badgeLabel: cleanExt.toUpperCase() || "AUDIO",
    };
  }
  if (["mp4", "mov", "avi", "mkv", "webm"].includes(cleanExt)) {
    return {
      icon: FileVideo,
      colorClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      badgeLabel: cleanExt.toUpperCase() || "VIDEO",
    };
  }

  return {
    icon: File,
    colorClass: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
    badgeLabel: cleanExt.toUpperCase() || "FILE",
  };
}

export default function FileComponent({
  className,
  format,
  nodeKey,
  url,
  title: initialTitle,
  size: initialSize,
  extension: initialExtension,
}: FileComponentProps) {
  const [editor] = useLexicalComposerContext();
  const [title, setTitle] = useState(initialTitle || "Untitled File");
  const [isEditing, setIsEditing] = useState(false);

  // Derive file extension from url if not provided
  const inferredExtension =
    initialExtension ||
    url.split("?")[0].split("#")[0].split(".").pop() ||
    "file";

  const { icon: Icon, colorClass, badgeLabel } = getFileCategory(inferredExtension);

  const handleTitleBlur = useCallback(() => {
    setIsEditing(false);
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isFileNode(node)) {
        node.setTitle(title);
      }
    });
  }, [editor, nodeKey, title]);

  const handleDelete = () => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (node) {
        node.remove();
      }
    });
  };

  return (
    <BlockWithAlignableContents className={className} format={format} nodeKey={nodeKey}>
      <div className="relative my-3 flex items-center justify-between gap-3 w-full max-w-xl rounded-xl border border-border/80 bg-card/95 p-3 shadow-xs hover:border-primary/50 hover:shadow-sm transition-all select-none group">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* File icon badge */}
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border",
              colorClass
            )}
          >
            <Icon className="h-5 w-5" />
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1">
            {isEditing ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={(e) => e.key === "Enter" && handleTitleBlur()}
                autoFocus
                className="h-7 w-full rounded border border-primary/50 bg-background px-2 text-xs font-medium focus:outline-none"
              />
            ) : (
              <p
                onDoubleClick={() => setIsEditing(true)}
                className="truncate text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
                title="Double click to rename"
              >
                {title}
              </p>
            )}

            <div className="flex items-center gap-2 pt-0.5 text-[11px] text-muted-foreground font-mono">
              <span className="rounded bg-muted px-1.5 py-0.2 font-semibold">
                {badgeLabel}
              </span>
              {initialSize && <span>{initialSize}</span>}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 opacity-85 group-hover:opacity-100 transition-opacity">
          <a
            href={url}
            download={title}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-all"
            title="Download file"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Download</span>
          </a>

          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          <button
            type="button"
            onClick={handleDelete}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            title="Remove attachment"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </BlockWithAlignableContents>
  );
}
