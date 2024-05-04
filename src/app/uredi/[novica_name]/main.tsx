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
} from '@mdxeditor/editor'
// } from '@lukaprsina/mdxeditor'
// } from "modified-editor";
import useForwardedRef from "~/hooks/use_forwarded_ref";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { PublishDrawer, Test } from "./publish_drawer";
import { useTheme } from "next-themes";
import "./main.module.css";
import clsx from "clsx";
import ResponsiveShell from "../../../components/responsive_shell";
import { Badge } from "~/components/ui/badge";
import {
  SaveArticleType,
  read_article,
  save_article,
} from "../../../server/data_layer/articles";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { allPlugins, recurse_article } from "./helpers";
import { Route } from "./routeType";
import { useRouteParams } from "next-typesafe-url/app";
import { useRouter } from "next/navigation";
import { Article } from "@prisma/client";
import { useSession } from "next-auth/react";
import { ServerError } from "~/lib/server_error";

// import '@lukaprsina/mdxeditor/style.css'
import '@mdxeditor/editor/style.css'
// import "modified-editor/style.css";

function useEditorArticle(
  novica_name: string | undefined,
  update_state: () => void,
) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const query = useQuery({
    queryKey: ["editor_article", novica_name],
    queryFn: async () => {
      if (!novica_name) {
        console.log("throwing error query: no article url")
        throw new Error("No article url");
      }

      const response = await read_article({ url: novica_name });
      console.log("queryFn", { novica_name, response });
      if (!response.data || response.serverError || response.validationErrors)
        throw new ServerError("Zod error", { ...response });

      return response.data;
    },
  });

  const mutation = useMutation({
    mutationKey: ["save_article", novica_name],
    mutationFn: async (input: SaveArticleType) => {
      if (typeof query.data === "undefined") {
        console.log("throwing error mutation: no query.data")
        throw new Error("No query.data");
      }

      update_state();
      const response = await save_article(input);
      console.log("mutationFn", { novica_name, response });
      if (!response.data || response.serverError || response.validationErrors)
        throw new ServerError("Zod error", { ...response });

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
    if (novica_name) {
      query.refetch();
      update_state();
    }
  }, [novica_name, query.refetch]);

  function update_state() {
    const markdown = innerRef.current?.getMarkdown();
    if (!innerRef.current || !query.data || !markdown) return;

    const { new_title, new_markdown, image_urls, new_url } = recurse_article(
      markdown,
      {
        id: query.data.id,
        title: query.data.title,
      },
    );

    setTitle(new_title);
    setUrl(new_url);
    setImageUrls(image_urls);
    console.log("update_state", {
      new_title,
      new_markdown,
      image_urls,
      new_url,
      query: query.data,
    });

    innerRef.current?.setMarkdown(new_markdown);
  }

  function save() {
    const markdown = innerRef.current?.getMarkdown();
    console.log("save 2", { markdown, query: query.data })
    if (!innerRef.current || !query.data || typeof markdown !== "string")
      return Promise.resolve(null);

    const { new_title, new_markdown, new_url } = recurse_article(markdown, {
      id: query.data.id,
      title: query.data.title,
    });

    console.log("save", {
      new_title,
      new_markdown,
      new_url,
      query: query.data,
    });

    return new Promise<Article | null>((resolve, reject) => {
      if (!innerRef.current || !query.data || typeof markdown !== "string")
        return Promise.resolve(null);

      mutation.mutate(
        {
          id: query.data.id,
          title: new_title,
          url: new_url,
          content: new_markdown,
          published: query.data.published,
        },
        {
          onSuccess: (data) => {
            resolve(data);
            /* setTimeout(() => {
              console.log("RESOLVING");
            }, 3000); */
          },
          onError: (error) => {
            console.error("Error saving", error);
            reject(error);
          },
        },
      );
    });
  }

  function fullSave(input: SaveArticleType) {
    const markdown = innerRef.current?.getMarkdown();
    if (!innerRef.current || !query.data || !markdown) return;

    const { new_title, new_markdown, new_url } = recurse_article(markdown, {
      id: query.data.id,
      title: query.data.title,
    });
    console.log("fullSave", {
      new_title,
      new_markdown,
      new_url,
      query: query.data,
    });

    mutation.mutate({
      id: query.data?.id,
      title: new_title,
      url: new_url,
      content: new_markdown,
      published: input.published,
    });
  }

  if (!query.data || routeParams.isLoading) return <p>Loading...</p>;

  if (routeParams.isError || !routeParams.data) {
    console.log({ article: query.data, routeParams });
    throw new Error("Article not found (ZOD)");
  }

  /* TODO: block when mutating (saving) */

  return (
    <ResponsiveShell user={session.data?.user}>
      <div className="container prose-xl dark:prose-invert">
        <div className="flex-end my-2 flex justify-between">
          <div className="space-x-2">
            <Button variant="outline" onClick={() => void save()}>
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
              save={save}
              fullSave={(input) => fullSave(input)}
              articleId={query.data.id}
              content={query.data.content}
              imageUrls={imageUrls}
              title={title}
              url={url}
              published={query.data.published}
            />
            <Button
              variant="outline"
              onClick={() =>
                console.log({ markdown: innerRef.current?.getMarkdown() })
              }
            >
              Log editor
            </Button>
          </div>
          <Badge className="" variant="outline">
            {query.data.published ? "Objavljeno" : "Neobjavljeno"}
          </Badge>
        </div>

        <div className="rounded-md border-2 border-primary/25">
          <MDXEditor
            plugins={allPlugins(
              query.data.content,
              routeParams.data.novica_name
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
