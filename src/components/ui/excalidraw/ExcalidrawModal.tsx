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

// import './ExcalidrawModal.css';

import { Excalidraw } from '@excalidraw/excalidraw';
import { isDOMNode } from 'lexical';
import * as React from 'react';
import { ReactPortal, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../dialog';
import { Button } from '../button';
import { Save, X, Trash2, AlertTriangle, Palette } from 'lucide-react';


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
    scale: 0.95,
    y: 20,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: 0.2,
    },
  },
};

const backdropVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 }
  },
};

const actionsVariants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.2, duration: 0.3 }
  },
};

/**
 * @explorer-desc
 * A component which renders a modal with Excalidraw (a painting app)
 * which can be used to export an editable image
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

  useEffect(() => {
    excaliDrawModelRef.current?.focus();
  }, []);

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
        if (hasUnsavedChanges) {
          setDiscardModalOpen(true);
        } else {
          onDelete();
        }
      }
    };

    if (excaliDrawModelRef.current !== null) {
      modalOverlayElement = excaliDrawModelRef.current?.parentElement;
      modalOverlayElement?.addEventListener('click', clickOutsideHandler);
    }

    return () => {
      modalOverlayElement?.removeEventListener('click', clickOutsideHandler);
    };
  }, [closeOnClickOutside, onDelete, hasUnsavedChanges]);

  useLayoutEffect(() => {
    const currentModalRef = excaliDrawModelRef.current;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        if (hasUnsavedChanges) {
          setDiscardModalOpen(true);
        } else {
          onDelete();
        }
      }
      // Add keyboard shortcuts
      if (event.ctrlKey || event.metaKey) {
        if (event.key === 's') {
          event.preventDefault();
          save();
        }
      }
    };

    currentModalRef?.addEventListener('keydown', onKeyDown);

    return () => {
      currentModalRef?.removeEventListener('keydown', onKeyDown);
    };
  }, [elements, files, onDelete, hasUnsavedChanges]);

  const save = () => {
    if (elements?.some((el) => !el.isDeleted)) {
      const appState = excalidrawAPI?.getAppState();
      // We only need a subset of the state
      const partialState: Partial<AppState> = {
        exportBackground: appState?.exportBackground,
        exportScale: appState?.exportScale,
        exportWithDarkMode: appState?.theme === 'dark',
        isBindingEnabled: appState?.isBindingEnabled,
        isLoading: appState?.isLoading,
        name: appState?.name,
        theme: appState?.theme,
        viewBackgroundColor: appState?.viewBackgroundColor,
        viewModeEnabled: appState?.viewModeEnabled,
        zenModeEnabled: appState?.zenModeEnabled,
        zoom: appState?.zoom,
      };
      onSave(elements, partialState, files);
      setHasUnsavedChanges(false);
    } else {
      // delete node if the scene is clear
      onDelete();
    }
  };

  const discard = () => {
    if (hasUnsavedChanges) {
      setDiscardModalOpen(true);
    } else {
      onClose();
    }
  };

  const handleConfirmDiscard = () => {
    setDiscardModalOpen(false);
    setHasUnsavedChanges(false);
    onClose();
  };

  function DiscardConfirmationDialog(): JSX.Element {
    return (
      <Dialog open={discardModalOpen} onOpenChange={setDiscardModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center sm:text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Discard Changes?
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
              You have unsaved changes in your drawing. Are you sure you want to discard them? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-3 pt-6">
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
              <Trash2 className="mr-2 h-4 w-4" />
              Discard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  if (isShown === false) {
    return null;
  }

  const onChange = (
    els: ExcalidrawInitialElements,
    _: AppState,
    fls: BinaryFiles,
  ) => {
    setElements(els);
    setFiles(fls);

    // Check if there are actual changes by comparing with initial state
    const hasChanges = (els && initialElements) ? (
      els.length !== initialElements.length ||
      els.some((el, idx) => JSON.stringify(el) !== JSON.stringify(initialElements[idx]))
    ) : els !== initialElements;
    setHasUnsavedChanges(hasChanges);
  };

  const hasContent = elements?.some((el) => !el.isDeleted);

  return createPortal(
    <AnimatePresence mode="wait">
      <motion.div
        className="fixed inset-0 z-[250] flex items-center justify-center"
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
              if (hasUnsavedChanges) {
                setDiscardModalOpen(true);
              } else {
                onDelete();
              }
            }
          }}
        />

        {/* Modal Content */}
        <motion.div
          className="relative z-10 mx-4 flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900"
          ref={excaliDrawModelRef}
          tabIndex={-1}
          variants={modalVariants}
          role="dialog"
          aria-modal="true"
          aria-labelledby="excalidraw-title"
          aria-describedby="excalidraw-description"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-800/50">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <Palette className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2
                  id="excalidraw-title"
                  className="text-lg font-semibold text-gray-900 dark:text-gray-100"
                >
                  Drawing Editor
                </h2>
                <p
                  id="excalidraw-description"
                  className="text-sm text-gray-500 dark:text-gray-400"
                >
                  Create and edit your drawings with Excalidraw
                  {hasUnsavedChanges && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
                      Unsaved changes
                    </span>
                  )}
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (hasUnsavedChanges) {
                  setDiscardModalOpen(true);
                } else {
                  onDelete();
                }
              }}
              className="h-8 w-8"
              aria-label="Close drawing editor"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Excalidraw Container */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full w-full">
              <Excalidraw
                onChange={onChange}
                excalidrawAPI={setExcalidrawAPI}
                initialData={{
                  appState: initialAppState || { isLoading: false },
                  elements: initialElements,
                  files: initialFiles,
                }}
                theme="light"
              />
            </div>
          </div>

          {/* Actions Footer */}
          <motion.div
            className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-800/50"
            variants={actionsVariants}
          >
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="hidden md:flex items-center space-x-1">
                <kbd className="rounded bg-gray-200 px-2 py-1 text-xs font-mono dark:bg-gray-700">
                  Ctrl
                </kbd>
                <span>+</span>
                <kbd className="rounded bg-gray-200 px-2 py-1 text-xs font-mono dark:bg-gray-700">
                  S
                </kbd>
                <span className="ml-1">to save</span>
              </div>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <div className="hidden md:flex items-center space-x-1">
                <kbd className="rounded bg-gray-200 px-2 py-1 text-xs font-mono dark:bg-gray-700">
                  Esc
                </kbd>
                <span className="ml-1">to close</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={discard}
                className="min-w-[100px]"
              >
                <X className="mr-2 h-4 w-4" />
                {hasUnsavedChanges ? 'Discard' : 'Close'}
              </Button>

              <Button
                onClick={save}
                disabled={!hasContent}
                className="min-w-[100px]"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Drawing
              </Button>
            </div>
          </motion.div>
        </motion.div>

        {/* Discard Confirmation Dialog */}
        {discardModalOpen && <DiscardConfirmationDialog />}
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}