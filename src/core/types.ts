import type {
  LexicalEditor,
  LexicalNode,
  Klass,
  LexicalNodeReplacement,
  SerializedEditorState,
  RangeSelection,
  NodeSelection,
  TextFormatType,
} from "lexical";
import type React from "react";

export type SelectionType = RangeSelection | NodeSelection | null;

export type NotiqEventType =
  | "update"
  | "selectionUpdate"
  | "focus"
  | "blur"
  | "destroy"
  | "transaction";

export interface NotiqEventData {
  editor: NotiqEditor;
  json?: SerializedEditorState;
  markdown?: string;
  html?: string;
  text?: string;
}

export type NotiqEventListener = (data: NotiqEventData) => void;

export type CommandFunction = (...args: any[]) => (context: {
  editor: NotiqEditor;
  lexical: LexicalEditor;
}) => boolean;

export interface ExtensionContext<Options = any, Storage = any> {
  editor: NotiqEditor;
  lexical: LexicalEditor;
  options: Options;
  storage: Storage;
}

export interface ExtensionConfig<Options = any, Storage = any> {
  name: string;
  defaultOptions?: Options;
  defaultStorage?: Storage;
  nodes?: (context: ExtensionContext<Options, Storage>) => (Klass<LexicalNode> | LexicalNodeReplacement)[];
  plugins?: (context: ExtensionContext<Options, Storage>) => React.ComponentType<any>[];
  addCommands?: (
    context: ExtensionContext<Options, Storage>
  ) => Record<string, CommandFunction>;
  addKeyboardShortcuts?: (
    context: ExtensionContext<Options, Storage>
  ) => Record<string, () => boolean>;
  onCreate?: (context: ExtensionContext<Options, Storage>) => void;
  onDestroy?: (context: ExtensionContext<Options, Storage>) => void;
  onUpdate?: (context: ExtensionContext<Options, Storage>) => void;
  onSelectionUpdate?: (context: ExtensionContext<Options, Storage>) => void;
}

export interface NotiqEditorOptions {
  extensions?: any[];
  content?: string | SerializedEditorState | Record<string, any>;
  editable?: boolean;
  autofocus?: boolean | "start" | "end" | "all";
  placeholder?: string | React.ReactNode;
  editorProps?: {
    attributes?: Record<string, string>;
    className?: string;
  };
  onUpdate?: (event: NotiqEventData) => void;
  onSelectionUpdate?: (event: NotiqEventData) => void;
  onFocus?: (event: NotiqEventData) => void;
  onBlur?: (event: NotiqEventData) => void;
  onDestroy?: () => void;
}

export type ChainedCommands = {
  run(): boolean;
  [commandName: string]: any;
};

export interface CanCommands {
  [commandName: string]: (...args: any[]) => boolean;
}

export interface NotiqEditor {
  readonly lexical: LexicalEditor;
  readonly options: NotiqEditorOptions;
  readonly extensions: any[];
  readonly storage: Record<string, any>;
  readonly commands: Record<string, (...args: any[]) => boolean>;
  readonly isEditable: boolean;
  readonly isFocused: boolean;

  chain(): ChainedCommands;
  can(): CanCommands;

  isActive(name: string, attributes?: Record<string, any>): boolean;
  setEditable(editable: boolean): void;
  focus(position?: "start" | "end" | "all" | boolean): void;
  blur(): void;

  getJSON(): SerializedEditorState;
  getHTML(): string;
  getMarkdown(): string;
  getText(): string;

  setContent(
    content: string | SerializedEditorState | Record<string, any>,
    options?: { discrete?: boolean; emitUpdate?: boolean }
  ): void;
  clearContent(options?: { emitUpdate?: boolean }): void;

  on(event: NotiqEventType, listener: NotiqEventListener): () => void;
  off(event: NotiqEventType, listener: NotiqEventListener): void;
  emit(event: NotiqEventType, data?: Partial<NotiqEventData>): void;

  destroy(): void;
}
