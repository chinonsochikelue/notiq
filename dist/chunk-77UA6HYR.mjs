import {
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/components/editor/plugins/SpeechToTextPlugin/index.ts
init_react_shim();
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  REDO_COMMAND,
  UNDO_COMMAND
} from "lexical";
import { useEffect as useEffect2, useRef as useRef2, useState } from "react";

// src/hooks/useReport.ts
init_react_shim();
import { useCallback, useEffect, useRef } from "react";
var getElement = () => {
  let element = document.getElementById("report-container");
  if (element === null) {
    element = document.createElement("div");
    element.id = "report-container";
    element.style.position = "fixed";
    element.style.top = "50%";
    element.style.left = "50%";
    element.style.fontSize = "32px";
    element.style.transform = "translate(-50%, -50px)";
    element.style.padding = "20px";
    element.style.background = "rgba(240, 240, 240, 0.4)";
    element.style.borderRadius = "20px";
    if (document.body) {
      document.body.appendChild(element);
    }
  }
  return element;
};
function useReport() {
  const timer = useRef(null);
  const cleanup = useCallback(() => {
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (document.body) {
      document.body.removeChild(getElement());
    }
  }, []);
  useEffect(() => {
    return cleanup;
  }, [cleanup]);
  return useCallback(
    (content) => {
      console.log(content);
      const element = getElement();
      if (timer.current !== null) {
        clearTimeout(timer.current);
      }
      element.innerHTML = content;
      timer.current = setTimeout(cleanup, 1e3);
      return timer.current;
    },
    [cleanup]
  );
}

// src/components/editor/plugins/SpeechToTextPlugin/index.ts
var SPEECH_TO_TEXT_COMMAND = createCommand(
  "SPEECH_TO_TEXT_COMMAND"
);
var VOICE_COMMANDS = {
  "\n": ({ selection }) => {
    selection.insertParagraph();
  },
  redo: ({ editor }) => {
    editor.dispatchCommand(REDO_COMMAND, void 0);
  },
  undo: ({ editor }) => {
    editor.dispatchCommand(UNDO_COMMAND, void 0);
  }
};
var SUPPORT_SPEECH_RECOGNITION = typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
function SpeechToTextPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isEnabled, setIsEnabled] = useState(false);
  const SpeechRecognition = (
    // @ts-expect-error missing type
    window.SpeechRecognition || window.webkitSpeechRecognition
  );
  const recognition = useRef2(null);
  const isRecognizing = useRef2(false);
  const report = useReport();
  useEffect2(() => {
    if (isEnabled && recognition.current === null) {
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = true;
      recognition.current.interimResults = true;
      recognition.current.onresult = (event) => {
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
        var _a;
        isRecognizing.current = false;
        if (isEnabled) {
          (_a = recognition.current) == null ? void 0 : _a.start();
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
  useEffect2(() => {
    return editor.registerCommand(
      SPEECH_TO_TEXT_COMMAND,
      (_isEnabled) => {
        setIsEnabled(_isEnabled);
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor]);
  return null;
}
var SpeechToTextPlugin_default = SUPPORT_SPEECH_RECOGNITION ? SpeechToTextPlugin : () => null;

export {
  SPEECH_TO_TEXT_COMMAND,
  SUPPORT_SPEECH_RECOGNITION,
  SpeechToTextPlugin_default
};
