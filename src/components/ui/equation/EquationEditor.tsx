/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { JSX, Ref, RefObject } from 'react';

import { isHTMLElement } from 'lexical';
import { ChangeEvent, forwardRef } from 'react';
import { handleEquationInputChange } from './equationTypography';
import KatexRenderer from './KatexRenderer';

type BaseEquationEditorProps = {
  equation: string;
  inline: boolean;
  setEquation: (equation: string) => void;
};

function EquationEditor(
  { equation, setEquation, inline }: BaseEquationEditorProps,
  forwardedRef: Ref<HTMLInputElement | HTMLTextAreaElement>,
): JSX.Element {
  const onChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    handleEquationInputChange(event.target, setEquation);
  };

  return inline && isHTMLElement(forwardedRef) ? (
    <span className="EquationEditor_inputBackground relative inline-flex items-center">
      <span className="EquationEditor_dollarSign">$</span>
      <input
        className="EquationEditor_inlineEditor"
        value={equation}
        onChange={onChange}
        autoFocus={true}
        ref={forwardedRef as RefObject<HTMLInputElement>}
      />
      <span className="EquationEditor_dollarSign">$</span>
      {equation.trim() && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-full mt-1.5 z-50 rounded-lg border border-border/70 bg-popover/95 px-2.5 py-1 text-popover-foreground shadow-md backdrop-blur-sm whitespace-nowrap"
        >
          <KatexRenderer equation={equation} inline={true} onDoubleClick={() => {}} />
        </span>
      )}
    </span>
  ) : (
    <div className="EquationEditor_inputBackground">
      <span className="EquationEditor_dollarSign">{'$$\n'}</span>
      <textarea
        className="EquationEditor_blockEditor"
        value={equation}
        onChange={onChange}
        ref={forwardedRef as RefObject<HTMLTextAreaElement>}
      />
      <span className="EquationEditor_dollarSign">{'\n$$'}</span>
      {equation.trim() && (
        <div
          aria-hidden="true"
          className="pointer-events-none mt-2 border-t border-border/50 pt-2 text-center"
        >
          <KatexRenderer equation={equation} inline={false} onDoubleClick={() => {}} />
        </div>
      )}
    </div>
  );
}

export default forwardRef(EquationEditor);
