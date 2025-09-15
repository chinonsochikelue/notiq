import React, { Dispatch, useCallback, useEffect, useState } from "react";

import {
  $getNodeByKey,
  $getSelection,
  $isElementNode,
  $isLineBreakNode,
  $isRangeSelection,
  $isRootOrShadowRoot,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  FORMAT_TEXT_COMMAND,
  LexicalEditor,
  NodeKey,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from "lexical";

import {
  useToolbarState,
  blockTypeToBlockName,
} from "@/components/providers/ToolbarContext";
import { cn } from "@/lib/utils";

import { Bold, Code, Italic, Link, Mic, Redo, Redo2Icon, Underline, Undo, Undo2Icon } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  $findMatchingParent,
  $getNearestNodeOfType,
  $isEditorIsNestedEditor,
  mergeRegister,
} from "@lexical/utils";
import {
  $getSelectionStyleValueForProperty,
  $isParentElementRTL,
} from "@lexical/selection";
import { getSelectedNode } from "../../utils/getSelectedNode";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { $isTableNode, $isTableSelection } from "@lexical/table";
import { $isListNode, ListNode } from "@lexical/list";
import { $isHeadingNode } from "@lexical/rich-text";
import { $isCodeNode, CODE_LANGUAGE_MAP } from "@lexical/code";
import dynamic from "next/dynamic";
import { Toggle } from "@/components/ui/toggle";
import { SHORTCUTS } from "../ShortcutsPlugin/shortcuts";
import { sanitizeUrl } from "../../utils/url";
import CodeList from "@/components/ui/drop-downs/code"
import { SPEECH_TO_TEXT_COMMAND, SUPPORT_SPEECH_RECOGNITION } from "../SpeechToTextPlugin";
const BlockFormatDropDown = dynamic(
  () => import("@/components/ui/drop-downs/block-format")
);
const FontDropDown = dynamic(
  () => import("@/components/ui/drop-downs/font")
);
const FontSize = dynamic(
  () => import("@/components/ui/drop-downs/font-size")
);
const Color = dynamic(() => import("@/components/ui/drop-downs/color"));
const BackgroundColor = dynamic(() => import("@/components/ui/drop-downs/background-color"));
const TextFormat = dynamic(
  () => import("@/components/ui/drop-downs/text-format")
);
const InsertNode = dynamic(
  () => import("@/components/ui/drop-downs/insert-node")
);
const TextAlign = dynamic(
  () => import("@/components/ui/drop-downs/text-align")
);
// import { type } from './../../../providers/ToolbarContext';


