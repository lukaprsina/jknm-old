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
} from '@mdxeditor/editor'

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

const allPlugins = (diffMarkdown: string) => [
    toolbarPlugin({ toolbarContents: () => <KitchenSinkToolbar /> }),
    listsPlugin(),
    quotePlugin(),
    headingsPlugin(),
    linkPlugin(),
    linkDialogPlugin(),
    imagePlugin({ imageUploadHandler: async () => '/sample-image.png' }),
    tablePlugin(),
    thematicBreakPlugin(),
    frontmatterPlugin(),
    sandpackPlugin({ sandpackConfig: reactSandpackConfig }),
    directivesPlugin({ directiveDescriptors: [AdmonitionDirectiveDescriptor] }),
    diffSourcePlugin({ viewMode: 'rich-text', diffMarkdown }),
    markdownShortcutPlugin(),
    codeBlockPlugin({ defaultCodeBlockLanguage: 'txt' }),
    codeMirrorPlugin({ codeBlockLanguages: { js: 'JavaScript', css: 'CSS', txt: 'text', tsx: 'TypeScript' } }),
]

export default function InitializedMDXEditor({
    editorRef,
    ...props
}: { editorRef: ForwardedRef<MDXEditorMethods> | null } & MDXEditorProps) {
    return (
        <MDXEditor
            plugins={allPlugins(props.markdown)}
            {...props}
            contentEditableClassName="prose max-w-full font-sans"
            ref={editorRef}
        />
    );
}