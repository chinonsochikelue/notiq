/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { JSX } from 'react';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import * as React from 'react';
import { useCallback, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import KatexRenderer from './KatexRenderer';
import { Button } from '../button';
import { handleEquationInputChange } from './equationTypography';

type Props = {
  initialEquation?: string;
  onConfirm: (equation: string, inline: boolean) => void;
  onCancel?: () => void;
};

const EQUATION_PRESETS: Array<{ label: string; latex: string }> = [
  { label: 'Fraction', latex: '\\frac{a}{b}' },
  { label: 'Sqrt', latex: '\\sqrt{x^2 + y^2}' },
  { label: 'Sum', latex: '\\sum_{i=1}^{n} i' },
  { label: 'Integral', latex: '\\int_{0}^{\\infty} e^{-x^2} \\, dx' },
  { label: 'Matrix', latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' },
];

export default function KatexEquationAlterer({
  onConfirm,
  onCancel,
  initialEquation = '',
}: Props): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [equation, setEquation] = useState<string>(initialEquation);
  const [inline, setInline] = useState<boolean>(true);

  const canConfirm = equation.trim().length > 0;

  const onClick = useCallback(() => {
    if (!canConfirm) return;
    onConfirm(equation, inline);
  }, [canConfirm, onConfirm, equation, inline]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && (inline || event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        if (canConfirm) {
          onConfirm(equation, inline);
        }
      }
    },
    [inline, canConfirm, onConfirm, equation],
  );

  const insertPreset = useCallback((latex: string) => {
    setEquation((prev) => (prev.trim() ? `${prev} ${latex}` : latex));
  }, []);

  return (
    <div className="flex w-full min-w-[320px] max-w-[480px] flex-col gap-4 pt-1">
      {/* Mode switcher: Inline vs Block */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Display Mode
        </span>
        <div
          role="group"
          aria-label="Equation display mode"
          className="inline-flex rounded-lg border border-border bg-muted/50 p-0.5"
        >
          <button
            type="button"
            onClick={() => setInline(true)}
            aria-pressed={inline}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              inline
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Inline <span className="ml-1 font-mono opacity-70">$x$</span>
          </button>
          <button
            type="button"
            onClick={() => setInline(false)}
            aria-pressed={!inline}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              !inline
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Block <span className="ml-1 font-mono opacity-70">$$x$$</span>
          </button>
        </div>
      </div>

      {/* LaTeX Input */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="notiq-equation-input"
            className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
          >
            LaTeX Expression
          </label>
          <span className="text-[11px] text-muted-foreground">
            {inline ? 'Enter to insert' : '⌘/Ctrl + Enter to insert'}
          </span>
        </div>

        {inline ? (
          <input
            id="notiq-equation-input"
            type="text"
            autoFocus
            placeholder="e.g. E = mc^2"
            onChange={(event) => handleEquationInputChange(event.target, setEquation)}
            onKeyDown={handleKeyDown}
            value={equation}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        ) : (
          <textarea
            id="notiq-equation-input"
            rows={3}
            autoFocus
            placeholder="e.g. \int_{0}^{\infty} e^{-x^2} \, dx = \frac{\sqrt{\pi}}{2}"
            onChange={(event) => handleEquationInputChange(event.target, setEquation)}
            onKeyDown={handleKeyDown}
            value={equation}
            className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        )}

        {/* Quick LaTeX presets */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {EQUATION_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => insertPreset(preset.latex)}
              className="rounded-md border border-border/70 bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              + {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Live Preview */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Preview
        </span>
        <div className="flex min-h-[84px] w-full items-center justify-center overflow-x-auto rounded-lg border border-border/70 bg-muted/30 px-4 py-3 text-foreground">
          {canConfirm ? (
            <ErrorBoundary
              onError={(e) => editor._onError(e as Error)}
              fallback={
                <span className="text-xs text-destructive">
                  Unable to render equation preview.
                </span>
              }
            >
              <KatexRenderer
                equation={equation}
                inline={inline}
                onDoubleClick={() => null}
              />
            </ErrorBoundary>
          ) : (
            <span className="text-xs text-muted-foreground">
              Live KaTeX preview will appear here...
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 border-t border-border/60 pt-3">
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="button" size="sm" onClick={onClick} disabled={!canConfirm}>
          Insert Equation
        </Button>
      </div>
    </div>
  );
}
