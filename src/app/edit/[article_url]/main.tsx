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
import { PublishDrawer } from "./publish_drawer";
import { useTheme } from "next-themes";
import "./main.module.css"
import clsx from "clsx";
import ResponsiveShell from "../../responsive_shell";
import { Badge } from "~/components/ui/badge";
import { SaveArticleType, read_article, save_article } from "../../actions";
import { useMutation, useQuery } from "@tanstack/react-query";
import { allPlugins, update_state } from "./helpers";
import { Route } from "./routeType";
import { useRouteParams } from "next-typesafe-url/app";
import { useRouter } from "next/navigation";
import { Article } from "@prisma/client";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useSession } from "next-auth/react";

function useEditorArticle(
    initialArticle: Article | undefined,
    article_url: string | undefined,
    router: AppRouterInstance
) {
    const { data, refetch } = useQuery({
        queryKey: ["editor_article", article_url],
        queryFn: async () => {
            console.log("reading article queryfn", { article_url, initialArticle })
            if (typeof article_url !== "string") return null

            const article = await read_article({ url: article_url })
            return article.data
        },
        initialData: initialArticle,
    })

    const { mutate } = useMutation({
        mutationKey: ["save_article", article_url],
        mutationFn: async (input: SaveArticleType) => {
            console.log("saving article", { article_url, initialArticle })
            if (typeof data === "undefined") return null

            const article = await save_article(input)
            if (article.data && !article.serverError && !article.validationErrors)
                router.push(`/edit/${article.data.url}`)

            return article.data
        },
        onSuccess: () => refetch()
    })

    return {
        data,
        mutate
    }
}

export default function InitializedMDXEditor({
    editorRef,
    article: initialArticle,
    markdown,
    ...props
}: { editorRef: ForwardedRef<MDXEditorMethods> | null } & EditorPropsJoined<MDXEditorProps>) {
    const [title, setTitle] = useState<string>("")
    const [url, setUrl] = useState<string>("")
    const [published, setPublished] = useState<boolean>(false)
    const session = useSession()

    const innerRef = useForwardedRef(editorRef);
    const routeParams = useRouteParams(Route.routeParams)
    const router = useRouter()
    const theme = useTheme()
    const [imageUrls, setImageUrls] = useState<string[]>([])

    const {
        data: article,
        mutate
    } = useEditorArticle(initialArticle, routeParams.data?.article_url, router)

    useEffect(() => {
        const markdown = innerRef.current?.getMarkdown()
        if (!innerRef.current || !article || !markdown) return
        const {
            new_title,
            new_markdown,
            image_urls,
            new_url
        } = update_state(markdown)

        setTitle(new_title)
        setUrl(new_url)
        setImageUrls(image_urls)
        console.log("updated state", { new_title, new_markdown, image_urls, new_url })

        innerRef.current?.setMarkdown(new_markdown)
    }, [article])

    if (!article || routeParams.isLoading)
        return <p>Loading...</p>

    if (routeParams.isError || !routeParams.data) {
        console.log({ article, routeParams })
        throw new Error("Article not found (ZOD)")
    }

    return (
        <ResponsiveShell user={session.data?.user}>
            <div className="prose-xl dark:prose-invert container">
                <div className="my-2 flex flex-end justify-between">
                    <div className="space-x-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                const markdown = innerRef.current?.getMarkdown()
                                if (!innerRef.current || !article || !markdown) return

                                const {
                                    new_title,
                                    new_markdown,
                                    new_url
                                } = update_state(markdown)

                                mutate({
                                    id: article?.id,
                                    title: new_title,
                                    url: new_url,
                                    content: new_markdown,
                                    published
                                })
                            }}
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
                        <PublishDrawer
                            save={(input: SaveArticleType) => mutate(input)}
                            imageUrls={imageUrls}
                            title={title}
                            url={url}
                            published={published}
                            setPublished={setPublished}
                        />
                    </div>
                    <Badge className="" variant="outline">{published ? "Popravljanje" : "Neobjavljeno"}</Badge>
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
                <div style={{ height: "70px" }} />
            </div>
        </ResponsiveShell>
    )
}