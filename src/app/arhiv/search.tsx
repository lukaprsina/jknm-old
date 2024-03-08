"use client"

import { meilisearchClient } from '~/lib/meilisearch';
import 'instantsearch.css/themes/reset.css'
import { SearchBox, Hits, Highlight, InstantSearch } from 'react-instantsearch';
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';
import { Hit as SearchHit } from "instantsearch.js"
// import { InstantSearchNext } from 'react-instantsearch-nextjs';
import { Card, CardContent, CardHeader } from '~/components/ui/card';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { custom_mdx_components } from '~/mdx-components';
import Image from 'next/image';
// import historyRouter from 'instantsearch.js/es/lib/routers/history';

const { searchClient } = instantMeiliSearch(
    'https://ms-adf78ae33284-106.lon.meilisearch.io',
    'a63da4928426f12639e19d62886f621130f3fa9ff3c7534c5d179f0f51c4f303',
    {
        finitePagination: true,
    }
);

export function Search() {
    const index = meilisearchClient.getIndex("novicke")

    return (
        <InstantSearch
            future={{ preserveSharedStateOnUnmount: true }}
            indexName="novicke"
            // indexName="steam-video-games"
            // searchClient={searchClient}
            searchClient={meilisearchClient.getInstantSearchClient()}
        >
            <SearchBox autoCapitalize='none' />
            <Hits hitComponent={Hit} />
        </InstantSearch>
    )
}

export type NovickeHit = {
    id: number
    title: string,
    url: string,
    content: string
    image_url: string
}

function Hit({ hit }: { hit: SearchHit<NovickeHit> }) {
    return (
        <Card className="w-full flex">
            <CardHeader className="w-52">
                <Highlight attribute="title" hit={hit} />
            </CardHeader>
            <CardContent className='flex gap-2 h-full'>
                <Image
                    src={hit.image_url}
                    alt={hit.title}
                    className="h-full m-0 rounded-xl border shadow text-xs"
                />
                <Highlight attribute="content" hit={hit} />
                {/* <MDXRemote
                    source={hit.content}
                    components={custom_mdx_components}
                /> */}
            </CardContent>
        </Card>
    )
} 
