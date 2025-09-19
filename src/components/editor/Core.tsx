"use client"

import { useCallback, useEffect, useState } from "react"
import { useSharedHistoryContext } from "../providers/SharedHistoryContext"
import { useLexicalEditable } from "@lexical/react/useLexicalEditable"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import dynamic from "next/dynamic"
import { Skeleton } from "../ui/skeleton"
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
import { cn } from "@/lib/utils"

const SlashCommand = dynamic(() => import("@/components/editor/plugins/SlashCommand"), { ssr: false })
const ToolbarPlugin = dynamic(() => import("@/components/editor/plugins/ToolbarPlugin"), {
  ssr: false,
  loading: () => <Skeleton className=" h-9 w-full  mt-8" />,
})
const ExcalidrawPlugin = dynamic(() => import("./plugins/ExcalidrawPlugin"), {
  ssr: false
});
const FloatingLinkEditorPlugin = dynamic(() => import("@/components/editor/plugins/FloatingLinkEditorPlugin"), {
  ssr: false,
})
const TableCellActionMenuPlugin = dynamic(() => import("@/components/editor/plugins/TableCellActionMenuPlugin"), {
  ssr: false,
})
const TableHoverActionsPlugin = dynamic(() => import("@/components/editor/plugins/TableHoverActionsPlugin"), {
  ssr: false,
})
const CodeActionMenuPlugin = dynamic(() => import("@/components/editor/plugins/CodeActionMenuPlugin"), { ssr: false })
const FloatingTextFormatToolbarPlugin = dynamic(
  () => import("@/components/editor/plugins/FloatingTextFormatToolbarPlugin"),
  { ssr: false },
)

const QUOTES = [
  { text: "The best way to predict the future is to invent it.", author: "Alan Kay" },
  { text: "Do not wait to strike till the iron is hot, but make it hot by striking.", author: "William Butler Yeats" },
  { text: "Creativity is intelligence having fun.", author: "Albert Einstein" },
  { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
  { text: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Success is not the key to happiness. Happiness is the key to success.", author: "Albert Schweitzer" },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "What we think, we become.", author: "Buddha" },
  { text: "The journey of a thousand miles begins with one step.", author: "Lao Tzu" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
];

function useRotatingQuote() {
  const [quote, setQuote] = useState<{ text: string; author: string } | null>(null);

  useEffect(() => {
    // Load initial quote
    const loadQuote = () => {
      const newQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
      setQuote(newQuote);
      localStorage.setItem(
        "editorQuote",
        JSON.stringify({ ...newQuote, timestamp: Date.now() })
      );
    };

    loadQuote(); // load one immediately

    const interval = setInterval(loadQuote, 3 * 60 * 60 * 100 ); // every 3 hours

    return () => clearInterval(interval);
  }, []);

  return quote;
}



export default function Core() {
  const { historyState } = useSharedHistoryContext()
  const quote = useRotatingQuote();
  const isEditable = useLexicalEditable()
  const [floatingAnchorElem, setFloatingAnchorElem] = useState<HTMLDivElement | null>(null)
  const [editor] = useLexicalComposerContext()
  const [activeEditor, setActiveEditor] = useState(editor)
  const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false)

  const onRef = useCallback((_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem)
    }
  }, [])

  return (
    <>
      {isEditable && (
        <ToolbarPlugin
          editor={editor}
          activeEditor={activeEditor}
          setActiveEditor={setActiveEditor}
          setIsLinkEditMode={setIsLinkEditMode}
        />
      )}

      <div className="flex justify-center w-full md:px-6 md:bg-muted/30 min-h-screen md:min-h-96 pt-24">
        <div
          className={cn(
            "relative w-full max-w-5xl rounded-2xl shadow-2xl prose prose-lg lg:prose-xl leading-relaxed",
          )}
        >
          <RichTextPlugin
            contentEditable={
              <div ref={onRef} className="relative">
                <ContentEditable
                  id="lexical-editor"
                  autoFocus
                  className={cn(
                    "editor-content relative z-20 min-h-[80vh] md:p-12 outline-none rounded-2xl",
                    "focus:outline-none focus:ring-0 text-foreground"
                  )}
                />
              </div>
            }
            placeholder={
              <div className="absolute text-bold md:top-18 top-6 left-2 md:text-6xl md:left-12 italic text-gray-400 pointer-events-none select-none">
                {quote ? `"${quote.text}" ~ ${quote.author}` : "Loading quote..."}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />


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
          <LinkPlugin />
          <StepperPlugin />
          <TwitterPlugin />
          <CheckListPlugin />
          <ImagesPlugin />
          <InlineImagePlugin />
          <AutoEmbedPlugin />
          <HintPlugin />
          <YouTubePlugin />
          <HistoryPlugin externalHistoryState={historyState} />
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

        </div>
      </div>
    </>
  )
}
