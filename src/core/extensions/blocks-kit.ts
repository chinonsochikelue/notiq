import React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { Extension } from "../extension";
import {
  setEditorNodeRenderers,
  clearEditorNodeRenderers,
  type NotiqNodeRenderers,
} from "../react/node-renderers";
import SlashCommand, {
  type SlashCommandPluginProps,
  type SlashCommandRenderProps,
} from "../../components/editor/plugins/SlashCommand";
import DraggableBlockPlugin, {
  type DraggableBlockPluginProps,
  type DraggableBlockRenderProps,
  type DraggableBlockTurnIntoType,
} from "../../components/editor/plugins/DraggableBlockPlugin";
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

export type {
  SlashCommandPluginProps,
  SlashCommandRenderProps,
  DraggableBlockPluginProps,
  DraggableBlockRenderProps,
  DraggableBlockTurnIntoType,
  NotiqNodeRenderers,
};

export type SlashMenuOptions = SlashCommandPluginProps;
export type BlockHandleOptions = DraggableBlockPluginProps;

export const SlashMenu = Extension.create<SlashMenuOptions>({
  name: "slashMenu",
  defaultOptions: {
    headless: false,
  },
  plugins: ({ options }) => {
    const BoundSlashMenu: React.FC = () =>
      React.createElement(
        SlashCommand as React.ComponentType<SlashCommandPluginProps>,
        {
          headless: options.headless,
          render: options.render,
          onStateChange: options.onStateChange,
        }
      );
    BoundSlashMenu.displayName = "NotiqSlashMenu";
    return [BoundSlashMenu];
  },
});

export const BlockHandle = Extension.create<BlockHandleOptions>({
  name: "blockHandle",
  defaultOptions: {
    headless: false,
  },
  plugins: ({ options }) => {
    const BoundBlockHandle: React.FC = () =>
      React.createElement(
        DraggableBlockPlugin as React.ComponentType<DraggableBlockPluginProps>,
        {
          anchorElem: options.anchorElem,
          className: options.className,
          headless: options.headless,
          render: options.render,
          renderTargetLine: options.renderTargetLine,
          onStateChange: options.onStateChange,
        }
      );
    BoundBlockHandle.displayName = "NotiqBlockHandle";
    return [BoundBlockHandle];
  },
});

export interface BlocksKitOptions {
  /** When true, suppresses default UI for SlashMenu and BlockHandle. */
  headless?: boolean;
  /** Configure or disable the SlashMenu extension. */
  slashMenu?: boolean | SlashMenuOptions;
  /** Configure or disable the BlockHandle (DraggableBlockPlugin) extension. */
  handles?: boolean | BlockHandleOptions;
  /** Custom React renderers for rich decorator nodes (hint, excalidraw, poll, image, inlineImage). */
  renderers?: NotiqNodeRenderers;
}

export const NodeRenderers = Extension.create<{ renderers: NotiqNodeRenderers }>({
  name: "nodeRenderers",
  defaultOptions: {
    renderers: {},
  },
  plugins: ({ options }) => {
    const BoundNodeRenderersPlugin: React.FC = () => {
      const [editor] = useLexicalComposerContext();
      React.useEffect(() => {
        setEditorNodeRenderers(editor, options.renderers);
        return () => {
          clearEditorNodeRenderers(editor);
        };
      }, [editor]);
      return null;
    };
    BoundNodeRenderersPlugin.displayName = "NotiqNodeRenderers";
    return [BoundNodeRenderersPlugin];
  },
});

export const BlocksKit = Extension.create<BlocksKitOptions>({
  name: "blocksKit",
  defaultOptions: {
    headless: false,
    slashMenu: true,
    handles: true,
  },
  addExtensions: ({ options }) => {
    const extensions = [
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
    ];

    if (options.renderers) {
      extensions.push(NodeRenderers.configure({ renderers: options.renderers }));
    }

    if (options.slashMenu !== false) {
      const slashOpts =
        typeof options.slashMenu === "object" ? options.slashMenu : {};
      extensions.push(
        SlashMenu.configure({
          headless: options.headless,
          ...slashOpts,
        })
      );
    }

    if (options.handles !== false) {
      const handleOpts =
        typeof options.handles === "object" ? options.handles : {};
      extensions.push(
        BlockHandle.configure({
          headless: options.headless,
          ...handleOpts,
        })
      );
    }

    return extensions;
  },
});
