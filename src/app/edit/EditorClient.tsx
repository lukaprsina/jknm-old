"use client"

import { Suspense, useRef } from "react";
// import type { MDXEditorMethods, MDXEditorProps } from "@lukaprsina/mdxeditor";
// import type { MDXEditorMethods, MDXEditorProps } from "@mdxeditor/editor";
import type { MDXEditorMethods, MDXEditorProps } from "modified-editor";
import dynamic from "next/dynamic";
import { forwardRef } from "react";
import type { Article } from "@prisma/client";
import type { save_article as save_type } from "../actions";

const Editor = dynamic(() => import("./InitializedMDXEditor"), { ssr: false });

export type EditorPropsJoined<T> = Partial<T>
    & EditorClientProps

export const ForwardRefEditor = forwardRef<MDXEditorMethods, EditorPropsJoined<MDXEditorProps>>(
    (props, ref) => <Editor {...props} editorRef={ref} markdown={props.article?.content} />,
);

ForwardRefEditor.displayName = "ForwardRefEditor";

type EditorClientProps = {
    article?: Article;
    save_article: typeof save_type;
}

export default function EditorClient({ article, save_article }: EditorClientProps) {
    const ref = useRef<MDXEditorMethods>(null)

    return (
        <Suspense fallback={null}>
            <ForwardRefEditor ref={ref} article={article} save_article={save_article} />
        </Suspense>
    )
}