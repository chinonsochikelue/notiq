import * as React from 'react';
import React__default, { ReactNode } from 'react';
import { ElementFormatType } from 'lexical';
import { HistoryState } from '@lexical/react/LexicalHistoryPlugin';

/**
 * Configuration for AI features in the Notiq editor.
 */
interface AIConfig {
    /**
     * The API endpoint for AI completions. Defaults to "/api/ai".
     */
    apiEndpoint?: string;
}
/**
 * Hook to access the current AI configuration.
 */
declare const useAI: () => AIConfig;
/**
 * Provider component for AI configuration.
 */
declare const AIProvider: ({ config, children }: {
    config?: AIConfig;
    children: ReactNode;
}) => React__default.JSX.Element;

interface UploadResponse {
    url: string;
}
/**
 * A function that handles file uploads.
 * @param file The file to upload.
 * @param onProgress Callback to report upload progress (0-100).
 * @returns A promise that resolves to an object containing the uploaded file's URL.
 */
type UploadHandler = (file: File, onProgress?: (progress: number) => void) => Promise<UploadResponse>;
interface UploadConfig {
    /**
     * Custom upload handler. If not provided, the editor will attempt to use its default
     * (which currently depends on EdgeStore if configured).
     */
    uploadHandler?: UploadHandler;
}
/**
 * Hook to access the current Upload configuration.
 */
declare const useUpload: () => UploadConfig | undefined;
/**
 * Provider component for Upload configuration.
 */
declare const UploadProvider: ({ config, children }: {
    config?: UploadConfig;
    children: ReactNode;
}) => React__default.JSX.Element;

type ToolbarItem = "undo" | "redo" | "block-format" | "font-family" | "font-size" | "bold" | "italic" | "underline" | "code" | "link" | "color" | "bg-color" | "text-format" | "insert" | "align" | "speech" | "template" | "download" | "export-md" | "export-pdf" | "separator";
type ToolbarConfig = {
    items?: ToolbarItem[];
    className?: string;
    itemClassName?: string;
    activeItemClassName?: string;
    mobileClassName?: string;
    mobileItemClassName?: string;
};
declare function Editor({ isEditable, content, aiConfig, uploadConfig, toolbarConfig, }: {
    isEditable: boolean;
    content?: unknown;
    aiConfig?: AIConfig;
    uploadConfig?: UploadConfig;
    toolbarConfig?: ToolbarConfig;
}): React__default.JSX.Element;

declare const MIN_ALLOWED_FONT_SIZE = 8;
declare const MAX_ALLOWED_FONT_SIZE = 72;
declare const DEFAULT_FONT_SIZE = 15;
declare const rootTypeToRootName: {
    root: string;
    table: string;
};
declare const blockTypeToBlockName: {
    bullet: string;
    check: string;
    code: string;
    h1: string;
    h2: string;
    h3: string;
    h4: string;
    h5: string;
    h6: string;
    number: string;
    paragraph: string;
    quote: string;
};
declare const INITIAL_TOOLBAR_STATE: {
    bgColor: string;
    blockType: keyof typeof blockTypeToBlockName;
    canRedo: boolean;
    canUndo: boolean;
    codeLanguage: string;
    elementFormat: ElementFormatType;
    fontColor: string;
    fontFamily: string;
    fontSize: string;
    fontSizeInputValue: string;
    isBold: boolean;
    isCode: boolean;
    isImageCaption: boolean;
    isItalic: boolean;
    isLink: boolean;
    isRTL: boolean;
    isStrikethrough: boolean;
    isSubscript: boolean;
    isSuperscript: boolean;
    isUnderline: boolean;
    isLowercase: boolean;
    isUppercase: boolean;
    isCapitalize: boolean;
    rootType: keyof typeof rootTypeToRootName;
};
type ToolbarState = typeof INITIAL_TOOLBAR_STATE;
type ToolbarStateKey = keyof ToolbarState;
type ToolbarStateValue<Key extends ToolbarStateKey> = ToolbarState[Key];
type ContextShape$1 = {
    toolbarState: ToolbarState;
    updateToolbarState<Key extends ToolbarStateKey>(key: Key, value: ToolbarStateValue<Key>): void;
};
declare const ToolbarContext: ({ children, }: {
    children: ReactNode;
}) => React__default.JSX.Element;
declare const useToolbarState: () => ContextShape$1;

type ContextShape = {
    historyState?: HistoryState;
};
declare const SharedHistoryContext: ({ children, }: {
    children: ReactNode;
}) => React.JSX.Element;
declare const useSharedHistoryContext: () => ContextShape;

/**
 * A Tailwind CSS plugin that adds Notiq's custom theme variables and styles.
 */
declare const notiqPlugin: any;

export { type AIConfig, AIProvider, type ContextShape$1 as ContextShape, DEFAULT_FONT_SIZE, Editor, MAX_ALLOWED_FONT_SIZE, MIN_ALLOWED_FONT_SIZE, SharedHistoryContext, type ToolbarConfig, ToolbarContext, type ToolbarItem, type UploadConfig, type UploadHandler, UploadProvider, type UploadResponse, blockTypeToBlockName, notiqPlugin, useAI, useSharedHistoryContext, useToolbarState, useUpload };
