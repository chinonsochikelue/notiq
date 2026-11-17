import "@testing-library/jest-dom";
import { ReadableStream, WritableStream, TransformStream } from "node:stream/web";

if (typeof globalThis.ReadableStream === "undefined") {
  Object.assign(globalThis, { ReadableStream });
}
if (typeof globalThis.WritableStream === "undefined") {
  Object.assign(globalThis, { WritableStream });
}
if (typeof globalThis.TransformStream === "undefined") {
  Object.assign(globalThis, { TransformStream });
}
