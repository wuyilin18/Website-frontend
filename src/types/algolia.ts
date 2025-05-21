// Algolia types for use across the application

// Define the search result interface
export interface AlgoliaSearchResponse<T> {
  hits: T[];
  nbHits: number;
  page: number;
  nbPages: number;
  hitsPerPage: number;
  processingTimeMS: number;
  query: string;
  params: string;
}

// Podcast data structure in Algolia index
export interface AlgoliaPodcast {
  objectID: string;
  title: string;
  description: string;
  imageUrl?: string;
  publishedAt?: string;
  duration?: string;
  listens?: number;
  [key: string]: unknown;
}

// Type for Algolia index
export interface AlgoliaSearchIndex {
  search: <T>(
    query: string,
    options?: Record<string, unknown>
  ) => Promise<AlgoliaSearchResponse<T>>;
  getObject: <T>(objectID: string) => Promise<T>;
}

// Type for Algolia client
export interface AlgoliaSearchClient {
  initIndex: (indexName: string) => AlgoliaSearchIndex;
}

// Extend global Window interface
declare global {
  interface Window {
    algoliasearch?: (appId: string, apiKey: string) => AlgoliaSearchClient;
    algoliaIndex?: AlgoliaSearchIndex;
  }
}
