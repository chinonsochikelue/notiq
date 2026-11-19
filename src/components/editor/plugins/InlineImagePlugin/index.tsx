/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
"use client"

import type { Position } from "../../nodes/InlineImageNode/InlineImageNode"
import type { JSX } from "react"

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $wrapNodeInElement, mergeRegister } from "@lexical/utils"
import {
  $createParagraphNode,
  $createRangeSelection,
  $getSelection,
  $insertNodes,
  $isNodeSelection,
  $isRootOrShadowRoot,
  $setSelection,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  createCommand,
  DRAGOVER_COMMAND,
  DRAGSTART_COMMAND,
  DROP_COMMAND,
  getDOMSelectionFromTarget,
  isHTMLElement,
  type LexicalCommand,
  type LexicalEditor,
} from "lexical"
import type * as React from "react"
import { useEffect, useRef, useState } from "react"
import { ImagePlus, Link2, Upload, X } from "lucide-react"

import {
  $createInlineImageNode,
  $isInlineImageNode,
  InlineImageNode,
  type InlineImagePayload,
} from "../../nodes/InlineImageNode/InlineImageNode"
import {
  InlineImageCaptionToggle,
  InlineImagePositionPicker,
} from "../../nodes/InlineImageNode/InlineImageComponent"
import { cn } from "../../../../lib/utils"
import { Button } from "../../../ui/button"
import { DialogActions } from "../../../ui/dialog/Dialog"

export type InsertInlineImagePayload = Readonly<InlineImagePayload>

export const INSERT_INLINE_IMAGE_COMMAND: LexicalCommand<InlineImagePayload> =
  createCommand("INSERT_INLINE_IMAGE_COMMAND")

export function InsertInlineImageDialog({
  activeEditor,
  onClose,
}: {
  activeEditor: LexicalEditor
  onClose: () => void
}): JSX.Element {
  const hasModifier = useRef(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [mode, setMode] = useState<"upload" | "url">("upload")
  const [src, setSrc] = useState("")
  const [fileName, setFileName] = useState("")
  const [altText, setAltText] = useState("")
  const [showCaption, setShowCaption] = useState(false)
  const [position, setPosition] = useState<Position>("left")
  const [isDragging, setIsDragging] = useState(false)

  const isDisabled = src.trim() === ""

  const loadImage = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]
    setFileName(file.name)
    if (!altText) {
      setAltText(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " "))
    }
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setSrc(reader.result)
      }
    }
    reader.onerror = () => {
      console.error("Error reading file")
      setSrc("")
      setFileName("")
    }
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    hasModifier.current = false
    const handler = (e: KeyboardEvent) => {
      hasModifier.current = e.altKey
    }
    document.addEventListener("keydown", handler)
    return () => {
      document.removeEventListener("keydown", handler)
    }
  }, [activeEditor])

  const handleOnClick = () => {
    const payload = { altText, position, showCaption, src: src.trim() }
    activeEditor.dispatchCommand(INSERT_INLINE_IMAGE_COMMAND, payload)
    onClose()
  }

  return (
    <div className="space-y-4 w-full max-w-md">
      {/* Source Mode Switcher */}
      <div className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-muted/40 p-1">
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all cursor-pointer",
            mode === "upload"
              ? "bg-background text-foreground shadow-xs ring-1 ring-border"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Upload className="h-3.5 w-3.5" />
          <span>Upload File</span>
        </button>
        <button
          type="button"
          onClick={() => setMode("url")}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all cursor-pointer",
            mode === "url"
              ? "bg-background text-foreground shadow-xs ring-1 ring-border"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Link2 className="h-3.5 w-3.5" />
          <span>From URL</span>
        </button>
      </div>

      {/* Upload Dropzone or URL Input */}
      {mode === "upload" ? (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setIsDragging(false)
            loadImage(e.dataTransfer.files)
          }}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors cursor-pointer",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border/80 bg-muted/20 hover:border-primary/50 hover:bg-muted/40",
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => loadImage(e.target.files)}
            data-test-id="image-modal-file-upload"
            className="sr-only"
          />
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ImagePlus className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-foreground">
              {fileName ? fileName : "Click to upload or drag & drop"}
            </p>
            <p className="text-[11px] text-muted-foreground">
              PNG, JPG, GIF, WebP, or SVG
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          <label
            htmlFor="inline-image-url-input"
            className="block text-xs font-medium text-muted-foreground"
          >
            Image URL
          </label>
          <input
            id="inline-image-url-input"
            type="url"
            placeholder="https://example.com/image.png"
            value={src}
            onChange={(e) => {
              setSrc(e.target.value)
              setFileName("")
            }}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      )}

      {/* Live Preview */}
      {src && (
        <div className="relative flex items-center justify-center rounded-xl border border-border/80 bg-muted/30 p-3 overflow-hidden">
          <img
            src={src}
            alt={altText || "Preview"}
            className="max-h-36 max-w-full rounded-lg object-contain"
          />
          <button
            type="button"
            aria-label="Clear selected image"
            onClick={() => {
              setSrc("")
              setFileName("")
            }}
            className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-background/90 border border-border text-muted-foreground hover:text-foreground shadow-xs cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Alt Text */}
      <div className="space-y-1.5">
        <label
          htmlFor="inline-image-alt-input"
          className="block text-xs font-medium text-muted-foreground"
        >
          Alt Text
        </label>
        <input
          id="inline-image-alt-input"
          type="text"
          placeholder="Descriptive alternative text"
          onChange={(e) => setAltText(e.target.value)}
          value={altText}
          data-test-id="image-modal-alt-text-input"
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Position */}
      <InlineImagePositionPicker value={position} onChange={setPosition} />

      {/* Caption Toggle */}
      <InlineImageCaptionToggle
        id="insert-inline-image-caption"
        checked={showCaption}
        onChange={setShowCaption}
      />

      <DialogActions>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="button"
          data-test-id="image-modal-file-upload-btn"
          disabled={isDisabled}
          onClick={handleOnClick}
        >
          Insert Image
        </Button>
      </DialogActions>
    </div>
  )
}

