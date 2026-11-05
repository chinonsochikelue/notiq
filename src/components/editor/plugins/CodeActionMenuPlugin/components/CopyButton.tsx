import { $isCodeNode } from "@lexical/code";
import {
  $getNearestNodeFromDOMNode,
  $getSelection,
  $setSelection,
  LexicalEditor,
} from "lexical";
import * as React from "react";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "../../../../ui/button";

interface Props {
  editor: LexicalEditor;
  getCodeDOMNode: () => HTMLElement | null;
}

export function CopyButton({ editor, getCodeDOMNode }: Props) {
  const [isCopyCompleted, setCopyCompleted] = useState<boolean>(false);

  const copyToClipboard = async () => {
    const codeDOMNode = getCodeDOMNode();

    if (!codeDOMNode) {
      return;
    }

    let content = "";

    editor.update(() => {
      const codeNode = $getNearestNodeFromDOMNode(codeDOMNode);

      if ($isCodeNode(codeNode)) {
        content = codeNode.getTextContent();
      }

      const selection = $getSelection();
      $setSelection(selection);
    });

    try {
      await navigator.clipboard.writeText(content);
      setCopyCompleted(true);
      setTimeout(() => setCopyCompleted(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };
  return (
    <Button
      variant="ghost"
      size="Toolbar"
      className="relative h-7 px-2 text-xs rounded-md text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      onClick={copyToClipboard}
      aria-label={isCopyCompleted ? "Copied" : "Copy to clipboard"}
      title="Copy code"
    >
      <span className="sr-only">{isCopyCompleted ? "Copied" : "Copy"}</span>
      <Copy
        className={`h-3.5 w-3.5 transition-all duration-300 ${isCopyCompleted ? "scale-0" : "scale-100"
          }`}
      />
      <Check
        className={`absolute inset-0 m-auto h-3.5 w-3.5 text-emerald-500 transition-all duration-300 ${isCopyCompleted ? "scale-100" : "scale-0"
          }`}
      />
    </Button>
  );
}
