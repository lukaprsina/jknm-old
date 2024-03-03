"use client"

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo } from "react";
import { Card } from "~/components/ui/card";
import { ArrayElement } from "~/lib/typescript_utils";
import { getPublishedArticles } from "~/server/data_layer/articles";

export type PublishedArticles = ArrayElement<Awaited<ReturnType<typeof getPublishedArticles>>>;

type ArticleViewProps = {
    initial_articles: PublishedArticles[]
}

export default function ArticleView({ initial_articles }: ArticleViewProps) {
    const { data: articles } = useQuery({
        queryKey: ["published_articles"],
        queryFn: async () => await getPublishedArticles(),
        initialData: initial_articles,
    })

    const articles_without_first = useMemo(() => {
        if (articles.length <= 1) return []
        else return articles.slice(1)
    }, [articles])

    return <>
        {articles && articles[0] ? <>
            <Card className="col-span-3 row-span-1 h-52">
                <ArticleCard article={articles[0]} />
            </Card>
            {
                articles_without_first.map((article) => (
                    <div key={article.id}>
                        <Card className="col-span-1 h-52">
                            <ArticleCard article={article} />
                        </Card>
                    </div>
                ))
            }
        </> : <p>Ni novic</p>}
    </>
}

type ArticleCardProps = {
    article: PublishedArticles
}

function ArticleCard({ article }: ArticleCardProps) {
    return (
        <Link
            href={`/novicka/${article.url}`}
            className="flex gap-2 h-full"
        >
            <div className="rounded-xl w-2/3 bg-primary/10 h-full">
                {article.imageUrl ? <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    < img
                        src={article.imageUrl}
                        className="relative w-full h-full object-cover rounded-xl m-0"
                    />
                </> : null}
            </div>
            {article.title}
        </Link>
    )
}