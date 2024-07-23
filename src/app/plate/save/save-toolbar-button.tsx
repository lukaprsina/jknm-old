import React from "react";
import { withRef } from "@udecode/cn";

import { ToolbarButton } from "../../../components/plate-ui/toolbar";
import { LucideSave } from "lucide-react";
import { useSaveButton } from "./useSaveButton";

export const SaveToolbarButton = withRef<typeof ToolbarButton>((rest, ref) => {
  const { props } = useSaveButton();

  return (
    <ToolbarButton ref={ref} tooltip="Save" {...props} {...rest}>
      <LucideSave />
    </ToolbarButton>
  );
});
