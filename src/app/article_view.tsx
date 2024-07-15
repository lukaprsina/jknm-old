"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo } from "react";
import { Card } from "~/components/ui/card";
import { ArrayElement } from "~/lib/typescript_utils";
import { get_published_articles } from "~/server/articles";

export default function ArticleView() {
  const { data: articles } = useQuery({
    queryKey: ["published_articles"],
    queryFn: async () => await get_published_articles(),
  });

  if (!articles) {
    return <div>Published articles not server rendered</div>;
  }

  const articles_without_first = useMemo(() => {
    if (articles.length <= 1) return [];
    else return articles.slice(1);
  }, [articles]);

  return (
    <>
      {articles && articles[0] ? (
        <>
          <Card className="col-span-1 row-span-1 h-96 sm:col-span-2">
            <ArticleCardHorizontal article={articles[0]} />
          </Card>
          {articles_without_first.map((article) => (
            <div key={article.id}>
              <Card className="col-span-1 h-96">
                <ArticleCardVertical article={article} />
              </Card>
            </div>
          ))}
        </>
      ) : (
        <p>Ni novic</p>
      )}
    </>
  );
}

export type ArticleCardProps = {
  article: {
    imageUrl: string | null;
    title: string;
    url: string;
  };
};

export function ArticleCardHorizontal({ article }: ArticleCardProps) {
  return (
    <Link href={`/novica/${article.url}`} className="flex h-full gap-2">
      <div className="h-full w-2/3 rounded-xl bg-primary/10">
        {article.imageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.imageUrl}
              className="relative m-0 h-full w-full rounded-xl object-cover"
            />
          </>
        ) : null}
      </div>
      <p className="p-2 text-lg font-bold">{article.title}</p>
    </Link>
  );
}

export function ArticleCardVertical({ article }: ArticleCardProps) {
  return (
    <Link
      href={`/novica/${article.url}`}
      className="flex h-full flex-col gap-2"
    >
      <div className="h-2/3 w-full rounded-xl bg-primary/10">
        {article.imageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.imageUrl}
              className="relative m-0 h-full w-full rounded-xl object-cover"
            />
          </>
        ) : null}
      </div>
      <p className="p-2 text-lg font-bold">{article.title}</p>
    </Link>
  );
}
