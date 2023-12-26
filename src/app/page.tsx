import Link from "next/link";
import { db } from "~/server/db";

async function getArticles() {
  const articles = await db.post.findMany();
  return articles;
}

export default async function HomePage() {
  const articles = await getArticles();

  return <>
    <div>
      <h1>Articles</h1>
      {articles.map((article) => (
        <div key={article.id}>
          <Link href={`/articles/${article.id}`}>
            {article.title}
          </Link>
        </div>
      ))}
    </div>
    <Link href="/account">Account</Link>
  </>
}
