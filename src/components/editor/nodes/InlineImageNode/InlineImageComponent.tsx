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
import type * as React from "react"
import { Suspense, useCallback, useEffect, useRef, useState } from "react"

import useModal from "../../../../hooks/useModal"
import LinkPlugin from "../../plugins/LinkPlugin"
import TextInput from "@/components/ui/TextInput"
import Select from "@/components/ui/Select"
import { DialogActions } from "@/components/ui/dialog/Dialog"
import LexicalContentEditable from "@/components/ui/ContentEditable"
import { Button } from "@/components/ui/button"

const imageCache = new Set()

function useSuspenseImage(src: string) {
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
}: {
  altText: string
  className: string | null
  height: "inherit" | number
  imageRef: { current: null | HTMLImageElement }
  src: string
  width: "inherit" | number
  position: Position
}): JSX.Element {
  useSuspenseImage(src)
  return (
    <img
      className={`block ${className || ""}`}
      src={src || "/placeholder.svg"}
      alt={altText}
      ref={imageRef}
      data-position={position}
      style={{
        height,
        width,
      }}
      draggable="false"
    />
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
  const node = editorState.read(() => $getNodeByKey(nodeKey) as InlineImageNode)
  const [altText, setAltText] = useState(node.getAltText())
  const [showCaption, setShowCaption] = useState(node.getShowCaption())
  const [position, setPosition] = useState<Position>(node.getPosition())

  const handleShowCaptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowCaption(e.target.checked)
  }

  const handlePositionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPosition(e.target.value as Position)
  }

  const handleOnConfirm = () => {
    const payload = { altText, position, showCaption }
    if (node) {
      activeEditor.update(() => {
        node.update(payload)
      })
    }
    onClose()
  }

  return (
    <>
      <div className="mb-4">
        <TextInput
          label="Alt Text"
          placeholder="Descriptive alternative text"
          onChange={setAltText}
          value={altText}
          data-test-id="image-modal-alt-text-input"
        />
      </div>

      <Select
        className="mb-4 w-52"
        value={position}
        label="Position"
        name="position"
        id="position-select"
        onChange={handlePositionChange}
      >
        <option value="left">Left</option>
        <option value="right">Right</option>
        <option value="full">Full Width</option>
      </Select>

      <div className="flex items-center space-x-2 mb-4">
        <input
          id="caption"
          type="checkbox"
          checked={showCaption}
          onChange={handleShowCaptionChange}
          className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-ring focus:ring-2"
        />
        <label htmlFor="caption" className="text-sm font-medium text-foreground cursor-pointer">
          Show Caption
        </label>
      </div>

      <DialogActions>
        <Button data-test-id="image-modal-file-upload-btn" onClick={() => handleOnConfirm()}>
          Confirm
        </Button>
      </DialogActions>
    </>
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

  const $onEnter = useCallback(
    (event: KeyboardEvent) => {
      const latestSelection = $getSelection()
      const buttonElem = buttonRef.current
      if (isSelected && $isNodeSelection(latestSelection) && latestSelection.getNodes().length === 1) {
        if (showCaption) {
          // Move focus into nested editor
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
    (event: KeyboardEvent) => {
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
            // Fix for Firefox: Ensure dataTransfer is set so the element is draggable
            // and doesn't trigger the browser's default image dragging behavior.
            const dataTransfer = event.dataTransfer
            if (dataTransfer) {
              dataTransfer.setData("text/plain", "_")
              // Optionally set drag image if needed, or rely on default
              if (imageRef.current) {
                dataTransfer.setDragImage(imageRef.current, 0, 0)
              }
            }
            return false // Allow propagation so Lexical handles the drag
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

  const draggable = isSelected && $isNodeSelection(selection)
  const isFocused = isSelected && isEditable

  return (
    <Suspense fallback={null}>
      <>
        <span draggable={draggable} className="relative inline-block">
          {isEditable && (
            <button
              className="absolute top-2 right-2 z-10 px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
              ref={buttonRef}
              onClick={() => {
                showModal("Update Inline Image", (onClose) => (
                  <UpdateInlineImageDialog activeEditor={editor} nodeKey={nodeKey} onClose={onClose} />
                ))
              }}
            >
              Edit
            </button>
          )}
          <LazyImage
            className={
              isFocused ? `ring-2 ring-ring ring-offset-2 ${$isNodeSelection(selection) ? "cursor-move" : ""}` : null
            }
            src={src}
            altText={altText}
            imageRef={imageRef}
            width={width}
            height={height}
            position={position}
          />
        </span>
        {showCaption && (
          <span className="block mt-2 p-2 border border-border rounded-md bg-muted/50">
            <LexicalNestedComposer initialEditor={caption}>
              <AutoFocusPlugin />
              <LinkPlugin />
              <RichTextPlugin
                contentEditable={
                  <LexicalContentEditable
                    placeholder="Enter a caption..."
                    placeholderClassName="text-xs text-muted-foreground absolute bottom-2.5 left-2.5 pointer-events-none select-none whitespace-nowrap inline-block overflow-hidden text-ellipsis"
                    className="min-h-5 border-0 resize-none cursor-text block relative outline-none p-2.5 select-text text-sm leading-relaxed w-full whitespace-pre-wrap break-words"
                  />
                }
                ErrorBoundary={LexicalErrorBoundary}
              />
            </LexicalNestedComposer>
          </span>
        )}
      </>
      {modal}
    </Suspense>
  )
}
