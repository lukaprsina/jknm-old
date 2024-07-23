"use effect";

import { createPluginFactory } from "@udecode/plate-core";
import { Value } from "@udecode/plate-common";
import { getPluginOptions } from "@udecode/plate-common";
import {
  type PlateEditor,
  type WithPlatePlugin,
  type KeyboardHandlerReturnType,
  isHotkey,
} from "@udecode/plate-common/server";

export const KEY_SAVE = "save";

export type SavePlugin = {
  hotkey?: string | string[];
  save_callback?: (value: Value) => void;
  autosave_on_lost_focus?: boolean;
  autosave_on_before_unload?: boolean;
  autosave_after_inactive?: boolean;
  autosave_after_inactive_ms?: number;
  max_ms_without_autosave?: number;
};

export const onKeyDownSave =
  <V extends Value = Value, E extends PlateEditor<V> = PlateEditor<V>>(
    editor: E,
    { options }: WithPlatePlugin<SavePlugin, V, E>,
  ): KeyboardHandlerReturnType =>
  (event) => {
    if (event.defaultPrevented) return;

    if (!options.hotkey || !options.save_callback) return;

    if (isHotkey(options.hotkey, event as any)) {
      event.preventDefault();
      event.stopPropagation();
      options.save_callback(editor.children);
    }
  };

let save_timeout_id: number | undefined = undefined;
let save_max_time_timeout_id: number | undefined = undefined;
let dirty = false;

export const createSavePlugin = createPluginFactory<SavePlugin>({
  key: KEY_SAVE,
  handlers: {
    onKeyDown: onKeyDownSave,
    onChange: (editor) => (value) => {
      const {
        save_callback,
        autosave_after_inactive,
        autosave_after_inactive_ms,
        max_ms_without_autosave,
      } = getPluginOptions<SavePlugin>(editor, KEY_SAVE);

      if (!autosave_after_inactive || !save_callback) return;

      dirty = true;
      clearTimeout(save_timeout_id);

      if (typeof save_max_time_timeout_id === "undefined") {
        save_max_time_timeout_id = setTimeout(() => {
          if (!dirty) return;
          save_callback(value);
          dirty = false;
          save_max_time_timeout_id = undefined;
        }, max_ms_without_autosave) as unknown as number;
      }

      save_timeout_id = setTimeout(() => {
        save_callback(value);
        dirty = false;
        save_max_time_timeout_id = undefined;
      }, autosave_after_inactive_ms) as unknown as number;
    },
  },
  options: {
    hotkey: ["ctrl+s"],
    save_callback: () => {
      alert("Save callback not set");
    },
    autosave_after_inactive: false,
    autosave_after_inactive_ms: 10 * 1000,
    max_ms_without_autosave: 60 * 1000,
  },
});
