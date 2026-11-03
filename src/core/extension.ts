import type {
  ExtensionConfig,
  ExtensionContext,
  NotiqEditor,
} from "./types";
import type { Klass, LexicalNode, LexicalNodeReplacement } from "lexical";
import type React from "react";

export class Extension<Options = any, Storage = any> {
  name: string;
  config: ExtensionConfig<Options, Storage>;
  options: Options;
  storage: Storage;
  subExtensions: Extension[] = [];

  constructor(
    config: ExtensionConfig<Options, Storage>,
    options?: Partial<Options>
  ) {
    this.name = config.name;
    this.config = config;
    this.options = {
      ...(config.defaultOptions || {}),
      ...(options || {}),
    } as Options;
    this.storage = {
      ...(config.defaultStorage || {}),
    } as Storage;
  }

  static create<Options = any, Storage = any>(
    config: ExtensionConfig<Options, Storage> & {
      addExtensions?: () => Extension[];
    }
  ): Extension<Options, Storage> {
    const ext = new Extension<Options, Storage>(config);
    if (config.addExtensions) {
      ext.subExtensions = config.addExtensions();
    }
    return ext;
  }

  configure(options?: Partial<Options>): Extension<Options, Storage> {
    const nextExt = new Extension<Options, Storage>(this.config, {
      ...this.options,
      ...options,
    });
    nextExt.subExtensions = this.subExtensions.map((sub) => sub.configure());
    return nextExt;
  }

  extend<ExtendedOptions = Options, ExtendedStorage = Storage>(
    extendedConfig: Partial<ExtensionConfig<ExtendedOptions, ExtendedStorage>>
  ): Extension<ExtendedOptions, ExtendedStorage> {
    const mergedConfig: ExtensionConfig<ExtendedOptions, ExtendedStorage> = {
      ...(this.config as any),
      ...(extendedConfig as any),
      name: extendedConfig.name || this.name,
      defaultOptions: {
        ...(this.config.defaultOptions || {}),
        ...(extendedConfig.defaultOptions || {}),
      } as ExtendedOptions,
      defaultStorage: {
        ...(this.config.defaultStorage || {}),
        ...(extendedConfig.defaultStorage || {}),
      } as ExtendedStorage,
    };
    return new Extension<ExtendedOptions, ExtendedStorage>(mergedConfig);
  }

  getNodes(
    context: ExtensionContext<Options, Storage>
  ): (Klass<LexicalNode> | LexicalNodeReplacement)[] {
    const directNodes = this.config.nodes ? this.config.nodes(context) : [];
    const subNodes = this.subExtensions.flatMap((sub) =>
      sub.getNodes({ ...context, options: sub.options, storage: sub.storage })
    );
    return [...directNodes, ...subNodes];
  }

  getPlugins(context: ExtensionContext<Options, Storage>): React.ComponentType<any>[] {
    const directPlugins = this.config.plugins ? this.config.plugins(context) : [];
    const subPlugins = this.subExtensions.flatMap((sub) =>
      sub.getPlugins({ ...context, options: sub.options, storage: sub.storage })
    );
    return [...directPlugins, ...subPlugins];
  }

  getCommands(context: ExtensionContext<Options, Storage>) {
    let commands = this.config.addCommands ? this.config.addCommands(context) : {};
    for (const sub of this.subExtensions) {
      commands = {
        ...commands,
        ...sub.getCommands({ ...context, options: sub.options, storage: sub.storage }),
      };
    }
    return commands;
  }

  getKeyboardShortcuts(context: ExtensionContext<Options, Storage>) {
    let shortcuts = this.config.addKeyboardShortcuts
      ? this.config.addKeyboardShortcuts(context)
      : {};
    for (const sub of this.subExtensions) {
      shortcuts = {
        ...shortcuts,
        ...sub.getKeyboardShortcuts({
          ...context,
          options: sub.options,
          storage: sub.storage,
        }),
      };
    }
    return shortcuts;
  }
}
