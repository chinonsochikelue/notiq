import {
  CodeActionMenuPlugin
} from "./chunk-PBD6LMLC.mjs";
import "./chunk-TTHQCW5F.mjs";
import "./chunk-GK35L7UY.mjs";
import {
  FloatingLinkEditorPlugin
} from "./chunk-QHIQKMVN.mjs";
import {
  SlashCommand
} from "./chunk-GYIOYVCN.mjs";
import {
  FloatingTextFormatToolbarPlugin
} from "./chunk-LQN3CMKV.mjs";
import "./chunk-Z4EWP7BI.mjs";
import "./chunk-4HBCVSE6.mjs";
import "./chunk-K36V4SIW.mjs";
import "./chunk-YMBXLRW5.mjs";
import "./chunk-456TN7IM.mjs";
import "./chunk-7VUMHWWL.mjs";
import "./chunk-EGMI62PP.mjs";
import "./chunk-KJ6AJ44Q.mjs";
import "./chunk-64Z3FI7T.mjs";
import "./chunk-2FNEAMSP.mjs";
import {
  CodeHighlightPlugin,
  LexicalAutoLinkPlugin,
  LinkWithMetaDataPlugin,
  nestedNodes
} from "./chunk-XLER2DHM.mjs";
import "./chunk-WJRHXI2C.mjs";
import "./chunk-U47ABU5Z.mjs";
import "./chunk-AMMKBSST.mjs";
import "./chunk-5QSNIVIG.mjs";
import {
  ImagesPlugin
} from "./chunk-LGG4IUIA.mjs";
import "./chunk-5BAKY5KN.mjs";
import "./chunk-YUDCJRJM.mjs";
import {
  $isStepperNode,
  initialEditorState
} from "./chunk-6RNZQOH2.mjs";
import "./chunk-GXYD4VZM.mjs";
import "./chunk-ZB5LZQKC.mjs";
import "./chunk-PZSUSXQG.mjs";
import "./chunk-7NZAPJ4G.mjs";
import "./chunk-TCYK7DM7.mjs";
import {
  useSharedHistoryContext
} from "./chunk-4EXYCTGJ.mjs";
import "./chunk-N3WN46VL.mjs";
import "./chunk-QEIFVK5M.mjs";
import "./chunk-GZPNVR7L.mjs";
import "./chunk-G53GLEAY.mjs";
import "./chunk-YPHOEJ46.mjs";
import "./chunk-4VWFVWYP.mjs";
import "./chunk-KJV3FAZ7.mjs";
import "./chunk-3JVFG7ER.mjs";
import "./chunk-3CPBODXA.mjs";
import "./chunk-4MEDW3T6.mjs";
import "./chunk-POGRR73N.mjs";
import "./chunk-WDG7J2DY.mjs";
import "./chunk-BIU7WTLX.mjs";
import "./chunk-YHPNOWFH.mjs";
import {
  React,
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/components/ui/stepper/stepper.tsx
init_react_shim();
import { Reorder as Reorder2, AnimatePresence } from "framer-motion";

// src/components/ui/stepper/step.tsx
init_react_shim();
import React2, { useCallback, useEffect, useRef, useState } from "react";
import { LexicalNestedComposer } from "@lexical/react/LexicalNestedComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { Plus } from "lucide-react";
import { Reorder } from "framer-motion";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { mergeRegister } from "@lexical/utils";
import {
  COMMAND_PRIORITY_LOW,
  SELECTION_CHANGE_COMMAND
} from "lexical";
function Step({
  item,
  numberd,
  insertAt,
  remove,
  updateTitle
}) {
  const titleRef = React2.useRef(null);
  const [isLinkEditMode, setIsLinkEditMode] = React2.useState(false);
  const [floatingAnchorElem, setFloatingAnchorElem] = useState(null);
  const { historyState } = useSharedHistoryContext();
  const activeEditorRef = useRef(null);
  const handleTitleBlur = () => {
    if (titleRef.current) {
      updateTitle(item.id, titleRef.current.textContent);
    }
  };
  const handleTitleKeyDown = (e) => {
    var _a;
    if (e.key === "Backspace") {
      const currentText = ((_a = titleRef.current) == null ? void 0 : _a.textContent) || "";
      if (currentText === "") {
        e.preventDefault();
        remove(item.id);
      }
    }
  };
  const onRef = useCallback((_floatingAnchorElem) => {
    setFloatingAnchorElem(_floatingAnchorElem);
  }, []);
  useEffect(() => {
    const unregister = mergeRegister(
      item.content.registerCommand(
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
  return /* @__PURE__ */ React2.createElement(
    Reorder.Item,
    {
      value: item,
      id: item.id.toString(),
      initial: { opacity: 0, y: 30 },
      animate: { opacity: 1, y: 0, transition: { duration: 0.15 } },
      exit: { opacity: 0, y: 20, transition: { duration: 0.3 } },
      className: "relative group my-2 flex w-full flex-row gap-x-6 select-none"
    },
    /* @__PURE__ */ React2.createElement(
      "div",
      {
        className: "h-7 w-7 absolute max-sm:w-5 max-sm:h-5 max-sm:text-xs rounded-full z-50 bg-muted cursor-grab flex items-center justify-center"
      },
      numberd + 1
    ),
    /* @__PURE__ */ React2.createElement("div", { className: "flex flex-col ml-10 w-full" }, /* @__PURE__ */ React2.createElement(
      "div",
      {
        contentEditable: true,
        suppressContentEditableWarning: true,
        ref: titleRef,
        onBlur: handleTitleBlur,
        onKeyDown: handleTitleKeyDown,
        className: "scroll-m-20 border-none outline-none cursor-text break-words max-sm:text-lg text-2xl font-semibold tracking-tight"
      },
      item.title
    ), /* @__PURE__ */ React2.createElement(
      LexicalNestedComposer,
      {
        initialEditor: item.content,
        initialNodes: [...nestedNodes]
      },
      /* @__PURE__ */ React2.createElement(HistoryPlugin, { externalHistoryState: historyState }),
      /* @__PURE__ */ React2.createElement(AutoFocusPlugin, null),
      /* @__PURE__ */ React2.createElement(LinkPlugin, null),
      /* @__PURE__ */ React2.createElement(ImagesPlugin, null),
      /* @__PURE__ */ React2.createElement(HorizontalRulePlugin, null),
      /* @__PURE__ */ React2.createElement(LexicalAutoLinkPlugin, null),
      /* @__PURE__ */ React2.createElement(LinkWithMetaDataPlugin, null),
      /* @__PURE__ */ React2.createElement(ListPlugin, null),
      /* @__PURE__ */ React2.createElement(CheckListPlugin, null),
      /* @__PURE__ */ React2.createElement(LinkWithMetaDataPlugin, null),
      /* @__PURE__ */ React2.createElement(TabIndentationPlugin, { maxIndent: 7 }),
      /* @__PURE__ */ React2.createElement(CodeHighlightPlugin, null),
      /* @__PURE__ */ React2.createElement(LinkPlugin, null),
      /* @__PURE__ */ React2.createElement(
        RichTextPlugin,
        {
          contentEditable: /* @__PURE__ */ React2.createElement("div", { ref: onRef, className: "relative" }, /* @__PURE__ */ React2.createElement(
            ContentEditable,
            {
              className: "h-fit w-full resize-none cursor-text relative outline-none select-text whitespace-pre-wrap break-words",
              "aria-placeholder": "Write hint caption",
              placeholder: /* @__PURE__ */ React2.createElement("div", { className: "text-base font-medium text-[#999] overflow-hidden absolute top-[2px] left-[2px]  text-nowrap inline-block text-ellipsis pointer-events-none" }, "Step content")
            }
          )),
          ErrorBoundary: LexicalErrorBoundary
        }
      ),
      floatingAnchorElem && /* @__PURE__ */ React2.createElement(React2.Fragment, null, /* @__PURE__ */ React2.createElement(
        FloatingTextFormatToolbarPlugin,
        {
          setIsLinkEditMode,
          anchorElem: floatingAnchorElem
        }
      ), /* @__PURE__ */ React2.createElement(CodeActionMenuPlugin, { anchorElem: floatingAnchorElem }), /* @__PURE__ */ React2.createElement(
        FloatingLinkEditorPlugin,
        {
          anchorElem: floatingAnchorElem,
          isLinkEditMode,
          setIsLinkEditMode
        }
      )),
      item.content.isEditable() && /* @__PURE__ */ React2.createElement(SlashCommand, null)
    )),
    /* @__PURE__ */ React2.createElement(
      "div",
      {
        onClick: () => insertAt(numberd + 1),
        className: "absolute max-sm:left-[2px] left-[4px] top-[35px] z-40 max-sm:w-4 max-sm:h-4 w-[20px] h-[20px] flex items-center justify-center ring-1 ring-gray-700 bg-gray-800 rounded-full cursor-pointer transition-opacity opacity-0 duration-500 group-hover:opacity-100"
      },
      /* @__PURE__ */ React2.createElement(Plus, { className: "size-[12px]" })
    )
  );
}

// src/components/ui/stepper/stepper.tsx
import { $getNodeByKey, createEditor } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
function Stepper({
  steps,
  nodeKey
}) {
  const [editor] = useLexicalComposerContext();
  function SetSteps(steps2) {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isStepperNode(node)) {
        node.replaceSteps(steps2);
      }
    });
  }
  const remove = (index) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isStepperNode(node)) {
        node.deleteStep(index);
      }
    });
  };
  function updateTitle(id, title) {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isStepperNode(node)) {
        node.updateTitle(id, title);
      }
    });
  }
  const insertAt = (index) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isStepperNode(node)) {
        const newId = Date.now();
        const newEditor = createEditor();
        const parsedEditorState = newEditor.parseEditorState(
          JSON.stringify(initialEditorState)
        );
        newEditor.setEditorState(parsedEditorState);
        const newStep = {
          id: newId,
          title: `New step `,
          content: newEditor
        };
        node.insertStepAtIndex(newStep, index);
      }
    });
  };
  return /* @__PURE__ */ React.createElement(
    Reorder2.Group,
    {
      axis: "y",
      values: steps,
      onReorder: SetSteps,
      className: "h-fit my-2 min-h-[90px] w-full overflow-hidden flex flex-col relative"
    },
    /* @__PURE__ */ React.createElement(AnimatePresence, { initial: false }, steps.map((item, index) => /* @__PURE__ */ React.createElement(
      Step,
      {
        updateTitle,
        remove,
        insertAt,
        key: item.id,
        numberd: index,
        item
      }
    ))),
    /* @__PURE__ */ React.createElement("div", { className: "absolute w-0.5 max-sm:left-2 left-[13px] rounded-sm -z-1 bg-input top-4 h-full" })
  );
}
export {
  Stepper as default
};
