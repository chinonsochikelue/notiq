/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { JSX } from 'react';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalEditable } from '@lexical/react/useLexicalEditable';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { mergeRegister } from '@lexical/utils';
import {
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_HIGH,
  KEY_ESCAPE_COMMAND,
  NodeKey,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { $isEquationNode } from './EquationNode';
import EquationEditor from '../../../ui/equation/EquationEditor';
import KatexRenderer from '../../../ui/equation/KatexRenderer';

type EquationComponentProps = {
  equation: string;
  inline: boolean;
  nodeKey: NodeKey;
};

export default function EquationComponent({
  equation,
  inline,
  nodeKey,
}: EquationComponentProps): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const isEditable = useLexicalEditable();
  const [equationValue, setEquationValue] = useState(equation);
  const [showEquationEditor, setShowEquationEditor] = useState<boolean>(false);
  const inputRef = useRef(null);
  const [isSelected, setSelected, clearSelection] =
    useLexicalNodeSelection(nodeKey);

  const onHide = useCallback(
    (restoreSelection?: boolean) => {
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
    [editor, equationValue, nodeKey],
  );

  useEffect(() => {
    if (!showEquationEditor && equationValue !== equation) {
      setEquationValue(equation);
    }
  }, [showEquationEditor, equation, equationValue]);

  useEffect(() => {
    if (showEquationEditor) {
      return mergeRegister(
        editor.registerCommand(
          SELECTION_CHANGE_COMMAND,
          () => {
            const activeElement = document.activeElement;
            const inputElem = inputRef.current;
            if (inputElem !== activeElement) {
              onHide();
            }
            return false;
          },
          COMMAND_PRIORITY_HIGH,
        ),
        editor.registerCommand(
          KEY_ESCAPE_COMMAND,
          () => {
            onHide(true);
            return true;
          },
          COMMAND_PRIORITY_HIGH,
        ),
      );
    } else {
      return editor.registerCommand(
        CLICK_COMMAND,
        (payload) => {
          const event = payload;

          if (event.target === inputRef.current) {
            clearSelection();
            setSelected(true);
            return true;
          }

          return false;
        },
        COMMAND_PRIORITY_HIGH,
      );
    }
  }, [editor, isSelected, nodeKey, onHide, setSelected, clearSelection, showEquationEditor]);

  const modifyEquation = useCallback(
    (newEquation: string) => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isEquationNode(node)) {
          node.setEquation(newEquation);
        }
      });
    },
    [editor, nodeKey],
  );

  useEffect(() => {
    if (!isEditable) {
      if (isSelected) {
        clearSelection();
      }
      return;
    }
    if (showEquationEditor) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isNodeSelection(selection)) {
          selection.clear();
        }
      });
    }
  }, [editor, nodeKey, onHide, showEquationEditor, isEditable, isSelected, clearSelection]);

  return (
    <>
      {showEquationEditor && isEditable ? (
        <EquationEditor
          equation={equationValue}
          setEquation={setEquationValue}
          inline={inline}
          ref={inputRef}
        />
      ) : (
        <ErrorBoundary onError={(e) => editor._onError(e as Error)} fallback={null}>
          <KatexRenderer
            equation={equationValue}
            inline={inline}
            onDoubleClick={() => {
              if (isEditable) {
                setShowEquationEditor(true);
              }
            }}
          />
        </ErrorBoundary>
      )}
    </>
  );
}
