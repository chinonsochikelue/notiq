/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { ExcalidrawInitialElements } from '../../../ui/excalidraw/ExcalidrawModal';
import type { AppState, BinaryFiles } from '@excalidraw/excalidraw/types';
import type { NodeKey } from 'lexical';
import type { JSX } from 'react';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalEditable } from '@lexical/react/useLexicalEditable';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { mergeRegister } from '@lexical/utils';
import {
  $getNodeByKey,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  KEY_DELETE_COMMAND,
  KEY_BACKSPACE_COMMAND,
  isDOMNode,
} from 'lexical';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as React from 'react';
import { Pencil, Trash2, Palette, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

import ExcalidrawModal from '../../../ui/excalidraw/ExcalidrawModal';
import { $isExcalidrawNode } from '.';
import ExcalidrawImage from './ExcalidrawImage';
import ImageResizer from './ImageResizer';

export default function ExcalidrawComponent({
  nodeKey,
  data,
  width,
  height,
}: {
  data: string;
  nodeKey: NodeKey;
  width: 'inherit' | number;
  height: 'inherit' | number;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const isEditable = useLexicalEditable();
  const [isModalOpen, setModalOpen] = useState<boolean>(
    data === '[]' && editor.isEditable(),
  );
  const imageContainerRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const captionButtonRef = useRef<HTMLButtonElement | null>(null);
  const [isSelected, setSelected, clearSelection] =
    useLexicalNodeSelection(nodeKey);
  const [isResizing, setIsResizing] = useState<boolean>(false);

  useEffect(() => {
    if (!isEditable) {
      if (isSelected) {
        clearSelection();
      }
      return;
    }
    return mergeRegister(
      editor.registerCommand(
        CLICK_COMMAND,
        (event: MouseEvent) => {
          const containerElem = containerRef.current;
          const eventTarget = event.target;

          if (isResizing) {
            return true;
          }

          if (
            containerElem !== null &&
            isDOMNode(eventTarget) &&
            containerElem.contains(eventTarget)
          ) {
            if (!event.shiftKey) {
              clearSelection();
            }
            setSelected(true);
            if (event.detail > 1) {
              setModalOpen(true);
            }
            return true;
          }

          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_DELETE_COMMAND,
        () => {
          if (isSelected) {
            deleteNode();
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_BACKSPACE_COMMAND,
        () => {
          if (isSelected) {
            deleteNode();
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [clearSelection, editor, isSelected, isResizing, setSelected, isEditable]);

  const deleteNode = useCallback(() => {
    setModalOpen(false);
    return editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (node) {
        node.remove();
      }
    });
  }, [editor, nodeKey]);

  const setData = (
    els: ExcalidrawInitialElements,
    aps: Partial<AppState>,
    fls: BinaryFiles,
  ) => {
    return editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isExcalidrawNode(node)) {
        if ((els && els.length > 0) || Object.keys(fls).length > 0) {
          node.setData(
            JSON.stringify({
              appState: aps,
              elements: els,
              files: fls,
            }),
          );
        } else {
          node.remove();
        }
      }
    });
  };

  const onResizeStart = () => {
    setIsResizing(true);
  };

  const onResizeEnd = (
    nextWidth: 'inherit' | number,
    nextHeight: 'inherit' | number,
  ) => {
    setTimeout(() => {
      setIsResizing(false);
    }, 200);

    editor.update(() => {
      const node = $getNodeByKey(nodeKey);

      if ($isExcalidrawNode(node)) {
        node.setWidth(nextWidth);
        node.setHeight(nextHeight);
      }
    });
  };

  const openModal = useCallback(() => {
    setModalOpen(true);
  }, []);

  const {
    elements = [],
    files = {},
    appState = {},
  } = useMemo(() => {
    try {
      return JSON.parse(data);
    } catch {
      return { elements: [], files: {}, appState: {} };
    }
  }, [data]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    if (!elements || elements.length === 0) {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if (node) {
          node.remove();
        }
      });
    }
  }, [editor, nodeKey, elements]);

  return (
    <>
      {isEditable && isModalOpen && (
        <ExcalidrawModal
          initialElements={elements}
          initialFiles={files}
          initialAppState={appState}
          isShown={isModalOpen}
          onDelete={deleteNode}
          onClose={closeModal}
          onSave={(els, aps, fls) => {
            setData(els, aps, fls);
            setModalOpen(false);
          }}
          closeOnClickOutside={false}
        />
      )}

      {elements && elements.length > 0 && (
        <div
          ref={containerRef}
          role="button"
          tabIndex={0}
          aria-label="Excalidraw drawing. Double-click or click Edit to modify."
          onDoubleClick={openModal}
          className={cn(
            'group relative my-4 inline-block max-w-full rounded-2xl border border-border/70 bg-card/40 p-2.5 shadow-xs transition-all duration-200 select-none cursor-pointer',
            'hover:border-border hover:shadow-md hover:bg-card/70',
            isSelected &&
              'ring-2 ring-primary ring-offset-2 ring-offset-background border-primary/50 shadow-md',
          )}
        >
          {/* Action Toolbar on Hover & Selection */}
          {isEditable && (
            <div
              className={cn(
                'absolute top-3 right-3 z-30 flex items-center gap-1 rounded-lg border border-border/80 bg-background/95 px-1.5 py-1 shadow-md backdrop-blur-md transition-opacity duration-150',
                isSelected
                  ? 'opacity-100'
                  : 'opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto',
              )}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openModal();
                }}
                className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-foreground hover:bg-accent transition-colors cursor-pointer"
                title="Edit drawing"
              >
                <Pencil className="h-3.5 w-3.5 text-primary" />
                <span>Edit</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openModal();
                }}
                className="flex items-center rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
                title="Open fullscreen editor"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>

              <div className="h-3.5 w-[1px] bg-border my-auto" />

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNode();
                }}
                className="flex items-center rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
                title="Delete drawing"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Drawing Preview SVG */}
          <ExcalidrawImage
            imageContainerRef={imageContainerRef}
            className="image"
            elements={elements}
            files={files}
            appState={appState}
            width={width}
            height={height}
          />

          {/* Subtle Bottom Badge / Hint */}
          <div
            className={cn(
              'absolute bottom-3 left-3 z-10 flex items-center gap-1.5 rounded-md border border-border/50 bg-background/85 px-2 py-0.5 text-[11px] font-medium text-muted-foreground backdrop-blur-sm transition-opacity duration-150 pointer-events-none',
              isSelected ? 'opacity-0' : 'opacity-0 group-hover:opacity-100',
            )}
          >
            <Palette className="h-3 w-3 text-primary" />
            <span>Excalidraw · Double-click to edit</span>
          </div>

          {/* Interactive Resizer Handles */}
          {(isSelected || isResizing) && isEditable && (
            <ImageResizer
              buttonRef={captionButtonRef}
              showCaption={false}
              setShowCaption={() => null}
              imageRef={imageContainerRef}
              editor={editor}
              onResizeStart={onResizeStart}
              onResizeEnd={onResizeEnd}
              captionsEnabled={false}
            />
          )}
        </div>
      )}
    </>
  );
}
