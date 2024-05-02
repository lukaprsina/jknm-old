"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Card } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { ArrayElement } from "~/lib/typescript_utils";
import { get_published_articles } from "~/server/data_layer/articles";

export function ArticleViewSwitch() {
  const { newLook, setNewLook } = useContext(ArticleViewSwitchContext);

  return (
    <div className="flex items-center space-x-2 pb-6">
      <Switch
        checked={newLook}
        onCheckedChange={setNewLook}
        id="article-view"
      />
      <Label htmlFor="article-view">Nov pogled novičk</Label>
    </div>
  );
}

export const ArticleViewSwitchContext = createContext<{
  newLook: boolean;
  setNewLook: React.Dispatch<React.SetStateAction<boolean>>;
}>({
  newLook: true,
  setNewLook: () => { },
});

export function ArticleViewSwitchProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [newLook, setNewLook] = useState(true);

  return (
    <ArticleViewSwitchContext.Provider value={{ newLook, setNewLook }}>
      {children}
    </ArticleViewSwitchContext.Provider>
  );
}

export type PublishedArticles = ArrayElement<
  Awaited<ReturnType<typeof get_published_articles>>
>;

export default function ArticleView() {
  const { newLook } = useContext(ArticleViewSwitchContext);

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

  return newLook ? (
    <>
      {articles && articles[0] ? (
        <>
          <Card className="col-span-1 row-span-1 h-96 sm:col-span-2">
            <ArticleCard article={articles[0]} />
          </Card>
          {articles_without_first.map((article) => (
            <div key={article.id}>
              <Card className="col-span-1 h-96">
                <ArticleCardNew article={article} />
              </Card>
            </div>
          ))}
        </>
      ) : (
        <p>Ni novic</p>
      )}
    </>
  ) : (
    <>
      {articles && articles[0] ? (
        <>
          <Card className="col-span-1 row-span-1 h-52 sm:col-span-2">
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

function ArticleCardNew({ article }: ArticleCardProps) {
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
