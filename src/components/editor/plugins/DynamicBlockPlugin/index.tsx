"use client"

import type React from "react"

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $insertNodeToNearestRoot } from "@lexical/utils"
import { COMMAND_PRIORITY_EDITOR, createCommand, type LexicalCommand } from "lexical"
import { useEffect } from "react"

import { $createDynamicBlockNode, DynamicBlockNode, type DynamicBlockPayload } from "../../nodes/DynamicBlockNode/DynamicBlockNode"

export { DynamicBlockNode, $createDynamicBlockNode, $isDynamicBlockNode } from "../../nodes/DynamicBlockNode/DynamicBlockNode"

export const INSERT_DYNAMIC_BLOCK_COMMAND: LexicalCommand<DynamicBlockPayload> =
  createCommand("INSERT_DYNAMIC_BLOCK_COMMAND")

export default function DynamicBlockPlugin(): React.JSX.Element | null {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!editor.hasNodes([DynamicBlockNode])) {
      throw new Error("DynamicBlockPlugin: DynamicBlockNode not registered on editor")
    }

    return editor.registerCommand<DynamicBlockPayload>(
      INSERT_DYNAMIC_BLOCK_COMMAND,
      (payload) => {
        const dynamicBlockNode = $createDynamicBlockNode(payload)
        $insertNodeToNearestRoot(dynamicBlockNode)
        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )
  }, [editor])

  return null
}

// Default payload for new dynamic blocks
export const createDefaultDynamicBlock = (): DynamicBlockPayload => ({
  id: `dynamic-block-${Date.now()}`,
  title: "Interactive Content Block",
  currentBlockId: "block-1",
  blocks: [
    {
      id: "block-1",
      type: "text",
      content: "<h3>Welcome!</h3><p>This is your first dynamic content block. Click to see the magic happen!</p>",
      animation: "fade",
    },
    {
      id: "block-2",
      type: "text",
      content:
        "<h3>Amazing!</h3><p>You triggered the interaction! This content appeared because you clicked. Try hovering for more surprises.</p>",
      animation: "slide",
    },
    {
      id: "block-3",
      type: "text",
      content:
        "<h3>Incredible!</h3><p>Hover interactions work too! You can create time-based triggers, scroll triggers, and much more.</p>",
      animation: "bounce",
    },
  ],
  triggers: [
    {
      id: "trigger-1",
      type: "click",
      condition: "",
      targetBlockId: "block-2",
      action: "replace",
    },
    {
      id: "trigger-2",
      type: "hover",
      condition: "",
      targetBlockId: "block-3",
      action: "replace",
    },
    {
      id: "trigger-3",
      type: "time",
      condition: 3,
      targetBlockId: "block-2",
      action: "replace",
    },
  ],
})
