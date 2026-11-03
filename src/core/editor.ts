import type {
  NotiqEditor,
  NotiqEditorOptions,
  NotiqEventType,
  NotiqEventListener,
  NotiqEventData,
  ChainedCommands,
  CanCommands,
  CommandFunction,
} from "./types";
import {
  createEditor as createLexicalEditor,
  $getRoot,
  $getSelection,
  $createParagraphNode,
  $isRangeSelection,
  $isElementNode,
  TextFormatType,
  type LexicalEditor,
  type SerializedEditorState,
} from "lexical";
import { $generateHtmlFromNodes } from "@lexical/html";
import { $convertToMarkdownString } from "@lexical/markdown";
import { NOTIQ_TRANSFORMERS } from "../components/editor/utils/markdownTransformers";
import {
  importContentToEditor,
  detectContentFormat,
} from "../components/editor/utils/importUtils";
import { createCommandChain, createCanCommands } from "./chain";
import { Extension } from "./extension";
import { $isHeadingNode, registerRichText } from "@lexical/rich-text";
import { $isListNode } from "@lexical/list";
import { $isCodeNode } from "@lexical/code";

export class NotiqEditorImpl implements NotiqEditor {
  readonly lexical: LexicalEditor;
  readonly options: NotiqEditorOptions;
  readonly extensions: Extension[];
  readonly storage: Record<string, any> = {};
  readonly commands: Record<string, (...args: any[]) => boolean> = {};

  private listeners: Map<NotiqEventType, Set<NotiqEventListener>> = new Map();
  private unregisterListeners: Array<() => void> = [];
  private rawCommands: Record<string, CommandFunction> = {};
  private _isFocused = false;

  constructor(options: NotiqEditorOptions = {}, customLexical?: LexicalEditor) {
    this.options = {
      editable: true,
      autofocus: false,
      ...options,
    };

    const extensions: Extension[] = (options.extensions || []).map((ext) =>
      ext instanceof Extension ? ext : Extension.create(ext)
    );
    this.extensions = extensions;

    // Collect all nodes contributed by extensions
    const allNodes: any[] = [];
    for (const ext of extensions) {
      this.storage[ext.name] = ext.storage;
      const nodes = ext.getNodes({
        editor: this,
        lexical: null as any,
        options: ext.options,
        storage: ext.storage,
      });
      allNodes.push(...nodes);
    }

    // Initialize or use existing LexicalEditor
    if (customLexical) {
      this.lexical = customLexical;
    } else {
      this.lexical = createLexicalEditor({
        nodes: allNodes,
        editable: this.options.editable,
        onError: (err) => console.error("[Notiq Editor Core Error]:", err),
      });
    }

    // Register rich text listeners (formatting, selection handling, pasting)
    try {
      this.unregisterListeners.push(registerRichText(this.lexical));
    } catch {
      // In case nodes are not registered yet
    }

    // Ensure root element has initial paragraph if empty
    this.lexical.update(
      () => {
        const root = $getRoot();
        if (root.isEmpty()) {
          root.append($createParagraphNode());
        }
      },
      { discrete: true }
    );

    // Initialize extension commands
    for (const ext of extensions) {
      const extCommands = ext.getCommands({
        editor: this,
        lexical: this.lexical,
        options: ext.options,
        storage: ext.storage,
      });
      for (const [name, fn] of Object.entries(extCommands)) {
        this.rawCommands[name] = fn;
        this.commands[name] = (...args: any[]) => {
          let success = false;
          this.lexical.update(
            () => {
              success = fn(...args)({ editor: this, lexical: this.lexical });
            },
            { discrete: true }
          );
          return success;
        };
      }
    }

    // Register update and selection listeners
    this.setupListeners();

    // Set initial content if provided
    if (this.options.content) {
      this.setContent(this.options.content, { discrete: true, emitUpdate: false });
    }

    // Autofocus if configured
    if (this.options.autofocus) {
      setTimeout(() => {
        this.focus(this.options.autofocus);
      }, 0);
    }

    // Trigger onCreate on extensions
    for (const ext of extensions) {
      if (ext.config.onCreate) {
        ext.config.onCreate({
          editor: this,
          lexical: this.lexical,
          options: ext.options,
          storage: ext.storage,
        });
      }
    }
  }

  get isEditable(): boolean {
    return this.lexical.isEditable();
  }

  get isFocused(): boolean {
    return this._isFocused;
  }

  private setupListeners(): void {
    const unregisterUpdate = this.lexical.registerUpdateListener(
      ({ editorState, dirtyElements, dirtyLeaves }) => {
        this.emit("transaction");
        if (dirtyElements.size > 0 || dirtyLeaves.size > 0) {
          this.emit("update");
          if (this.options.onUpdate) {
            this.options.onUpdate({ editor: this });
          }
        }
      }
    );

    const unregisterRoot = this.lexical.registerRootListener(
      (rootElement, prevRootElement) => {
        if (prevRootElement) {
          prevRootElement.removeEventListener("focus", this.handleFocus);
          prevRootElement.removeEventListener("blur", this.handleBlur);
        }
        if (rootElement) {
          rootElement.addEventListener("focus", this.handleFocus);
          rootElement.addEventListener("blur", this.handleBlur);
        }
      }
    );

    this.unregisterListeners.push(unregisterUpdate, unregisterRoot);
  }

