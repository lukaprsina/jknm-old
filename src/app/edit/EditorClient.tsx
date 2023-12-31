"use client"

import { Suspense, useRef } from "react";
import type { MDXEditorMethods } from "@mdxeditor/editor";

import type { MDXEditorProps } from "@mdxeditor/editor";
import dynamic from "next/dynamic";
import { forwardRef } from "react";

const Editor = dynamic(() => import("./InitializedMDXEditor"), { ssr: false });

export const ForwardRefEditor = forwardRef<MDXEditorMethods, MDXEditorProps>(
    (props, ref) => <Editor {...props} editorRef={ref} />,
);

ForwardRefEditor.displayName = "ForwardRefEditor";

export default function EditorClient() {
    const ref = useRef<MDXEditorMethods>(null)

    return (
        <Suspense fallback={null}>
            <ForwardRefEditor ref={ref} markdown="" />
        </Suspense>
    )
}