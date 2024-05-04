"use client";

import { compile, run } from "@mdx-js/mdx";
import { Fragment, useEffect, useState } from "react";
import * as runtime from "react/jsx-runtime";
import "instantsearch.css/themes/reset.css";
import { SearchBox, Hits } from "react-instantsearch";
import { Hit as SearchHit } from "instantsearch.js";
import { InstantSearchNext } from 'react-instantsearch-nextjs';
import { Jsx } from "hast-util-to-jsx-runtime";
import { Card, CardContent } from "~/components/ui/card";
import Image from "next/image";
import { Suspense } from "react";
import { MDXModule } from "mdx/types";
import { ARTICLE_PREFIX } from "~/lib/fs";
import { algoliaInstance } from "~/lib/algolia";
import Link from "next/link";

export function Search() {
  return (
    <InstantSearchNext
      future={{ preserveSharedStateOnUnmount: true }}
      indexName="novice"
      routing={{
        router: {
          cleanUrlOnDispose: false
        }
      }}
      searchClient={algoliaInstance.getClient()}
    >
      <SearchBox autoCapitalize="none" />
      <Hits hitComponent={Hit} />
    </InstantSearchNext>
  );
}

export type NoviceHit = {
  objectID: number;
  title: string;
  url: string;
  content: string;
  imageUrl: string;
};

function Hit({ hit }: { hit: SearchHit<NoviceHit> }) {
  const [mdxModule, setMdxModule] = useState<MDXModule>();
  const Content = mdxModule ? mdxModule.default : Fragment;

  useEffect(
    function () {
      (async function () {
        const code = String(
          await compile(hit.content ?? "", {
            outputFormat: "function-body",
          }),
        );

        const cached = await run(code, {
          Fragment,
          baseUrl: "/",
          jsx: runtime.jsx as Jsx,
          jsxs: runtime.jsxs as Jsx,
        });
        setMdxModule(cached);
      })();
    },
    [hit.content],
  );

  return (
    <Card className="flex h-52 w-full overflow-hidden">
      <CardContent className="h-full w-full p-0">
        <Link
          href={`${ARTICLE_PREFIX}/${hit.url ?? ""}`}
          className="flex h-full w-full gap-10"
        >
          <Image
            src={hit.imageUrl ?? ""}
            alt={hit.title ?? ""}
            width={1500}
            height={1000}
            className="m-0 h-full w-auto origin-right rounded-xl border text-xs shadow transition-all hover:scale-105"
          />
          <Suspense fallback={<p>Loading content</p>}>
            <div className="m-2 h-full max-h-full w-full overflow-hidden text-xs">
              <Content />
            </div>
          </Suspense>
        </Link>
      </CardContent>
    </Card>
  );
}
