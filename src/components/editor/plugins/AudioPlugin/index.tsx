"use client";

import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $insertNodeToNearestRoot } from "@lexical/utils";
import { COMMAND_PRIORITY_EDITOR } from "lexical";
import {
  $createAudioNode,
  AudioNode,
  AudioPayload,
  INSERT_AUDIO_COMMAND,
} from "../../nodes/AudioNode";

export default function AudioPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([AudioNode])) {
      throw new Error("AudioPlugin: AudioNode not registered on editor");
    }

    return editor.registerCommand<AudioPayload>(
      INSERT_AUDIO_COMMAND,
      (payload) => {
        editor.update(() => {
          const audioNode = $createAudioNode(payload);
          $insertNodeToNearestRoot(audioNode);
        });
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor]);

  return null;
}
