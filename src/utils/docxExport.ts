import { $isCodeNode } from "@lexical/code";
import { $isLinkNode } from "@lexical/link";
import { $isListItemNode, $isListNode } from "@lexical/list";
import { $isHeadingNode, $isQuoteNode } from "@lexical/rich-text";
import {
  $isTableCellNode,
  $isTableNode,
  $isTableRowNode,
} from "@lexical/table";
import {
  Document,
  ExternalHyperlink,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import {
  $getRoot,
  $isElementNode,
  $isLineBreakNode,
  $isTextNode,
  type LexicalEditor,
  type LexicalNode,
} from "lexical";

const HEADING_MAP: Record<
  string,
  (typeof HeadingLevel)[keyof typeof HeadingLevel]
> = {
  h1: HeadingLevel.HEADING_1,
  h2: HeadingLevel.HEADING_2,
  h3: HeadingLevel.HEADING_3,
  h4: HeadingLevel.HEADING_4,
  h5: HeadingLevel.HEADING_5,
  h6: HeadingLevel.HEADING_6,
};

function convertInlineChildren(
  nodes: LexicalNode[],
  options: { italics?: boolean; font?: string } = {}
): Array<TextRun | ExternalHyperlink> {
  const runs: Array<TextRun | ExternalHyperlink> = [];

  for (const child of nodes) {
    if ($isLineBreakNode(child)) {
      runs.push(new TextRun({ break: 1 }));
      continue;
    }

    if ($isLinkNode(child)) {
      const linkText = child.getTextContent() || child.getURL();
      runs.push(
        new ExternalHyperlink({
          link: child.getURL(),
          children: [
            new TextRun({
              text: linkText,
              style: "Hyperlink",
            }),
          ],
        })
      );
      continue;
    }

    if ($isTextNode(child)) {
      const isCode = child.hasFormat("code");
      runs.push(
        new TextRun({
          text: child.getTextContent(),
          bold: child.hasFormat("bold"),
          italics: options.italics || child.hasFormat("italic"),
          underline: child.hasFormat("underline") ? {} : undefined,
          strike: child.hasFormat("strikethrough"),
          font: isCode ? "Consolas" : options.font,
        })
      );
      continue;
    }

    if ($isElementNode(child)) {
      runs.push(...convertInlineChildren(child.getChildren(), options));
      continue;
    }

    const fallback = child.getTextContent();
    if (fallback) {
      runs.push(new TextRun({ text: fallback, italics: options.italics }));
    }
  }

  return runs;
}

export function buildDocxDocument(editor: LexicalEditor): Document {
  const blocks: Array<Paragraph | Table> = [];

  editor.getEditorState().read(() => {
    const root = $getRoot();

    for (const node of root.getChildren()) {
      if ($isHeadingNode(node)) {
        blocks.push(
          new Paragraph({
            heading: HEADING_MAP[node.getTag()] ?? HeadingLevel.HEADING_2,
            children: convertInlineChildren(node.getChildren()),
            spacing: { before: 200, after: 120 },
          })
        );
        continue;
      }

      if ($isQuoteNode(node)) {
        blocks.push(
          new Paragraph({
            indent: { left: 480 },
            children: convertInlineChildren(node.getChildren(), {
              italics: true,
            }),
            spacing: { before: 120, after: 120 },
          })
        );
        continue;
      }

      if ($isCodeNode(node)) {
        const lines = node.getTextContent().split("\n");
        for (const line of lines) {
          blocks.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: line || " ",
                  font: "Consolas",
                  size: 20,
                }),
              ],
              spacing: { before: 40, after: 40 },
            })
          );
        }
        continue;
      }

      if ($isListNode(node)) {
        const listType = node.getListType();
        let index = 1;
        for (const item of node.getChildren()) {
          if (!$isListItemNode(item)) continue;
          const prefix =
            listType === "check"
              ? item.getChecked()
                ? "☑ "
                : "☐ "
              : listType === "number"
                ? `${index++}. `
                : "• ";

          blocks.push(
            new Paragraph({
              indent: { left: 360 * (item.getIndent() + 1) },
              children: [
                new TextRun({ text: prefix }),
                ...convertInlineChildren(item.getChildren()),
              ],
              spacing: { before: 60, after: 60 },
            })
          );
        }
        continue;
      }

      if ($isTableNode(node)) {
        const tableRows: TableRow[] = [];
        for (const rowNode of node.getChildren()) {
          if (!$isTableRowNode(rowNode)) continue;
          const cells: TableCell[] = [];
          for (const cellNode of rowNode.getChildren()) {
            if (!$isTableCellNode(cellNode)) continue;
            cells.push(
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({ text: cellNode.getTextContent() || " " }),
                    ],
                  }),
                ],
              })
            );
          }
          if (cells.length > 0) {
            tableRows.push(new TableRow({ children: cells }));
          }
        }
        if (tableRows.length > 0) {
          blocks.push(
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: tableRows,
            })
          );
        }
        continue;
      }

      if ($isElementNode(node)) {
        blocks.push(
          new Paragraph({
            children: convertInlineChildren(node.getChildren()),
            spacing: { before: 80, after: 80 },
          })
        );
        continue;
      }

      const text = node.getTextContent();
      if (text) {
        blocks.push(
          new Paragraph({
            children: [new TextRun({ text })],
            spacing: { before: 80, after: 80 },
          })
        );
      }
    }
  });

  return new Document({
    sections: [
      {
        children:
          blocks.length > 0
            ? blocks
            : [new Paragraph({ children: [new TextRun({ text: "" })] })],
      },
    ],
  });
}

export async function exportEditorToDocxBuffer(
  editor: LexicalEditor
): Promise<Uint8Array> {
  const doc = buildDocxDocument(editor);
  if (typeof (Packer as any).toBuffer === "function") {
    const buf = await Packer.toBuffer(doc);
    return new Uint8Array(buf);
  }
  const blob = await Packer.toBlob(doc);
  return new Uint8Array(await blob.arrayBuffer());
}

export async function exportEditorToDocxBlob(
  editor: LexicalEditor
): Promise<Blob> {
  const doc = buildDocxDocument(editor);
  return Packer.toBlob(doc);
}

export async function downloadDocx(
  editor: LexicalEditor,
  filename: string = "notiq-document.docx"
): Promise<void> {
  const blob = await exportEditorToDocxBlob(editor);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".docx") ? filename : `${filename}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
