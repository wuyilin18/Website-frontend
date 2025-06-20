import { createAlgoliaClient } from "./algoliaClient";

// 使用InstantSearch命令中的实际Algolia凭据
const ALGOLIA_APP_ID = "4KSBT528TD";
const ALGOLIA_SEARCH_API_KEY = "4c5827731a6ad8b7bc3063c61916c372";
const ALGOLIA_INDEX_NAME = "algolia_podcast_sample_dataset";

// 初始化客户端
const algoliaClient = createAlgoliaClient(
  ALGOLIA_APP_ID,
  ALGOLIA_SEARCH_API_KEY,
  ALGOLIA_INDEX_NAME
);

// 只导出需要使用的index
const index = algoliaClient ? algoliaClient.index : null;

export interface SearchResult {
  objectID: string;
  title: string;
  content?: string;
  summary?: string;
  slug?: string;
  imageUrl?: string;
  [key: string]: string | undefined;
}

export async function searchPosts(query: string): Promise<SearchResult[]> {
  if (!index || !query || query.trim() === "") {
    return [];
  }

  try {
    const { hits } = await index.search<SearchResult>(query, {
      hitsPerPage: 10,
      attributesToRetrieve: ["objectID", "title", "summary", "imageUrl"],
      attributesToHighlight: ["title", "summary"],
    });

    return hits;
  } catch (error) {
    console.error("Algolia search error:", error);
    return [];
  }
}
