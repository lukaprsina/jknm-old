"use client"

import { Suspense, useRef } from "react";
import { ForwardRefEditor } from "./ForwardRefEditor";
import type { MDXEditorMethods } from "@mdxeditor/editor";

const markdown = `
# Hello world!
Check the EditorComponent.tsx file for the code .
`
export default function Home() {
    const ref = useRef<MDXEditorMethods>(null)

    return (
        <Suspense fallback={null}>
            <ForwardRefEditor ref={ref} markdown={markdown} />
        </Suspense>
    )
}