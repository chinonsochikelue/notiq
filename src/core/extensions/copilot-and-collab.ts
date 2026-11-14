"use client";

import React from "react";
import { Extension } from "../extension";
import {
  OPEN_AI_COMMAND_BAR_COMMAND,
  type AICommandBarPluginProps,
  type AICommandBarRenderProps,
} from "../../components/editor/plugins/AICommandBarPlugin";
import InlineCopilotPlugin, {
  type InlineCopilotPluginProps,
  type InlineCopilotRenderProps,
} from "../../components/editor/plugins/InlineCopilotPlugin";
import CollaborationPlugin from "../../components/editor/plugins/CollaborationPlugin";
import AICommandBarPlugin from "../../components/editor/plugins/AICommandBarPlugin";

export type { AICommandBarRenderProps, InlineCopilotRenderProps };

export interface AICommandBarOptions {
  headless?: boolean;
  apiEndpoint?: string;
  render?: (state: AICommandBarRenderProps) => React.ReactNode;
  onStateChange?: (state: AICommandBarRenderProps) => void;
}

export const AICommandBar = Extension.create<AICommandBarOptions>({
  name: "aiCommandBar",
  defaultOptions: {
    headless: false,
  },
  plugins: ({ options }) => {
    const BoundCommandBar: React.FC = () =>
      React.createElement(
        AICommandBarPlugin as React.ComponentType<AICommandBarPluginProps>,
        {
          headless: options.headless,
          apiEndpoint: options.apiEndpoint,
          render: options.render,
          onStateChange: options.onStateChange,
        }
      );
    return [BoundCommandBar];
  },
  addCommands: () => ({
    openAICommandBar:
      (payload?: { initialPrompt?: string; action?: string }) =>
      ({ lexical }) => {
        lexical.dispatchCommand(OPEN_AI_COMMAND_BAR_COMMAND, payload);
        return true;
      },
  }),
});

export interface AICopilotOptions {
  enabled?: boolean;
  headless?: boolean;
  render?: (state: InlineCopilotRenderProps) => React.ReactNode;
  onStateChange?: (state: InlineCopilotRenderProps) => void;
  commandBar?: AICommandBarOptions;
}

export const AICopilot = Extension.create<AICopilotOptions>({
  name: "aiCopilot",
  defaultOptions: {
    enabled: true,
    headless: false,
  },
  addExtensions: ({ options }) => [
    AICommandBar.configure({
      headless: options.commandBar?.headless ?? options.headless,
      apiEndpoint: options.commandBar?.apiEndpoint,
      render: options.commandBar?.render,
      onStateChange: options.commandBar?.onStateChange,
    }),
  ],
  plugins: ({ options }) => {
    if (options.enabled === false) return [];
    const BoundCopilot: React.FC = () =>
      React.createElement(
        InlineCopilotPlugin as React.ComponentType<InlineCopilotPluginProps>,
        {
          headless: options.headless,
          render: options.render,
          onStateChange: options.onStateChange,
        }
      );
    return [BoundCopilot];
  },
});

export interface CollaborationOptions {
  enabled?: boolean;
}

export const Collaboration = Extension.create<CollaborationOptions>({
  name: "collaboration",
  defaultOptions: {
    enabled: true,
  },
  plugins: ({ options }) => {
    if (options.enabled === false) return [];
    return [CollaborationPlugin as React.ComponentType<any>];
  },
});
