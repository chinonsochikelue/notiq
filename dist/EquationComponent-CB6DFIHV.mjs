import {
  $isEquationNode,
  KatexRenderer
} from "./chunk-3JVFG7ER.mjs";
import {
  React,
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/components/editor/nodes/EquationNode/EquationComponent.tsx
init_react_shim();
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalEditable } from "@lexical/react/useLexicalEditable";
import { mergeRegister } from "@lexical/utils";
import {
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  COMMAND_PRIORITY_HIGH,
  KEY_ESCAPE_COMMAND,
  SELECTION_CHANGE_COMMAND
} from "lexical";
import * as React2 from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";

// src/components/ui/equation/EquationEditor.tsx
init_react_shim();
import { isHTMLElement } from "lexical";
import { forwardRef } from "react";
function EquationEditor({ equation, setEquation, inline }, forwardedRef) {
  const onChange = (event) => {
    setEquation(event.target.value);
  };
  return inline && isHTMLElement(forwardedRef) ? /* @__PURE__ */ React.createElement("span", { className: "EquationEditor_inputBackground" }, /* @__PURE__ */ React.createElement("span", { className: "EquationEditor_dollarSign" }, "$"), /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "EquationEditor_inlineEditor",
      value: equation,
      onChange,
      autoFocus: true,
      ref: forwardedRef
    }
  ), /* @__PURE__ */ React.createElement("span", { className: "EquationEditor_dollarSign" }, "$")) : /* @__PURE__ */ React.createElement("div", { className: "EquationEditor_inputBackground" }, /* @__PURE__ */ React.createElement("span", { className: "EquationEditor_dollarSign" }, "$$\n"), /* @__PURE__ */ React.createElement(
    "textarea",
    {
      className: "EquationEditor_blockEditor",
      value: equation,
      onChange,
      ref: forwardedRef
    }
  ), /* @__PURE__ */ React.createElement("span", { className: "EquationEditor_dollarSign" }, "\n$$"));
}
var EquationEditor_default = forwardRef(EquationEditor);

// src/components/editor/nodes/EquationNode/EquationComponent.tsx
function EquationComponent({
  equation,
  inline,
  nodeKey
}) {
  const [editor] = useLexicalComposerContext();
  const isEditable = useLexicalEditable();
  const [equationValue, setEquationValue] = useState(equation);
  const [showEquationEditor, setShowEquationEditor] = useState(false);
  const inputRef = useRef(null);
  const onHide = useCallback(
    (restoreSelection) => {
      setShowEquationEditor(false);
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isEquationNode(node)) {
          node.setEquation(equationValue);
          if (restoreSelection) {
            node.selectNext(0, 0);
          }
        }
      });
    },
    [editor, equationValue, nodeKey]
  );
  useEffect(() => {
    if (!showEquationEditor && equationValue !== equation) {
      setEquationValue(equation);
    }
  }, [showEquationEditor, equation, equationValue]);
  useEffect(() => {
    if (!isEditable) {
      return;
    }
    if (showEquationEditor) {
      return mergeRegister(
        editor.registerCommand(
          SELECTION_CHANGE_COMMAND,
          (payload) => {
            const activeElement = document.activeElement;
            const inputElem = inputRef.current;
            if (inputElem !== activeElement) {
              onHide();
            }
            return false;
          },
          COMMAND_PRIORITY_HIGH
        ),
        editor.registerCommand(
          KEY_ESCAPE_COMMAND,
          (payload) => {
            const activeElement = document.activeElement;
            const inputElem = inputRef.current;
            if (inputElem === activeElement) {
              onHide(true);
              return true;
            }
            return false;
          },
          COMMAND_PRIORITY_HIGH
        )
      );
    } else {
      return editor.registerUpdateListener(({ editorState }) => {
        const isSelected = editorState.read(() => {
          const selection = $getSelection();
          return $isNodeSelection(selection) && selection.has(nodeKey) && selection.getNodes().length === 1;
        });
        if (isSelected) {
          setShowEquationEditor(true);
        }
      });
    }
  }, [editor, nodeKey, onHide, showEquationEditor, isEditable]);
  return /* @__PURE__ */ React2.createElement(React2.Fragment, null, showEquationEditor && isEditable ? /* @__PURE__ */ React2.createElement(
    EquationEditor_default,
    {
      equation: equationValue,
      setEquation: setEquationValue,
      inline,
      ref: inputRef
    }
  ) : /* @__PURE__ */ React2.createElement(ErrorBoundary, { onError: (e) => editor._onError(e), fallback: null }, /* @__PURE__ */ React2.createElement(
    KatexRenderer,
    {
      equation: equationValue,
      inline,
      onDoubleClick: () => {
        if (isEditable) {
          setShowEquationEditor(true);
        }
      }
    }
  )));
}
export {
  EquationComponent as default
};
