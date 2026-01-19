"use client"

import { useState, useEffect, useRef } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $getNodeByKey } from "lexical"
import {
  DynamicBlockNode,
  type DynamicBlockPayload,
  type DynamicContentBlock,
  type BlockTrigger,
} from "./DynamicBlockNode"
import { Button } from "../../../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card"
import { Badge } from "../../../ui/badge"
import { Play, Pause, Settings, Eye, EyeOff, Zap } from "lucide-react"
import { cn } from "../../../../lib/utils"

interface DynamicBlockComponentProps {
  nodeKey: string
  payload: DynamicBlockPayload
}

export default function DynamicBlockComponent({ nodeKey, payload }: DynamicBlockComponentProps) {
  const [editor] = useLexicalComposerContext()
  const [currentBlockId, setCurrentBlockId] = useState(payload.currentBlockId || payload.blocks[0]?.id)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const currentBlock = payload.blocks.find((block) => block.id === currentBlockId)
  const activeTriggers = payload.triggers.filter(
    (trigger) =>
      trigger.targetBlockId === currentBlockId || payload.blocks.some((block) => block.id === trigger.targetBlockId),
  )

  const executeTrigger = (trigger: BlockTrigger) => {
    const targetBlock = payload.blocks.find((block) => block.id === trigger.targetBlockId)
    if (!targetBlock) return

    switch (trigger.action) {
      case "show":
      case "replace":
        setCurrentBlockId(trigger.targetBlockId)
        break
      case "hide":
        setCurrentBlockId("")
        break
      case "animate":
        // Trigger animation by temporarily changing block
        setCurrentBlockId("")
        setTimeout(() => setCurrentBlockId(trigger.targetBlockId), 100)
        break
    }
  }

  useEffect(() => {
    if (!isPreviewMode || !containerRef.current) return

    const container = containerRef.current
    const timeTriggers = activeTriggers.filter((t) => t.type === "time")
    const clickTriggers = activeTriggers.filter((t) => t.type === "click")
    const hoverTriggers = activeTriggers.filter((t) => t.type === "hover")

    // Handle time-based triggers
    if (isPlaying && timeTriggers.length > 0) {
      timeTriggers.forEach((trigger) => {
        const delay = typeof trigger.condition === "number" ? trigger.condition * 1000 : 3000
        timeoutRef.current = setTimeout(() => executeTrigger(trigger), delay)
      })
    }

    // Handle click triggers
    const handleClick = () => {
      clickTriggers.forEach(executeTrigger)
    }

    // Handle hover triggers
    const handleMouseEnter = () => {
      hoverTriggers.forEach(executeTrigger)
    }

    container.addEventListener("click", handleClick)
    container.addEventListener("mouseenter", handleMouseEnter)

    return () => {
      container.removeEventListener("click", handleClick)
      container.removeEventListener("mouseenter", handleMouseEnter)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [isPreviewMode, isPlaying, activeTriggers, currentBlockId])

  const updatePayload = (newPayload: Partial<DynamicBlockPayload>) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if ($isDynamicBlockNode(node)) {
        node.updatePayload({ ...payload, ...newPayload })
      }
    })
  }

  const renderContentBlock = (block: DynamicContentBlock) => {
    const animationClass =
      block.animation && block.animation !== "none"
        ? `animate-${block.animation === "fade" ? "fade-in" : block.animation === "slide" ? "slide-in-right" : "bounce-in"}`
        : ""

    switch (block.type) {
      case "text":
        return (
          <div
            className={cn("prose prose-sm max-w-none", animationClass)}
            style={block.styles}
            dangerouslySetInnerHTML={{ __html: block.content }}
          />
        )
      case "image":
        return (
          <img
            src={block.content || "/placeholder.svg"}
            alt="Dynamic content"
            className={cn("max-w-full h-auto rounded-lg", animationClass)}
            style={block.styles}
          />
        )
      case "video":
        return (
          <video
            src={block.content}
            controls
            className={cn("max-w-full h-auto rounded-lg", animationClass)}
            style={block.styles}
          />
        )
      case "html":
        return (
          <div
            className={cn("w-full", animationClass)}
            style={block.styles}
            dangerouslySetInnerHTML={{ __html: block.content }}
          />
        )
      default:
        return <div className="text-muted-foreground">Unknown content type</div>
    }
  }

  return (
    <Card className="w-full my-4 border-2 border-dashed border-accent/30 bg-gradient-to-br from-background to-accent/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent" />
            <CardTitle className="text-lg font-semibold">{payload.title}</CardTitle>
            <Badge variant="secondary" className="text-xs">
              Dynamic Block
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsPreviewMode(!isPreviewMode)} className="h-8 px-2">
              {isPreviewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {isPreviewMode ? "Edit" : "Preview"}
            </Button>
            {isPreviewMode && (
              <Button variant="ghost" size="sm" onClick={() => setIsPlaying(!isPlaying)} className="h-8 px-2">
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setShowSettings(!showSettings)} className="h-8 px-2">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent ref={containerRef} className="space-y-4">
        {/* Content Display Area */}
        <div className="min-h-[200px] p-4 rounded-lg border bg-card/50 relative overflow-hidden">
          {currentBlock ? (
            <div className="transition-all duration-300 ease-in-out">{renderContentBlock(currentBlock)}</div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Zap className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No content block selected</p>
                <p className="text-sm">Configure blocks and triggers below</p>
              </div>
            </div>
          )}
        </div>

        {/* Block Selection */}
        {!isPreviewMode && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Content Blocks ({payload.blocks.length})</h4>
              <Button size="sm" variant="outline" className="h-7 text-xs bg-transparent">
                Add Block
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {payload.blocks.map((block) => (
                <Button
                  key={block.id}
                  variant={currentBlockId === block.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentBlockId(block.id)}
                  className="h-auto p-2 flex flex-col items-start text-left"
                >
                  <div className="font-medium text-xs capitalize">{block.type}</div>
                  <div className="text-xs text-muted-foreground truncate w-full">
                    {block.content.substring(0, 30)}...
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Triggers Display */}
        {!isPreviewMode && activeTriggers.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Active Triggers ({activeTriggers.length})</h4>
            <div className="flex flex-wrap gap-2">
              {activeTriggers.map((trigger) => (
                <Badge key={trigger.id} variant="outline" className="text-xs">
                  {trigger.type}: {trigger.action}
                  {trigger.type === "time" && ` (${trigger.condition}s)`}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Preview Mode Instructions */}
        {isPreviewMode && (
          <div className="text-center p-3 bg-accent/10 rounded-lg border border-accent/20">
            <p className="text-sm text-accent font-medium">Preview Mode Active</p>
            <p className="text-xs text-muted-foreground mt-1">
              {activeTriggers.some((t) => t.type === "click") && "Click to trigger interactions • "}
              {activeTriggers.some((t) => t.type === "hover") && "Hover to trigger interactions • "}
              {activeTriggers.some((t) => t.type === "time") && "Press play for time-based triggers"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function $isDynamicBlockNode(node: any): node is DynamicBlockNode {
  return node instanceof DynamicBlockNode
}
