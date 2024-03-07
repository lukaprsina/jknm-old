"use client";

import { InstantMeiliSearchInstance, instantMeiliSearch, type InstantMeiliSearchObject } from '@meilisearch/instant-meilisearch'
import { MeiliSearch, Index } from 'meilisearch';
import { env } from '~/env';

class MeilisearchClient {
    private static instance: MeilisearchClient;

    private client: MeiliSearch;
    private instant_search: InstantMeiliSearchObject;

    private constructor() {
        // TODO: Replace with env variable
        const host = "localhost:7700";
        const apiKey = env.NEXT_PUBLIC_MEILI_MASTER_KEY;

        if (!host) {
            throw new Error('MEILISEARCH_URL is not defined');
        }

        this.client = new MeiliSearch({ host, apiKey });
        this.instant_search = instantMeiliSearch(host, apiKey, {
            primaryKey: 'id',
            finitePagination: true,
            meiliSearchParams: {
                attributesToHighlight: ['title', 'content'],
            }
        });
    }

    public static getInstance(): MeilisearchClient {
        if (!MeilisearchClient.instance) {
            MeilisearchClient.instance = new MeilisearchClient();
        }

        return MeilisearchClient.instance;
    }

    public getIndex(index: string): Index {
        return this.client.index(index);
    }

    async createIndex(indexName: string) {
        await this.client.createIndex(indexName);
        console.log("Creating index", indexName)
        if (this.instant_search.searchClient.initIndex) {
            console.log("InitIndex exists")
            this.instant_search.searchClient.initIndex(indexName);
        }

    }

    public getInstantSearchClient(): InstantMeiliSearchInstance {
        return this.instant_search.searchClient;
    }
}

export const meilisearchClient = MeilisearchClient.getInstance();