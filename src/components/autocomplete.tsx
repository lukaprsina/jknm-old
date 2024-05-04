import { autocomplete, AutocompleteComponents, AutocompleteSource, getAlgoliaResults } from '@algolia/autocomplete-js';
import { NoviceHit } from '~/app/novice/search';
import { algoliaInstance } from '~/lib/algolia';
import React, { createElement, Fragment, useEffect, useRef } from 'react';
import { createRoot, Root } from 'react-dom/client';

import '@algolia/autocomplete-theme-classic';
import Link from 'next/link';
import { ARTICLE_PREFIX } from '~/lib/fs';

type AutocompleteProps = {
    openOnFocus: boolean;
    getSources: (props: { query: string }) => AutocompleteSource<NoviceHit>[];
}

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
            renderer: { createElement, Fragment, render: () => { } },
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
    }, []);

    return <div ref={containerRef} />;
}

export function NoviceAutocomplete() {
    const searchClient = algoliaInstance.getClient();

    return <Autocomplete
        openOnFocus
        getSources={({ query }) => [
            {
                sourceId: 'products',
                getItems() {
                    return getAlgoliaResults({
                        searchClient,
                        queries: [
                            {
                                indexName: 'novice',
                                query,
                                params: {
                                    hitsPerPage: 8
                                }
                            },
                        ],
                    });
                },
                templates: {
                    header({ }) {
                        return <>
                            <span className="aa-SourceHeaderTitle">Novice</span>
                            <div className="aa-SourceHeaderLine" />
                        </>
                    },
                    item({ item, components }) {
                        return <ProductItem hit={item} components={components} />;
                    },
                    noResults() {
                        return 'Ni ujemajočih novic.';
                    },
                },
            },
        ]}
    />
}

type ProductItemProps = {
    hit: NoviceHit
    components: AutocompleteComponents
}

function ProductItem({ hit, components }: ProductItemProps) {
    return (
        <Link className="aa-ItemLink" href={`/${ARTICLE_PREFIX}/${hit.url}`}>
            <div className="aa-ItemContent">
                <div className="aa-ItemIcon">
                    <img src={hit.imageUrl} alt="TODO: alt" width="40" height="40" />
                </div>
                <div className="aa-ItemContentBody">
                    <div className="aa-ItemContentTitle">
                        <components.Highlight hit={hit} attribute="title" />
                    </div>
                    <div className="aa-ItemContentDescription">
                        <components.Snippet hit={hit} attribute="content" />
                    </div>
                </div>
            </div>
        </Link>
    );
}