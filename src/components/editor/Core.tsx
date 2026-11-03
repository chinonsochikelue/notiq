"use client"

import { useCallback, useEffect, useState } from "react"
import { useSharedHistoryContext } from "../providers/SharedHistoryContext"
import { useLexicalEditable } from "@lexical/react/useLexicalEditable"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import dynamic from "next/dynamic.js"
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import { ContentEditable } from "@lexical/react/LexicalContentEditable"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin"
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin"
import ImagesPlugin from "./plugins/ImagesPlugin"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { TablePlugin } from "@lexical/react/LexicalTablePlugin"
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin"
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin"
import ShortcutsPlugin from "./plugins/ShortcutsPlugin"
import TabFocusPlugin from "./plugins/TabFocusPlugin"
import TableCellResizerPlugin from "./plugins/TableCellResizer"
import PollPlugin from "./plugins/PollPlugin"
import { LayoutPlugin } from "./plugins/LayoutPlugin"
import CollapsiblePlugin from "./plugins/CollapsiblePlugin"
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin"
import LexicalAutoLinkPlugin from "./plugins/AutoLinkPlugin"
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin"
import { ListPlugin } from "@lexical/react/LexicalListPlugin"
import { LinkWithMetaDataPlugin } from "./plugins/LinkWithMetaData"
import CodeHighlightPlugin from "./plugins/CodeHighlightPlugin"
import DragDropPaste from "./plugins/DragDropPastePlugin"
import DraggableBlockPlugin from "./plugins/DraggableBlockPlugin"
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin"
import { ClickableLinkPlugin } from "@lexical/react/LexicalClickableLinkPlugin"
import TwitterPlugin from "./plugins/TwitterPlugin"
import AutoEmbedPlugin from "./plugins/AutoEmbedPlugin"
import YouTubePlugin from "./plugins/YouTubePlugin"
import HintPlugin from "./nodes/Hint"
import { LexicalOnChangePlugin } from "./lexical-on-change"
import StepperPlugin from "./nodes/Stepper"
import InlineImagePlugin from "./plugins/InlineImagePlugin"
import FigmaPlugin from "./plugins/FigmaPlugin"
import EquationsPlugin from "./plugins/EquationsPlugin"
import SpeechToTextPlugin from "./plugins/SpeechToTextPlugin"
import { cn } from "../../lib/utils"
import StoryBuilderPlugin from "./plugins/StoryBuilderPlugin"
import DynamicBlockPlugin from "./plugins/DynamicBlockPlugin"
import { motion, AnimatePresence } from "framer-motion"
import ContentAnalyticsPlugin from "./plugins/ContentAnalyticsPlugin"
import { ToolbarConfig } from "./index"

const SlashCommand = dynamic(() => import("./plugins/SlashCommand"), { ssr: false })
const ToolbarPlugin = dynamic(() => import("./plugins/ToolbarPlugin"), {
  ssr: false,
  loading: () => (
    <div className="hidden md:block w-full flex justify-center p-4">
    </div>
  ),
})
const ExportPlugin = dynamic(() => import("./plugins/ExportPlugin"), { ssr: false });
const TemplatePlugin = dynamic(() => import("./plugins/TemplatePlugin"), { ssr: false });
const ExcalidrawPlugin = dynamic(() => import("./plugins/ExcalidrawPlugin"), {
  ssr: false
});
const FloatingLinkEditorPlugin = dynamic(() => import("./plugins/FloatingLinkEditorPlugin"), {
  ssr: false,
})
const TableCellActionMenuPlugin = dynamic(() => import("./plugins/TableCellActionMenuPlugin"), {
  ssr: false,
})
const TableHoverActionsPlugin = dynamic(() => import("./plugins/TableHoverActionsPlugin"), {
  ssr: false,
})
const CodeActionMenuPlugin = dynamic(() => import("./plugins/CodeActionMenuPlugin"), { ssr: false })
const FloatingTextFormatToolbarPlugin = dynamic(
  () => import("./plugins/FloatingTextFormatToolbarPlugin"),
  { ssr: false },
)

function EditorPlaceholder() {
  return (
    <div className="pointer-events-none select-none absolute top-8 md:top-16 left-4 md:left-12 z-10 text-muted-foreground/60 text-base md:text-lg flex items-center gap-2">
      <span>Type</span>
      <kbd className="px-1.5 py-0.5 text-xs font-mono rounded bg-muted border border-border text-muted-foreground">
        /
      </kbd>
      <span>for commands, or start writing...</span>
    </div>
  );
}

