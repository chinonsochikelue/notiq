"use client";

import type { LexicalCommand, LexicalEditor, RangeSelection } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  REDO_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import { useEffect, useRef, useState } from "react";
import useReport from "../../../../hooks/useReport";

export const SPEECH_TO_TEXT_COMMAND: LexicalCommand<boolean> = createCommand(
  "SPEECH_TO_TEXT_COMMAND"
);

const VOICE_COMMANDS: Readonly<
  Record<
    string,
    (arg0: { editor: LexicalEditor; selection: RangeSelection }) => void
  >
> = {
  "\n": ({ selection }) => {
    selection.insertParagraph();
  },
  redo: ({ editor }) => {
    editor.dispatchCommand(REDO_COMMAND, undefined);
  },
  undo: ({ editor }) => {
    editor.dispatchCommand(UNDO_COMMAND, undefined);
  },
};

export const SUPPORT_SPEECH_RECOGNITION: boolean =
  typeof window !== "undefined" &&
  ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

function SpeechToTextPlugin(): null {
  const [editor] = useLexicalComposerContext();
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const SpeechRecognition =
    // @ts-expect-error missing type
    window.SpeechRecognition || window.webkitSpeechRecognition;

  const recognition = useRef<any>(null);
  const isRecognizing = useRef(false); // ✅ track running state
  const report = useReport();

  useEffect(() => {
    if (isEnabled && recognition.current === null) {
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = true;
      recognition.current.interimResults = true;

      recognition.current.onresult = (event: any) => {
        const resultItem = event.results.item(event.resultIndex);
        const { transcript } = resultItem.item(0);
        report(transcript);

        if (!resultItem.isFinal) {
          return;
        }

        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const command = VOICE_COMMANDS[transcript.toLowerCase().trim()];
            if (command) {
              command({ editor, selection });
            } else if (transcript.match(/\s*\n\s*/)) {
              selection.insertParagraph();
            } else {
              selection.insertText(transcript);
            }
          }
        });
      };

      recognition.current.onstart = () => {
        isRecognizing.current = true;
      };

      recognition.current.onend = () => {
        isRecognizing.current = false;
        // auto-restart if still enabled
        if (isEnabled) {
          recognition.current?.start();
        }
      };
    }

    if (recognition.current) {
      if (isEnabled && !isRecognizing.current) {
        recognition.current.start();
      } else if (!isEnabled && isRecognizing.current) {
        recognition.current.stop();
      }
    }

    return () => {
      if (recognition.current) {
        recognition.current.stop();
        recognition.current = null;
        isRecognizing.current = false;
      }
    };
  }, [SpeechRecognition, editor, isEnabled, report]);

  useEffect(() => {
    return editor.registerCommand(
      SPEECH_TO_TEXT_COMMAND,
      (_isEnabled: boolean) => {
        setIsEnabled(_isEnabled);
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor]);

  return null;
}

export default (SUPPORT_SPEECH_RECOGNITION
  ? SpeechToTextPlugin
  : () => null) as () => null;