export default function InlineImagePlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!editor.hasNodes([InlineImageNode])) {
      throw new Error("ImagesPlugin: ImageNode not registered on editor")
    }

    return mergeRegister(
      editor.registerCommand<InsertInlineImagePayload>(
        INSERT_INLINE_IMAGE_COMMAND,
        (payload) => {
          const imageNode = $createInlineImageNode(payload)
          $insertNodes([imageNode])
          if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
            $wrapNodeInElement(imageNode, $createParagraphNode).selectEnd()
          }

          return true
        },
        COMMAND_PRIORITY_EDITOR,
      ),
      editor.registerCommand<DragEvent>(
        DRAGSTART_COMMAND,
        (event) => {
          return $onDragStart(event)
        },
        COMMAND_PRIORITY_HIGH,
      ),
      editor.registerCommand<DragEvent>(
        DRAGOVER_COMMAND,
        (event) => {
          return $onDragover(event)
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand<DragEvent>(
        DROP_COMMAND,
        (event) => {
          return $onDrop(event, editor)
        },
        COMMAND_PRIORITY_HIGH,
      ),
    )
  }, [editor])

  return null
}

const TRANSPARENT_IMAGE = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"

let img: HTMLImageElement | null = null

if (typeof document !== "undefined") {
  img = document.createElement("img")
  img.src = TRANSPARENT_IMAGE
}

function $onDragStart(event: DragEvent): boolean {
  const node = $getImageNodeInSelection()
  if (!node) {
    return false
  }
  const dataTransfer = event.dataTransfer
  if (!dataTransfer) {
    return false
  }
  dataTransfer.setData("text/plain", "_")
  if (img) {
    dataTransfer.setDragImage(img, 0, 0)
  }
  dataTransfer.setData(
    "application/x-lexical-drag",
    JSON.stringify({
      data: {
        altText: node.__altText,
        caption: node.__caption,
        height: node.__height,
        key: node.getKey(),
        position: node.__position,
        showCaption: node.__showCaption,
        src: node.__src,
        width: node.__width,
      },
      type: "image",
    }),
  )

  return true
}

function $onDragover(event: DragEvent): boolean {
  const node = $getImageNodeInSelection()
  if (!node) {
    return false
  }
  if (!canDropImage(event)) {
    event.preventDefault()
  }
  return true
}

function $onDrop(event: DragEvent, editor: LexicalEditor): boolean {
  const node = $getImageNodeInSelection()
  if (!node) {
    return false
  }
  const data = getDragImageData(event)
  if (!data) {
    return false
  }
  event.preventDefault()
  if (canDropImage(event)) {
    const range = getDragSelection(event)
    node.remove()
    const rangeSelection = $createRangeSelection()
    if (range !== null && range !== undefined) {
      rangeSelection.applyDOMRange(range)
    }
    $setSelection(rangeSelection)
    editor.dispatchCommand(INSERT_INLINE_IMAGE_COMMAND, data)
  }
  return true
}

function $getImageNodeInSelection(): InlineImageNode | null {
  const selection = $getSelection()
  if (!$isNodeSelection(selection)) {
    return null
  }
  const nodes = selection.getNodes()
  const node = nodes[0]
  return $isInlineImageNode(node) ? node : null
}

function getDragImageData(event: DragEvent): null | InsertInlineImagePayload {
  const dragData = event.dataTransfer?.getData("application/x-lexical-drag")
  if (!dragData) {
    return null
  }
  const { type, data } = JSON.parse(dragData)
  if (type !== "image") {
    return null
  }

  return data
}

declare global {
  interface DragEvent {
    rangeOffset?: number
    rangeParent?: Node
  }
}

function canDropImage(event: DragEvent): boolean {
  const target = event.target
  return !!(
    isHTMLElement(target) &&
    !target.closest("code, span.editor-image") &&
    isHTMLElement(target.parentElement) &&
    target.parentElement.closest("div.ContentEditable__root")
  )
}

function getDragSelection(event: DragEvent): Range | null | undefined {
  let range
  const domSelection = getDOMSelectionFromTarget(event.target)
  if (document.caretRangeFromPoint) {
    range = document.caretRangeFromPoint(event.clientX, event.clientY)
  } else if (event.rangeParent && domSelection !== null) {
    domSelection.collapse(event.rangeParent, event.rangeOffset || 0)
    range = domSelection.getRangeAt(0)
  } else {
    throw Error("Cannot get the selection when dragging")
  }

  return range
}
