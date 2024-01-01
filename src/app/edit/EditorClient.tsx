"use client"

import { Suspense, useRef } from "react";
import type { MDXEditorMethods } from "@mdxeditor/editor";

import type { MDXEditorProps } from "@mdxeditor/editor";
import dynamic from "next/dynamic";
import { forwardRef } from "react";
import type { Article } from "@prisma/client";

const Editor = dynamic(() => import("./InitializedMDXEditor"), { ssr: false });

export type EditorPropsJoined<T> = Partial<T>
    & EditorClientProps

export const ForwardRefEditor = forwardRef<MDXEditorMethods, EditorPropsJoined<MDXEditorProps>>(
    (props, ref) => <Editor {...props} editorRef={ref} markdown={props.article?.content} />,
);

ForwardRefEditor.displayName = "ForwardRefEditor";

type EditorClientProps = {
    article?: Article;
}

export default function EditorClient({ article }: EditorClientProps) {
    const ref = useRef<MDXEditorMethods>(null)

    return (
        <Suspense fallback={null}>
            <ForwardRefEditor ref={ref} article={article} />
        </Suspense>
    )
}