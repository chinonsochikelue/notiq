"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { DRAG_DROP_PASTE } from "@lexical/rich-text";
import { isMimeType, mediaFileReader } from "@lexical/utils";
import { COMMAND_PRIORITY_LOW } from "lexical";
import { useEffect } from "react";

import { INSERT_IMAGE_COMMAND } from "../ImagesPlugin";

export const ACCEPTABLE_IMAGE_TYPES = [
  "image/",
  "image/heic",
  "image/heif",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

function formatImageAltText(filename: string): string {
  const base = filename.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ").trim();
  return base || filename;
}

export interface DragDropPasteProps {
  /** Optional async uploader returning a hosted URL; falls back to inline data URL when omitted or failing. */
  onUploadImage?: (file: File) => Promise<string>;
}

export default function DragDropPaste({
  onUploadImage,
}: DragDropPasteProps = {}): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      DRAG_DROP_PASTE,
      (files) => {
        (async () => {
          const imageFiles = files.filter((file) =>
            isMimeType(file, ACCEPTABLE_IMAGE_TYPES)
          );
          if (imageFiles.length === 0) return;

          if (onUploadImage) {
            for (const file of imageFiles) {
              try {
                const uploadedUrl = await onUploadImage(file);
                if (uploadedUrl) {
                  editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                    altText: formatImageAltText(file.name),
                    src: uploadedUrl,
                  });
                  continue;
                }
              } catch {
                // Fall back to local data URL if upload fails
              }
              const fallback = await mediaFileReader([file], ACCEPTABLE_IMAGE_TYPES);
              for (const { file: f, result } of fallback) {
                editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                  altText: formatImageAltText(f.name),
                  src: result,
                });
              }
            }
            return;
          }

          const filesResult = await mediaFileReader(
            imageFiles,
            ACCEPTABLE_IMAGE_TYPES
          );
          for (const { file, result } of filesResult) {
            if (isMimeType(file, ACCEPTABLE_IMAGE_TYPES)) {
              editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                altText: formatImageAltText(file.name),
                src: result,
              });
            }
          }
        })();
        return true;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor, onUploadImage]);

  return null;
}
