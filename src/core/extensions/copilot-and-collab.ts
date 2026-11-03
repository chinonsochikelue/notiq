"use client";

import React from "react";
import { Extension } from "../extension";
import dynamic from "next/dynamic";
import { OPEN_AI_COMMAND_BAR_COMMAND } from "../../components/editor/plugins/AICommandBarPlugin";

const InlineCopilotPlugin = dynamic(
  () => import("../../components/editor/plugins/InlineCopilotPlugin"),
  { ssr: false }
);

const CollaborationPlugin = dynamic(
  () => import("../../components/editor/plugins/CollaborationPlugin"),
  { ssr: false }
);

const AICommandBarPlugin = dynamic(
  () => import("../../components/editor/plugins/AICommandBarPlugin"),
  { ssr: false }
);

export const AICommandBar = Extension.create({
  name: "aiCommandBar",
  plugins: () => [AICommandBarPlugin as React.ComponentType<any>],
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
}

export const AICopilot = Extension.create<AICopilotOptions>({
  name: "aiCopilot",
  defaultOptions: {
    enabled: true,
  },
  addExtensions: () => [AICommandBar],
  plugins: ({ options }) => {
    if (options.enabled === false) return [];
    return [InlineCopilotPlugin as React.ComponentType<any>];
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
