import algoliasearch, { type SearchClient } from "algoliasearch";
import { env } from "~/env";

class AlgoliaClient {
  private static instance: AlgoliaClient;

  private client: SearchClient;

  private constructor() {
    this.client = algoliasearch(env.NEXT_PUBLIC_ALGOLIA_ID, env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY);
  }

  public static getInstance(): AlgoliaClient {
    if (!AlgoliaClient.instance) {
      AlgoliaClient.instance = new AlgoliaClient();
    }

    return AlgoliaClient.instance;
  }

  public getClient(): SearchClient {
    return this.client;
  }
}

export const algoliaInstance = AlgoliaClient.getInstance();