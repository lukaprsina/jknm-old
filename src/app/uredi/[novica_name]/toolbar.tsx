"use client";

import {
  // type AdmonitionKind,
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  ChangeAdmonitionType,
  ConditionalContents,
  CreateLink,
  DiffSourceToggleWrapper,
  type EditorInFocus,
  InsertAdmonition,
  InsertFrontmatter,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  Separator,
  UndoRedo,
} from "@mdxeditor/editor"
// } from "@lukaprsina/mdxeditor"
// } from "modified-editor";

type DirectiveNode = {
  getMdastNode: () => {
    name: string;
  };
};

function whenInAdmonition(editorInFocus: EditorInFocus | null) {
  const node = editorInFocus?.rootNode;
  if (!node || node.getType() !== "directive") {
    return false;
  }

  return ["note", "tip", "danger", "info", "caution"].includes(
    (node as unknown as DirectiveNode).getMdastNode().name,
  );
}

export const Toolbar: React.FC = () => {
  return (
    <DiffSourceToggleWrapper>
      <UndoRedo />
      <Separator />
      <BoldItalicUnderlineToggles />
      <Separator />
      <ListsToggle />
      <Separator />

      <ConditionalContents
        options={[
          { when: whenInAdmonition, contents: () => <ChangeAdmonitionType /> },
          { fallback: () => <BlockTypeSelect /> },
        ]}
      />

      <Separator />

      <CreateLink />
      <InsertImage />

      <Separator />

      <InsertTable />
      <InsertThematicBreak />

      <ConditionalContents
        options={[
          {
            when: (editorInFocus) => !whenInAdmonition(editorInFocus),
            contents: () => (
              <>
                <Separator />
                <InsertAdmonition />
              </>
            ),
          },
        ]}
      />

      <Separator />
      <InsertFrontmatter />
    </DiffSourceToggleWrapper>
  );
};
