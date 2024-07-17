import {
  autocomplete,
  AutocompleteComponents,
  AutocompleteSource,
  getAlgoliaResults,
} from "@algolia/autocomplete-js";
import { NoviceHit } from "~/app/novice/search";
import { algoliaInstance } from "~/lib/algolia";
import React, {
  createElement,
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createRoot, Root } from "react-dom/client";

import "@algolia/autocomplete-theme-classic";
import Link from "next/link";
import { ARTICLE_PREFIX } from "~/lib/fs";
import { MDXModule } from "mdx/types";
import { compile, Jsx, run } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import "./autocomplete.css";

type AutocompleteProps = {
  openOnFocus: boolean;
  getSources: (props: { query: string }) => AutocompleteSource<NoviceHit>[];
};

// https://www.algolia.com/doc/ui-libraries/autocomplete/integrations/using-react/
export function Autocomplete(props: AutocompleteProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<HTMLElement>();
  const panelRootRef = useRef<Root>();

  useEffect(() => {
    if (!containerRef.current) {
      return undefined;
    }

    const search = autocomplete({
      container: containerRef.current,
      renderer: { createElement, Fragment, render: () => {} },
      defaultActiveItemId: 0,
      render({ children }, root) {
        if (!panelRootRef.current || rootRef.current !== root) {
          rootRef.current = root;

          panelRootRef.current?.unmount();
          panelRootRef.current = createRoot(root);
        }

        panelRootRef.current.render(children);
      },
      ...props,
    });

    return () => {
      search.destroy();
    };
  }, [props]);

  return <div ref={containerRef} />;
}

export function NoviceAutocomplete() {
  const searchClient = algoliaInstance.getClient();

  return (
    <Autocomplete
      openOnFocus
      getSources={({ query }) => [
        {
          sourceId: "products",
          getItems() {
            return getAlgoliaResults({
              searchClient,
              queries: [
                {
                  indexName: "novice",
                  query,
                  params: {
                    hitsPerPage: 8,
                  },
                },
              ],
            });
          },
          templates: {
            header({}) {
              return (
                <>
                  <span className="aa-SourceHeaderTitle">Novice</span>
                  <div className="aa-SourceHeaderLine" />
                </>
              );
            },
            item({ item, components }) {
              return <ProductItem hit={item} components={components} />;
            },
            noResults() {
              return "Ni ujemajočih novic.";
            },
          },
        },
      ]}
    />
  );
}

type ProductItemProps = {
  hit: NoviceHit;
  components: AutocompleteComponents;
};

function ProductItem({ hit, components }: ProductItemProps) {
  const [mdxModule, setMdxModule] = useState<MDXModule>();
  const Content = mdxModule ? mdxModule.default : Fragment;

  const content_preview = useMemo(() => {
    return hit.content.split("\n").slice(0, 3).join("\n");
  }, [hit.content]);

  useEffect(
    function () {
      (async function () {
        const code = String(
          await compile(content_preview ?? "", {
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
    [content_preview],
  );

  if (!hit.imageUrl) return;

  return (
    <Link
      className="aa-ItemLink text-inherit"
      href={`/${ARTICLE_PREFIX}/${hit.url}`}
    >
      <div className="aa-ItemContent h-12 overflow-hidden">
        {/* <div className="aa-ItemIcon">
          <img src={hit.imageUrl} alt="TODO: alt" width="40" height="40" />
        </div> */}
        <div className="aa-ItemContentBody">
          {/* <div className="aa-ItemContentTitle">
            <components.Highlight hit={hit} attribute="title" />
          </div> */}
          <div className="aa-ItemContentDescription">
            <Content />
            {/* <components.Snippet hit={hit} attribute="content" /> */}
          </div>
        </div>
      </div>
    </Link>
  );
}
