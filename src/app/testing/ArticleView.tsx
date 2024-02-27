"use client"

import { Article } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { getArticles } from "../data_layer/articles";
import { Button } from "~/components/ui/button";

type ArticleViewProps = {
    articles: Article[]
}

export function ArticleView({ articles: initialArticles }: ArticleViewProps) {
    const { data, refetch } = useQuery({
        queryKey: ["articles2tokydrift"],
        queryFn: () => getArticles(),
        initialData: initialArticles,
    })

    return (
        <div className="prose container">
            <Button onClick={() => void refetch()}>
                Refetch
            </Button>
            {data.map((article) => (
                <div key={article.id}>
                    <h2>{article.title}</h2>
                    <p>{article.content}</p>
                </div>
            ))}
        </div>
    )
}