const rootTypeToRootName = {
  root: 'Root',
  table: 'Table',
};
export default function index({
  editor,
  activeEditor,
  setActiveEditor,
  setIsLinkEditMode,
}: {
  editor: LexicalEditor;
  activeEditor: LexicalEditor;
  setActiveEditor: Dispatch<LexicalEditor>;
  setIsLinkEditMode: Dispatch<boolean>;
}) {
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const [isSpeechToText, setIsSpeechToText] = useState(false);
  const [selectedElementKey, setSelectedElementKey] = useState<NodeKey | null>(
    null
  );
  const { toolbarState, updateToolbarState } = useToolbarState();

  const $updateToolbar = useCallback(() => {
    const currentEditor = activeEditor || editor;

    if (!currentEditor) return;

    currentEditor.read(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        if (activeEditor !== editor && $isEditorIsNestedEditor(activeEditor)) {
          const rootElement = activeEditor.getRootElement();
          updateToolbarState(
            "isImageCaption",
            !!rootElement?.parentElement?.classList.contains(
              "image-caption-container"
            )
          );
        } else {
          updateToolbarState("isImageCaption", false);
        }

        const anchorNode = selection.anchor.getNode();
        let element =
          anchorNode.getKey() === "root"
            ? anchorNode
            : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });

        if (element === null) {
          element = anchorNode.getTopLevelElementOrThrow();
        }

        const elementKey = element.getKey();
        const elementDOM = currentEditor.getElementByKey(elementKey);

        const node = getSelectedNode(selection);
        const parent = node.getParent();
        const isLink = $isLinkNode(parent) || $isLineBreakNode(node);
        updateToolbarState("isLink", isLink);

        const tableNode = $findMatchingParent(node, $isTableNode);
        if ($isTableNode(tableNode)) {
          updateToolbarState("rootType", "table");
        } else {
          updateToolbarState("rootType", "root");
        }

        if (elementDOM !== null) {
          setSelectedElementKey(elementKey);
          if ($isListNode(element)) {
            const parentList = $getNearestNodeOfType<ListNode>(anchorNode, ListNode);
            const type = parentList
              ? parentList.getListType()
              : element.getListType();
            updateToolbarState("blockType", type);
          } else {
            const type = $isHeadingNode(element)
              ? element.getTag()
              : element.getType();
            if (type in blockTypeToBlockName) {
              updateToolbarState(
                "blockType",
                type as keyof typeof blockTypeToBlockName
              );
            }
            if ($isCodeNode(element)) {
              const language =
                element.getLanguage() as keyof typeof CODE_LANGUAGE_MAP;
              updateToolbarState(
                "codeLanguage",
                language ? CODE_LANGUAGE_MAP[language] || language : ""
              );
              return;
            }
          }
        }

        updateToolbarState(
          "fontColor",
          $getSelectionStyleValueForProperty(selection, "color", "#000")
        );
        updateToolbarState(
          "bgColor",
          $getSelectionStyleValueForProperty(
            selection,
            "background-color",
            "#fff"
          )
        );
        updateToolbarState(
          "fontFamily",
          $getSelectionStyleValueForProperty(selection, "font-family", "Arial")
        );

        let matchingParent;
        if ($isLinkNode(parent)) {
          matchingParent = $findMatchingParent(
            node,
            (parentNode) => $isElementNode(parentNode) && !parentNode.isInline()
          );
        }

        updateToolbarState(
          "elementFormat",
          $isElementNode(matchingParent)
            ? matchingParent.getFormatType()
            : $isElementNode(node)
              ? node.getFormatType()
              : parent?.getFormatType() || "left"
        );
      }

      if ($isRangeSelection(selection) || $isTableSelection(selection)) {
        updateToolbarState("isBold", selection.hasFormat("bold"));
        updateToolbarState("isItalic", selection.hasFormat("italic"));
        updateToolbarState("isUnderline", selection.hasFormat("underline"));
        updateToolbarState("isStrikethrough", selection.hasFormat("strikethrough"));
        updateToolbarState("isSubscript", selection.hasFormat("subscript"));
        updateToolbarState("isSuperscript", selection.hasFormat("superscript"));
        updateToolbarState("isCode", selection.hasFormat("code"));
        updateToolbarState(
          "fontSize",
          $getSelectionStyleValueForProperty(selection, "font-size", "15px")
        );
        updateToolbarState("isLowercase", selection.hasFormat("lowercase"));
        updateToolbarState("isUppercase", selection.hasFormat("uppercase"));
        updateToolbarState("isCapitalize", selection.hasFormat("capitalize"));
      }
    });
  }, [activeEditor, editor, updateToolbarState]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        setActiveEditor(newEditor);
        $updateToolbar();
        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor, $updateToolbar, setActiveEditor]);

  useEffect(() => {
    activeEditor.getEditorState().read(() => {
      $updateToolbar();
    });
  }, [activeEditor, $updateToolbar]);

  useEffect(() => {
    return mergeRegister(
      editor.registerEditableListener((editable) => {
        setIsEditable(editable);
      }),
      activeEditor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      activeEditor.registerCommand<boolean>(
        CAN_UNDO_COMMAND,
        (payload) => {
          updateToolbarState("canUndo", payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      activeEditor.registerCommand<boolean>(
        CAN_REDO_COMMAND,
        (payload) => {
          updateToolbarState("canRedo", payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      )
    );
  }, [$updateToolbar, activeEditor, editor, updateToolbarState]);

  const insertLink = useCallback(() => {
    if (!toolbarState.isLink) {
      setIsLinkEditMode(true);
      activeEditor.dispatchCommand(
        TOGGLE_LINK_COMMAND,
        sanitizeUrl("https://")
      );
    } else {
      setIsLinkEditMode(false);
      activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [activeEditor, setIsLinkEditMode, toolbarState.isLink]);
  const onCodeLanguageSelect = useCallback(
    (value: string) => {
      activeEditor.update(() => {
        if (selectedElementKey !== null) {
          const node = $getNodeByKey(selectedElementKey);
          if ($isCodeNode(node)) {
            node.setLanguage(value);
          }
        }
      });
    },
    [activeEditor, selectedElementKey]
  );


  return (
    <nav
      className={cn(
        "z-[200] fixed top-0 left-0  backdrop-blur-md bg-white/10 dark:bg-black/10 w-full  border-gray-500/20",


      )}
    >
      <div className="group flex flex-row justify-center max-sm:overflow-x-scroll  w-screen items-center   p-2 border-b">
        <div className="flex flex-row gap-x-2">
          <Button
            size={"Toolbar"}
            variant={"outline"}
            disabled={!toolbarState.canUndo || !isEditable}
            onClick={() => {
              activeEditor.dispatchCommand(UNDO_COMMAND, undefined);
            }}
            tip={false ? "Undo (⌘Z)" : "Undo (Ctrl+Z)"}
            type="button"
            aria-label="Undo"
            className="border-none"
          >
            <Undo2Icon className=" size-4" />
          </Button>
          <Button
            variant={"outline"}
            size={"Toolbar"}
            disabled={!toolbarState.canRedo || !isEditable}
            onClick={() => {
              activeEditor.dispatchCommand(REDO_COMMAND, undefined);
            }}
            tip={false ? "Redo (⇧⌘Z)" : "Redo (Ctrl+Y)"}
            type="button"
            className="toolbar-item border-none"
            aria-label="Redo"
          >
            <Redo2Icon className=" size-4" />
          </Button>
        </div>
        <Separator className="h-6 mx-2" orientation="vertical" />
        {toolbarState.blockType in blockTypeToBlockName &&
          activeEditor === editor && (
            <div className="flex flex-row gap-x-[5px]  items-center">
              <BlockFormatDropDown
                disabled={!isEditable}
                blockType={toolbarState.blockType}
                editor={activeEditor}
              />
              <Separator orientation={"vertical"} />
            </div>
          )}
        <Separator className="h-6 mx-2" orientation="vertical" />
        {toolbarState.blockType == "code" ? (
          <CodeList
            onCodeLanguageSelect={onCodeLanguageSelect}
            codeLanguage={toolbarState.codeLanguage}
            disabled={!isEditable}
          />
        ) : (
          <div className="flex flex-row items-center">
            <FontDropDown
              disabled={!isEditable}
              style={{ fontFamily: toolbarState.fontFamily }}
              value={toolbarState.fontFamily}
              editor={activeEditor}
            />
            <Separator className="h-6 mx-2" orientation="vertical" />
            <FontSize
              selectionFontSize={toolbarState.fontSize.slice(0, -2)}
              editor={activeEditor}
              disabled={!isEditable}
            />
            <Separator className="h-6 mx-2" orientation="vertical" />
            <div className="flex flex-row gap-x-1">
              <Toggle
                disabled={!isEditable}
                variant={"outline"}
                size={"Toolbar"}
                pressed={toolbarState.isBold}
                onPressedChange={() => {
                  activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
                }}
                tip={`Bold ${SHORTCUTS.BOLD}`}
                aria-label={`Format text as bold. Shortcut: ${SHORTCUTS.BOLD}`}
              >
                <Bold />
              </Toggle>
              <Toggle
                variant={"outline"}
                size={"Toolbar"}
                disabled={!isEditable}
                pressed={toolbarState.isItalic}
                onPressedChange={() => {
                  activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
                }}
                tip={`Italic (${SHORTCUTS.ITALIC})`}
                type="button"
                aria-label={`Format text as italics. Shortcut: ${SHORTCUTS.ITALIC}`}
              >
                <Italic />
              </Toggle>
              <Toggle
                disabled={!isEditable}
                variant={"outline"}
                size={"Toolbar"}
                pressed={toolbarState.isUnderline}
                onPressedChange={() => {
                  activeEditor.dispatchCommand(
                    FORMAT_TEXT_COMMAND,
                    "underline"
                  );
                }}
                tip={`Underline (${SHORTCUTS.UNDERLINE})`}
                type="button"
                aria-label={`Format text to underlined. Shortcut: ${SHORTCUTS.UNDERLINE}`}
              >
                <Underline />
              </Toggle>
              <Toggle
                disabled={!isEditable}
                variant={"outline"}
                size={"Toolbar"}
                pressed={toolbarState.isCode}
                onPressedChange={() => {
                  activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "code");
                }}
                tip={`Insert code block (${SHORTCUTS.INSERT_CODE_BLOCK})`}
                type="button"
                aria-label="Insert code block"
              >
                <Code />
              </Toggle>
              <Toggle
                variant={"outline"}
                size={"Toolbar"}
                disabled={!isEditable}
                onPressedChange={insertLink}
                pressed={toolbarState.isLink}
                aria-label="Insert link"
                tip={`Insert link (${SHORTCUTS.INSERT_LINK})`}
                type="button"
              >
                <Link />
              </Toggle>
            </div>
            <Separator className="h-6 mx-2" orientation="vertical" />
            <Color
              disabled={!isEditable}
              color={toolbarState.fontColor}
              bgColor={toolbarState.bgColor}
              editor={editor}
            />
            <BackgroundColor
              disabled={!isEditable}
              color={toolbarState.fontColor}
              bgColor={toolbarState.bgColor}
              editor={editor}
            />
            <Separator className="h-6 mx-2" orientation="vertical" />
            <TextFormat
              disabled={!isEditable}
              editor={editor}
              toolbarState={toolbarState}
            />
            <Separator className="h-6 mx-2" orientation="vertical" />
            <InsertNode disabled={!isEditable} editor={editor} />
          </div>
        )}
        <Separator className="h-6 mx-2" orientation="vertical" />

        <TextAlign
          disabled={!isEditable}
          value={toolbarState.elementFormat}
          editor={activeEditor}
          isRTL={toolbarState.isRTL}
        />
        
        {SUPPORT_SPEECH_RECOGNITION && (
          <Button
            variant={"outline"}
            size={"Toolbar"}
            type="button"
            onClick={() => {
              editor.dispatchCommand(SPEECH_TO_TEXT_COMMAND, !isSpeechToText);
              setIsSpeechToText(!isSpeechToText);
            }}
            className={`
      relative inline-flex items-center justify-center
      p-3 rounded-lg border-none font-medium
      transition-all duration-300 ease-in-out
      active:scale-95
      ${isSpeechToText
                ? "border-none animate-pulse bg-gray-800"
                : 'bg-transparent hover:bg-gray-900 cursor-pointer border-none shadow-sm hover:shadow-md'
              }
    `}
            title="Speech To Text"
            aria-label={`${isSpeechToText ? 'Disable' : 'Enable'} speech to text`}
          >
            <div className="relative z-10 flex items-center space-x-2">
              <Mic className={`w-4 h-4 transition-all duration-300 ${isSpeechToText ? 'animate-bounce' : ''
                }`} />
              {/* {isSpeechToText && (
                <div className="flex space-x-1">
                  <div className="w-1 h-4 bg-white rounded-full animate-pulse animation-delay-0"></div>
                  <div className="w-1 h-3 bg-white rounded-full animate-pulse animation-delay-150"></div>
                  <div className="w-1 h-4 bg-white rounded-full animate-pulse animation-delay-300"></div>
                </div>
              )} */}
            </div>

            {/* Ripple effect on click */}
            {/* <div className="absolute inset-0 rounded-lg overflow-hidden">
              <div className={`absolute inset-0 bg-white transition-transform duration-500 ${isSpeechToText ? 'scale-0' : ''
                }`}></div>
            </div> */}
          </Button>
        )}
      </div>
    </nav>
  );
}
