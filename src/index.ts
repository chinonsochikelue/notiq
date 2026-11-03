// Framework Core & Headless Primitives
export * from "./core";

// Ready-to-use Editor & Components
export { default as Editor } from "./components/editor";
export type { ToolbarConfig, ToolbarItem } from "./components/editor";
export * from "./components/editor/plugins/CollaborationPlugin/CollaboratorsBar";

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
