import { describe, it, expect } from "vitest";
import { createEditor, $getRoot } from "lexical";
import nodes from "../nodes";
import { $createAudioNode, $isAudioNode, AudioNode } from "../nodes/AudioNode";
import { $createFileNode, $isFileNode, FileNode } from "../nodes/FileNode";
import { $convertToMarkdownString, $convertFromMarkdownString } from "@lexical/markdown";
import { NOTIQ_TRANSFORMERS } from "../utils/markdownTransformers";

describe("New Block Types: AudioNode & FileNode", () => {
  it("creates and serializes AudioNode correctly", () => {
    const editor = createEditor({ nodes: [...nodes] });

    editor.update(() => {
      const audio = $createAudioNode({
        src: "https://example.com/podcast.mp3",
        title: "Episode 1",
        author: "Tech Show",
      });

      expect($isAudioNode(audio)).toBe(true);
      expect(audio.getSrc()).toBe("https://example.com/podcast.mp3");
      expect(audio.getTitle()).toBe("Episode 1");
      expect(audio.getAuthor()).toBe("Tech Show");

      const json = audio.exportJSON();
      expect(json.src).toBe("https://example.com/podcast.mp3");
      expect(json.title).toBe("Episode 1");
      expect(json.author).toBe("Tech Show");

      const restored = AudioNode.importJSON(json);
      expect(restored.getSrc()).toBe("https://example.com/podcast.mp3");
      expect(restored.getTitle()).toBe("Episode 1");
    });
  });

  it("creates and serializes FileNode correctly", () => {
    const editor = createEditor({ nodes: [...nodes] });

    editor.update(() => {
      const file = $createFileNode({
        url: "https://example.com/document.pdf",
        title: "Project Proposal",
        size: "2.4 MB",
        extension: "pdf",
      });

      expect($isFileNode(file)).toBe(true);
      expect(file.getUrl()).toBe("https://example.com/document.pdf");
      expect(file.getTitle()).toBe("Project Proposal");
      expect(file.getSize()).toBe("2.4 MB");
      expect(file.getExtension()).toBe("pdf");

      const json = file.exportJSON();
      expect(json.url).toBe("https://example.com/document.pdf");
      expect(json.title).toBe("Project Proposal");
      expect(json.size).toBe("2.4 MB");

      const restored = FileNode.importJSON(json);
      expect(restored.getUrl()).toBe("https://example.com/document.pdf");
      expect(restored.getTitle()).toBe("Project Proposal");
    });
  });

  it("exports and imports AudioNode in Markdown via NOTIQ_TRANSFORMERS", () => {
    const editor = createEditor({ nodes: [...nodes] });

    editor.update(() => {
      const root = $getRoot();
      root.clear();
      const audio = $createAudioNode({
        src: "https://example.com/song.mp3",
        title: "Summer Beat",
      });
      root.append(audio);

      const markdown = $convertToMarkdownString(NOTIQ_TRANSFORMERS);
      expect(markdown).toContain("[🎵 Audio: Summer Beat](https://example.com/song.mp3)");
    });
  });

  it("exports and imports FileNode in Markdown via NOTIQ_TRANSFORMERS", () => {
    const editor = createEditor({ nodes: [...nodes] });

    editor.update(() => {
      const root = $getRoot();
      root.clear();
      const file = $createFileNode({
        url: "https://example.com/report.pdf",
        title: "Financial Report",
        size: "1.5 MB",
      });
      root.append(file);

      const markdown = $convertToMarkdownString(NOTIQ_TRANSFORMERS);
      expect(markdown).toContain("📎 [Financial Report (1.5 MB)](https://example.com/report.pdf)");
    });
  });
});