  private handleFocus = () => {
    this._isFocused = true;
    this.emit("focus");
    if (this.options.onFocus) {
      this.options.onFocus({ editor: this });
    }
  };

  private handleBlur = () => {
    this._isFocused = false;
    this.emit("blur");
    if (this.options.onBlur) {
      this.options.onBlur({ editor: this });
    }
  };

  chain(): ChainedCommands {
    return createCommandChain(this, this.lexical, this.rawCommands);
  }

  can(): CanCommands {
    return createCanCommands(this, this.lexical, this.rawCommands);
  }

  isActive(name: string, attributes?: Record<string, any>): boolean {
    let active = false;

    this.lexical.getEditorState().read(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) {
        return;
      }

      // Check text formats (bold, italic, underline, strikethrough, code, subscript, superscript, highlight)
      const textFormats = [
        "bold",
        "italic",
        "underline",
        "strikethrough",
        "code",
        "subscript",
        "superscript",
        "highlight",
      ];
      if (textFormats.includes(name)) {
        active = selection.hasFormat(name as TextFormatType);
        return;
      }

      // Check block element node formats (heading, paragraph, blockquote, code, list)
      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : $isElementNode(anchorNode)
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();

      if (name === "heading" && $isHeadingNode(element)) {
        if (attributes && attributes.level) {
          active = element.getTag() === `h${attributes.level}`;
        } else {
          active = true;
        }
        return;
      }

      if (name === "codeBlock" && $isCodeNode(element)) {
        if (attributes && attributes.language) {
          active = element.getLanguage() === attributes.language;
        } else {
          active = true;
        }
        return;
      }

      if (name === "bulletList" && $isListNode(element)) {
        active = element.getListType() === "bullet";
        return;
      }

      if (name === "orderedList" && $isListNode(element)) {
        active = element.getListType() === "number";
        return;
      }

      if (name === "checkList" && $isListNode(element)) {
        active = element.getListType() === "check";
        return;
      }

      if (name === "paragraph" && element.getType() === "paragraph") {
        active = true;
        return;
      }

      if (name === "quote" && element.getType() === "quote") {
        active = true;
        return;
      }
    });

    return active;
  }

  setEditable(editable: boolean): void {
    this.lexical.setEditable(editable);
  }

  focus(position: "start" | "end" | "all" | boolean = true): void {
    this.lexical.update(() => {
      const root = $getRoot();
      if (root.isEmpty()) {
        root.append($createParagraphNode());
      }
      const firstChild = root.getFirstChild();
      const lastChild = root.getLastChild();
      if (position === "start" && firstChild) {
        firstChild.selectStart();
      } else if (position === "all") {
        root.select(0, root.getChildrenSize());
      } else if (lastChild) {
        lastChild.selectEnd();
      } else {
        root.select(0, 0);
      }
    });

    const rootElement = this.lexical.getRootElement();
    if (rootElement) {
      rootElement.focus();
    }
  }

  blur(): void {
    const root = this.lexical.getRootElement();
    if (root) {
      root.blur();
    }
  }

  getJSON(): SerializedEditorState {
    return this.lexical.getEditorState().toJSON();
  }

  getHTML(): string {
    let html = "";
    this.lexical.getEditorState().read(() => {
      html = $generateHtmlFromNodes(this.lexical, null);
    });
    return html;
  }

  getMarkdown(): string {
    let md = "";
    this.lexical.getEditorState().read(() => {
      md = $convertToMarkdownString(NOTIQ_TRANSFORMERS);
    });
    return md;
  }

  getText(): string {
    let text = "";
    this.lexical.getEditorState().read(() => {
      text = $getRoot().getTextContent();
    });
    return text;
  }

  setContent(
    content: string | SerializedEditorState | Record<string, any>,
    options: { discrete?: boolean; emitUpdate?: boolean } = {}
  ): void {
    if (typeof content === "object" && content !== null) {
      this.lexical.setEditorState(
        this.lexical.parseEditorState(JSON.stringify(content))
      );
    } else if (typeof content === "string") {
      const format = detectContentFormat(content);
      importContentToEditor(this.lexical, content, format, "replace");
    }
    if (options.emitUpdate !== false) {
      this.emit("update");
    }
  }

  clearContent(options: { emitUpdate?: boolean } = {}): void {
    this.lexical.update(
      () => {
        const root = $getRoot();
        root.clear();
      },
      { discrete: true }
    );
    if (options.emitUpdate !== false) {
      this.emit("update");
    }
  }

  on(event: NotiqEventType, listener: NotiqEventListener): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
    return () => this.off(event, listener);
  }

  off(event: NotiqEventType, listener: NotiqEventListener): void {
    const set = this.listeners.get(event);
    if (set) {
      set.delete(listener);
    }
  }

  emit(event: NotiqEventType, data?: Partial<NotiqEventData>): void {
    const set = this.listeners.get(event);
    if (set) {
      const payload: NotiqEventData = {
        editor: this,
        ...(data || {}),
      };
      set.forEach((listener) => {
        try {
          listener(payload);
        } catch (err) {
          console.error(`[Notiq Event Error (${event})]:`, err);
        }
      });
    }
  }

  destroy(): void {
    this.unregisterListeners.forEach((fn) => fn());
    this.unregisterListeners = [];
    this.emit("destroy");
    this.listeners.clear();
  }
}

export function createNotiqEditor(options: NotiqEditorOptions = {}): NotiqEditor {
  return new NotiqEditorImpl(options);
}
