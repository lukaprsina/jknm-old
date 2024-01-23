import { unstable_cache } from "next/cache";
import Link from "next/link";
import path from "path";
import { db } from "~/server/db";

const getArticles = unstable_cache(async () => db.article.findMany(), ["find"], { tags: ["articles"], revalidate: 300 })

export default async function HomePage() {
  const articles = await getArticles();

  return <>
    <div className="prose lg:prose-xl">
      <h1>Articles</h1>
      {articles.map((article) => (
        <div key={article.id}>
          <Link href={path.join("article", article.pathname)}>
            {article.title}
          </Link>
        </div>
      ))}
    </div>
  </>
}
