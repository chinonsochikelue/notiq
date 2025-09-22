"use client"

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $wrapNodeInElement } from "@lexical/utils"
import {
  $createParagraphNode,
  $insertNodes,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  type LexicalCommand,
} from "lexical"
import { useEffect } from "react"
import type * as React from "react"

import { $createStoryBuilderNode, StoryBuilderNode, type StoryBuilderPayload } from "../../nodes/StoryBuilderNode/StoryBuilderNode"

export const INSERT_STORY_BUILDER_COMMAND: LexicalCommand<StoryBuilderPayload> =
  createCommand("INSERT_STORY_BUILDER_COMMAND")

export default function StoryBuilderPlugin(): React.JSX.Element | null {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!editor.hasNodes([StoryBuilderNode])) {
      throw new Error("StoryBuilderPlugin: StoryBuilderNode not registered on editor")
    }

    return editor.registerCommand<StoryBuilderPayload>(
      INSERT_STORY_BUILDER_COMMAND,
      (payload) => {
        const storyBuilderNode = $createStoryBuilderNode(payload)
        $insertNodes([storyBuilderNode])
        if ($isRootOrShadowRoot(storyBuilderNode.getParentOrThrow())) {
          $wrapNodeInElement(storyBuilderNode, $createParagraphNode).selectEnd()
        }

        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )
  }, [editor])

  return null
}

export { StoryBuilderNode, $createStoryBuilderNode, $isStoryBuilderNode } from "../../nodes/StoryBuilderNode/StoryBuilderNode"
export type { StoryBuilderPayload, StoryNode, StoryChoice } from "../../nodes/StoryBuilderNode/StoryBuilderNode"