export default function Core({
  toolbarConfig,
}: {
  toolbarConfig?: ToolbarConfig;
}) {
  const { historyState } = useSharedHistoryContext()
  const isEditable = useLexicalEditable()
  const [floatingAnchorElem, setFloatingAnchorElem] = useState<HTMLDivElement | null>(null)
  const [editor] = useLexicalComposerContext()
  const [activeEditor, setActiveEditor] = useState(editor)
  const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false)
  const [hasContent, setHasContent] = useState(false)

  const onRef = useCallback((_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem)
    }
  }, [])

  // Monitor editor content to hide placeholder
  useEffect(() => {
    const unregister = editor.registerTextContentListener((textContent) => {
      setHasContent(textContent.trim().length > 0)
    })

    return unregister
  }, [editor])

  return (
    <>
      {isEditable && (
        <ToolbarPlugin
          editor={editor}
          activeEditor={activeEditor}
          setActiveEditor={setActiveEditor}
          setIsLinkEditMode={setIsLinkEditMode}
          toolbarConfig={toolbarConfig}
        />
      )}

      {isEditable && <ContentAnalyticsPlugin />}

      <div className={cn(
        "flex justify-center w-full min-h-screen transition-all duration-300",
        "dark:md:from-gray-900/50 dark:md:to-gray-800/30",
        "pt-20 md:pt-10"
      )}>
        <motion.div
          className={cn(
            "relative w-full max-w-5xl transition-all duration-500",
            "prose prose-lg dark:prose-invert lg:prose-xl leading-relaxed",
            "md:rounded-2xl md:shadow-2xl md:shadow-black/5",
            "md:dark:shadow-black/20",
            "bg-white dark:bg-gray-900",
            "md:border md:border-gray-200/50 dark:md:border-gray-800/50"
          )}
        >
          {/* Subtle background pattern */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30 dark:from-blue-900/10 dark:to-purple-900/10" />
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700" />
          </div>

          <RichTextPlugin
            contentEditable={
              <div ref={onRef} className="relative">
                <ContentEditable
                  id="lexical-editor"
                  autoFocus
                  className={cn(
                    "editor-content relative z-20 outline-none",
                    "px-4 md:px-12 py-8 md:py-16",
                    "min-h-[80vh] md:min-h-[70vh]",
                    "focus:outline-none focus:ring-0",
                    "text-foreground selection:bg-blue-100 dark:selection:bg-blue-900/30",
                    "font-['Inter',_system-ui,_sans-serif] antialiased",
                    "leading-relaxed tracking-wide",
                    "transition-all duration-200 ease-in-out",
                    "rounded-2xl"
                  )}
                />
              </div>
            }
            placeholder={!hasContent ? <EditorPlaceholder /> : null}
            ErrorBoundary={LexicalErrorBoundary}
          />

          {/* Enhanced focus ring */}
          <div className="absolute inset-0 rounded-2xl ring-0 ring-blue-500/0 transition-all duration-300 pointer-events-none focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:ring-offset-2 focus-within:ring-offset-white dark:focus-within:ring-offset-gray-900" />

          {/* All plugins remain the same */}
          <AutoFocusPlugin defaultSelection={"rootStart"} />
          <ClearEditorPlugin />
          <ShortcutsPlugin editor={activeEditor} setIsLinkEditMode={setIsLinkEditMode} />
          <LexicalOnChangePlugin />
          <LinkPlugin />
          <HorizontalRulePlugin />
          <TabFocusPlugin />
          <PollPlugin />
          <ExcalidrawPlugin />
          <FigmaPlugin />
          <EquationsPlugin />
          <SpeechToTextPlugin />
          <TableCellResizerPlugin />
          <LayoutPlugin />
          <CollapsiblePlugin />
          <CodeHighlightPlugin />
          <DragDropPaste />
          <TabIndentationPlugin maxIndent={7} />
          <LexicalAutoLinkPlugin />
          <LinkWithMetaDataPlugin />
          <ListPlugin />
          <StepperPlugin />
          <TwitterPlugin />
          <CheckListPlugin />
          <ImagesPlugin />
          <InlineImagePlugin />
          <AutoEmbedPlugin />
          <HintPlugin />
          <YouTubePlugin />
          <StoryBuilderPlugin />
          <DynamicBlockPlugin />
          <HistoryPlugin externalHistoryState={historyState} />
          <ExportPlugin />
          <TemplatePlugin />
          <MarkdownShortcutPlugin />
          <ClickableLinkPlugin disabled={isEditable} />
          <TablePlugin hasCellMerge={true} hasCellBackgroundColor={true} hasHorizontalScroll={true} />

          {floatingAnchorElem && isEditable && (
            <>
              <DraggableBlockPlugin anchorElem={floatingAnchorElem} />
              <FloatingLinkEditorPlugin
                anchorElem={floatingAnchorElem}
                isLinkEditMode={isLinkEditMode}
                setIsLinkEditMode={setIsLinkEditMode}
              />
              <FloatingTextFormatToolbarPlugin setIsLinkEditMode={setIsLinkEditMode} anchorElem={floatingAnchorElem} />
              <TableCellActionMenuPlugin anchorElem={floatingAnchorElem} cellMerge={true} />
              <CodeActionMenuPlugin anchorElem={floatingAnchorElem} />
              <TableHoverActionsPlugin anchorElem={floatingAnchorElem} />
            </>
          )}

          {isEditable && <SlashCommand />}
        </motion.div>
      </div>
    </>
  )
}