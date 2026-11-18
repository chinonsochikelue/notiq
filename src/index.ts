// Framework Core & Headless Primitives
export * from "./core";

// Ready-to-use Editor & Components
export { default as Editor } from "./components/editor";
export { default as CanvasMode } from "./components/canvas/CanvasMode";
export type { ToolbarConfig, ToolbarItem } from "./components/editor";
export * from "./components/editor/plugins/CollaborationPlugin/CollaboratorsBar";
export {
  default as TableOfContentsPlugin,
  useTableOfContents,
  type HeadingEntry,
  type UseTableOfContentsOptions,
  type UseTableOfContentsResult,
  type TableOfContentsPluginProps,
} from "./components/editor/plugins/TableOfContentsPlugin";
export {
  default as MentionsPlugin,
  formatSmartDateLabel,
  getSmartDateOptions,
} from "./components/editor/plugins/MentionsPlugin";
export {
  MentionNode,
  $createMentionNode,
  $isMentionNode,
  type MentionKind,
  type SerializedMentionNode,
} from "./components/editor/nodes/MentionNode";

// Providers & Contexts
export * from "./components/providers/ToolbarContext";
export * from "./components/providers/SharedHistoryContext";
export * from "./components/providers/AIContext";
export * from "./components/providers/UploadContext";
export * from "./components/providers/CollabContext";
export * from "./components/providers/CommentsContext";
export * from "./components/providers/VersionHistoryContext";

// Styles & Tailwinds
export * from "./styles/tailwind-plugin";
