import { autocomplete, AutocompleteComponents, AutocompleteSource, getAlgoliaResults } from '@algolia/autocomplete-js';
import { NovickeHit } from '~/app/arhiv/search';
import { algoliaInstance } from '~/lib/algolia';
import { Hit as SearchHit } from "instantsearch.js";
import React, { createElement, Fragment, useEffect, useRef } from 'react';
import { createRoot, Root } from 'react-dom/client';

import '@algolia/autocomplete-theme-classic';

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
                            },
                        ],
                    });
                },
                templates: {
                    item({ item, components }) {
                        return <ProductItem hit={item} components={components} />;
                    },
                },
            },
        ]}
    />
}

type AutocompleteProps = {
    openOnFocus: boolean;
    getSources: (props: { query: string }) => AutocompleteSource<NovickeHit>[];
}

export default function Autocomplete(props: AutocompleteProps) {
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

type ProductItemProps = {
    hit: SearchHit<NovickeHit>
    components: AutocompleteComponents
}

function ProductItem({ hit, components }: ProductItemProps) {
    return (
        <div className="aa-ItemWrapper">
            <div className="aa-ItemContent">
                <div className="aa-ItemIcon aa-ItemIcon--alignTop">
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
                <div className="aa-ItemActions">
                    <button
                        className="aa-ItemActionButton aa-DesktopOnly aa-ActiveOnly"
                        type="button"
                        title="Select"
                    >
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M18.984 6.984h2.016v6h-15.188l3.609 3.609-1.406 1.406-6-6 6-6 1.406 1.406-3.609 3.609h13.172v-4.031z" />
                        </svg>
                    </button>
                    <button
                        className="aa-ItemActionButton"
                        type="button"
                        title="Add to cart"
                    >
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                            <path d="M19 5h-14l1.5-2h11zM21.794 5.392l-2.994-3.992c-0.196-0.261-0.494-0.399-0.8-0.4h-12c-0.326 0-0.616 0.156-0.8 0.4l-2.994 3.992c-0.043 0.056-0.081 0.117-0.111 0.182-0.065 0.137-0.096 0.283-0.095 0.426v14c0 0.828 0.337 1.58 0.879 2.121s1.293 0.879 2.121 0.879h14c0.828 0 1.58-0.337 2.121-0.879s0.879-1.293 0.879-2.121v-14c0-0.219-0.071-0.422-0.189-0.585-0.004-0.005-0.007-0.010-0.011-0.015zM4 7h16v13c0 0.276-0.111 0.525-0.293 0.707s-0.431 0.293-0.707 0.293h-14c-0.276 0-0.525-0.111-0.707-0.293s-0.293-0.431-0.293-0.707zM15 10c0 0.829-0.335 1.577-0.879 2.121s-1.292 0.879-2.121 0.879-1.577-0.335-2.121-0.879-0.879-1.292-0.879-2.121c0-0.552-0.448-1-1-1s-1 0.448-1 1c0 1.38 0.561 2.632 1.464 3.536s2.156 1.464 3.536 1.464 2.632-0.561 3.536-1.464 1.464-2.156 1.464-3.536c0-0.552-0.448-1-1-1s-1 0.448-1 1z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}