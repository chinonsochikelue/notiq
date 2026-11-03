import { Extension } from "../extension";
import { $getSelection, $isRangeSelection, $insertNodes } from "lexical";
import { ExcalidrawNode, $createExcalidrawNode } from "../../components/editor/nodes/ExcalidrawNode";
import { FigmaNode, $createFigmaNode } from "../../components/editor/nodes/FigmaNode/FigmaNode";
import { EquationNode, $createEquationNode } from "../../components/editor/nodes/EquationNode/EquationNode";
import { Hint, $createHintNode, type HintType } from "../../components/editor/nodes/Hint";
import { StepperNode, $createStepperNode, type StepsType } from "../../components/editor/nodes/Stepper";
import { PollNode, $createPollNode, createPollOption } from "../../components/editor/nodes/PollNode";
import { ImageNode, $createImageNode, type ImagePayload } from "../../components/editor/nodes/ImageNode";
import { TweetNode, $createTweetNode } from "../../components/editor/nodes/TweetNode";
import { YouTubeNode, $createYouTubeNode } from "../../components/editor/plugins/YouTubeNode";
import { AudioNode, $createAudioNode, type AudioPayload } from "../../components/editor/nodes/AudioNode";
import { FileNode, $createFileNode, type FilePayload } from "../../components/editor/nodes/FileNode";
import { LayoutContainerNode } from "../../components/editor/nodes/LayoutNode/LayoutContainerNode";
import { LayoutItemNode } from "../../components/editor/nodes/LayoutNode/LayoutItemNode";
import { INSERT_LAYOUT_COMMAND } from "../../components/editor/plugins/LayoutPlugin";

export const Excalidraw = Extension.create({
  name: "excalidraw",
  nodes: () => [ExcalidrawNode],
  addCommands: () => ({
    insertExcalidraw:
      (data?: { data?: string }) =>
      ({ lexical }) => {
        lexical.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const node = $createExcalidrawNode();
            if (data?.data) {
              node.setData(data.data);
            }
            selection.insertNodes([node]);
          }
        });
        return true;
      },
  }),
});

export const Figma = Extension.create({
  name: "figma",
  nodes: () => [FigmaNode],
  addCommands: () => ({
    insertFigma:
      (options: { url: string }) =>
      ({ lexical }) => {
        if (!options?.url) return false;
        lexical.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            selection.insertNodes([$createFigmaNode(options.url)]);
          }
        });
        return true;
      },
  }),
});

export const Equation = Extension.create({
  name: "equation",
  nodes: () => [EquationNode],
  addCommands: () => ({
    insertEquation:
      (options: { equation: string; inline?: boolean }) =>
      ({ lexical }) => {
        if (!options?.equation) return false;
        lexical.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            selection.insertNodes([
              $createEquationNode(options.equation, !!options.inline),
            ]);
          }
        });
        return true;
      },
  }),
});

export const HintBlock = Extension.create({
  name: "hint",
  nodes: () => [Hint],
  addCommands: () => ({
    insertHint:
      (options?: { variant?: HintType }) =>
      ({ lexical }) => {
        const variant = options?.variant || "info";
        lexical.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            selection.insertNodes([$createHintNode(variant)]);
          }
        });
        return true;
      },
  }),
});

export const Stepper = Extension.create({
  name: "stepper",
  nodes: () => [StepperNode],
  addCommands: () => ({
    insertStepper:
      (steps?: StepsType) =>
      ({ lexical }) => {
        lexical.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            selection.insertNodes([$createStepperNode(steps || [])]);
          }
        });
        return true;
      },
  }),
});

export const Poll = Extension.create({
  name: "poll",
  nodes: () => [PollNode],
  addCommands: () => ({
    insertPoll:
      (options: { question: string; options?: string[] }) =>
      ({ lexical }) => {
        if (!options?.question) return false;
        const choices = (options.options || ["Option 1", "Option 2"]).map((t) =>
          createPollOption(t)
        );
        lexical.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            selection.insertNodes([$createPollNode(options.question, choices)]);
          }
        });
        return true;
      },
  }),
});

export const Image = Extension.create({
  name: "image",
  nodes: () => [ImageNode],
  addCommands: () => ({
    insertImage:
      (payload: ImagePayload) =>
      ({ lexical }) => {
        if (!payload?.src) return false;
        lexical.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            selection.insertNodes([$createImageNode(payload)]);
          }
        });
        return true;
      },
  }),
});

export const Tweet = Extension.create({
  name: "tweet",
  nodes: () => [TweetNode],
  addCommands: () => ({
    insertTweet:
      (options: { tweetId: string }) =>
      ({ lexical }) => {
        if (!options?.tweetId) return false;
        lexical.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            selection.insertNodes([$createTweetNode(options.tweetId)]);
          }
        });
        return true;
      },
  }),
});

export const YouTube = Extension.create({
  name: "youtube",
  nodes: () => [YouTubeNode],
  addCommands: () => ({
    insertYouTube:
      (options: { videoId: string }) =>
      ({ lexical }) => {
        if (!options?.videoId) return false;
        lexical.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            selection.insertNodes([$createYouTubeNode(options.videoId)]);
          }
        });
        return true;
      },
  }),
});

export const Audio = Extension.create({
  name: "audio",
  nodes: () => [AudioNode],
  addCommands: () => ({
    insertAudio:
      (payload: AudioPayload) =>
      ({ lexical }) => {
        if (!payload?.src) return false;
        lexical.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            selection.insertNodes([$createAudioNode(payload)]);
          }
        });
        return true;
      },
  }),
});

export const File = Extension.create({
  name: "file",
  nodes: () => [FileNode],
  addCommands: () => ({
    insertFile:
      (payload: FilePayload) =>
      ({ lexical }) => {
        if (!payload?.url) return false;
        lexical.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            selection.insertNodes([$createFileNode(payload)]);
          }
        });
        return true;
      },
  }),
});

export const ColumnsLayout = Extension.create({
  name: "columnsLayout",
  nodes: () => [LayoutContainerNode, LayoutItemNode],
  addCommands: () => ({
    setColumns:
      (columns: 2 | 3 = 2) =>
      ({ lexical }) => {
        lexical.dispatchCommand(
          INSERT_LAYOUT_COMMAND,
          columns === 2 ? "1fr 1fr" : "1fr 1fr 1fr"
        );
        return true;
      },
  }),
});

export const BlocksKit = Extension.create({
  name: "blocksKit",
  addExtensions: () => [
    Excalidraw,
    Figma,
    Equation,
    HintBlock,
    Stepper,
    Poll,
    Image,
    Tweet,
    YouTube,
    Audio,
    File,
    ColumnsLayout,
  ],
});
