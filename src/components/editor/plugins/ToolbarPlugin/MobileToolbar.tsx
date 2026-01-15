"use client"

import React, { useEffect, useState } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import {
    $getSelection,
    $isRangeSelection,
    FORMAT_TEXT_COMMAND,
    REDO_COMMAND,
    UNDO_COMMAND,
    SELECTION_CHANGE_COMMAND,
    COMMAND_PRIORITY_CRITICAL,
} from "lexical"
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Undo2,
    Redo2,
    Heading1,
    Heading2,
    List,
    ListOrdered,
    Link as LinkIcon,
    Code,
    Quote,
    CheckSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToolbarState } from "@/components/providers/ToolbarContext"
import { TOGGLE_LINK_COMMAND } from "@lexical/link"
import { sanitizeUrl } from "../../utils/url"
import {
    INSERT_ORDERED_LIST_COMMAND,
    INSERT_UNORDERED_LIST_COMMAND,
    INSERT_CHECK_LIST_COMMAND,
} from "@lexical/list"
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text"
import { $setBlocksType } from "@lexical/selection"

export default function MobileToolbar({
    editor,
    activeEditor,
    toolbarState,
    setIsLinkEditMode,
    isVisible,
}: {
    editor: any
    activeEditor: any
    toolbarState: any
    setIsLinkEditMode: (mode: boolean) => void
    isVisible: boolean
}) {
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)
    const [bottomOffset, setBottomOffset] = useState(0)

    useEffect(() => {
        // Visual Viewport logic to position toolbar above keyboard
        const visualViewport = window.visualViewport

        const handleResize = () => {
            if (!visualViewport) return

            const windowHeight = window.innerHeight
            const viewportHeight = visualViewport.height
            const offsetTop = visualViewport.offsetTop

            // If viewport is significantly smaller than window, keyboard is likely open
            // or browser chrome is showing.

            // Calculate where the bottom of the viewport is relative to the layout viewport
            const viewportBottom = offsetTop + viewportHeight
            const diff = windowHeight - viewportBottom

            // Update offset to stick to bottom of visual viewport
            // If the browser resizes the layout viewport (resize-content), diff might be 0
            // but bottom:0 works fine then.
            // If overlay, diff > 0.

            setBottomOffset(Math.max(0, diff))
            setIsKeyboardOpen(viewportHeight < windowHeight * 0.85)
        }

        if (visualViewport) {
            visualViewport.addEventListener("resize", handleResize)
            visualViewport.addEventListener("scroll", handleResize)
            // Initial check
            handleResize()
        }

        return () => {
            if (visualViewport) {
                visualViewport.removeEventListener("resize", handleResize)
                visualViewport.removeEventListener("scroll", handleResize)
            }
        }
    }, [])

    const ToolbarButton = ({
        onClick,
        isActive,
        icon: Icon,
        label,
    }: {
        onClick: () => void
        isActive?: boolean
        icon: any
        label: string
    }) => (
        <button
            onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onClick()
            }}
            className={cn(
                "flex items-center justify-center min-w-[36px] h-9 rounded-xl transition-all duration-200 active:scale-95 touch-manipulation",
                isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            )}
            aria-label={label}
        >
            <Icon className="w-5 h-5 stroke-[2.5]" />
        </button>
    )

    const formatHeading = (headingLevel: "h1" | "h2") => {
        activeEditor.update(() => {
            const selection = $getSelection()
            if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createHeadingNode(headingLevel))
            }
        })
    }

    const formatQuote = () => {
        activeEditor.update(() => {
            const selection = $getSelection()
            if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createQuoteNode())
            }
        })
    }

    return (
        <div
            className={cn(
                "fixed left-0 w-full z-50 md:hidden transition-all duration-300 ease-out",
                isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
            )}
            style={{
                bottom: `${bottomOffset}px`,
            }}
        >
            <div
                className={cn(
                    "w-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-800/50 pointer-events-auto",
                    "pb-[env(safe-area-inset-bottom)]",
                )}
                onMouseDown={(e) => {
                    // Prevent focus loss
                    if (e.target instanceof Element && e.target.tagName !== 'INPUT') {
                        e.preventDefault()
                    }
                }}
            >
                {/* Helper Bar - e.g. Suggestion strip or just main tools */}
                <div className="flex items-center gap-1.5 px-3 py-2 overflow-x-auto no-scrollbar scroll-smooth w-full">

                    <ToolbarButton
                        onClick={() => activeEditor.dispatchCommand(UNDO_COMMAND, undefined)}
                        icon={Undo2}
                        label="Undo"
                        isActive={false} // Undo doesn't have active state usually
                    />
                    <ToolbarButton
                        onClick={() => activeEditor.dispatchCommand(REDO_COMMAND, undefined)}
                        icon={Redo2}
                        label="Redo"
                        isActive={false}
                    />

                    <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 mx-1 flex-shrink-0" />

                    <ToolbarButton
                        onClick={() => activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
                        isActive={toolbarState.isBold}
                        icon={Bold}
                        label="Bold"
                    />
                    <ToolbarButton
                        onClick={() => activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
                        isActive={toolbarState.isItalic}
                        icon={Italic}
                        label="Italic"
                    />
                    <ToolbarButton
                        onClick={() => activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
                        isActive={toolbarState.isUnderline}
                        icon={Underline}
                        label="Underline"
                    />
                    <ToolbarButton
                        onClick={() => activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")}
                        isActive={toolbarState.isStrikethrough}
                        icon={Strikethrough}
                        label="Strikethrough"
                    />

                    <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 mx-1 flex-shrink-0" />

                    <ToolbarButton
                        onClick={() => formatHeading("h1")}
                        isActive={toolbarState.blockType === "h1"}
                        icon={Heading1}
                        label="Heading 1"
                    />
                    <ToolbarButton
                        onClick={() => formatHeading("h2")}
                        isActive={toolbarState.blockType === "h2"}
                        icon={Heading2}
                        label="Heading 2"
                    />

                    <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 mx-1 flex-shrink-0" />

                    <ToolbarButton
                        onClick={() => activeEditor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
                        isActive={toolbarState.blockType === "bullet"}
                        icon={List}
                        label="Bullet List"
                    />
                    <ToolbarButton
                        onClick={() => activeEditor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
                        isActive={toolbarState.blockType === "number"}
                        icon={ListOrdered}
                        label="Numbered List"
                    />
                    <ToolbarButton
                        onClick={() => activeEditor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined)}
                        isActive={toolbarState.blockType === "check"}
                        icon={CheckSquare}
                        label="Check List"
                    />

                    <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 mx-1 flex-shrink-0" />

                    <ToolbarButton
                        onClick={() => formatQuote()}
                        isActive={toolbarState.blockType === "quote"}
                        icon={Quote}
                        label="Quote"
                    />
                    <ToolbarButton
                        onClick={() => activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")}
                        isActive={toolbarState.isCode}
                        icon={Code}
                        label="Code"
                    />

                    <ToolbarButton
                        onClick={() => {
                            if (!toolbarState.isLink) {
                                setIsLinkEditMode(true)
                                activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeUrl("https://"))
                            } else {
                                setIsLinkEditMode(false)
                                activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
                            }
                        }}
                        isActive={toolbarState.isLink}
                        icon={LinkIcon}
                        label="Link"
                    />
                </div>
            </div>
        </div>
    )
}
