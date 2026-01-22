import React, { Dispatch, useCallback, useEffect, useState } from "react";

import {
  $getNodeByKey,
  $getSelection,
  $isElementNode,
  $isLineBreakNode,
  $isRangeSelection,
  $isRootOrShadowRoot,
  BLUR_COMMAND,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  FOCUS_COMMAND,
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
} from "../../../providers/ToolbarContext";
import { cn } from "../../../../lib/utils";
import { TemplateDialog } from "../TemplatePlugin/TemplateDialog";
import { ToolbarConfig, ToolbarItem } from "../../index";

import { Bold, Code, DownloadIcon, FileJson, FileText, Italic, Link, Mic, Redo, Redo2Icon, Underline, Undo, Undo2Icon } from "lucide-react";
import { EXPORT_MARKDOWN_COMMAND, EXPORT_PDF_COMMAND } from "../ExportPlugin";

import { Separator } from "../../../ui/separator";
import { Button } from "../../../ui/button";
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
import dynamic from "next/dynamic.js";
import { Toggle } from "../../../ui/toggle";
import { SHORTCUTS } from "../ShortcutsPlugin/shortcuts";
import { sanitizeUrl } from "../../utils/url";
import CodeList from "../../../ui/drop-downs/code"
import { SPEECH_TO_TEXT_COMMAND, SUPPORT_SPEECH_RECOGNITION } from "../SpeechToTextPlugin";
import { downloadHTML, exportEditorToHTML } from "../../../../utils/htmlExport";
const BlockFormatDropDown = dynamic(
  () => import("../../../ui/drop-downs/block-format")
);
const MobileToolbar = dynamic(() => import("./MobileToolbar"), { ssr: false });
const FontDropDown = dynamic(
  () => import("../../../ui/drop-downs/font")
);
const FontSize = dynamic(
  () => import("../../../ui/drop-downs/font-size")
);
const Color = dynamic(() => import("../../../ui/drop-downs/color"));
const BackgroundColor = dynamic(() => import("../../../ui/drop-downs/background-color"));
const TextFormat = dynamic(
  () => import("../../../ui/drop-downs/text-format")
);
const InsertNode = dynamic(
  () => import("../../../ui/drop-downs/insert-node")
);
const TextAlign = dynamic(
  () => import("../../../ui/drop-downs/text-align")
);
// import { type } from './../../../providers/ToolbarContext';


