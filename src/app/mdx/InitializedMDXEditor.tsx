"use client"

import { type ForwardedRef } from "react";
import {
    MDXEditor,
    toolbarPlugin,
    KitchenSinkToolbar,
    listsPlugin,
    quotePlugin,
    headingsPlugin,
    linkPlugin,
    linkDialogPlugin,
    imagePlugin,
    tablePlugin,
    thematicBreakPlugin,
    frontmatterPlugin,
    sandpackPlugin,
    directivesPlugin,
    AdmonitionDirectiveDescriptor,
    diffSourcePlugin,
    markdownShortcutPlugin,
    type MDXEditorMethods,
    type MDXEditorProps,
    type SandpackConfig,
    codeBlockPlugin,
    codeMirrorPlugin,
    GenericJsxEditor,
    JsxComponentDescriptor,
    NestedLexicalEditor,
    jsxPlugin,
    jsxPluginHooks,
} from '@mdxeditor/editor'
import { Button } from "@mantine/core";

const defaultSnippetContent = `
# Title
Hello world!
`.trim()

const reactSandpackConfig: SandpackConfig = {
    defaultPreset: 'react',
    presets: [
        {
            label: 'React',
            name: 'react',
            meta: 'live',
            sandpackTemplate: 'react',
            sandpackTheme: 'light',
            snippetFileName: '/App.js',
            snippetLanguage: 'jsx',
            initialSnippetContent: defaultSnippetContent,
        },
    ],
}

const imageUploadHandler = async (image: File): Promise<string> => {
    console.log(image.name)
    const form = new FormData()
    form.append("file", image)

    const image_response = await fetch("/api/file", {
        method: "POST",
        body: form,
    })

    if (image_response.ok) {
        const image_json = await image_response.json() as { location: string }

        return image_json.location
    } else {
        throw new Error("Failed to upload image")
    }
}

const allPlugins = (diffMarkdown: string) => [
    toolbarPlugin({
        toolbarContents: () => <>
            <KitchenSinkToolbar />
            <InsertMyLeaf />
        </>
    }),
    listsPlugin(),
    quotePlugin(),
    headingsPlugin(),
    linkPlugin(),
    linkDialogPlugin(),
    imagePlugin({ imageUploadHandler }),
    tablePlugin(),
    thematicBreakPlugin(),
    frontmatterPlugin(),
    sandpackPlugin({ sandpackConfig: reactSandpackConfig }),
    directivesPlugin({ directiveDescriptors: [AdmonitionDirectiveDescriptor] }),
    diffSourcePlugin({ viewMode: 'rich-text', diffMarkdown }),
    markdownShortcutPlugin(),
    codeBlockPlugin({ defaultCodeBlockLanguage: 'txt' }),
    codeMirrorPlugin({ codeBlockLanguages: { js: 'JavaScript', css: 'CSS', txt: 'text', tsx: 'TypeScript' } }),
    jsxPlugin({ jsxComponentDescriptors }),
]

export default function InitializedMDXEditor({
    editorRef,
    ...props
}: { editorRef: ForwardedRef<MDXEditorMethods> | null } & MDXEditorProps) {
    return (
        <MDXEditor
            plugins={allPlugins(props.markdown)}
            {...props}
            contentEditableClassName="prose max-w-full"
            ref={editorRef}
        />
    );
}

const jsxComponentDescriptors: JsxComponentDescriptor[] = [
    {
        name: 'MyLeaf',
        kind: 'text', // 'text' for inline, 'flow' for block
        // the source field is used to construct the import statement at the top of the markdown document. 
        // it won't be actually sourced.
        source: './external',
        // Used to construct the property popover of the generic editor
        props: [
            { name: 'foo', type: 'string' },
            { name: 'bar', type: 'string' }
        ],
        // whether the component has children or not
        hasChildren: true,
        Editor: GenericJsxEditor
    },
    {
        name: 'Marker',
        kind: 'text',
        source: './external',
        props: [{ name: 'type', type: 'string' }],
        hasChildren: false,
        Editor: () => {
            return (
                <div style={{ border: '1px solid red', padding: 8, margin: 8, display: 'inline-block' }}>
                    <NestedLexicalEditor<MdxJsxTextElement>
                        getContent={(node) => node.children}
                        getUpdatedMdastNode={(mdastNode, children: any) => {
                            return { ...mdastNode, children }
                        }}
                    />
                </div>
            )
        }
    },
    {
        name: 'BlockNode',
        kind: 'flow',
        source: './external',
        props: [],
        hasChildren: true,
        Editor: GenericJsxEditor
    }
]

// a toolbar button that will insert a JSX element into the editor.
const InsertMyLeaf = () => {
    const insertJsx = jsxPluginHooks.usePublisher('insertJsx')
    return (
        <Button
            onClick={() =>
                insertJsx({
                    name: 'MyLeaf',
                    kind: 'text',
                    props: { foo: 'bar', bar: 'baz' }
                })
            }
        >
            Leaf
        </Button>
    )
}