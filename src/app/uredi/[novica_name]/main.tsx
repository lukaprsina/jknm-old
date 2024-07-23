"use client";

import { type ForwardedRef, useState, useEffect, useMemo } from "react";
import {
  BoldItalicUnderlineToggles,
  headingsPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  MDXEditor,
  quotePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  UndoRedo,
  type MDXEditorMethods,
  type MDXEditorProps,
} from "@mdxeditor/editor";
// } from '@lukaprsina/mdxeditor'
// } from "modified-editor";
import useForwardedRef from "~/hooks/use_forwarded_ref";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { PublishDrawer } from "./publish_drawer";
import { useTheme } from "next-themes";
import "./main.module.css";
import clsx from "clsx";
import ResponsiveShell from "../../../components/responsive_shell";
import { Badge } from "~/components/ui/badge";
import {
  SaveArticleType,
  get_article_by_url,
  save_article,
} from "../../../server/articles";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { allPlugins, recurse_article } from "./helpers";
import { Route } from "./routeType";
import { useRouteParams, useSearchParams } from "next-typesafe-url/app";
import { useRouter } from "next/navigation";
import { Article } from "@prisma/client";
import { useSession } from "next-auth/react";
import { ServerError } from "~/lib/server_error";

// import '@lukaprsina/mdxeditor/style.css'
import "@mdxeditor/editor/style.css";
import useLog from "~/hooks/use_log";
import { PublishFormValues, SelectImage } from "./publish_form";
// import "modified-editor/style.css";

function useEditorArticle(
  novica_name: string | undefined,
  update_state: () => void,
) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["editor_article", novica_name],
    queryFn: async () => {
      if (!novica_name) {
        throw new Error("No article url");
      }

      const response = await get_article_by_url({ url: novica_name });
      console.log("queryFn", { novica_name, response });
      if (!response?.data || response.serverError || response.validationErrors)
        throw new Error("Zod error");

      return response.data;
    },
  });

  const mutation = useMutation({
    mutationKey: ["save_article", novica_name],
    mutationFn: async (input: SaveArticleType) => {
      if (typeof query.data === "undefined") {
        console.error("mutation: No query.data", { query, input });
        throw new Error("No query.data");
      }

      const response = await save_article(input);
      console.log("mutationFn", { novica_name, response });
      if (!response?.data || response.serverError || response.validationErrors)
        throw new Error("Zod error");

      router.push(`/uredi/${response.data.url}`);

      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["editor_article", novica_name], data);
      update_state();
    },
  });

  return {
    query,
    mutation,
  };
}

export default function InitializedMDXEditor({
  editorRef,
  ...props
}: {
  editorRef: ForwardedRef<MDXEditorMethods> | null;
} & MDXEditorProps) {
  const [title, setTitle] = useState<string>("");
  const [url, setUrl] = useState<string>("");
  const session = useSession();

  const innerRef = useForwardedRef(editorRef);
  const routeParams = useRouteParams(Route.routeParams);
  const theme = useTheme();
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const novica_name = useMemo(
    () => decodeURIComponent(routeParams.data?.novica_name ?? ""),
    [routeParams.data?.novica_name],
  );

  const { query, mutation } = useEditorArticle(novica_name, update_state);

  useEffect(() => {
    console.log("useEffect", routeParams.data?.novica_name, novica_name);
    if (routeParams.data?.novica_name !== novica_name) {
      query.refetch();
      update_state();
    }
  }, [novica_name, query.refetch]);

  useEffect(() => {
    if (query.data) update_state();
  }, [query.data]);

  function update_state() {
    console.log("update_state 1");
    const markdown = innerRef.current?.getMarkdown();
    if (!innerRef.current || !query.data || !markdown) return;

    const { new_title, new_markdown, image_urls, new_url } = recurse_article(
      markdown,
      undefined,
      undefined,
    );
    console.log("update_state 2");

    setTitle(new_title);
    setUrl(new_url);
    setImageUrls(image_urls);

    /* console.log("update_state", {
      new_title,
      new_markdown,
      image_urls,
      new_url,
      query: query.data,
    }); */

    innerRef.current?.setMarkdown(new_markdown);
  }

  function save_content() {
    const markdown = innerRef.current?.getMarkdown();
    if (!innerRef.current || !query.data || typeof markdown !== "string")
      return;

    const { new_title, new_markdown, new_url } = recurse_article(
      markdown,
      undefined,
      undefined,
    );

    /* console.log("save", {
      new_title,
      new_markdown,
      new_url,
      query: query.data,
    }); */

    mutation.mutate({
      id: query.data?.id,
      title: new_title,
      url: new_url,
      content: new_markdown,
      published: query.data.published,
    });

    return new_url;
  }

  function configure_article({
    image_url,
    published,
    title,
    url,
  }: PublishFormValues) {
    const markdown = innerRef.current?.getMarkdown();
    if (!innerRef.current || !query.data || typeof markdown !== "string")
      return;

    const { new_title, new_markdown, new_url } = recurse_article(
      markdown,
      title,
      url,
    );

    /* console.log("save", {
      new_title,
      new_markdown,
      new_url,
      query: query.data,
    }); */

    mutation.mutate({
      id: query.data?.id,
      title: new_title,
      url: new_url,
      content: new_markdown,
      image_url,
      published,
    });
  }

  if (!query.data || routeParams.isLoading) return <p>Loading...</p>;

  if (routeParams.isError || !routeParams.data) {
    console.error({ article: query.data, routeParams });
    throw new Error("Article not found (ZOD)");
  }

  /* TODO: block when mutating (saving) */

  return (
    <ResponsiveShell user={session.data?.user}>
      <div className="prose-xl dark:prose-invert container pt-4">
        <div className="flex-end flex justify-between py-2">
          <div className="space-x-2">
            <Button variant="outline" onClick={() => save_content()}>
              Shrani
            </Button>
            <Button asChild variant="outline">
              <Link
                className="no-underline"
                href={`/novica/${novica_name}`}
                target="_blank"
              >
                Obišči stran
              </Link>
            </Button>
            <PublishDrawer
              configure_article={configure_article}
              save_content={save_content}
              articleId={query.data.id}
              content={query.data.content}
              imageUrls={imageUrls}
              selectedImageUrl={
                query.data.imageUrl ?? imageUrls.at(0) ?? undefined
              }
              title={title}
              url={url}
              published={query.data.published}
            />
          </div>
          <Badge className="" variant="outline">
            {query.data.published ? "Objavljeno" : "Neobjavljeno"}
          </Badge>
        </div>

        <div className="rounded-md border-2 border-primary/25">
          <MDXEditor
            plugins={allPlugins(
              query.data.content,
              routeParams.data.novica_name,
            )}
            {...props}
            markdown={query.data.content}
            className={clsx(
              theme.resolvedTheme === "dark" ? "dark-theme dark-editor" : "",
            )}
            contentEditableClassName="max-w-full"
            ref={editorRef}
          />
        </div>
        <pre className="text-sm">{JSON.stringify(query.data, null, 2)}</pre>
      </div>
    </ResponsiveShell>
  );
}
