"use client"

import { compile, run } from '@mdx-js/mdx'
import { Fragment, useEffect, useState } from 'react'
import * as runtime from 'react/jsx-runtime'
import { meilisearchClient } from '~/lib/meilisearch';
import 'instantsearch.css/themes/reset.css'
import { SearchBox, Hits, InstantSearch } from 'react-instantsearch';
import { Hit as SearchHit } from "instantsearch.js"
// import { InstantSearchNext } from 'react-instantsearch-nextjs';
import { Jsx } from 'hast-util-to-jsx-runtime'
import { Card, CardContent } from '~/components/ui/card';
import Image from 'next/image';
import { Suspense } from 'react';
import { MDXModule } from 'mdx/types';
import Link from 'next/link';
import { ARTICLE_PREFIX } from '~/lib/fs';
// import historyRouter from 'instantsearch.js/es/lib/routers/history';

/* const { searchClient } = instantMeiliSearch(
    'https://ms-adf78ae33284-106.lon.meilisearch.io',
    'a63da4928426f12639e19d62886f621130f3fa9ff3c7534c5d179f0f51c4f303',
    {
        finitePagination: true,
    }
); */

export function Search() {
    return (
        <InstantSearch
            future={{ preserveSharedStateOnUnmount: true }}
            indexName="novicke"
            // indexName="steam-video-games"
            // searchClient={searchClient}
            searchClient={meilisearchClient.getInstantSearchClient()}
        >
            <SearchBox
                autoCapitalize='none'
            />
            <Hits hitComponent={Hit} />
        </InstantSearch>
    )
}

export type NovickeHit = {
    id: number
    title: string,
    url: string,
    content: string,
    imageUrl: string
}

function Hit({ hit }: { hit: SearchHit<NovickeHit> }) {
    const [mdxModule, setMdxModule] = useState<MDXModule>()
    const Content = mdxModule ? mdxModule.default : Fragment

    useEffect(function () {
        ; (async function () {
            const code = String(await compile(hit.content, {
                outputFormat: 'function-body',
            }))

            const cached = await run(code, {
                Fragment,
                baseUrl: "/",
                jsx: runtime.jsx as Jsx,
                jsxs: runtime.jsxs as Jsx,
            })
            setMdxModule(cached)
        })()
    }, [hit.content])

    return (
        <Card className="w-full flex h-52 overflow-hidden">
            <CardContent className="p-0 w-full h-full">
                <Link href={`${ARTICLE_PREFIX}/${hit.url}`} className='flex gap-10 h-full w-full'>
                    <Image
                        src={hit.imageUrl}
                        alt={hit.title}
                        width={1500}
                        height={1000}
                        className="m-0 rounded-xl border shadow text-xs w-auto h-full origin-right transition-all hover:scale-105"
                    />
                    <Suspense fallback={<p>Loading next-mdx-remote-client</p>}>
                        <div className="overflow-hidden h-full w-full m-2 max-h-full text-xs">
                            <Content />
                        </div>
                    </Suspense>
                </Link>
            </CardContent>
        </Card>
    )
} 