"use client";

import React, { useState } from "react";

import { withRef } from "@udecode/cn";
import {
  type ELEMENT_IMAGE,
  type ELEMENT_MEDIA_EMBED,
  insertMedia,
} from "@udecode/plate-media";
import { useEditorRef } from "@udecode/plate-common";

import { Icons } from "./../../components/icons";

import { ToolbarButton } from "./toolbar";

export const MediaToolbarButton = withRef<
  typeof ToolbarButton,
  {
    nodeType?: typeof ELEMENT_IMAGE | typeof ELEMENT_MEDIA_EMBED;
  }
>(({ nodeType, ...rest }, ref) => {
  const editor = useEditorRef();
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const file_input_ref = React.useRef<HTMLInputElement>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;

    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    setUploading(true);

    const response = await fetch("/s3/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ filename: file.name, content_type: file.type }),
    });

    if (response.ok) {
      const { url, fields } = await response.json();

      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      formData.append("file", file);

      const uploadResponse = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (uploadResponse.ok) {
        setImageURL(`${url}${fields.key}`);
        console.log("Image URL:", `${url}${fields.key}`);

        await insertMedia(editor, {
          type: nodeType,
          getUrl: async () => `${url}${fields.key}` ?? "No URL",
        });
      } else {
        console.error("S3 Upload Error:", uploadResponse);
        alert("Upload failed.");
      }
    } else {
      alert("Failed to get pre-signed URL.");
    }

    setUploading(false);
  };

  return (
    <>
      <form>
        <input
          id="file"
          hidden
          type="file"
          onChange={handleChange}
          ref={file_input_ref}
          accept="image/png, image/jpeg"
        />
        <ToolbarButton
          ref={ref}
          disabled={uploading}
          tooltip="Image"
          onClick={() => {
            file_input_ref.current?.click();
          }}
          onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
          }}
          {...rest}
        >
          <Icons.image />
        </ToolbarButton>
      </form>
    </>
  );
});
