"use client"

import { type ForwardedRef, useState, useEffect } from "react";
import {
    MDXEditor,
    type MDXEditorMethods,
    type MDXEditorProps,
    // } from '@mdxeditor/editor'
    // } from '@lukaprsina/mdxeditor'
} from 'modified-editor'
import useForwardedRef from "~/lib/useForwardedRef";
import type { EditorPropsJoined } from "./editor_client";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { PublishDrawer, Test } from "./publish_drawer";
import { useTheme } from "next-themes";
import "./main.module.css"
import clsx from "clsx";
import ResponsiveShell from "../../../components/responsive_shell";
import { Badge } from "~/components/ui/badge";
import { SaveArticleType, save_article } from "../../../server/data_layer/articles";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { allPlugins, update_state } from "./helpers";
import { Route } from "./routeType";
import { useRouteParams } from "next-typesafe-url/app";
import { useRouter } from "next/navigation";
import { Article } from "@prisma/client";
import { useSession } from "next-auth/react";
import { ServerError } from "~/lib/server_error";
import { read_article_safe } from "~/lib/query_helpers";

function useEditorArticle(
    article_url: string | undefined,
) {
    const queryClient = useQueryClient()
    const router = useRouter()

    const query = useQuery({
        queryKey: ["editor_article", article_url],
        queryFn: async () => await read_article_safe(article_url),
    })

    const mutation = useMutation({
        mutationKey: ["save_article", article_url],
        mutationFn: async (input: SaveArticleType) => {
            if (typeof query.data === "undefined") return null

            const article = await save_article(input)
            console.log("saved article mutationFn", { article_url, article })
            if (!article.data || article.serverError || article.validationErrors)
                throw new ServerError("Zod error", { ...article })

            router.push(`/uredi/${article.data.url}`)

            return article.data
        },
        onSuccess: (data) => {
            queryClient.setQueryData(["editor_article", article_url], data)
        }
    })

    return {
        query,
        mutation
    }
}

// TODO: when saving and updating title, the new text gets deleted

export default function InitializedMDXEditor({
    editorRef,
    markdown,
    ...props
}: { editorRef: ForwardedRef<MDXEditorMethods> | null } & EditorPropsJoined<MDXEditorProps>) {
    const [title, setTitle] = useState<string>("")
    const [url, setUrl] = useState<string>("")
    const session = useSession()

    const innerRef = useForwardedRef(editorRef);
    const routeParams = useRouteParams(Route.routeParams)
    const theme = useTheme()
    const [imageUrls, setImageUrls] = useState<string[]>([])

    const {
        query,
        mutation
    } = useEditorArticle(routeParams.data?.article_url)

    useEffect(() => {
        const markdown = innerRef.current?.getMarkdown()
        if (!innerRef.current || !query.data || !markdown) return

        const {
            new_title,
            new_markdown,
            image_urls,
            new_url
        } = update_state(markdown, { id: query.data.id })

        setTitle(new_title)
        setUrl(new_url)
        setImageUrls(image_urls)
        console.log("updated state", { new_title, new_markdown, image_urls, new_url })

        innerRef.current?.setMarkdown(new_markdown)
    }, [query.data])

    function save() {
        const markdown = innerRef.current?.getMarkdown()
        if (!innerRef.current || !query.data || typeof markdown !== "string") return Promise.resolve(null)

        const {
            new_title,
            new_markdown,
            new_url
        } = update_state(markdown, { id: query.data.id })

        return new Promise<Article | null>((resolve, reject) => {
            if (!innerRef.current || !query.data || typeof markdown !== "string") return Promise.resolve(null)

            mutation.mutate({
                id: query.data.id,
                title: new_title,
                url: new_url,
                content: new_markdown,
                published: query.data.published,
            }, {
                onSuccess: (data) => {
                    setTimeout(() => {
                        console.log("RESOLVING")
                        resolve(data)
                    }, 1000)
                },
                onError: (error) => {
                    console.error("Error saving", error)
                    reject(error)
                }
            })
        })
    }

    function fullSave(input: SaveArticleType) {
        const markdown = innerRef.current?.getMarkdown()
        if (!innerRef.current || !query.data || !markdown) return

        const {
            new_title,
            new_markdown,
            new_url
        } = update_state(markdown, input)
        console.warn("Full saving", { new_title, new_markdown, new_url, input })

        mutation.mutate({
            id: query.data?.id,
            title: new_title,
            url: new_url,
            content: new_markdown,
            published: input.published,
        })
    }

    if (!query.data || routeParams.isLoading)
        return <p>Loading...</p>

    if (routeParams.isError || !routeParams.data) {
        console.log({ article: query.data, routeParams })
        throw new Error("Article not found (ZOD)")
    }

    /* TODO: block when mutating (saving) */

    return (
        <ResponsiveShell user={session.data?.user}>
            <div className="prose-xl dark:prose-invert container">
                <div className="my-2 flex flex-end justify-between">
                    <div className="space-x-2">
                        <Button
                            variant="outline"
                            onClick={() => void save()}
                        >
                            Shrani
                        </Button>
                        <Button asChild variant="outline">
                            <Link
                                className="no-underline"
                                href={`/novicka/${routeParams.data.article_url}`}
                                target="_blank"
                            >
                                Obišči stran
                            </Link>
                        </Button>
                        <Test save={async () => await save()} />
                        <PublishDrawer
                            save={save}
                            fullSave={(input) => fullSave(input)}
                            articleId={query.data.id}
                            content={query.data.content}
                            imageUrls={imageUrls}
                            title={title}
                            url={url}
                            published={query.data.published}
                        />
                        <Button
                            variant="outline"
                            onClick={() => console.log({ markdown: innerRef.current?.getMarkdown() })}
                        >
                            Log editor
                        </Button>
                    </div>
                    <Badge className="" variant="outline">{query.data.published ? "Popravljanje" : "Neobjavljeno"}</Badge>
                </div>

                <div className="border-2 border-primary/25 rounded-md">
                    <MDXEditor
                        plugins={allPlugins(markdown ?? "", routeParams.data.article_url)}
                        {...props}
                        markdown={markdown ?? ""}
                        className={clsx(theme.resolvedTheme === "dark" ? "dark-theme dark-editor" : "")}
                        contentEditableClassName="max-w-full"
                        ref={editorRef}
                    />
                </div>
                <pre className="text-sm">{JSON.stringify(query.data, null, 2)}</pre>
            </div>
        </ResponsiveShell>
    )
}