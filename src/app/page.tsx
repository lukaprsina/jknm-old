import { unstable_cache } from "next/cache";
import Link from "next/link";
import path from "path";
import { ARTICLE_PREFIX } from "~/lib/fs";
import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";

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
    <div className="prose lg:prose-xl">
      <h1>Articles</h1>
      {articles.map((article) => (
        <div key={article.id}>
          <Link href={path.join(ARTICLE_PREFIX, article.url)}>
            {article.title}
          </Link>
        </div>
      ))}
    </div>
  </>
}
