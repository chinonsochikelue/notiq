"use client";

import React, { useState } from "react";
import type { LexicalEditor } from "lexical";
import { INSERT_AUDIO_COMMAND } from "../../editor/nodes/AudioNode";
import { Music, UploadCloud, Sparkles, Link as LinkIcon } from "lucide-react";
import { Button } from "../button";
import { Input } from "../input";
import { Label } from "../label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs";

const SAMPLE_TRACKS = [
  {
    title: "Ambient Lo-Fi Chill",
    author: "SoundHelix Sample",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    title: "Acoustic Breeze",
    author: "Royalty Free Audio",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    title: "Podcast Audio Intro",
    author: "Notiq Studio",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
];

export function InsertAudioDialog({
  activeEditor,
  onClose,
}: {
  activeEditor: LexicalEditor;
  onClose: () => void;
}) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");

  const handleInsert = (audioSrc: string, audioTitle?: string, audioAuthor?: string) => {
    if (!audioSrc.trim()) return;
    activeEditor.dispatchCommand(INSERT_AUDIO_COMMAND, {
      src: audioSrc.trim(),
      title: audioTitle?.trim() || "Audio Track",
      author: audioAuthor?.trim() || "Audio Clip",
    });
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    const fileName = file.name.replace(/\.[^/.]+$/, "");
    handleInsert(fileUrl, fileName, `${(file.size / (1024 * 1024)).toFixed(1)} MB`);
  };

  return (
    <div className="w-full max-w-md p-2 space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Music className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Insert Audio Player</h3>
          <p className="text-xs text-muted-foreground">
            Embed an audio stream, podcast, or sound file
          </p>
        </div>
      </div>

      <Tabs defaultValue="url" className="w-full">
        <TabsList className="grid grid-cols-3 w-full h-8 text-xs">
          <TabsTrigger value="url" className="text-xs">Link / URL</TabsTrigger>
          <TabsTrigger value="upload" className="text-xs">Upload File</TabsTrigger>
          <TabsTrigger value="samples" className="text-xs">Demo Samples</TabsTrigger>
        </TabsList>

        <TabsContent value="url" className="space-y-3 pt-3">
          <div className="space-y-1">
            <Label htmlFor="audio-url" className="text-xs">Audio URL (MP3, WAV, Stream)</Label>
            <div className="relative">
              <LinkIcon className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                id="audio-url"
                placeholder="https://example.com/audio.mp3"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pl-8 text-xs h-8"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="audio-title" className="text-xs">Track Title</Label>
              <Input
                id="audio-title"
                placeholder="e.g. Episode #12"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xs h-8"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="audio-author" className="text-xs">Artist / Show</Label>
              <Input
                id="audio-author"
                placeholder="e.g. Tech Talk"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="text-xs h-8"
              />
            </div>
          </div>

          <Button
            onClick={() => handleInsert(url, title, author)}
            disabled={!url.trim()}
            className="w-full text-xs h-8"
          >
            Insert Audio
          </Button>
        </TabsContent>

        <TabsContent value="upload" className="space-y-3 pt-3">
          <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-xl hover:border-primary/60 transition-colors cursor-pointer bg-muted/20">
            <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-xs font-semibold text-foreground">Click to upload audio file</span>
            <span className="text-[11px] text-muted-foreground">Supports MP3, WAV, AAC, M4A, OGG</span>
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </TabsContent>

        <TabsContent value="samples" className="space-y-2 pt-3">
          <p className="text-xs text-muted-foreground">Click any track to insert instantly:</p>
          <div className="space-y-1.5">
            {SAMPLE_TRACKS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleInsert(sample.src, sample.title, sample.author)}
                className="w-full flex items-center justify-between p-2 rounded-lg border border-border/70 hover:border-primary/50 hover:bg-muted/50 transition-all text-left group"
              >
                <div>
                  <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                    {sample.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{sample.author}</p>
                </div>
                <Sparkles className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
              </button>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
export default InsertAudioDialog;
