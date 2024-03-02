import Link from "next/link";
import { getServerAuthSession } from "~/server/auth";
import { Card } from "~/components/ui/card";
import ResponsiveShell from "./responsive_shell";
import { getPublishedArticles } from "../server/data_layer/fake";

export default async function HomePage() {
  const articles = await getPublishedArticles();
  const session = await getServerAuthSession();

  return (
    <ResponsiveShell user={session?.user}>
      <div className="prose lg:prose-xl dark:prose-invert container">
        {/* Public articles */}
        <div className="grid grid-cols-3 gap-4 h-56">
          {articles.length !== 0 && articles[0] ? <>
            <Card className="col-span-3 row-span-1 h-full">
              <ArticleCard article={articles[0]} />
            </Card>
            {
              articles.splice(1).map((article) => (
                <div key={article.id}>
                  <Card className="col-span-1 h-full">
                    <ArticleCard article={article} />
                  </Card>
                </div>
              ))
            }
          </> : <p>Ni novic</p>}
        </div>
      </div>
    </ResponsiveShell>
  )
}

type ArticleCardProps = {
  article: {
    id: number;
    title: string;
    url: string;
    createdById: string;
  };
}

function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link
      href={`/novicka/${article.url}`}
    >
      {article.title}
    </Link>
  )
}