const rootTypeToRootName = {
  root: 'Root',
  table: 'Table',
};
export default function ToolbarPlugin({
  editor,
  activeEditor,
  setActiveEditor,
  setIsLinkEditMode,
  toolbarConfig,
  className,
}: {
  editor: LexicalEditor;
  activeEditor: LexicalEditor;
  setActiveEditor: Dispatch<LexicalEditor>;
  setIsLinkEditMode: Dispatch<boolean>;
  toolbarConfig?: ToolbarConfig;
  className?: string;
}) {
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const [isSpeechToText, setIsSpeechToText] = useState(false);
  const [selectedElementKey, setSelectedElementKey] = useState<NodeKey | null>(
    null
  );
  const [isFocused, setIsFocused] = useState(false);
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
      editor.registerCommand(
        FOCUS_COMMAND,
        () => {
          setIsFocused(true);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      editor.registerCommand(
        BLUR_COMMAND,
        () => {
          setIsFocused(false);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      ),
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


  const handleDownloadHTML = useCallback(() => {
    try {
      const htmlContent = exportEditorToHTML(activeEditor)
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-")
      downloadHTML(htmlContent, `document-${timestamp}.html`)
    } catch (error) {
      console.error("Failed to export HTML:", error)
    }
  }, [activeEditor])

  const DEFAULT_TOOLBAR_ITEMS: ToolbarItem[] = [
    "undo", "redo", "separator",
    "block-format", "separator",
    "font-family", "separator",
    "font-size", "separator",
    "bold", "italic", "underline", "code", "link", "separator",
    "color", "bg-color", "separator",
    "text-format", "separator",
    "insert", "separator",
    "align", "separator",
    "speech", "template", "download", "separator",
    "export-md", "export-pdf"
  ];

  const itemsToRender = toolbarConfig?.items || DEFAULT_TOOLBAR_ITEMS;
  const customClassName = toolbarConfig?.className || className;
  const itemClassName = toolbarConfig?.itemClassName;
  const activeItemClassName = toolbarConfig?.activeItemClassName;

  const renderItem = (item: ToolbarItem, index: number) => {
    switch (item) {
      case "undo":
        return (
          <Button
            key={`undo-${index}`}
            size={"Toolbar"}
            variant={"outline"}
            disabled={!toolbarState.canUndo || !isEditable}
            onClick={() => {
              activeEditor.dispatchCommand(UNDO_COMMAND, undefined);
            }}
            tip={false ? "Undo (⌘Z)" : "Undo (Ctrl+Z)"}
            type="button"
            aria-label="Undo"
            className={cn("border-none", itemClassName)}
          >
            <Undo2Icon className=" size-4" />
          </Button>
        );
      case "redo":
        return (
          <Button
            key={`redo-${index}`}
            variant={"outline"}
            size={"Toolbar"}
            disabled={!toolbarState.canRedo || !isEditable}
            onClick={() => {
              activeEditor.dispatchCommand(REDO_COMMAND, undefined);
            }}
            tip={false ? "Redo (⇧⌘Z)" : "Redo (Ctrl+Y)"}
            type="button"
            className={cn("toolbar-item border-none", itemClassName)}
            aria-label="Redo"
          >
            <Redo2Icon className=" size-4" />
          </Button>
        );
      case "separator":
        return <Separator key={`sep-${index}`} className="h-6 mx-2" orientation="vertical" />;
      case "block-format":
        return toolbarState.blockType in blockTypeToBlockName && activeEditor === editor ? (
          <div key={`block-${index}`} className="flex flex-row gap-x-[5px] items-center">
            <BlockFormatDropDown
              disabled={!isEditable}
              blockType={toolbarState.blockType}
              editor={activeEditor}
            />
          </div>
        ) : null;
      case "font-family":
        return (
          <FontDropDown
            key={`font-${index}`}
            disabled={!isEditable}
            style={{ fontFamily: toolbarState.fontFamily }}
            value={toolbarState.fontFamily}
            editor={activeEditor}
          />
        );
      case "font-size":
        return (
          <FontSize
            key={`size-${index}`}
            selectionFontSize={toolbarState.fontSize.slice(0, -2)}
            editor={activeEditor}
            disabled={!isEditable}
          />
        );
      case "bold":
        return (
          <Toggle
            key={`bold-${index}`}
            disabled={!isEditable}
            variant={"outline"}
            size={"Toolbar"}
            pressed={toolbarState.isBold}
            onPressedChange={() => {
              activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
            }}
            tip={`Bold ${SHORTCUTS.BOLD}`}
            aria-label={`Format text as bold. Shortcut: ${SHORTCUTS.BOLD}`}
            className={cn(itemClassName, toolbarState.isBold && activeItemClassName)}
          >
            <Bold size={16} />
          </Toggle>
        );
      case "italic":
        return (
          <Toggle
            key={`italic-${index}`}
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
            className={cn(itemClassName, toolbarState.isItalic && activeItemClassName)}
          >
            <Italic size={16} />
          </Toggle>
        );
      case "underline":
        return (
          <Toggle
            key={`underline-${index}`}
            disabled={!isEditable}
            variant={"outline"}
            size={"Toolbar"}
            pressed={toolbarState.isUnderline}
            onPressedChange={() => {
              activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
            }}
            tip={`Underline (${SHORTCUTS.UNDERLINE})`}
            type="button"
            aria-label={`Format text to underlined. Shortcut: ${SHORTCUTS.UNDERLINE}`}
            className={cn(itemClassName, toolbarState.isUnderline && activeItemClassName)}
          >
            <Underline size={16} />
          </Toggle>
        );
      case "code":
        return (
          <Toggle
            key={`code-${index}`}
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
            className={cn(itemClassName, toolbarState.isCode && activeItemClassName)}
          >
            <Code size={16} />
          </Toggle>
        );
      case "link":
        return (
          <Toggle
            key={`link-${index}`}
            variant={"outline"}
            size={"Toolbar"}
            disabled={!isEditable}
            onPressedChange={insertLink}
            pressed={toolbarState.isLink}
            aria-label="Insert link"
            tip={`Insert link (${SHORTCUTS.INSERT_LINK})`}
            type="button"
            className={cn(itemClassName, toolbarState.isLink && activeItemClassName)}
          >
            <Link size={16} />
          </Toggle>
        );
      case "color":
        return (
          <Color
            key={`color-${index}`}
            disabled={!isEditable}
            color={toolbarState.fontColor}
            bgColor={toolbarState.bgColor}
            editor={editor}
          />
        );
      case "bg-color":
        return (
          <BackgroundColor
            key={`bg-${index}`}
            disabled={!isEditable}
            color={toolbarState.fontColor}
            bgColor={toolbarState.bgColor}
            editor={editor}
          />
        );
      case "text-format":
        return (
          <TextFormat
            key={`format-${index}`}
            disabled={!isEditable}
            editor={editor}
            toolbarState={toolbarState}
          />
        );
      case "insert":
        return <InsertNode key={`insert-${index}`} disabled={!isEditable} editor={editor} />;
      case "align":
        return (
          <TextAlign
            key={`align-${index}`}
            disabled={!isEditable}
            value={toolbarState.elementFormat}
            editor={activeEditor}
            isRTL={toolbarState.isRTL}
          />
        );
      case "speech":
        return SUPPORT_SPEECH_RECOGNITION ? (
          <Button
            key={`speech-${index}`}
            variant={"outline"}
            size={"Toolbar"}
            type="button"
            onClick={() => {
              editor.dispatchCommand(SPEECH_TO_TEXT_COMMAND, !isSpeechToText);
              setIsSpeechToText(!isSpeechToText);
            }}
            className={cn(
              "relative inline-flex items-center justify-center p-3 rounded-lg border-none font-medium transition-all duration-300 ease-in-out active:scale-95",
              isSpeechToText ? "animate-pulse bg-gray-800" : "bg-transparent hover:bg-gray-900 cursor-pointer shadow-sm hover:shadow-md",
              itemClassName
            )}
            title="Speech To Text"
            aria-label={`${isSpeechToText ? "Disable" : "Enable"} speech to text`}
          >
            <Mic className={cn("w-4 h-4 transition-all duration-300", isSpeechToText && "animate-bounce")} />
          </Button>
        ) : null;
      case "template":
        return <TemplateDialog key={`template-${index}`} />;
      case "download":
        return (
          <Button
            key={`download-${index}`}
            variant={"outline"}
            size={"Toolbar"}
            type="button"
            onClick={handleDownloadHTML}
            tip="Download as HTML"
            aria-label="Download document as HTML file"
            className={cn("border-none", itemClassName)}
          >
            <DownloadIcon className="size-4" />
          </Button>
        );
      case "export-md":
        return (
          <Button
            key={`md-${index}`}
            variant={"outline"}
            size={"Toolbar"}
            type="button"
            onClick={() => {
              editor.dispatchCommand(EXPORT_MARKDOWN_COMMAND, undefined);
            }}
            tip="Export to Markdown"
            aria-label="Export document to Markdown"
            className={cn("border-none", itemClassName)}
          >
            <FileJson className="size-4" />
          </Button>
        );
      case "export-pdf":
        return (
          <Button
            key={`pdf-${index}`}
            variant={"outline"}
            size={"Toolbar"}
            type="button"
            onClick={() => {
              editor.dispatchCommand(EXPORT_PDF_COMMAND, undefined);
            }}
            tip="Export to PDF"
            aria-label="Export document to PDF"
            className={cn("border-none", itemClassName)}
          >
            <FileText className="size-4" />
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <nav
        className={cn(
          "left-0 w-full hidden md:block", // Hide on mobile, show on desktop
          customClassName
        )}
      >
        <div className="flex justify-center pt-4">
          <div
            className={cn(
              "group flex flex-row items-center bg-background/70 gap-x-2 dark:border dark:border-gray-500/20",
              "md:rounded-2xl rounded-md h-14 px-4 py-2 shadow-md",
              "overflow-x-auto whitespace-nowrap max-w-[90%] scrollbar-none",
              "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            )}
          >
            {toolbarState.blockType === "code" ? (
              <CodeList
                onCodeLanguageSelect={onCodeLanguageSelect}
                codeLanguage={toolbarState.codeLanguage}
                disabled={!isEditable}
              />
            ) : (
              itemsToRender.map((item, index) => renderItem(item, index))
            )}
          </div>
        </div>
      </nav>

      <MobileToolbar
        editor={editor}
        activeEditor={activeEditor}
        toolbarState={toolbarState}
        setIsLinkEditMode={setIsLinkEditMode}
        isVisible={isFocused}
        toolbarConfig={toolbarConfig}
      />
    </>
  );
}
