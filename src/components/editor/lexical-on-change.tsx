import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import useLayoutEffectImpl from "./utils/useLayoutEffect";
import { setNodePlaceholderFromSelection } from "./utils/setNodePlaceholderFromSelection/setNodePlaceholderFromSelection";

export function LexicalOnChangePlugin() {
  const [editor] = useLexicalComposerContext();

  useLayoutEffectImpl(() => {
    const unregisterListener = editor.registerUpdateListener(
      ({ editorState, dirtyElements, dirtyLeaves, prevEditorState, tags }) => {
        if (
          (dirtyElements.size === 0 && dirtyLeaves.size === 0) ||
          tags.has("history-merge") ||
          prevEditorState.isEmpty()
        ) {
          return;
        }
        setNodePlaceholderFromSelection(editor);

      }
    );

    return () => {
      unregisterListener();
    };
  }, [editor]);
  return <></>
}
