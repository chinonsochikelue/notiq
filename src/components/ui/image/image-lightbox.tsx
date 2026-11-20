"use client";

import React, { useCallback, useEffect, useState } from "react";
import * as ReactDOM from "react-dom";
import { Download, RotateCcw, X, ZoomIn, ZoomOut } from "lucide-react";

export interface ImageLightboxProps {
  src: string;
  altText?: string;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Full-screen interactive lightbox modal for viewing editor images at full resolution
 * with keyboard shortcuts (Escape, +, -, 0) and zoom controls.
 */
export default function ImageLightbox({
  src,
  altText,
  isOpen,
  onClose,
}: ImageLightboxProps) {
  const [zoom, setZoom] = useState(1);

  const zoomIn = useCallback(() => {
    setZoom((z) => Math.min(3, Number((z + 0.25).toFixed(2))));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((z) => Math.max(0.5, Number((z - 0.25).toFixed(2))));
  }, []);

  const resetZoom = useCallback(() => {
    setZoom(1);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setZoom(1);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        zoomIn();
      } else if (e.key === "-") {
        e.preventDefault();
        zoomOut();
      } else if (e.key === "0") {
        e.preventDefault();
        resetZoom();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, zoomIn, zoomOut, resetZoom]);

  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  return ReactDOM.createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={altText ? `Image preview: ${altText}` : "Image preview"}
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex flex-col bg-black/85 backdrop-blur-md animate-in fade-in-0 duration-150"
    >
      {/* Top Control Bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex items-center justify-between gap-4 px-4 py-3 text-white/90 border-b border-white/10 bg-black/40"
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">
            {altText || "Image Preview"}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={zoomOut}
            disabled={zoom <= 0.5}
            aria-label="Zoom out"
            title="Zoom out (-)"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-40 transition-colors cursor-pointer"
          >
            <ZoomOut className="h-4 w-4" />
          </button>

          <span className="min-w-[48px] text-center font-mono text-xs text-white/80">
            {Math.round(zoom * 100)}%
          </span>

          <button
            type="button"
            onClick={zoomIn}
            disabled={zoom >= 3}
            aria-label="Zoom in"
            title="Zoom in (+)"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-40 transition-colors cursor-pointer"
          >
            <ZoomIn className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={resetZoom}
            aria-label="Reset zoom"
            title="Reset zoom (0)"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <a
            href={src}
            download={altText || "image"}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Download image"
            title="Download / Open original"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
          >
            <Download className="h-4 w-4" />
          </a>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close lightbox"
            title="Close (Esc)"
            className="ml-1 flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 hover:bg-white/25 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Image Viewport */}
      <div
        onWheel={(e) => {
          if (e.deltaY < 0) zoomIn();
          else if (e.deltaY > 0) zoomOut();
        }}
        className="flex-1 overflow-auto flex items-center justify-center p-6"
      >
        <img
          src={src}
          alt={altText || "Preview"}
          onClick={(e) => e.stopPropagation()}
          style={{ transform: `scale(${zoom})` }}
          className="max-h-full max-w-full rounded-lg object-contain shadow-2xl transition-transform duration-150 select-none"
          draggable={false}
        />
      </div>
    </div>,
    document.body
  );
}
