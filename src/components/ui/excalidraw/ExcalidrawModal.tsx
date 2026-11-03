/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
  AppState,
  BinaryFiles,
  ExcalidrawImperativeAPI,
  ExcalidrawInitialDataState,
} from '@excalidraw/excalidraw/types';
import type { JSX } from 'react';

import '@excalidraw/excalidraw/index.css';

import { Excalidraw } from '@excalidraw/excalidraw';
import { isDOMNode } from 'lexical';
import * as React from 'react';
import { ReactPortal, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../dialog';
import { Button } from '../button';
import {
  Save,
  X,
  Trash2,
  AlertTriangle,
  Palette,
  Maximize2,
  Minimize2,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type ExcalidrawInitialElements = ExcalidrawInitialDataState['elements'];

type Props = {
  closeOnClickOutside?: boolean;
  /**
   * The initial set of elements to draw into the scene
   */
  initialElements: ExcalidrawInitialElements;
  /**
   * The initial set of elements to draw into the scene
   */
  initialAppState: AppState;
  /**
   * The initial set of elements to draw into the scene
   */
  initialFiles: BinaryFiles;
  /**
   * Controls the visibility of the modal
   */
  isShown?: boolean;
  /**
   * Callback when closing and discarding the new changes
   */
  onClose: () => void;
  /**
   * Completely remove Excalidraw component
   */
  onDelete: () => void;
  /**
   * Callback when the save button is clicked
   */
  onSave: (
    elements: ExcalidrawInitialElements,
    appState: Partial<AppState>,
    files: BinaryFiles,
  ) => void;
};

const modalVariants = {
  initial: {
    opacity: 0,
    scale: 0.96,
    y: 16,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 350,
      damping: 32,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 16,
    transition: {
      duration: 0.18,
    },
  },
};

const backdropVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.25 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.18 },
  },
};

/**
 * Modernized Excalidraw Modal
 * Full dark mode support, fullscreen toggle, non-destructive close, and accessible controls.
 */
