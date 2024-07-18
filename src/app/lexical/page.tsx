"use client";

import { EditorState, LexicalEditor } from "lexical";
import theme from "./theme";
import "./styles.css";

import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { AutoLinkPlugin } from "@lexical/react/LexicalAutoLinkPlugin";
import { LinkNode, AutoLinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { TableNode, TableCellNode, TableRowNode } from "@lexical/table";
import ToolbarPlugin from "./toolbar";
// import { TableNode, TableCellNode, TableRowNode } from "@lexical/table";

export default function Editor() {
  return (
    <LexicalComposer
      initialConfig={{
        namespace: "MyEditor",
        theme,
        onError,
        nodes: [
          LinkNode,
          ListItemNode,
          ListNode,
          TableNode,
          TableCellNode,
          TableRowNode,
          AutoLinkNode,
        ],
      }}
    >
      <ToolbarPlugin />
      <RichTextPlugin
        contentEditable={<ContentEditable />}
        placeholder={<div>Enter some text...</div>}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <LinkPlugin />
      <ListPlugin />
      <TablePlugin />
      <TabIndentationPlugin />
      <AutoLinkPlugin matchers={MATCHERS} />
      <HistoryPlugin />
      <AutoFocusPlugin />
      <OnChangePlugin onChange={onChange} />
    </LexicalComposer>
  );
}

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error: Error) {
  console.error(error);
}

function onChange(
  editorState: EditorState,
  editor: LexicalEditor,
  tags: Set<string>,
) {}

const URL_MATCHER =
  /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;

const MATCHERS = [
  (text: string) => {
    const match = URL_MATCHER.exec(text);
    if (match === null) {
      return null;
    }
    const fullMatch = match[0];
    return {
      index: match.index,
      length: fullMatch.length,
      text: fullMatch,
      url: fullMatch.startsWith("http") ? fullMatch : `https://${fullMatch}`,
      // attributes: { rel: 'noreferrer', target: '_blank' }, // Optional link attributes
    };
  },
];
