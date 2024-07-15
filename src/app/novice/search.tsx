"use client";

import { compile, run } from "@mdx-js/mdx";
import { Fragment, useEffect, useState } from "react";
import * as runtime from "react/jsx-runtime";
import "instantsearch.css/themes/reset.css";
import {
  SearchBox,
  Hits,
  useSearchBox,
  SortBy,
  useSortBy,
} from "react-instantsearch";
import { Hit as SearchHit } from "instantsearch.js";
import { InstantSearchNext } from "react-instantsearch-nextjs";
import { Jsx } from "hast-util-to-jsx-runtime";
import { Card, CardContent } from "~/components/ui/card";
import Image from "next/image";
import { Suspense } from "react";
import { MDXModule } from "mdx/types";
import { ARTICLE_PREFIX } from "~/lib/fs";
import { algoliaInstance } from "~/lib/algolia";
import Link from "next/link";
import type { UseSearchBoxProps, UseSortByProps } from "react-instantsearch";
import { Input } from "~/components/ui/input";
import { ArticleCardHorizontal, ArticleCardVertical } from "../article_view";
import { Select, SelectItem } from "~/components/ui/select";
import {
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@radix-ui/react-select";

export function Search() {
  return (
    <InstantSearchNext
      future={{ preserveSharedStateOnUnmount: true }}
      indexName="novice"
      routing={{
        router: {
          cleanUrlOnDispose: false,
        },
      }}
      searchClient={algoliaInstance.getClient()}
    >
      <div /* className="flex flex-col pb-4 sm:flex-row" */>
        <CustomSearchBox />
        <CustomSortBy
          items={[
            { value: "novice", label: "Najnovejše" },
            { value: "novice_date_asc", label: "Najstarejše" },
          ]}
        />
        {/* <SearchBox autoCapitalize="none" /> */}
      </div>
      <Hits
        hitComponent={Hit}
        classNames={{
          list: "grid grid-cols-1 gap-4 sm:grid-cols-2",
        }}
      />
    </InstantSearchNext>
  );
}

const queryHook: UseSearchBoxProps["queryHook"] = (query, search) => {
  search(query);
};

function CustomSearchBox() {
  const search_api = useSearchBox({ queryHook });

  return (
    <Input
      // type="submit"
      placeholder="Iskanje ..."
      value={search_api.query}
      onChange={(e) => search_api.refine(e.target.value)}
    />
  );
}

function CustomSortBy(props: UseSortByProps) {
  const { currentRefinement, options, refine } = useSortBy(props);

  return (
    <Select onValueChange={(value) => refine(value)} value={currentRefinement}>
      <SelectTrigger className="z-50 flex flex-1">
        <SelectValue placeholder="Sortiraj po ..." />
      </SelectTrigger>
      <SelectContent className="z-50">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
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

  if (!hit.imageUrl) return;

  return (
    <Card className="col-span-1 h-96">
      <ArticleCardHorizontal article={hit} />
    </Card>
  );

  return (
    <Card className="flex h-52 w-full overflow-hidden">
      <CardContent className="h-full w-full p-0">
        <Link
          href={`${ARTICLE_PREFIX}/${hit.url ?? ""}`}
          className="flex h-full w-full gap-10"
        >
          <Image
            src={hit.imageUrl}
            alt={hit.title ?? ""}
            width={1500}
            height={1000}
            className="m-0 h-full w-auto transform-gpu rounded-xl border text-xs shadow transition-all hover:scale-105"
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
