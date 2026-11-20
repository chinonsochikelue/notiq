import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { $getRoot, type LexicalEditor } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  DatabaseNode,
  $createDatabaseNode,
  $isDatabaseNode,
  createDefaultDatabaseRows,
} from "../nodes/DatabaseNode";
import { filterAndSortDatabaseRows } from "../nodes/DatabaseNode/DatabaseComponent";

function EditorRef({ onReady }: { onReady: (editor: LexicalEditor) => void }) {
  const [editor] = useLexicalComposerContext();
  React.useEffect(() => {
    onReady(editor);
  }, [editor, onReady]);
  return null;
}

describe("DatabaseNode & DatabaseComponent", () => {
  it("filters and sorts database rows accurately", () => {
    const rows = [
      {
        id: "1",
        title: "Write docs",
        status: "todo" as const,
        priority: "low" as const,
        tag: "Docs",
        dueDate: "2026-12-05",
      },
      {
        id: "2",
        title: "Fix sync bug",
        status: "in_progress" as const,
        priority: "high" as const,
        tag: "Core",
        dueDate: "2026-11-25",
      },
      {
        id: "3",
        title: "Build release",
        status: "done" as const,
        priority: "medium" as const,
        tag: "Ops",
        dueDate: "",
      },
    ];

    expect(filterAndSortDatabaseRows(rows, { query: "core" })).toHaveLength(1);
    expect(
      filterAndSortDatabaseRows(rows, { statusFilter: "todo" })[0].id
    ).toBe("1");

    const byPriority = filterAndSortDatabaseRows(rows, { sortBy: "priority" });
    expect(byPriority.map((r) => r.id)).toEqual(["2", "3", "1"]);

    const byDueDate = filterAndSortDatabaseRows(rows, { sortBy: "dueDate" });
    expect(byDueDate.map((r) => r.id)).toEqual(["2", "1", "3"]);
  });

  it("serializes and deserializes DatabaseNode via exportJSON/importJSON", () => {
    let editorRef: LexicalEditor | null = null;
    render(
      <LexicalComposer
        initialConfig={{
          namespace: "db-json-test",
          nodes: [DatabaseNode],
          onError: (e) => {
            throw e;
          },
        }}
      >
        <EditorRef onReady={(ed) => (editorRef = ed)} />
        <RichTextPlugin
          contentEditable={<ContentEditable />}
          placeholder={null}
          ErrorBoundary={LexicalErrorBoundary}
        />
      </LexicalComposer>
    );

    let exported: ReturnType<DatabaseNode["exportJSON"]> | null = null;
    act(() => {
      editorRef!.update(() => {
        const node = $createDatabaseNode({
          title: "Sprint Board",
          view: "kanban",
          rows: createDefaultDatabaseRows(),
        });
        $getRoot().append(node);
        exported = node.exportJSON();
      });
    });

    expect(exported!.type).toBe("database");
    expect(exported!.title).toBe("Sprint Board");
    expect(exported!.view).toBe("kanban");
    expect(exported!.rows).toHaveLength(3);

    act(() => {
      editorRef!.update(() => {
        const rehydrated = DatabaseNode.importJSON(exported!);
        expect($isDatabaseNode(rehydrated)).toBe(true);
        expect(rehydrated.__title).toBe("Sprint Board");
        expect(rehydrated.__view).toBe("kanban");
        expect(rehydrated.__rows).toHaveLength(3);
      });
    });
  });

  it("renders Table and Kanban views and supports adding rows", async () => {
    let editorRef: LexicalEditor | null = null;
    render(
      <LexicalComposer
        initialConfig={{
          namespace: "db-ui-test",
          nodes: [DatabaseNode],
          onError: (e) => {
            throw e;
          },
        }}
      >
        <EditorRef onReady={(ed) => (editorRef = ed)} />
        <RichTextPlugin
          contentEditable={<ContentEditable />}
          placeholder={null}
          ErrorBoundary={LexicalErrorBoundary}
        />
      </LexicalComposer>
    );

    await act(async () => {
      editorRef!.update(() => {
        $getRoot().append($createDatabaseNode({ title: "Roadmap", view: "table" }));
      });
    });

    expect(await screen.findByDisplayValue("Roadmap")).toBeTruthy();
    expect(screen.getByText("3 items")).toBeTruthy();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "New Row" }));
    });
    expect(await screen.findByText("4 items")).toBeTruthy();

    await act(async () => {
      fireEvent.click(screen.getByRole("tab", { name: "Kanban" }));
    });
    expect(await screen.findAllByText("Add card")).toHaveLength(3);
  });
});
