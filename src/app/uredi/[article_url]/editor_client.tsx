"use client";

import { Suspense, useRef } from "react";
// import type { MDXEditorMethods, MDXEditorProps } from "@lukaprsina/mdxeditor";
// import type { MDXEditorMethods, MDXEditorProps } from "@mdxeditor/editor";
import type { MDXEditorMethods, MDXEditorProps } from "modified-editor";
import dynamic from "next/dynamic";
import { forwardRef } from "react";
import type { Article } from "@prisma/client";
import { Skeleton } from "~/components/ui/skeleton";

const Editor = dynamic(() => import("./main"), { ssr: false });

export type EditorPropsJoined<T> = Partial<T> & EditorClientProps;

export const ForwardRefEditor = forwardRef<
  MDXEditorMethods,
  EditorPropsJoined<MDXEditorProps>
>((props, ref) => <Editor {...props} editorRef={ref} />);

ForwardRefEditor.displayName = "ForwardRefEditor";

type EditorClientProps = {};

function EditorSkeleton() {
  return (
    <div className="flex items-center space-x-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
}

export default function EditorClient({}: EditorClientProps) {
  const ref = useRef<MDXEditorMethods>(null);

  return (
    /* TODO: skeleton doesn't work */
    <Suspense fallback={<EditorSkeleton />}>
      <ForwardRefEditor ref={ref} />
    </Suspense>
  );
}
