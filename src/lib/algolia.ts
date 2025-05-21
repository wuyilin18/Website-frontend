import { createAlgoliaClient } from "./algoliaClient";

// 使用InstantSearch命令中的实际Algolia凭据
const ALGOLIA_APP_ID = "RUZHGLUF3V";
const ALGOLIA_SEARCH_API_KEY = "378c7137eca8f2b7a6625599c691fa2f";
const ALGOLIA_INDEX_NAME = "algolia_podcast_sample_dataset";

// 初始化客户端，并只导出需要使用的index
const { index } = createAlgoliaClient(
  ALGOLIA_APP_ID,
  ALGOLIA_SEARCH_API_KEY,
  ALGOLIA_INDEX_NAME
);

export interface SearchResult {
  objectID: string;
  title: string;
  content?: string;
  description?: string;
  slug?: string;
  imageUrl?: string;
  [key: string]: string | undefined;
}

export async function searchPosts(query: string): Promise<SearchResult[]> {
  if (!query || query.trim() === "") {
    return [];
  }

  try {
    const { hits } = await index.search<SearchResult>(query, {
      hitsPerPage: 10,
      attributesToRetrieve: ["objectID", "title", "description", "imageUrl"],
      attributesToHighlight: ["title", "description"],
    });

    return hits;
  } catch (error) {
    console.error("Algolia search error:", error);
    return [];
  }
}
