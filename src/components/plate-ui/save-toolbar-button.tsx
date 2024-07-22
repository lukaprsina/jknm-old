import React from "react";
import { withRef } from "@udecode/cn";
import { useDebouncedCallback } from "use-debounce";

import { Icons } from "@/components/icons";

import { ToolbarButton } from "./toolbar";
import { useEditorRef } from "@udecode/plate-common";

export const SaveToolbarButton = withRef<typeof ToolbarButton>((rest, ref) => {
  const editorRef = useEditorRef();
  const debounced = useDebouncedCallback(
    (value) => {
      console.log("Saving...");
    },
    500,
    // The maximum time func is allowed to be delayed before it's invoked:
    { maxWait: 2000 },
  );

  return (
    <ToolbarButton
      ref={ref}
      tooltip="Save"
      onClick={() => {
        debounced(editorRef.children);
      }}
      onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
      }}
      {...rest}
    >
      <Icons.link />
    </ToolbarButton>
  );
});
