"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo } from "react";
import { Card } from "~/components/ui/card";
import { ArrayElement } from "~/lib/typescript_utils";
import { get_published_articles } from "~/server/data_layer/articles";

export type PublishedArticles = ArrayElement<
  Awaited<ReturnType<typeof get_published_articles>>
>;

export default function ArticleView() {
  const { data: articles } = useQuery({
    queryKey: ["published_articles"],
    queryFn: async () => await get_published_articles(),
  });

  if (!articles) {
    console.error("Published articles not server rendered");
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
          <Card className="col-span-3 row-span-1 h-52">
            <ArticleCard article={articles[0]} />
          </Card>
          {articles_without_first.map((article) => (
            <div key={article.id}>
              <Card className="col-span-1 h-52">
                <ArticleCard article={article} />
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

type ArticleCardProps = {
  article: PublishedArticles;
};

function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link href={`/novicka/${article.url}`} className="flex h-full gap-2">
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
      {article.title}
    </Link>
  );
}
