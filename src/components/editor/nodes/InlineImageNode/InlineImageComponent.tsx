"use client"

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import type { InlineImageNode, Position } from "./InlineImageNode"
import type { BaseSelection, LexicalEditor, NodeKey } from "lexical"
import type { JSX } from "react"

import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import { LexicalNestedComposer } from "@lexical/react/LexicalNestedComposer"
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import { useLexicalEditable } from "@lexical/react/useLexicalEditable"
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection"
import { mergeRegister } from "@lexical/utils"
import {
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  $setSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  DRAGSTART_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from "lexical"
import {
  AlignLeft,
  AlignRight,
  Captions,
  ImageOff,
  Maximize2,
  Pencil,
  RotateCcw,
  Trash2,
  ZoomIn,
} from "lucide-react"
import type * as React from "react"
import { Suspense, useCallback, useEffect, useRef, useState } from "react"

import useModal from "../../../../hooks/useModal"
import { cn } from "../../../../lib/utils"
import LinkPlugin from "../../plugins/LinkPlugin"
import LexicalContentEditable from "../../../ui/ContentEditable"
import { Button } from "../../../ui/button"
import { DialogActions } from "../../../ui/dialog/Dialog"
import ImageLightbox from "../../../ui/image/image-lightbox"

const imageCache = new Set<string>()

function useSuspenseImage(src: string) {
  if (!src) return
  if (!imageCache.has(src)) {
    throw new Promise((resolve) => {
      const img = new Image()
      img.src = src
      img.onload = () => {
        imageCache.add(src)
        resolve(null)
      }
      img.onerror = () => {
        imageCache.add(src) // Still cache to prevent infinite retries
        resolve(null)
      }
    })
  }
}

function LazyImage({
  altText,
  className,
  imageRef,
  src,
  width,
  height,
  position,
  onError,
}: {
  altText: string
  className: string | null
  height: "inherit" | number
  imageRef: { current: null | HTMLImageElement }
  src: string
  width: "inherit" | number
  position: Position
  onError?: () => void
}): JSX.Element {
  useSuspenseImage(src)
  return (
    <img
      className={cn(
        "block max-w-full rounded-lg object-contain transition-shadow duration-150",
        className,
      )}
      src={src || "/placeholder.svg"}
      alt={altText}
      ref={imageRef}
      crossOrigin="anonymous"
      data-position={position}
      onError={onError}
      style={{
        height: height === "inherit" ? "auto" : height,
        width:
          width === "inherit"
            ? position === "full"
              ? "100%"
              : "auto"
            : width,
      }}
      draggable="false"
    />
  )
}

const POSITION_OPTIONS: Array<{
  value: Exclude<Position, undefined>
  label: string
  icon: typeof AlignLeft
}> = [
  { value: "left", label: "Left", icon: AlignLeft },
  { value: "right", label: "Right", icon: AlignRight },
  { value: "full", label: "Full Width", icon: Maximize2 },
]

export function InlineImagePositionPicker({
  value,
  onChange,
}: {
  value: Position
  onChange: (next: Exclude<Position, undefined>) => void
}): JSX.Element {
  const active = value ?? "left"
  return (
    <div className="space-y-1.5">
      <span className="block text-xs font-medium text-muted-foreground">
        Position
      </span>
      <div
        role="radiogroup"
        aria-label="Image position"
        className="grid grid-cols-3 gap-1.5 rounded-lg border border-border bg-muted/40 p-1"
      >
        {POSITION_OPTIONS.map((opt) => {
          const Icon = opt.icon
          const isSelected = active === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(opt.value)}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all cursor-pointer",
                isSelected
                  ? "bg-background text-foreground shadow-xs ring-1 ring-border"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50",
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span>{opt.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function InlineImageCaptionToggle({
  id = "inline-image-caption-toggle",
  checked,
  onChange,
}: {
  id?: string
  checked: boolean
  onChange: (checked: boolean) => void
}): JSX.Element {
  return (
    <label
      htmlFor={id}
      className="flex items-center justify-between gap-3 rounded-lg border border-border/80 bg-muted/20 px-3 py-2 cursor-pointer hover:bg-muted/40 transition-colors"
    >
      <span className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Captions className="h-4 w-4 text-muted-foreground" />
        <span>Show Caption</span>
      </span>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <span
        aria-hidden="true"
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-transparent transition-colors",
          checked ? "bg-primary" : "bg-muted-foreground/30",
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 rounded-full bg-background shadow-xs transition-transform",
            checked ? "translate-x-4" : "translate-x-0.5",
          )}
        />
      </span>
    </label>
  )
}

export function UpdateInlineImageDialog({
  activeEditor,
  nodeKey,
  onClose,
}: {
  activeEditor: LexicalEditor
  nodeKey: NodeKey
  onClose: () => void
}): JSX.Element {
  const editorState = activeEditor.getEditorState()
  const node = editorState.read(() => $getNodeByKey(nodeKey) as InlineImageNode | null)
  const [altText, setAltText] = useState(node?.getAltText() ?? "")
  const [showCaption, setShowCaption] = useState(node?.getShowCaption() ?? false)
  const [position, setPosition] = useState<Position>(node?.getPosition() ?? "left")
  const initialWidth = node?.__width
  const [widthInput, setWidthInput] = useState<string>(
    typeof initialWidth === "number" && initialWidth > 0 ? String(initialWidth) : "",
  )

  const src = node?.getSrc() ?? ""

  const handleOnConfirm = () => {
    if (node) {
      activeEditor.update(() => {
        const current = $getNodeByKey(nodeKey) as InlineImageNode | null
        if (!current) return
        current.update({ altText, position, showCaption })
        const parsedWidth = Number(widthInput.trim())
        if (widthInput.trim() === "") {
          current.setWidthAndHeight("inherit", "inherit")
        } else if (Number.isFinite(parsedWidth) && parsedWidth >= 48) {
          current.setWidthAndHeight(Math.round(parsedWidth), "inherit")
        }
      })
    }
    onClose()
  }

  return (
    <div className="space-y-4 w-full max-w-md">
      {src && (
        <div className="flex items-center justify-center rounded-xl border border-border/80 bg-muted/30 p-3 overflow-hidden">
          <img
            src={src}
            alt={altText || "Preview"}
            className="max-h-36 max-w-full rounded-lg object-contain"
          />
        </div>
      )}

      <div className="space-y-1.5">
        <label
          htmlFor="update-inline-image-alt"
          className="block text-xs font-medium text-muted-foreground"
        >
          Alt Text
        </label>
        <input
          id="update-inline-image-alt"
          type="text"
          placeholder="Descriptive alternative text"
          onChange={(e) => setAltText(e.target.value)}
          value={altText}
          data-test-id="image-modal-alt-text-input"
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="update-inline-image-width"
            className="block text-xs font-medium text-muted-foreground"
          >
            Width (px, leave blank for auto)
          </label>
          {widthInput !== "" && (
            <button
              type="button"
              onClick={() => setWidthInput("")}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              Reset Auto
            </button>
          )}
        </div>
        <input
          id="update-inline-image-width"
          type="number"
          min={48}
          max={1600}
          placeholder="Auto"
          value={widthInput}
          onChange={(e) => setWidthInput(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <InlineImagePositionPicker
        value={position}
        onChange={(next) => setPosition(next)}
      />

      <InlineImageCaptionToggle
        id="update-inline-image-caption"
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
          onClick={handleOnConfirm}
        >
          Save Changes
        </Button>
      </DialogActions>
    </div>
  )
}

export default function InlineImageComponent({
  src,
  altText,
  nodeKey,
  width,
  height,
  showCaption,
  caption,
  position,
}: {
  altText: string
  caption: LexicalEditor
  height: "inherit" | number
  nodeKey: NodeKey
  showCaption: boolean
  src: string
  width: "inherit" | number
  position: Position
}): JSX.Element {
  const [modal, showModal] = useModal()
  const imageRef = useRef<null | HTMLImageElement>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey)
  const [editor] = useLexicalComposerContext()
  const [selection, setSelection] = useState<BaseSelection | null>(null)
  const activeEditorRef = useRef<LexicalEditor | null>(null)
  const isEditable = useLexicalEditable()
  const [isLoadError, setIsLoadError] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [liveSize, setLiveSize] = useState<{ width: number; height: number } | null>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  useEffect(() => {
    setIsLoadError(false)
  }, [src])

  const $onEnter = useCallback(
    (event: KeyboardEvent | null) => {
      if (!event) return false
      const latestSelection = $getSelection()
      const buttonElem = buttonRef.current
      if (isSelected && $isNodeSelection(latestSelection) && latestSelection.getNodes().length === 1) {
        if (showCaption) {
          $setSelection(null)
          event.preventDefault()
          caption.focus()
          return true
        } else if (buttonElem !== null && buttonElem !== document.activeElement) {
          event.preventDefault()
          buttonElem.focus()
          return true
        }
      }
      return false
    },
    [caption, isSelected, showCaption],
  )

  const $onEscape = useCallback(
    (event: KeyboardEvent | null) => {
      if (!event) return false
      if (activeEditorRef.current === caption || buttonRef.current === event.target) {
        $setSelection(null)
        editor.update(() => {
          setSelected(true)
          const parentRootElement = editor.getRootElement()
          if (parentRootElement !== null) {
            parentRootElement.focus()
          }
        })
        return true
      }
      return false
    },
    [caption, editor, setSelected],
  )

  useEffect(() => {
    let isMounted = true
    const unregister = mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        if (isMounted) {
          setSelection(editorState.read(() => $getSelection()))
        }
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_, activeEditor) => {
          activeEditorRef.current = activeEditor
          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand<MouseEvent>(
        CLICK_COMMAND,
        (payload) => {
          const event = payload
          if (event.target === imageRef.current) {
            if (event.shiftKey) {
              setSelected(!isSelected)
            } else {
              clearSelection()
              setSelected(true)
            }
            return true
          }

          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        DRAGSTART_COMMAND,
        (event) => {
          if (event.target === imageRef.current) {
            const dataTransfer = event.dataTransfer
            if (dataTransfer) {
              dataTransfer.setData("text/plain", "_")
              if (imageRef.current) {
                dataTransfer.setDragImage(imageRef.current, 0, 0)
              }
            }
            return false
          }
          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(KEY_ENTER_COMMAND, $onEnter, COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_ESCAPE_COMMAND, $onEscape, COMMAND_PRIORITY_LOW),
    )
    return () => {
      isMounted = false
      unregister()
    }
  }, [clearSelection, editor, isSelected, nodeKey, $onEnter, $onEscape, setSelected])

  const draggable = isSelected && $isNodeSelection(selection) && !isResizing && isEditable
  useEffect(() => {
    if (caption && typeof caption.setEditable === "function") {
      caption.setEditable(isEditable)
    }
  }, [caption, isEditable])

  const handleResizePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const img = imageRef.current
    if (!img || !isEditable) return
    e.preventDefault()
    e.stopPropagation()

    const rect = img.getBoundingClientRect()
    const startX = e.clientX
    const startWidth = rect.width || 240
    const aspectRatio =
      img.naturalWidth > 0 && img.naturalHeight > 0
        ? img.naturalWidth / img.naturalHeight
        : rect.width / (rect.height || 1)

    let latestWidth = startWidth
    let latestHeight = startWidth / aspectRatio
    setIsResizing(true)
    setLiveSize({ width: Math.round(latestWidth), height: Math.round(latestHeight) })

    const onPointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX
      latestWidth = Math.min(1200, Math.max(64, startWidth + deltaX))
      latestHeight = latestWidth / aspectRatio
      img.style.width = `${Math.round(latestWidth)}px`
      img.style.height = `${Math.round(latestHeight)}px`
      setLiveSize({ width: Math.round(latestWidth), height: Math.round(latestHeight) })
    }

    const onPointerUp = () => {
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerup", onPointerUp)
      setIsResizing(false)
      setLiveSize(null)
      editor.update(() => {
        const node = $getNodeByKey(nodeKey) as InlineImageNode | null
        if (node) {
          node.setWidthAndHeight(Math.round(latestWidth), Math.round(latestHeight))
        }
      })
    }

    window.addEventListener("pointermove", onPointerMove)
    window.addEventListener("pointerup", onPointerUp)
  }

  const updateNodePosition = (nextPosition: Exclude<Position, undefined>) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey) as InlineImageNode | null
      if (node) {
        node.setPosition(nextPosition)
      }
    })
  }

  const toggleCaption = () => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey) as InlineImageNode | null
      if (node) {
        node.setShowCaption(!showCaption)
      }
    })
  }

  const removeNode = () => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey) as InlineImageNode | null
      if (node) {
        node.remove()
      }
    })
  }

  const isFocused = (isSelected || isResizing) && isEditable

  const positionContainerClass =
    position === "full"
      ? "block w-full my-3"
      : position === "right"
        ? "inline-block align-baseline sm:float-right sm:ml-4 mb-2 max-w-full sm:max-w-[55%]"
        : position === "left"
          ? "inline-block align-baseline sm:float-left sm:mr-4 mb-2 max-w-full sm:max-w-[55%]"
          : "inline-block align-baseline max-w-full"

  return (
    <Suspense fallback={null}>
      <span className={cn("relative group select-none", positionContainerClass)}>
        <span
          draggable={draggable}
          onDoubleClick={() => {
            if (!isLoadError && src) setLightboxOpen(true)
          }}
          onClick={() => {
            if (!isEditable && !isLoadError && src) setLightboxOpen(true)
          }}
          className="relative block"
        >
          {isLoadError ? (
            <span className="flex flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border bg-muted/40 px-5 py-6 text-center text-xs text-muted-foreground min-w-[200px]">
              <ImageOff className="h-5 w-5 text-muted-foreground/70" />
              <span className="font-medium text-foreground/80">
                Image could not be loaded
              </span>
              {altText && (
                <span className="max-w-[220px] truncate text-[11px] opacity-75">
                  {altText}
                </span>
              )}
            </span>
          ) : (
            <LazyImage
              className={
                isFocused
                  ? `ring-2 ring-primary ring-offset-2 ring-offset-background ${
                      $isNodeSelection(selection) ? "cursor-move" : ""
                    }`
                  : "hover:ring-1 hover:ring-border"
              }
              src={src}
              altText={altText}
              imageRef={imageRef}
              width={width}
              height={height}
              position={position}
              onError={() => setIsLoadError(true)}
            />
          )}

          {isEditable && !isResizing && (
            <span
              className={cn(
                "absolute top-2 right-2 z-10 flex items-center gap-0.5 rounded-lg border border-border/80 bg-background/90 p-0.5 shadow-md backdrop-blur-md transition-opacity duration-150",
                isSelected
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100 focus-within:opacity-100",
              )}
            >
              {POSITION_OPTIONS.map((opt) => {
                const Icon = opt.icon
                const active = (position ?? "left") === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    title={`Align ${opt.label}`}
                    aria-label={`Align ${opt.label}`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => {
                      e.stopPropagation()
                      updateNodePosition(opt.value)
                    }}
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-md transition-colors cursor-pointer",
                      active
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </button>
                )
              })}

              <span className="mx-0.5 h-3.5 w-px bg-border/80" />

              <button
                type="button"
                title={showCaption ? "Hide caption" : "Add caption"}
                aria-label={showCaption ? "Hide caption" : "Add caption"}
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.stopPropagation()
                  toggleCaption()
                }}
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-md transition-colors cursor-pointer",
                  showCaption
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Captions className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                title="Preview full size"
                aria-label="Preview full size"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.stopPropagation()
                  setLightboxOpen(true)
                }}
                className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                ref={buttonRef}
                title="Edit inline image"
                aria-label="Edit inline image"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.stopPropagation()
                  showModal("Update Inline Image", (onClose) => (
                    <UpdateInlineImageDialog
                      activeEditor={editor}
                      nodeKey={nodeKey}
                      onClose={onClose}
                    />
                  ))
                }}
                className="flex h-6 items-center gap-1 rounded-md px-1.5 text-[11px] font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <Pencil className="h-3 w-3" />
                <span>Edit</span>
              </button>

              <button
                type="button"
                title="Remove image"
                aria-label="Remove image"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.stopPropagation()
                  removeNode()
                }}
                className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/15 hover:text-destructive transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </span>
          )}

          {isFocused && $isNodeSelection(selection) && !isLoadError && (
            <div
              role="separator"
              aria-label="Resize inline image"
              onPointerDown={handleResizePointerDown}
              className="absolute bottom-1.5 right-1.5 z-20 flex h-4 w-4 items-center justify-center rounded-full border-2 border-background bg-primary shadow-sm cursor-nwse-resize transition-transform hover:scale-110"
            />
          )}

          {liveSize && (
            <span className="absolute bottom-2 left-2 z-20 rounded-md bg-background/90 px-1.5 py-0.5 font-mono text-[10px] font-medium text-foreground shadow-sm border border-border/70">
              {liveSize.width} × {liveSize.height}
            </span>
          )}
        </span>

        {showCaption && (
          <span className="block -mt-6.5 rounded-lg border border-border/60 bg-transparent px-2.5 py-1 transition-colors focus-within:border-primary/40 focus-within:bg-muted/50">
            <LexicalNestedComposer initialEditor={caption}>
              <AutoFocusPlugin />
              <LinkPlugin />
              <RichTextPlugin
                contentEditable={
                  <LexicalContentEditable
                    placeholder={isEditable ? "Write a caption..." : ""}
                    placeholderClassName="text-xs text-muted-foreground/75 pointer-events-none select-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center truncate px-2"
                    className="min-h-6 border-0 resize-none cursor-text block relative outline-none py-1 px-1 select-text text-xs text-muted-foreground text-center leading-relaxed w-full whitespace-pre-wrap break-words"
                  />
                }
                ErrorBoundary={LexicalErrorBoundary}
              />
            </LexicalNestedComposer>
          </span>
        )}
      </span>
      {modal}
      <ImageLightbox
        src={src}
        altText={altText}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </Suspense>
  )
}
