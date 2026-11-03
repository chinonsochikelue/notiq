/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { LexicalEditor } from 'lexical';
import type { JSX } from 'react';

import { calculateZoomLevel } from '@lexical/utils';
import * as React from 'react';
import { useRef } from 'react';

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

const Direction = {
  east: 1 << 0,
  north: 1 << 3,
  south: 1 << 1,
  west: 1 << 2,
};

export default function ImageResizer({
  onResizeStart,
  onResizeEnd,
  buttonRef,
  imageRef,
  maxWidth,
  editor,
  showCaption,
  setShowCaption,
  captionsEnabled,
}: {
  editor: LexicalEditor;
  buttonRef: { current: null | HTMLButtonElement };
  imageRef: { current: null | HTMLElement };
  maxWidth?: number;
  onResizeEnd: (width: 'inherit' | number, height: 'inherit' | number) => void;
  onResizeStart: () => void;
  setShowCaption: (show: boolean) => void;
  showCaption: boolean;
  captionsEnabled: boolean;
}): JSX.Element {
  const controlWrapperRef = useRef<HTMLDivElement>(null);
  const userSelect = useRef({
    priority: '',
    value: 'default',
  });
  const positioningRef = useRef<{
    currentHeight: 'inherit' | number;
    currentWidth: 'inherit' | number;
    direction: number;
    isResizing: boolean;
    ratio: number;
    startHeight: number;
    startWidth: number;
    startX: number;
    startY: number;
  }>({
    currentHeight: 0,
    currentWidth: 0,
    direction: 0,
    isResizing: false,
    ratio: 0,
    startHeight: 0,
    startWidth: 0,
    startX: 0,
    startY: 0,
  });
  const editorRootElement = editor.getRootElement();
  // Find max width, accounting for editor padding.
  const maxWidthContainer = maxWidth
    ? maxWidth
    : editorRootElement !== null
      ? editorRootElement.getBoundingClientRect().width - 20
      : 100;
  const maxHeightContainer =
    editorRootElement !== null
      ? editorRootElement.getBoundingClientRect().height - 20
      : 100;

  const minWidth = 100;
  const minHeight = 100;

  const setStartCursor = (direction: number) => {
    const ew = direction === Direction.east || direction === Direction.west;
    const ns = direction === Direction.north || direction === Direction.south;
    const nwse =
      (direction & Direction.north && direction & Direction.west) ||
      (direction & Direction.south && direction & Direction.east);

    const cursorDir = ew ? 'ew' : ns ? 'ns' : nwse ? 'nwse' : 'nesw';

    if (editorRootElement !== null) {
      editorRootElement.style.setProperty(
        'cursor',
        `${cursorDir}-resize`,
        'important',
      );
    }
    if (document.body !== null) {
      document.body.style.setProperty(
        'cursor',
        `${cursorDir}-resize`,
        'important',
      );
      userSelect.current.value = document.body.style.getPropertyValue(
        '-webkit-user-select',
      );
      userSelect.current.priority = document.body.style.getPropertyPriority(
        '-webkit-user-select',
      );
      document.body.style.setProperty(
        '-webkit-user-select',
        `none`,
        'important',
      );
    }
  };

  const setEndCursor = () => {
    if (editorRootElement !== null) {
      editorRootElement.style.setProperty('cursor', 'text');
    }
    if (document.body !== null) {
      document.body.style.setProperty('cursor', 'default');
      document.body.style.setProperty(
        '-webkit-user-select',
        userSelect.current.value,
        userSelect.current.priority,
      );
    }
  };

  const handlePointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
    direction: number,
  ) => {
    if (!editor.isEditable()) {
      return;
    }

    const image = imageRef.current;
    const controlWrapper = controlWrapperRef.current;

    if (image !== null && controlWrapper !== null) {
      event.preventDefault();
      const { width, height } = image.getBoundingClientRect();
      const zoom = calculateZoomLevel(image);
      const positioning = positioningRef.current;
      positioning.startWidth = width;
      positioning.startHeight = height;
      positioning.ratio = width / height;
      positioning.currentWidth = width;
      positioning.currentHeight = height;
      positioning.startX = event.clientX / zoom;
      positioning.startY = event.clientY / zoom;
      positioning.isResizing = true;
      positioning.direction = direction;

      setStartCursor(direction);
      onResizeStart();

      controlWrapper.classList.add('image-control-wrapper--resizing');
      image.style.height = `${height}px`;
      image.style.width = `${width}px`;

      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp);
    }
  };

  const handlePointerMove = (event: PointerEvent) => {
    const image = imageRef.current;
    const positioning = positioningRef.current;

    const isHorizontal =
      positioning.direction & (Direction.east | Direction.west);
    const isVertical =
      positioning.direction & (Direction.south | Direction.north);

    if (image !== null && positioning.isResizing) {
      const zoom = calculateZoomLevel(image);
      // Corner cursor
      if (isHorizontal && isVertical) {
        let diff = Math.floor(positioning.startX - event.clientX / zoom);
        diff = positioning.direction & Direction.east ? -diff : diff;

        const width = clamp(
          positioning.startWidth + diff,
          minWidth,
          maxWidthContainer,
        );

        const height = width / positioning.ratio;
        image.style.width = `${width}px`;
        image.style.height = `${height}px`;
        positioning.currentHeight = height;
        positioning.currentWidth = width;
      } else if (isVertical) {
        let diff = Math.floor(positioning.startY - event.clientY / zoom);
        diff = positioning.direction & Direction.south ? -diff : diff;

        const height = clamp(
          positioning.startHeight + diff,
          minHeight,
          maxHeightContainer,
        );

        image.style.height = `${height}px`;
        positioning.currentHeight = height;
      } else {
        let diff = Math.floor(positioning.startX - event.clientX / zoom);
        diff = positioning.direction & Direction.east ? -diff : diff;

        const width = clamp(
          positioning.startWidth + diff,
          minWidth,
          maxWidthContainer,
        );

        image.style.width = `${width}px`;
        positioning.currentWidth = width;
      }
    }
  };

  const handlePointerUp = () => {
    const image = imageRef.current;
    const positioning = positioningRef.current;
    const controlWrapper = controlWrapperRef.current;
    if (image !== null && controlWrapper !== null && positioning.isResizing) {
      const width = positioning.currentWidth;
      const height = positioning.currentHeight;
      positioning.startWidth = 0;
      positioning.startHeight = 0;
      positioning.ratio = 0;
      positioning.startX = 0;
      positioning.startY = 0;
      positioning.currentWidth = 0;
      positioning.currentHeight = 0;
      positioning.isResizing = false;

      controlWrapper.classList.remove('image-control-wrapper--resizing');

      setEndCursor();
      onResizeEnd(width, height);

      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    }
  };

  return (
    <div ref={controlWrapperRef} className="pointer-events-none">
      {!showCaption && captionsEnabled && (
        <button
          className="pointer-events-auto image-caption-button"
          ref={buttonRef}
          onClick={() => {
            setShowCaption(!showCaption);
          }}
        >
          Add Caption
        </button>
      )}
      {/* North */}
      <div
        className="pointer-events-auto absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background ring-1 ring-primary/40 cursor-ns-resize transition-transform hover:scale-125 z-20 shadow-xs"
        onPointerDown={(event) => {
          handlePointerDown(event, Direction.north);
        }}
      />
      {/* North East */}
      <div
        className="pointer-events-auto absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background ring-1 ring-primary/40 cursor-nesw-resize transition-transform hover:scale-125 z-20 shadow-xs"
        onPointerDown={(event) => {
          handlePointerDown(event, Direction.north | Direction.east);
        }}
      />
      {/* East */}
      <div
        className="pointer-events-auto absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background ring-1 ring-primary/40 cursor-ew-resize transition-transform hover:scale-125 z-20 shadow-xs"
        onPointerDown={(event) => {
          handlePointerDown(event, Direction.east);
        }}
      />
      {/* South East */}
      <div
        className="pointer-events-auto absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background ring-1 ring-primary/40 cursor-nwse-resize transition-transform hover:scale-125 z-20 shadow-xs"
        onPointerDown={(event) => {
          handlePointerDown(event, Direction.south | Direction.east);
        }}
      />
      {/* South */}
      <div
        className="pointer-events-auto absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background ring-1 ring-primary/40 cursor-ns-resize transition-transform hover:scale-125 z-20 shadow-xs"
        onPointerDown={(event) => {
          handlePointerDown(event, Direction.south);
        }}
      />
      {/* South West */}
      <div
        className="pointer-events-auto absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background ring-1 ring-primary/40 cursor-nesw-resize transition-transform hover:scale-125 z-20 shadow-xs"
        onPointerDown={(event) => {
          handlePointerDown(event, Direction.south | Direction.west);
        }}
      />
      {/* West */}
      <div
        className="pointer-events-auto absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background ring-1 ring-primary/40 cursor-ew-resize transition-transform hover:scale-125 z-20 shadow-xs"
        onPointerDown={(event) => {
          handlePointerDown(event, Direction.west);
        }}
      />
      {/* North West */}
      <div
        className="pointer-events-auto absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background ring-1 ring-primary/40 cursor-nwse-resize transition-transform hover:scale-125 z-20 shadow-xs"
        onPointerDown={(event) => {
          handlePointerDown(event, Direction.north | Direction.west);
        }}
      />
    </div>
  );
}
