"use client"

import { meilisearchClient } from '~/lib/meilisearch';
import 'instantsearch.css/themes/reset.css'
import { SearchBox, Hits, Highlight, InstantSearch } from 'react-instantsearch';
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';
import { BaseHit, Hit as SearchHit } from "instantsearch.js"
import { InstantSearchNext } from 'react-instantsearch-nextjs';

const { searchClient } = instantMeiliSearch(
    'https://ms-adf78ae33284-106.lon.meilisearch.io',
    'a63da4928426f12639e19d62886f621130f3fa9ff3c7534c5d179f0f51c4f303',
    {
        finitePagination: true,
    }
);

export function Search() {
    const index = meilisearchClient.getIndex("novicke")
    index.getDocuments().then((o) => console.log("meili novicke", o))

    return (
        <InstantSearchNext
            future={{ preserveSharedStateOnUnmount: true }}
            indexName="novicke"
            // indexName="steam-video-games"
            // searchClient={searchClient}
            searchClient={meilisearchClient.getInstantSearchClient()}
            routing
        >
            <SearchBox autoCapitalize='none' />
            <Hits hitComponent={Hit} />
        </InstantSearchNext>
    )
}

export type NovickeHit = {
    id: number
    title: string,
    url: string,
    content: string
}

function Hit({ hit }: { hit: SearchHit<NovickeHit> }) {
    return (
        <div>
            {hit.title}
        </div>
    )
} 
