import ResponsiveShell from "../components/responsive_shell";
import { get_published_articles } from "~/server/data_layer/articles";
import { getServerAuthSession } from "~/server/auth";
import ArticleView, {
  ArticleViewSwitch,
} from "./article_view";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import Parallax from "./parallax";

export default async function HomePage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["published_articles"],
    queryFn: async () => await get_published_articles(),
  });

  const session = await getServerAuthSession();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ResponsiveShell user={session?.user}>
        <Parallax>
          <div className="container prose-xl pt-10 dark:prose-invert">
            <ArticleViewSwitch />
            {/* Public articles */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ArticleView />
            </div>
          </div>
        </Parallax>
      </ResponsiveShell>
    </HydrationBoundary>
  );
}
