import ResponsiveShell from "../components/responsive_shell";
import { getPublishedArticles } from "~/server/data_layer/articles";
import { getServerAuthSession } from "~/server/auth";
import ArticleView from "./article_view";

export default async function HomePage() {
  const articles = await getPublishedArticles();
  const session = await getServerAuthSession();

  return (
    <ResponsiveShell user={session?.user}>
      <div className="prose-xl dark:prose-invert container">
        {/* Public articles */}
        <div className="grid grid-cols-3 gap-4 h-56">
          {articles ? <>
            <ArticleView initial_articles={articles} />
          </> : null}
        </div>
      </div>
    </ResponsiveShell>
  )
}