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
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const form_ref = React.useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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
      <form ref={form_ref} onSubmit={handleSubmit}>
        <input
          id="file"
          type="file"
          onChange={(e) => {
            const files = e.target.files;
            if (files) {
              setFile(files?.item(0) ?? null);
            }
          }}
          accept="image/png, image/jpeg"
        />
        <ToolbarButton
          ref={ref}
          type="submit"
          disabled={uploading}
          onClick={async () => {}}
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
