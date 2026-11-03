import type {
  NotiqEditor,
  ChainedCommands,
  CanCommands,
  CommandFunction,
} from "./types";
import type { LexicalEditor } from "lexical";

export function createCommandChain(
  editor: NotiqEditor,
  lexical: LexicalEditor,
  commands: Record<string, CommandFunction>,
  isDryRun = false
): ChainedCommands {
  const queue: Array<() => boolean> = [];

  const handler: ProxyHandler<any> = {
    get(_target, prop: string) {
      if (prop === "run") {
        return () => {
          if (isDryRun) {
            return queue.every((fn) => {
              try {
                return fn();
              } catch {
                return false;
              }
            });
          }

          let allSuccessful = true;
          lexical.update(
            () => {
              for (const fn of queue) {
                try {
                  const res = fn();
                  if (res === false) {
                    allSuccessful = false;
                  }
                } catch (err) {
                  console.error("[Notiq Chain Error]:", err);
                  allSuccessful = false;
                }
              }
            },
            { discrete: true }
          );

          return allSuccessful;
        };
      }

      // Check if command exists in registered commands
      if (prop in commands) {
        return (...args: any[]) => {
          const commandFactory = commands[prop];
          queue.push(() => {
            const runner = commandFactory(...args);
            return runner({ editor, lexical });
          });
          return proxy;
        };
      }

      // Built-in chain commands
      if (prop === "focus") {
        return (position?: "start" | "end" | "all" | boolean) => {
          queue.push(() => {
            editor.focus(position);
            return true;
          });
          return proxy;
        };
      }

      if (prop === "blur") {
        return () => {
          queue.push(() => {
            editor.blur();
            return true;
          });
          return proxy;
        };
      }

      return () => proxy;
    },
  };

  const proxy = new Proxy({}, handler) as ChainedCommands;
  return proxy;
}

export function createCanCommands(
  editor: NotiqEditor,
  lexical: LexicalEditor,
  commands: Record<string, CommandFunction>
): CanCommands {
  const handler: ProxyHandler<any> = {
    get(_target, prop: string) {
      if (prop in commands) {
        return (...args: any[]) => {
          try {
            const runner = commands[prop](...args);
            return runner({ editor, lexical });
          } catch {
            return false;
          }
        };
      }
      return () => true;
    },
  };

  return new Proxy({}, handler) as CanCommands;
}
