import { get_article_by_url } from "~/server/articles";
import { type Metadata } from "next";
import ResponsiveShell from "~/components/responsive_shell";
import { getServerAuthSession } from "~/server/auth";
import type { InferPagePropsType } from "next-typesafe-url";
import { Route, type RouteType } from "./routeType";
import { withParamValidation } from "next-typesafe-url/app/hoc";
import { MDXRemote } from "remote-mdx/rsc";
import { custom_mdx_components } from "~/mdx-components";

type PageProps = InferPagePropsType<RouteType>;

type ArticleType = {
  params: { novica_name: string };
};

// TODO: maybe search params do better, because react_devtools_backend_compact.js.map
// and other junk ddoses server
export async function generateMetadata({
  params,
}: ArticleType): Promise<Metadata> {
  const response = await get_article_by_url({
    url: decodeURIComponent(params.novica_name),
  });
  return {
    title: response?.data?.title,
  };
}

async function Article({ routeParams }: PageProps) {
  const session = await getServerAuthSession();
  const article = await get_article_by_url({
    url: decodeURIComponent(routeParams.novica_name),
  });

  return (
    <ResponsiveShell editable={true} user={session?.user}>
      <div className="prose dark:prose-invert lg:prose-lg container pt-12">
        {article?.data?.content ? (
          <MDXRemote
            source={article.data?.content}
            components={custom_mdx_components}
          />
        ) : null}
      </div>
    </ResponsiveShell>
  );
}

export default withParamValidation(Article, Route);
