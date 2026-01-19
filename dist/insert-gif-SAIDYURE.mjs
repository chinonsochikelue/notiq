import {
  Skeleton
} from "./chunk-QEIFVK5M.mjs";
import {
  Input
} from "./chunk-POGRR73N.mjs";
import {
  Button
} from "./chunk-BIU7WTLX.mjs";
import "./chunk-YHPNOWFH.mjs";
import {
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/components/ui/models/insert-gif.tsx
init_react_shim();
import React2, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

// src/components/editor/utils/gif.ts
init_react_shim();
var API_KEY = process.env.NEXT_PUBLIC_TENOR_API_KEY;
var fetchGifs = async ({ q = "trending" }) => {
  const params = new URLSearchParams({
    key: API_KEY || "",
    q,
    limit: "200",
    media_filter: "minimal"
  });
  const response = await fetch(`https://tenor.googleapis.com/v2/search?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  const data = await response.json();
  const gifs = data.results.map((gif) => ({
    id: gif.id,
    url: gif.media_formats.gif.url,
    alt_text: gif.content_description
  }));
  return { gifs, next: data.next };
};
var gif_default = fetchGifs;

// src/components/ui/models/insert-gif.tsx
import { Search, X } from "lucide-react";
function InsertGif({ insertGifOnClick, onClose }) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);
  const { data: gifs, isPending } = useQuery({
    queryKey: ["gifs", debouncedSearch],
    queryFn: async () => {
      const { gifs: gifs2 } = await gif_default({ q: debouncedSearch || "trending" });
      return gifs2;
    }
  });
  return /* @__PURE__ */ React2.createElement("div", { className: "flex flex-col space-y-1" }, /* @__PURE__ */ React2.createElement("form", { onSubmit: (e) => e.preventDefault(), className: "relative mb-3" }, /* @__PURE__ */ React2.createElement(
    Button,
    {
      type: "submit",
      className: "absolute text-gray-500 left-1 top-[50%] -translate-y-1/2",
      variant: "ghost",
      size: "sm"
    },
    /* @__PURE__ */ React2.createElement(Search, { className: "w-4 h-4" })
  ), /* @__PURE__ */ React2.createElement(
    Input,
    {
      onChange: (e) => setSearch(e.target.value),
      value: search,
      placeholder: "Search for GIFs",
      className: "pl-9"
    }
  ), search && /* @__PURE__ */ React2.createElement(
    X,
    {
      onClick: () => setSearch(""),
      className: "w-4 h-4 absolute cursor-pointer transition-colors text-gray-500 right-3 top-[50%] hover:text-white -translate-y-1/2"
    }
  )), /* @__PURE__ */ React2.createElement("div", { className: "grid grid-cols-3 gap-2" }, isPending && Array(9).fill(0).map((_, i) => /* @__PURE__ */ React2.createElement(Skeleton, { key: i, className: "rounded-md w-full h-full" })), !isPending && (gifs == null ? void 0 : gifs.map((gif) => /* @__PURE__ */ React2.createElement(
    "button",
    {
      key: gif.id,
      onClick: () => {
        insertGifOnClick({ src: gif.url, altText: gif.alt_text });
        onClose();
      },
      className: "w-full h-full"
    },
    /* @__PURE__ */ React2.createElement("img", { src: gif.url, alt: gif.alt_text, className: "rounded-md w-full h-full" })
  ))), !isPending && (gifs == null ? void 0 : gifs.length) === 0 && /* @__PURE__ */ React2.createElement("p", { className: "text-center text-gray-500" }, "No GIFs found")));
}
export {
  InsertGif as default
};
