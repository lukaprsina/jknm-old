import { unstable_cache } from "next/cache";
import Link from "next/link";
import path from "path";
import { ARTICLE_PREFIX } from "~/lib/fs";
import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";
import { Card } from "~/components/ui/card";

const getArticles = unstable_cache(async (id?: string) => db.article.findMany({
  where: {
    OR: [
      { published: true },
      { createdById: id }
    ]
  },
  select: {
    title: true,
    id: true,
    url: true,
    createdById: true
  }
}), ["find"], { tags: ["articles"], revalidate: 300 })

export default async function HomePage() {
  const session = await getServerAuthSession()
  const articles = await getArticles(session?.user.id);

  return <>
    <div className="grid grid-cols-3 grid-rows-2 gap-4 h-56">
      {articles.length === 0 ? <p>Ni novic</p> : <>
        <Card className="col-span-1 row-span-2">
          <Link href={path.join(ARTICLE_PREFIX, articles[0]?.url ?? '')}>
            {articles[0]?.title ?? ''}
          </Link>
        </Card>
        <MultipleCards articles={articles.slice(1)} />
      </>}
    </div>
  </>
}

type MultipleCardsProps = {
  articles: {
    title: string;
    id: number;
    url: string;
  }[]
}

function MultipleCards({ articles }: MultipleCardsProps) {
  return <>
    {
      articles.map((article) => (
        <div key={article.id}>
          <Card className="col-span-1">
            <Link href={path.join(ARTICLE_PREFIX, article.url)}>
              {article.title}
            </Link>
          </Card>
        </div>
      ))
    }
  </>
}