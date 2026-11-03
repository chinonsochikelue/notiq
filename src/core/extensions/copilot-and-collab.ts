"use client";

import React from "react";
import { Extension } from "../extension";
import dynamic from "next/dynamic";

const InlineCopilotPlugin = dynamic(
  () => import("../../components/editor/plugins/InlineCopilotPlugin"),
  { ssr: false }
);

const CollaborationPlugin = dynamic(
  () => import("../../components/editor/plugins/CollaborationPlugin"),
  { ssr: false }
);

export interface AICopilotOptions {
  enabled?: boolean;
}

export const AICopilot = Extension.create<AICopilotOptions>({
  name: "aiCopilot",
  defaultOptions: {
    enabled: true,
  },
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
