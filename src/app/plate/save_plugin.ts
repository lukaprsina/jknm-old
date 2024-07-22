"use effect";

import { createPluginFactory } from "@udecode/plate-core";
import { useEffect } from "react";
import { Value } from "@udecode/plate-common";

const KEY_SAVE = "save";

function save(value: Value) {
  console.log("saving", value);
}

let save_timeout_id: number | undefined = undefined;

export const createSavePlugin = createPluginFactory({
  key: KEY_SAVE,
  handlers: {
    onChange: (editor) => (value) => {
      clearTimeout(save_timeout_id);

      save_timeout_id = setTimeout(() => {
        save(value);
      }, 5000) as unknown as number;
      console.log(save_timeout_id);
    },
  },
});
