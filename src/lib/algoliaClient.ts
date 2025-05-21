// Import Algolia using dynamic import to avoid TypeScript default export issues
import type { SearchClient } from "@algolia/client-search";

// 声明一个简化的AlgoliaSearchIndex接口
interface AlgoliaSearchIndex {
  search: <T>(
    query: string,
    options?: Record<string, unknown>
  ) => Promise<{ hits: T[] }>;
  getObject: <T>(objectID: string) => Promise<T>;
}

interface AlgoliaClient {
  searchClient: SearchClient;
  index: AlgoliaSearchIndex;
}

// 为algoliasearch定义类型签名
type AlgoliaSearchFunction = (
  appId: string,
  apiKey: string
) => {
  initIndex: (indexName: string) => AlgoliaSearchIndex;
};

// 在Window对象上声明algolia属性，解决TypeScript警告
declare global {
  interface Window {
    algoliasearch?: AlgoliaSearchFunction;
    algoliaIndex?: AlgoliaSearchIndex;
  }
}

export function createAlgoliaClient(
  appId: string,
  apiKey: string,
  indexName: string
): AlgoliaClient {
  // Use dynamic import for the Algolia client to avoid TypeScript issues
  // This function will be called only in the browser
  if (typeof window !== "undefined") {
    // 使用安全的动态导入模式
    const algoliasearch = window.algoliasearch;

    if (!algoliasearch) {
      console.error("Algolia search library not loaded");
      return {
        searchClient: {} as SearchClient,
        index: {
          search: () => Promise.resolve({ hits: [] }),
          getObject: () => Promise.resolve({}),
        } as AlgoliaSearchIndex,
      };
    }

    const searchClient = algoliasearch(appId, apiKey);
    const index = searchClient.initIndex(indexName);

    return { searchClient, index };
  }

  // Return a mock client for server-side rendering
  return {
    searchClient: {} as SearchClient,
    index: {
      search: () => Promise.resolve({ hits: [] }),
      getObject: () => Promise.resolve({}),
    } as AlgoliaSearchIndex,
  };
}
