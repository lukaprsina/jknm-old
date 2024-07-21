import React from "react";

import { withRef } from "@udecode/cn";
import {
  type ELEMENT_IMAGE,
  type ELEMENT_MEDIA_EMBED,
  insertMedia,
} from "@udecode/plate-media";
import { useEditorRef } from "@udecode/plate-common";

import { Icons } from "./../../components/icons";

import { ToolbarButton } from "./toolbar";

export const useMediaToolbarButton = ({
  nodeType,
}: { nodeType?: string } = {}) => {
  const editor = useEditorRef();

  return {
    props: {
      onClick: async () => {
        await insertMedia(editor, {
          type: nodeType,
          getUrl: async () => prompt("Enter the URL: lol") ?? "",
        });
      },
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
      },
    },
  };
};

export const MediaToolbarButton = withRef<
  typeof ToolbarButton,
  {
    nodeType?: typeof ELEMENT_IMAGE | typeof ELEMENT_MEDIA_EMBED;
  }
>(({ nodeType, ...rest }, ref) => {
  const { props } = useMediaToolbarButton({ nodeType });

  return (
    <ToolbarButton ref={ref} {...props} {...rest}>
      <Icons.image />
    </ToolbarButton>
  );
});
