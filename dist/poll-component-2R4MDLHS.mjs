import {
  $isPollNode,
  createPollOption
} from "./chunk-GZPNVR7L.mjs";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "./chunk-3G37YKTV.mjs";
import {
  Input
} from "./chunk-POGRR73N.mjs";
import {
  Button
} from "./chunk-BIU7WTLX.mjs";
import {
  cn
} from "./chunk-YHPNOWFH.mjs";
import {
  __objRest,
  __spreadValues,
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/components/ui/poll/poll-component.tsx
init_react_shim();
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import { mergeRegister } from "@lexical/utils";
import {
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND
} from "lexical";
import * as React2 from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// src/components/ui/checkbox.tsx
init_react_shim();
import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
var Checkbox = React.forwardRef((_a, ref) => {
  var _b = _a, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ React.createElement(
    CheckboxPrimitive.Root,
    __spreadValues({
      ref,
      className: cn(
        "peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
        className
      )
    }, props),
    /* @__PURE__ */ React.createElement(
      CheckboxPrimitive.Indicator,
      {
        className: cn("flex items-center justify-center text-current")
      },
      /* @__PURE__ */ React.createElement(Check, { className: "h-4 w-4" })
    )
  );
});
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

// src/components/ui/poll/poll-component.tsx
import { X } from "lucide-react";
import { useLexicalEditable } from "@lexical/react/useLexicalEditable";
import { useMutation } from "@tanstack/react-query";
function getTotalVotes(options) {
  return options.reduce((totalVotes, next) => {
    return totalVotes + next.votes.length;
  }, 0);
}
function PollOptionComponent({
  option,
  index,
  options,
  totalVotes,
  withPollNode,
  isEditable
}) {
  const userId = "1212312";
  const checkboxRef = useRef(null);
  const votesArray = option.votes;
  const checkedIndex = votesArray.indexOf(userId);
  const checked = checkedIndex !== -1;
  const votes = votesArray.length;
  const text = option.text;
  const [editor] = useLexicalComposerContext();
  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      try {
        await new Promise((resolve) => {
          withPollNode((node) => {
            node.toggleVote(option, userId);
          }, resolve);
        });
        return;
      } catch (error) {
        await new Promise((resolve) => {
          withPollNode((node) => {
            node.toggleVote(option, userId);
          }, resolve);
        });
        throw error;
      }
    }
  });
  return /* @__PURE__ */ React2.createElement("div", { className: "flex  flex-row items-center justify-center gap-x-2" }, /* @__PURE__ */ React2.createElement("div", null, /* @__PURE__ */ React2.createElement(
    Checkbox,
    {
      disabled: !userId,
      ref: checkboxRef,
      onCheckedChange: () => {
        mutate();
      },
      checked
    }
  )), /* @__PURE__ */ React2.createElement("div", { className: "flex  relative  overflow-hidden" }, /* @__PURE__ */ React2.createElement(
    "div",
    {
      className: "h-9 overflow-hidden bg-blue-500/30 dark:bg-blue-300/50 rounded-md  absolute top-0 left-0 w-full py-2  transition-all  duration-1000",
      style: { width: `${votes === 0 ? 0 : votes / totalVotes * 100}%` }
    }
  ), /* @__PURE__ */ React2.createElement("span", { className: " absolute text-xs font-bold right-2 top-1" }, votes > 0 && (votes === 1 ? "1 vote" : `${votes} votes`)), /* @__PURE__ */ React2.createElement(
    Input,
    {
      className: " overflow-hidden ring-0 outline-none bg-transparent",
      value: text,
      disabled: !isEditable,
      onChange: (e) => {
        const target = e.target;
        const value = target.value;
        const selectionStart = target.selectionStart;
        const selectionEnd = target.selectionEnd;
        withPollNode(
          (node) => {
            node.setOptionText(option, value);
          },
          () => {
            target.selectionStart = selectionStart;
            target.selectionEnd = selectionEnd;
          }
        );
      },
      placeholder: `Option ${index + 1}`
    }
  )), isEditable && /* @__PURE__ */ React2.createElement(
    Button,
    {
      size: "sm",
      variant: "ghost",
      disabled: options.length < 3 || !isEditable || isPending,
      "aria-label": "Remove",
      className: "mx-1",
      onClick: () => {
        withPollNode((node) => {
          node.deleteOption(option);
        });
      }
    },
    /* @__PURE__ */ React2.createElement(X, null)
  ));
}
function PollComponent({
  question,
  options,
  nodeKey
}) {
  const [editor] = useLexicalComposerContext();
  const [internalOptions, setInternalOptions] = useState(options);
  const [version, setVersion] = useState(0);
  const totalVotes = useMemo(() => getTotalVotes(options), [options, version]);
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
  const [selection, setSelection] = useState(null);
  const ref = useRef(null);
  const isEditable = useLexicalEditable();
  const $onDelete = useCallback(
    (payload) => {
      const deleteSelection = $getSelection();
      if (isSelected && $isNodeSelection(deleteSelection)) {
        const event = payload;
        event.preventDefault();
        deleteSelection.getNodes().forEach((node) => {
          if ($isPollNode(node)) {
            node.remove();
          }
        });
      }
      return false;
    },
    [isSelected]
  );
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isPollNode(node)) {
          setInternalOptions([...node.__options]);
          setVersion((v) => v + 1);
        }
      });
    });
  }, [editor, nodeKey]);
  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        setSelection(editorState.read(() => $getSelection()));
      }),
      editor.registerCommand(
        CLICK_COMMAND,
        (payload) => {
          const event = payload;
          if (event.target === ref.current) {
            if (!event.shiftKey) {
              clearSelection();
            }
            setSelected(!isSelected);
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_DELETE_COMMAND,
        $onDelete,
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_BACKSPACE_COMMAND,
        $onDelete,
        COMMAND_PRIORITY_LOW
      )
    );
  }, [clearSelection, editor, isSelected, nodeKey, $onDelete, setSelected]);
  const withPollNode = (cb, onUpdate) => {
    return new Promise((resolve) => {
      editor.update(
        () => {
          const node = $getNodeByKey(nodeKey);
          if ($isPollNode(node)) {
            cb(node);
            node.markDirty();
          }
        },
        {
          onUpdate: () => {
            onUpdate == null ? void 0 : onUpdate();
            resolve();
          },
          tag: "history-merge"
        }
      );
    });
  };
  const addOption = () => {
    withPollNode((node) => {
      node.addOption(createPollOption());
    });
  };
  const handleQuestionChange = useCallback(
    (event) => {
      const newQuestion = event.target.value || "";
      withPollNode((node) => {
        node.setQuestion(newQuestion);
      });
    },
    [withPollNode]
  );
  return /* @__PURE__ */ React2.createElement(Card, null, /* @__PURE__ */ React2.createElement(CardHeader, { className: "text-center" }, /* @__PURE__ */ React2.createElement(
    CardTitle,
    {
      suppressContentEditableWarning: true,
      onChange: handleQuestionChange,
      contentEditable: isEditable
    },
    question
  )), /* @__PURE__ */ React2.createElement(CardContent, { className: " space-y-2" }, options.map((option, index) => {
    const key = `${option.uid}-${option.votes.length}`;
    return /* @__PURE__ */ React2.createElement(
      PollOptionComponent,
      {
        key,
        withPollNode,
        option,
        index,
        options,
        totalVotes,
        isEditable
      }
    );
  })), isEditable && /* @__PURE__ */ React2.createElement(CardFooter, { className: "flex items-center justify-center" }, /* @__PURE__ */ React2.createElement(Button, { disabled: !isEditable, onClick: addOption }, "Add Option")));
}
export {
  PollComponent as default
};
