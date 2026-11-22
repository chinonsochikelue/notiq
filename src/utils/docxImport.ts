import type { LexicalEditor } from "lexical";
import mammoth from "mammoth";
import {
  importHTMLToEditor,
  type ImportMode,
} from "../components/editor/utils/importUtils";

export async function convertDocxBufferToHtml(
  arrayBuffer: ArrayBuffer
): Promise<{ html: string; warnings: string[] }> {
  const input =
    typeof Buffer !== "undefined"
      ? ({ arrayBuffer, buffer: Buffer.from(arrayBuffer) } as {
          arrayBuffer: ArrayBuffer;
          buffer: Buffer;
        })
      : { arrayBuffer };
  const result = await mammoth.convertToHtml(input);
  return {
    html: result.value,
    warnings: result.messages.map((m) => m.message),
  };
}

export async function importDocxBufferToEditor(
  editor: LexicalEditor,
  arrayBuffer: ArrayBuffer,
  mode: ImportMode = "replace"
): Promise<{ html: string; warnings: string[] }> {
  const { html, warnings } = await convertDocxBufferToHtml(arrayBuffer);
  importHTMLToEditor(editor, html, mode);
  return { html, warnings };
}

export async function importDocxFileToEditor(
  editor: LexicalEditor,
  file: File,
  mode: ImportMode = "replace"
): Promise<{ html: string; warnings: string[] }> {
  const buffer = await file.arrayBuffer();
  return importDocxBufferToEditor(editor, buffer, mode);
}
