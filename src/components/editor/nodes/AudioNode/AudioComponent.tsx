"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { BlockWithAlignableContents } from "@lexical/react/LexicalBlockWithAlignableContents";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNodeByKey, type ElementFormatType, type NodeKey } from "lexical";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  Music,
  Download,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { cn } from "../../../../lib/utils";
import { $isAudioNode } from "./index";

interface AudioComponentProps {
  className: Readonly<{
    base: string;
    focus: string;
  }>;
  format: ElementFormatType | null;
  nodeKey: NodeKey;
  src: string;
  title: string;
  author?: string;
}

function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export default function AudioComponent({
  className,
  format,
  nodeKey,
  src,
  title: initialTitle,
  author: initialAuthor,
}: AudioComponentProps) {
  const [editor] = useLexicalComposerContext();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [title, setTitle] = useState(initialTitle || "Audio Track");
  const [author, setAuthor] = useState(initialAuthor || "Audio Clip");
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // Sync title changes back to the Lexical node
  const handleTitleBlur = useCallback(() => {
    setIsEditingTitle(false);
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isAudioNode(node)) {
        node.setTitle(title);
        node.setAuthor(author);
      }
    });
  }, [editor, nodeKey, title, author]);

  // Audio element listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const cycleSpeed = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const speeds = [1, 1.25, 1.5, 2];
    const nextSpeed = speeds[(speeds.indexOf(playbackRate) + 1) % speeds.length];
    audio.playbackRate = nextSpeed;
    setPlaybackRate(nextSpeed);
  };

  const restartAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    setCurrentTime(0);
    audio.play().catch(() => {});
    setIsPlaying(true);
  };

  const handleDelete = () => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (node) {
        node.remove();
      }
    });
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <BlockWithAlignableContents className={className} format={format} nodeKey={nodeKey}>
      <div className="relative my-4 w-full max-w-2xl rounded-2xl border border-border/80 bg-card/95 p-4 shadow-sm hover:shadow-md transition-all select-none group">
        {/* Hidden HTML Audio element */}
        <audio ref={audioRef} src={src} preload="metadata" />

        <div className="flex items-center justify-between gap-3 pb-3 border-b border-border/50">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={cn(
                "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300",
                isPlaying
                  ? "bg-primary text-primary-foreground shadow-md scale-105"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <Music className={cn("h-5 w-5", isPlaying && "animate-pulse")} />
            </div>

            <div className="min-w-0">
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleTitleBlur}
                    onKeyDown={(e) => e.key === "Enter" && handleTitleBlur()}
                    autoFocus
                    className="h-6 rounded border border-primary/50 bg-background px-1.5 text-xs font-semibold focus:outline-none"
                  />
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    onBlur={handleTitleBlur}
                    onKeyDown={(e) => e.key === "Enter" && handleTitleBlur()}
                    className="h-6 rounded border border-border bg-background px-1.5 text-[11px] text-muted-foreground focus:outline-none"
                  />
                </div>
              ) : (
                <div
                  onDoubleClick={() => setIsEditingTitle(true)}
                  className="cursor-pointer group/title"
                  title="Double click to edit title"
                >
                  <p className="truncate text-sm font-semibold text-foreground group-hover/title:text-primary transition-colors">
                    {title}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">{author}</p>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={cycleSpeed}
              className="rounded-md px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              title="Playback speed"
            >
              {playbackRate}x
            </button>
            <button
              type="button"
              onClick={toggleMute}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <a
              href={src}
              download={title || "audio"}
              target="_blank"
              rel="noreferrer"
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              title="Download or open audio file"
            >
              <Download className="h-4 w-4" />
            </a>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              title="Delete audio player"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Player controls & Waveform bar */}
        <div className="flex items-center gap-3 pt-3">
          <button
            type="button"
            onClick={togglePlay}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm hover:scale-105 active:scale-95 transition-all"
            aria-label={isPlaying ? "Pause audio" : "Play audio"}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
          </button>

          <button
            type="button"
            onClick={restartAudio}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Restart"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          {/* Scrubber track */}
          <div className="relative flex-1 flex items-center group/track">
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 rounded-lg bg-muted appearance-none cursor-pointer accent-primary"
            />
          </div>

          <div className="shrink-0 font-mono text-[11px] text-muted-foreground">
            {formatDuration(currentTime)} / {formatDuration(duration)}
          </div>
        </div>
      </div>
    </BlockWithAlignableContents>
  );
}
