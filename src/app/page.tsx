import type { Article } from "@prisma/client";
import Link from "next/link";
import path from "path";
import getURL from "~/lib/get-url";

async function getArticles() {
  const origin_url = getURL("/api/articles")
  try {
    const response = await fetch(origin_url, { next: { tags: ["articles"], revalidate: 300 } })
    return await response.json() as { articles: Article[] }
  } catch (e: unknown) {
    if (e instanceof Error) console.error(e.message)
    if (typeof e === "string") console.error(e)
    throw new Error(origin_url)
  }
}

// const getCachedArticles = unstable_cache(async () => db.article.findMany(), ["articles"])

export default async function HomePage() {
  const response = await getArticles();
  if (!response?.articles) {
    return <div>Error</div>
  }

  return <>
    <div>
      <h1>Articles</h1>
      {response.articles.map((article) => (
        <div key={article.id}>
          <Link href={path.join("article", article.pathname)}>
            {article.title}
          </Link>
        </div>
      ))}
    </div>
  </>
}