export default function ExcalidrawModal({
  closeOnClickOutside = false,
  onSave,
  initialElements,
  initialAppState,
  initialFiles,
  isShown = false,
  onDelete,
  onClose,
}: Props): ReactPortal | null {
  const excaliDrawModelRef = useRef<HTMLDivElement | null>(null);
  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);
  const [discardModalOpen, setDiscardModalOpen] = useState(false);
  const [elements, setElements] =
    useState<ExcalidrawInitialElements>(initialElements);
  const [files, setFiles] = useState<BinaryFiles>(initialFiles);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';

  const isExistingDrawing = useMemo(
    () => initialElements && initialElements.some((el) => !el.isDeleted),
    [initialElements],
  );

  const isMac = useMemo(
    () => typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent),
    [],
  );

  useEffect(() => {
    excaliDrawModelRef.current?.focus();
  }, []);

  // Sync initial state if modal reopens
  useEffect(() => {
    setElements(initialElements);
    setFiles(initialFiles);
    setHasUnsavedChanges(false);
  }, [initialElements, initialFiles, isShown]);

  const discard = () => {
    if (hasUnsavedChanges) {
      setDiscardModalOpen(true);
    } else {
      if (isExistingDrawing) {
        onClose();
      } else {
        onDelete();
      }
    }
  };

  const handleConfirmDiscard = () => {
    setDiscardModalOpen(false);
    setHasUnsavedChanges(false);
    if (isExistingDrawing) {
      onClose();
    } else {
      onDelete();
    }
  };

  useEffect(() => {
    let modalOverlayElement: HTMLElement | null = null;

    const clickOutsideHandler = (event: MouseEvent) => {
      const target = event.target;
      if (
        excaliDrawModelRef.current !== null &&
        isDOMNode(target) &&
        !excaliDrawModelRef.current.contains(target) &&
        closeOnClickOutside
      ) {
        discard();
      }
    };

    if (excaliDrawModelRef.current !== null) {
      modalOverlayElement = excaliDrawModelRef.current?.parentElement;
      modalOverlayElement?.addEventListener('click', clickOutsideHandler);
    }

    return () => {
      modalOverlayElement?.removeEventListener('click', clickOutsideHandler);
    };
  }, [closeOnClickOutside, discard]);

  useLayoutEffect(() => {
    const currentModalRef = excaliDrawModelRef.current;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        discard();
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        save();
      }
    };

    currentModalRef?.addEventListener('keydown', onKeyDown);

    return () => {
      currentModalRef?.removeEventListener('keydown', onKeyDown);
    };
  }, [elements, files, hasUnsavedChanges, isExistingDrawing]);

  const save = () => {
    const currentElements = excalidrawAPI?.getSceneElements() || elements || [];
    const currentFiles = excalidrawAPI?.getFiles() || files || {};
    const hasActiveContent = currentElements.some((el) => !el.isDeleted);

    if (hasActiveContent) {
      const appState = excalidrawAPI?.getAppState();
      const partialState: Partial<AppState> = {
        exportBackground: appState?.exportBackground ?? false,
        exportScale: appState?.exportScale ?? 1,
        exportWithDarkMode: isDarkMode,
        isBindingEnabled: appState?.isBindingEnabled,
        isLoading: false,
        name: appState?.name,
        theme: isDarkMode ? 'dark' : 'light',
        viewBackgroundColor: appState?.viewBackgroundColor,
        viewModeEnabled: appState?.viewModeEnabled,
        zenModeEnabled: appState?.zenModeEnabled,
        zoom: appState?.zoom,
      };
      onSave(currentElements, partialState, currentFiles);
      setHasUnsavedChanges(false);
    } else {
      // If the scene was completely emptied and user saves, remove the node
      onDelete();
    }
  };

  if (!isShown) {
    return null;
  }

  const onChange = (
    els: ExcalidrawInitialElements,
    _: AppState,
    fls: BinaryFiles,
  ) => {
    setElements(els);
    setFiles(fls);

    const hasChanges =
      els && initialElements
        ? els.length !== initialElements.length ||
          els.some(
            (el, idx) =>
              JSON.stringify(el) !== JSON.stringify(initialElements[idx]),
          )
        : els !== initialElements;

    setHasUnsavedChanges(hasChanges);
  };

  const hasContent = elements?.some((el) => !el.isDeleted);

  function DiscardConfirmationDialog(): JSX.Element {
    return (
      <Dialog open={discardModalOpen} onOpenChange={setDiscardModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center sm:text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle className="text-lg font-semibold text-foreground">
              Discard Changes?
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              You have unsaved changes in your drawing. Are you sure you want to discard them? This cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button
              variant="outline"
              onClick={() => setDiscardModalOpen(false)}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDiscard}
              className="flex-1 sm:flex-none"
            >
              <Trash2 className="mr-1.5 h-4 w-4" />
              Discard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return createPortal(
    <AnimatePresence mode="wait">
      <motion.div
        className="fixed inset-0 z-[250] flex items-center justify-center p-2 sm:p-4"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={backdropVariants}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => {
            if (closeOnClickOutside) {
              discard();
            }
          }}
        />

        {/* Modal Window */}
        <motion.div
          className={cn(
            'relative z-10 flex flex-col overflow-hidden border border-border bg-card shadow-2xl transition-all duration-200',
            isFullscreen
              ? 'fixed inset-0 h-screen w-screen max-w-none rounded-none'
              : 'h-[90vh] w-full max-w-6xl rounded-2xl',
          )}
          ref={excaliDrawModelRef}
          tabIndex={-1}
          variants={modalVariants}
          role="dialog"
          aria-modal="true"
          aria-labelledby="excalidraw-title"
          aria-describedby="excalidraw-description"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-muted/40 px-5 py-3.5 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shadow-sm">
                <Palette className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2
                    id="excalidraw-title"
                    className="text-base font-semibold text-foreground tracking-tight"
                  >
                    Excalidraw Editor
                  </h2>
                  {hasUnsavedChanges ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                      Unsaved
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <Check className="h-3 w-3" />
                      Saved
                    </span>
                  )}
                </div>
                <p
                  id="excalidraw-description"
                  className="text-xs text-muted-foreground hidden sm:block"
                >
                  Create and design diagrams, flowcharts, and sketches
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={discard}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                aria-label="Close drawing editor"
                title="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Excalidraw Canvas Area */}
          <div className="flex-1 w-full h-full overflow-hidden bg-background relative">
            <Excalidraw
              onChange={onChange}
              excalidrawAPI={setExcalidrawAPI}
              initialData={{
                appState: initialAppState || { isLoading: false },
                elements: initialElements,
                files: initialFiles,
              }}
              theme={isDarkMode ? 'dark' : 'light'}
              UIOptions={{
                canvasActions: {
                  changeViewBackgroundColor: true,
                  clearCanvas: true,
                  export: { saveFileToDisk: true },
                  loadScene: false,
                  saveToActiveFile: false,
                  toggleTheme: true,
                },
              }}
            />
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between border-t border-border bg-muted/40 px-5 py-3">
            <div className="hidden sm:flex items-center space-x-2 text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[11px] font-mono shadow-xs">
                  {isMac ? '⌘' : 'Ctrl'}
                </kbd>
                <span>+</span>
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[11px] font-mono shadow-xs">
                  S
                </kbd>
                <span className="ml-1">Save</span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[11px] font-mono shadow-xs">
                  Esc
                </kbd>
                <span className="ml-1">Close</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={discard}
                className="min-w-[80px]"
              >
                <X className="mr-1.5 h-3.5 w-3.5" />
                {hasUnsavedChanges ? 'Discard' : 'Close'}
              </Button>

              <Button
                size="sm"
                onClick={save}
                disabled={!hasContent && !isExistingDrawing}
                className="min-w-[100px] shadow-sm"
              >
                <Save className="mr-1.5 h-3.5 w-3.5" />
                Save Drawing
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Discard Confirmation Dialog */}
        {discardModalOpen && <DiscardConfirmationDialog />}
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
