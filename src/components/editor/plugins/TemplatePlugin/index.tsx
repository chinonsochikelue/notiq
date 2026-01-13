import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $convertFromMarkdownString, TRANSFORMERS } from "@lexical/markdown";
import { COMMAND_PRIORITY_EDITOR, createCommand, LexicalCommand } from "lexical";
import { useEffect } from "react";

export const INSERT_TEMPLATE_COMMAND: LexicalCommand<string> = createCommand("INSERT_TEMPLATE_COMMAND");

export default function TemplatePlugin(): null {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        return editor.registerCommand(
            INSERT_TEMPLATE_COMMAND,
            (markdownContent) => {
                editor.update(() => {
                    // Clear editor or append? Let's just convert and replace selection or append.
                    // For simplicity, we convert markdown to nodes and insert them.
                    // Note: $convertFromMarkdownString wipes the editor usually unless handled carefully.
                    // Using it with 'undefined' as current editor State might work to parsed state, then insert.

                    // Actually, let's use a simpler approach: 
                    // 1. Clear editor? Or
                    // 2. Insert at current selection. 

                    // Re-using $convertFromMarkdownString directly on the editor state replaces content. 
                    // Let's assume we want to replace or verify with user. 
                    // For this MVP, we will replace the content to ensure clean template.

                    $convertFromMarkdownString(markdownContent, TRANSFORMERS);
                });
                return true;
            },
            COMMAND_PRIORITY_EDITOR
        );
    }, [editor]);

    return null;
}
