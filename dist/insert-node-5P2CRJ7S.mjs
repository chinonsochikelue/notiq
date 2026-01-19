import {
  INSERT_EXCALIDRAW_COMMAND
} from "./chunk-EHNQD5KO.mjs";
import {
  DropDown
} from "./chunk-EGMI62PP.mjs";
import "./chunk-KJ6AJ44Q.mjs";
import "./chunk-64Z3FI7T.mjs";
import {
  AutoEmbedDialog,
  FigmaEmbedConfig,
  INSERT_COLLAPSIBLE_COMMAND,
  INSERT_LAYOUT_COMMAND,
  TwitterEmbedConfig,
  YoutubeEmbedConfig
} from "./chunk-AMMKBSST.mjs";
import {
  useModal
} from "./chunk-5QSNIVIG.mjs";
import {
  INSERT_IMAGE_COMMAND
} from "./chunk-LGG4IUIA.mjs";
import "./chunk-GXYD4VZM.mjs";
import "./chunk-N3WN46VL.mjs";
import {
  Skeleton
} from "./chunk-QEIFVK5M.mjs";
import {
  INSERT_HINT_COMMAND
} from "./chunk-G53GLEAY.mjs";
import "./chunk-XWC4TK2N.mjs";
import "./chunk-KJV3FAZ7.mjs";
import "./chunk-POGRR73N.mjs";
import "./chunk-WDG7J2DY.mjs";
import "./chunk-BIU7WTLX.mjs";
import "./chunk-YHPNOWFH.mjs";
import {
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/components/ui/drop-downs/insert-node.tsx
init_react_shim();
import React, { useMemo, lazy, Suspense } from "react";
import { AlertCircle, Columns2, Columns3, Columns4, DraftingCompassIcon, Figma, FlipHorizontal2, Image, ImagePlay, Plus, SquareChevronRight, SquarePenIcon, Table, Twitter, Youtube } from "lucide-react";
import { INSERT_HORIZONTAL_RULE_COMMAND } from "@lexical/react/LexicalHorizontalRuleNode";
var InsertImageDialog = lazy(() => import("./insert-image-U3RJN3OW.mjs").then((module) => ({ default: module.InsertImageDialog })));
var InsertGif = lazy(() => import("./insert-gif-SAIDYURE.mjs"));
var InsertTableBody = lazy(() => import("./insert-table-24XYUS2W.mjs").then((module) => ({ default: module.InsertTable })));
var InsertPoll = lazy(
  () => import("./insert-poll-HCPM7MO6.mjs").then((module) => ({ default: module.InsertPoll }))
);
function InsertNode({
  disabled,
  editor
}) {
  const [model, showModal] = useModal();
  const insertGifOnClick = (payload) => {
    editor.dispatchCommand(INSERT_IMAGE_COMMAND, payload);
  };
  const items = useMemo(
    () => [
      {
        label: "Horizontal Rule",
        icon: /* @__PURE__ */ React.createElement(FlipHorizontal2, { className: "w-4 h-4" }),
        func: () => editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, void 0)
      },
      {
        label: "Image",
        icon: /* @__PURE__ */ React.createElement(Image, { className: "size-4" }),
        func: () => {
          showModal(
            "Insert Image",
            "Please select an image to upload.",
            (onClose) => /* @__PURE__ */ React.createElement(Suspense, { fallback: /* @__PURE__ */ React.createElement(Skeleton, { className: "mx-2 w-[350px] h-[350px]" }) }, /* @__PURE__ */ React.createElement(InsertImageDialog, { activeEditor: editor, onClose })),
            true
          );
        }
      },
      {
        label: "GIF",
        icon: /* @__PURE__ */ React.createElement(ImagePlay, { className: "w-4 h-4" }),
        func: () => {
          showModal(
            "Insert GIF",
            "Please select a GIF to upload.",
            (onClose) => /* @__PURE__ */ React.createElement(Suspense, { fallback: /* @__PURE__ */ React.createElement(Skeleton, { className: "mx-2 w-[400px] h-[400px]" }) }, /* @__PURE__ */ React.createElement(InsertGif, { insertGifOnClick, onClose })),
            true
          );
        }
      },
      {
        label: "Table",
        icon: /* @__PURE__ */ React.createElement(Table, { className: "w-4 h-4" }),
        func: () => {
          showModal(
            "Insert Table",
            "Please configure your table.",
            (onClose) => /* @__PURE__ */ React.createElement(Suspense, { fallback: /* @__PURE__ */ React.createElement(Skeleton, { className: "mx-2 w-[400px] h-[100px]" }) }, /* @__PURE__ */ React.createElement(InsertTableBody, { activeEditor: editor, onClose })),
            true
          );
        }
      },
      {
        label: "ExcaliDraw",
        icon: /* @__PURE__ */ React.createElement(DraftingCompassIcon, { className: "w-4 h-4" }),
        func: () => {
          editor.dispatchCommand(INSERT_EXCALIDRAW_COMMAND, void 0);
        }
      },
      {
        label: "Poll",
        icon: /* @__PURE__ */ React.createElement(SquarePenIcon, { className: "w-4 h-4" }),
        func: () => {
          showModal(
            "Create Poll",
            "Please type your question.",
            (onClose) => /* @__PURE__ */ React.createElement(Suspense, { fallback: /* @__PURE__ */ React.createElement(Skeleton, { className: "mx-2 w-[400px] h-[100px]" }) }, /* @__PURE__ */ React.createElement(InsertPoll, { activeEditor: editor, onClose })),
            true
          );
        }
      },
      {
        label: "2 columns (equal width)",
        icon: /* @__PURE__ */ React.createElement(Columns2, { className: "w-4 h-4" }),
        func: () => {
          editor.dispatchCommand(INSERT_LAYOUT_COMMAND, "1fr 1fr");
        }
      },
      {
        label: "3 columns (equal width)",
        icon: /* @__PURE__ */ React.createElement(Columns3, { className: "w-4 h-4" }),
        func: () => {
          editor.dispatchCommand(INSERT_LAYOUT_COMMAND, "1fr 1fr 1fr");
        }
      },
      {
        label: "4 columns (equal width)",
        icon: /* @__PURE__ */ React.createElement(Columns4, { className: "w-4 h-4" }),
        func: () => {
          editor.dispatchCommand(INSERT_LAYOUT_COMMAND, "1fr 1fr 1fr 1fr");
        }
      },
      {
        label: "2 columns (25% - 75%)",
        icon: /* @__PURE__ */ React.createElement(Columns2, { className: "w-4 h-4" }),
        func: () => {
          editor.dispatchCommand(INSERT_LAYOUT_COMMAND, "1fr 3fr");
        }
      },
      {
        label: "Collapsible container",
        icon: /* @__PURE__ */ React.createElement(SquareChevronRight, { className: "w-4 h-4" }),
        func: () => {
          editor.dispatchCommand(INSERT_COLLAPSIBLE_COMMAND, void 0);
        }
      },
      {
        label: "Twitter",
        icon: /* @__PURE__ */ React.createElement(Twitter, { className: "w-4 h-4" }),
        func: () => {
          showModal("Twitter tweet", "Insert a URL to embed a live preview. Works with Twitter, Google Drive, Vimeo, and more.", (onClose) => /* @__PURE__ */ React.createElement(AutoEmbedDialog, { embedConfig: TwitterEmbedConfig, onClose }), true);
        }
      },
      {
        label: "Youtube",
        icon: /* @__PURE__ */ React.createElement(Youtube, null),
        func: () => {
          showModal("Youtube", "Insert a URL to embed a live preview. Works with YouTube, Google Drive, Vimeo, and more.", (onClose) => /* @__PURE__ */ React.createElement(AutoEmbedDialog, { embedConfig: YoutubeEmbedConfig, onClose }), true);
        }
      },
      {
        label: "Figma",
        icon: /* @__PURE__ */ React.createElement(Figma, null),
        func: () => {
          showModal("Figma", "Insert a URL to embed a live preview. Works with Figma.", (onClose) => /* @__PURE__ */ React.createElement(AutoEmbedDialog, { embedConfig: FigmaEmbedConfig, onClose }), true);
        }
      },
      {
        label: "Hint",
        icon: /* @__PURE__ */ React.createElement(AlertCircle, null),
        func: () => {
          editor.dispatchCommand(INSERT_HINT_COMMAND, "info");
        }
      }
    ],
    [editor, showModal]
  );
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
    DropDown,
    {
      values: items,
      TriggerClassName: { width: "115px", border: "none" },
      className: "cursor-pointer",
      TriggerLabel: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Plus, null), /* @__PURE__ */ React.createElement("span", null, "Insert")),
      disabled
    }
  ), model);
}
export {
  InsertNode as default
};
