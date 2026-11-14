import React, { useCallback, useEffect, useRef, useState } from "react";
import { LexicalNestedComposer } from "@lexical/react/LexicalNestedComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import ImagesPlugin from "../../editor/plugins/ImagesPlugin";
import { Plus, Trash2 } from "lucide-react";
import { Reorder } from "framer-motion";
import { StepType, initialEditorState, safelySetEditorState } from "../../editor/nodes/Stepper";
import { createEditor } from "lexical";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { useSharedHistoryContext } from "../../providers/SharedHistoryContext";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { nestedNodes } from "../../editor/nodes";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";
import LexicalAutoLinkPlugin from "../../editor/plugins/AutoLinkPlugin";
import { LinkWithMetaDataPlugin } from "../../editor/plugins/LinkWithMetaData";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import CodeHighlightPlugin from "../../editor/plugins/CodeHighlightPlugin";
import { mergeRegister } from "@lexical/utils";
import {
  COMMAND_PRIORITY_LOW,
  LexicalEditor,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { cn } from "../../../lib/utils";
import FloatingTextFormatToolbarPlugin from "../../editor/plugins/FloatingTextFormatToolbarPlugin";
import SlashCommand from "../../editor/plugins/SlashCommand";
import CodeActionMenuPlugin from "../../editor/plugins/CodeActionMenuPlugin";
import FloatingLinkEditorPlugin from "../../editor/plugins/FloatingLinkEditorPlugin";

interface Props {
  item: StepType;
  numberd: number;
  insertAt: (index: number) => void;
  remove: (numberd: number) => void;
  updateTitle: (index: number, title: string) => void;
}

export default function Step({
  item,
  numberd,
  insertAt,
  remove,
  updateTitle,
}: Props) {
  const [parentEditor] = useLexicalComposerContext();
  const isEditable = parentEditor.isEditable();

  if (!item || typeof item !== "object") {
    return null;
  }

  const titleRef = React.useRef<HTMLDivElement>(null);
  const [isLinkEditMode, setIsLinkEditMode] = React.useState<boolean>(false);
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);
  const { historyState } = useSharedHistoryContext();
  const activeEditorRef = useRef<LexicalEditor | null>(null);

  const editorInstance = React.useMemo(() => {
    if (item?.content && typeof (item.content as any).isEditable === "function") {
      return item.content;
    }
    const newEditor = createEditor({ nodes: [...nestedNodes], editable: isEditable });
    const rawContent = (item?.content as any)?.editorState || item?.content;
    safelySetEditorState(newEditor, rawContent);
    return newEditor;
  }, [item?.content, isEditable]);

  useEffect(() => {
    if (editorInstance && typeof editorInstance.setEditable === "function") {
      editorInstance.setEditable(isEditable);
    }
  }, [editorInstance, isEditable]);

  const handleTitleBlur = () => {
    if (titleRef.current) {
      updateTitle(item.id, titleRef.current.textContent!)
    }
  };

  // fix the delete
  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Backspace") {
      const currentText = titleRef.current?.textContent || "";
      if (currentText === "") {
        e.preventDefault();
        remove(item.id);
      }
    }
  };

  const onRef = useCallback((_floatingAnchorElem: HTMLDivElement | null) => {
    setFloatingAnchorElem(_floatingAnchorElem);
  }, []);


  useEffect(() => {
    const unregister = mergeRegister(
      editorInstance.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_, activeEditor) => {
          activeEditorRef.current = activeEditor;
          return false;
        },
        COMMAND_PRIORITY_LOW
      )
    );
    return () => {
      unregister();
    };
  }, []);

  return (
    <Reorder.Item
      value={item}
      id={item?.id ? item.id.toString() : String(numberd)}
      dragListener={isEditable}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.15 } }}
      exit={{ opacity: 0, y: 20, transition: { duration: 0.3 } }}
      className="relative group my-2 flex w-full flex-row gap-x-6 select-none"
    >
      <div
        className={cn(
          "h-7 w-7 absolute max-sm:w-5 max-sm:h-5 max-sm:text-xs rounded-full z-50 bg-muted flex items-center justify-center",
          isEditable ? "cursor-grab" : "cursor-default"
        )}>
        {numberd + 1}
      </div>

      <div className="flex flex-col ml-10 w-full">
        <div className="flex items-center justify-between w-full group/header">
          <div
            contentEditable={isEditable}
            suppressContentEditableWarning
            ref={titleRef}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            className={cn(
              "flex-1 scroll-m-20 border-none outline-none break-words max-sm:text-lg text-2xl font-semibold tracking-tight",
              isEditable ? "cursor-text" : "cursor-default select-text"
            )}
          >
            {item.title}
          </div>
          {isEditable && (
            <button
              type="button"
              onClick={() => remove(item.id)}
              title="Delete step"
              className="opacity-0 group-hover/header:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-destructive rounded hover:bg-muted"
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
        <LexicalNestedComposer
          initialEditor={editorInstance}
          initialNodes={[...nestedNodes]}
        >
          <HistoryPlugin externalHistoryState={historyState} />
          <AutoFocusPlugin />
          <LinkPlugin />
          <ImagesPlugin />
          <HorizontalRulePlugin />
          <LexicalAutoLinkPlugin />
          <LinkWithMetaDataPlugin />
          <ListPlugin />
          <CheckListPlugin />
          <TabIndentationPlugin maxIndent={7} />
          <CodeHighlightPlugin />
          <RichTextPlugin
            contentEditable={
              <div ref={onRef} className="relative">
                <ContentEditable
                  className={cn(
                    "h-fit w-full resize-none relative outline-none select-text whitespace-pre-wrap break-words",
                    isEditable ? "cursor-text" : "cursor-default select-text"
                  )}
                  aria-placeholder={isEditable ? "Step content" : ""}
                  placeholder={(editable: boolean) =>
                    editable ? (
                      <div className="text-base font-medium text-[#999] overflow-hidden absolute top-[2px] left-[2px] text-nowrap inline-block text-ellipsis pointer-events-none">
                        Step content
                      </div>
                    ) : null
                  }
                />
              </div>
            }
            placeholder={null}
            ErrorBoundary={LexicalErrorBoundary}
          />
          {floatingAnchorElem && (
            <>
              <FloatingTextFormatToolbarPlugin
                setIsLinkEditMode={setIsLinkEditMode}
                anchorElem={floatingAnchorElem}
              />
              <CodeActionMenuPlugin anchorElem={floatingAnchorElem} />
              <FloatingLinkEditorPlugin
                anchorElem={floatingAnchorElem}
                isLinkEditMode={isLinkEditMode}
                setIsLinkEditMode={setIsLinkEditMode}
              />
            </>
          )}
          {typeof editorInstance?.isEditable === "function" && editorInstance.isEditable() && <SlashCommand />}
        </LexicalNestedComposer>
      </div>

      {isEditable && (
        <div
          onClick={() => insertAt(numberd + 1)}
          className="absolute max-sm:left-[2px] left-[4px] top-[35px] z-40 max-sm:w-4 max-sm:h-4 w-[20px] h-[20px] flex items-center justify-center ring-1 ring-gray-700 bg-gray-800 rounded-full cursor-pointer transition-opacity opacity-0 duration-500 group-hover:opacity-100"
        >
          <Plus className="size-[12px]" />
        </div>
      )}
    </Reorder.Item>
  );
}
