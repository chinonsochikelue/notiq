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
import StoryBuilderPlugin from "./plugins/StoryBuilderPlugin"
import DynamicBlockPlugin from "./plugins/DynamicBlockPluggin"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Lightbulb, Quote } from "lucide-react"
import ContentAnalyticsPlugin from "./plugins/ContentAnalyticsPlugin"

const SlashCommand = dynamic(() => import("@/components/editor/plugins/SlashCommand"), { ssr: false })
const ToolbarPlugin = dynamic(() => import("@/components/editor/plugins/ToolbarPlugin"), {
  ssr: false,
  loading: () => (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4">
      <Skeleton className="h-12 w-full max-w-4xl rounded-2xl" />
    </div>
  ),
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
  { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
  { text: "Life is what happens to you while you're busy making other plans.", author: "John Lennon" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
];

function useRotatingQuote() {
  const [quote, setQuote] = useState<{ text: string; author: string } | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const loadNewQuote = useCallback(() => {
    setIsAnimating(true);
    
    setTimeout(() => {
      const newQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
      setQuote(newQuote);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          "editorQuote",
          JSON.stringify({ ...newQuote, timestamp: Date.now() })
        );
      }
      
      setIsAnimating(false);
    }, 300);
  }, []);

  useEffect(() => {
    // Load initial quote from localStorage or random
    const loadInitialQuote = () => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem("editorQuote");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            const isRecent = Date.now() - parsed.timestamp < 3 * 60 * 60 * 1000; // 3 hours
            if (isRecent && parsed.text && parsed.author) {
              setQuote({ text: parsed.text, author: parsed.author });
              return;
            }
          } catch (e) {
            // Fall through to load new quote
          }
        }
      }
      
      // Load new quote if no valid stored quote
      const newQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
      setQuote(newQuote);
    };

    loadInitialQuote();

    // Rotate quote every 3 hours
    const interval = setInterval(loadNewQuote, 3 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadNewQuote]);

  return { quote, isAnimating, loadNewQuote };
}

// Enhanced placeholder component
function EnhancedPlaceholder({ quote, isAnimating, onRefresh }: { 
  quote: { text: string; author: string } | null;
  isAnimating: boolean;
  onRefresh: () => void;
}) {
  if (!quote) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 text-gray-400"
        >
          <Sparkles className="h-6 w-6 animate-pulse" />
          <span className="text-lg italic">Loading inspiration...</span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
      <motion.div 
        className="relative h-full w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full blur-3xl" />
          <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-gradient-to-br from-pink-400 to-orange-600 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 h-full flex flex-col justify-center px-4 md:px-12">
          <AnimatePresence mode="wait">
            {!isAnimating && (
              <motion.div
                key={quote.text}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ 
                  duration: 0.6, 
                  ease: [0.4, 0, 0.2, 1] 
                }}
                className="max-w-4xl"
              >
                {/* Quote Icon */}
                <motion.div 
                  className="flex items-center gap-3 mb-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="relative">
                    <Quote className="h-8 w-8 text-blue-400/60 dark:text-blue-300/40" />
                    <motion.div
                      className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-gray-300 to-transparent dark:from-gray-600" />
                </motion.div>

                {/* Quote Text */}
                <motion.blockquote 
                  className="text-2xl md:text-4xl lg:text-5xl font-light italic leading-relaxed text-gray-400 dark:text-gray-500 mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                >
                  "{quote.text}"
                </motion.blockquote>

                {/* Author */}
                <motion.div 
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="h-px flex-1 bg-gradient-to-l from-gray-300 to-transparent dark:from-gray-600" />
                  <cite className="text-lg md:text-xl text-gray-500 dark:text-gray-400 font-medium not-italic">
                    {quote.author}
                  </cite>
                  <Lightbulb className="h-5 w-5 text-amber-400/60 dark:text-amber-300/40" />
                </motion.div>

                {/* Refresh Hint */}
                <motion.button
                  onClick={onRefresh}
                  className="mt-8 pointer-events-auto text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 flex items-center hidden md:flex gap-2 group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <Sparkles className="h-4 w-4 group-hover:animate-spin transition-transform" />
                  <span>Click for new inspiration</span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading State */}
          {isAnimating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="h-8 w-8 text-blue-400" />
              </motion.div>
              <span className="ml-3 text-xl text-gray-400 italic">Finding inspiration...</span>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function Core() {
  const { historyState } = useSharedHistoryContext()
  const { quote, isAnimating, loadNewQuote } = useRotatingQuote();
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
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            duration: 0.6, 
            ease: [0.4, 0, 0.2, 1],
            delay: 0.1 
          }}
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
                    "leading-relaxed prose prose-lg dark:prose-invert lg:prose-xl tracking-wide",
                    "transition-all duration-200 ease-in-out",
                    "rounded-2xl"
                  )}
                />
              </div>
            }
            placeholder={
              !hasContent ? (
                <EnhancedPlaceholder 
                  quote={quote} 
                  isAnimating={isAnimating}
                  onRefresh={loadNewQuote}
                />
              ) : null
            }
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
          <LinkPlugin />
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