import Link from "next/link";
import path from "path";
import { ARTICLE_PREFIX } from "~/lib/fs";
import { getServerAuthSession } from "~/server/auth";
import { Card } from "~/components/ui/card";
import ResponsiveShell from "./responsive_shell";
import { getPublishedArticles } from "../server/data_layer/fake";
import { type RouterOutputs } from "next-typesafe-url";

type _ThisIsHelpful = RouterOutputs["/novicka/[novicka_name]"]["routeParams"];


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
              <Link
                href={`/novicka/${articles[0].url}`}
              >
                {articles[0].title}
              </Link>
            </Card>
            <MultipleCards articles={articles.slice(1)} />
          </> : <p>Ni novic</p>}
        </div>
      </div>
    </ResponsiveShell>
  )
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
          <Card className="col-span-1 h-full">
            <Link href={path.join(ARTICLE_PREFIX, article.url)}>
              {article.title}
            </Link>
          </Card>
        </div>
      ))
    }
  </>
}