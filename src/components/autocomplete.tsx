import { autocomplete, AutocompleteComponents, AutocompleteSource, getAlgoliaResults } from '@algolia/autocomplete-js';
import { NovickeHit } from '~/app/novicke/search';
import { algoliaInstance } from '~/lib/algolia';
import { Hit as SearchHit } from "instantsearch.js";
import React, { createElement, Fragment, useEffect, useRef } from 'react';
import { createRoot, Root } from 'react-dom/client';

import '@algolia/autocomplete-theme-classic';
import Link from 'next/link';

type AutocompleteProps = {
    openOnFocus: boolean;
    getSources: (props: { query: string }) => AutocompleteSource<NovickeHit>[];
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

export function NovickeAutocomplete() {
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
                                indexName: 'novicke',
                                query,
                                params: {
                                    hitsPerPage: 8
                                }
                            },
                        ],
                    });
                },
                templates: {
                    footer({ }) {
                        return <>
                            <p>Hi</p>
                        </>
                    },
                    item({ item, components }) {
                        return <ProductItem hit={item} components={components} />;
                    },
                },
            },
        ]}
    />
}

type ProductItemProps = {
    hit: SearchHit<NovickeHit>
    components: AutocompleteComponents
}

function ProductItem({ hit, components }: ProductItemProps) {
    return (
        <Link className="aa-ItemLink" href={hit.url}>
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