import {
  Progress,
  useUpload
} from "./chunk-JXDPPUJI.mjs";
import {
  INSERT_IMAGE_COMMAND
} from "./chunk-LGG4IUIA.mjs";
import "./chunk-N3WN46VL.mjs";
import {
  Card,
  CardContent
} from "./chunk-3G37YKTV.mjs";
import {
  Button
} from "./chunk-BIU7WTLX.mjs";
import "./chunk-YHPNOWFH.mjs";
import {
  React,
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/components/ui/models/insert-image.tsx
init_react_shim();
import { useEffect, useRef as useRef2 } from "react";

// src/components/ui/image/file-upload.tsx
init_react_shim();
import { useState, useRef } from "react";
import {
  Upload,
  Loader2,
  X,
  Image,
  UploadCloudIcon,
  Video
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// src/lib/edgestore.ts
init_react_shim();
import { createEdgeStoreProvider } from "@edgestore/react";
var { EdgeStoreProvider, useEdgeStore } = createEdgeStoreProvider();

// src/components/ui/image/file-upload.tsx
var FileUploadZone = ({
  InsertMedia
}) => {
  const [draggedZone, setDraggedZone] = useState(null);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);
  const { edgestore } = useEdgeStore();
  const uploadConfig = useUpload();
  const handleDragEnter = (index) => (e) => {
    e.preventDefault();
    setDraggedZone(index);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setDraggedZone(null);
  };
  const upload = async (newFiles) => {
    setUploading(true);
    setProgress(0);
    let uploadedFiles = [];
    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      try {
        let url = "";
        if (uploadConfig == null ? void 0 : uploadConfig.uploadHandler) {
          const res = await uploadConfig.uploadHandler(file, (p) => {
            setProgress(
              Math.round(p / 100 * ((i + 1) / newFiles.length) * 100)
            );
          });
          url = res.url;
        } else {
          const response = await edgestore.publicFiles.upload({
            file,
            onProgressChange: (progress2) => {
              setProgress(
                Math.round(progress2 / 100 * ((i + 1) / newFiles.length) * 100)
              );
            }
          });
          url = response.url;
        }
        uploadedFiles.push({ url, alt: file.name });
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
      }
    }
    setFiles((prevFiles) => [...prevFiles, ...uploadedFiles]);
    setUploading(false);
    setProgress(100);
  };
  const handleDrop = () => async (e) => {
    e.preventDefault();
    setDraggedZone(null);
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      await upload(droppedFiles);
    }
  };
  const handleFileSelect = async (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      await upload(selectedFiles);
    }
  };
  const removeFile = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };
  const zones = [
    {
      title: "Upload Images",
      subtitle: "Drop images here",
      icon: Image,
      gradient: "from-purple-400 via-pink-500 to-red-500",
      rotate: "-rotate-2"
    },
    {
      title: "Upload Videos",
      subtitle: "Drop videos here",
      icon: Video,
      gradient: "from-blue-400 via-teal-500 to-green-500",
      rotate: ""
    },
    {
      title: "Upload Files",
      subtitle: "Drop files here",
      icon: UploadCloudIcon,
      gradient: "from-yellow-400 via-orange-500 to-red-500",
      rotate: "rotate-3"
    }
  ];
  return /* @__PURE__ */ React.createElement(Card, { className: "mx-auto w-full  bg-transparent border-none max-w-[300px] lg:max-w-[500px] overflow-hidden rounded-[1rem]" }, /* @__PURE__ */ React.createElement(CardContent, { className: "p-6 py-7   cursor:pointer" }, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6" }, zones.map((zone, index) => /* @__PURE__ */ React.createElement("div", { key: index, className: `relative ${zone.rotate}` }, /* @__PURE__ */ React.createElement(
    motion.div,
    {
      onDragEnter: handleDragEnter(index),
      onDragOver: (e) => e.preventDefault(),
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
      whileHover: { y: -4, scale: 1.02 },
      whileTap: { scale: 0.98 },
      className: "group relative h-full"
    },
    /* @__PURE__ */ React.createElement(
      "div",
      {
        className: `
                    absolute inset-0 -z-10 rounded-xl bg-gradient-to-br ${zone.gradient}
                    opacity-0 blur-md transition-opacity duration-300
                    ${draggedZone === index ? "opacity-70" : "group-hover:opacity-70"}
                  `
      }
    ),
    /* @__PURE__ */ React.createElement(Card, { className: "relative h-full rounded-[1rem] overflow-hidden border-2 border-dashed border-gray-200 dark:border-gray-800 transition-colors duration-300 group-hover:border-transparent" }, /* @__PURE__ */ React.createElement(CardContent, { className: "flex h-full flex-col items-center justify-center p-6 text-center" }, /* @__PURE__ */ React.createElement(
      motion.div,
      {
        whileHover: { scale: 1.1, rotate: 10 },
        className: "rounded-full bg-gray-100 dark:bg-gray-800 p-3 mb-4"
      },
      /* @__PURE__ */ React.createElement(zone.icon, { className: "h-8 w-8 text-gray-500" })
    ), /* @__PURE__ */ React.createElement("h3", { className: "mb-1 text-sm font-medium" }, zone.title), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-gray-500" }, zone.subtitle)))
  )))), (uploading || files.length > 0) && /* @__PURE__ */ React.createElement("div", { className: "mb-6" }, /* @__PURE__ */ React.createElement(Progress, { value: uploading ? progress : 100, className: "h-2 mb-2" }), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-gray-500 mb-2" }, uploading ? `Uploading... ${progress}%` : `${files.length} file(s) uploaded`), /* @__PURE__ */ React.createElement(AnimatePresence, null, files.map((file, index) => /* @__PURE__ */ React.createElement(
    motion.div,
    {
      key: `${file.alt}-${index}`,
      initial: { opacity: 0, y: -10 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -10 },
      className: "flex items-center justify-between bg-gray-100 dark:bg-gray-800 rounded-[1rem] p-2 mb-2"
    },
    /* @__PURE__ */ React.createElement("span", { className: "truncate max-w-[80%] text-sm text-gray-700 dark:text-gray-300 ml-2" }, file.alt),
    /* @__PURE__ */ React.createElement(
      Button,
      {
        variant: "ghost",
        size: "icon",
        onClick: () => removeFile(index),
        className: "h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
      },
      /* @__PURE__ */ React.createElement(X, { className: "h-4 w-4" })
    )
  )))), /* @__PURE__ */ React.createElement("div", { className: "text-center flex flex-col" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "file",
      ref: fileInputRef,
      onChange: handleFileSelect,
      className: "hidden",
      multiple: true
    }
  ), /* @__PURE__ */ React.createElement(
    Button,
    {
      onClick: () => {
        var _a;
        return (_a = fileInputRef.current) == null ? void 0 : _a.click();
      },
      disabled: uploading,
      className: "rounded-[1rem] mt-5"
    },
    uploading ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Uploading...") : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Upload, { className: "mr-2 h-4 w-4" }), "Choose Files")
  ), files.length > 0 && /* @__PURE__ */ React.createElement(
    Button,
    {
      onClick: () => InsertMedia(files),
      disabled: uploading,
      className: "rounded-[1rem] mt-2"
    },
    "Insert the ",
    files.length == 1 ? "image" : "images"
  ))));
};
var file_upload_default = FileUploadZone;

// src/components/ui/models/insert-image.tsx
function InsertImageDialog({
  activeEditor,
  onClose
}) {
  const hasModifier = useRef2(false);
  useEffect(() => {
    hasModifier.current = false;
    const handler = (e) => {
      hasModifier.current = e.altKey;
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
    };
  }, [activeEditor]);
  const handleInsertImage = (payload) => {
    activeEditor.dispatchCommand(INSERT_IMAGE_COMMAND, payload);
  };
  const InsertMedia = (files) => {
    if (!files) {
      return;
    }
    for (let index = 0; index < files.length; index++) {
      console.log(files);
      const payload = {
        altText: files[index].alt || "image",
        src: files[index].url
      };
      handleInsertImage(payload);
      if (index === files.length - 1) {
        onClose();
      }
    }
  };
  return /* @__PURE__ */ React.createElement(file_upload_default, { InsertMedia });
}
export {
  InsertImageDialog
};
