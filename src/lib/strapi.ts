// 与Strapi API交互的服务
import qs from "qs";

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL || "http://127.0.0.1:1337";

// 定义媒体对象的可能类型
type StrapiMediaObject = {
  url?: string;
  id?: number;
  width?: number;
  height?: number;
  alternativeText?: string;
  data?: {
    attributes?: {
      url?: string;
      formats?: Record<string, { url: string }>;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  attributes?: {
    url?: string;
    formats?: Record<string, { url: string }>;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

// 定义Strapi参数接口
interface StrapiParams {
  fields?: string[];
  sort?: string[];
  populate?: string | string[] | Record<string, unknown>;
  filters?: Record<string, unknown>;
  pagination?: Record<string, number>;
  [key: string]: unknown;
}

/**
 * 获取API URL
 * @param path API路径
 * @returns 完整的API URL
 */
const getStrapiURL = (path = "") => {
  return `${STRAPI_URL}${path}`;
};

/**
 * 检查Strapi服务器连接状态
 */
const checkStrapiConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(
      getStrapiURL("/api/posts?pagination[page]=1&pagination[pageSize]=1"),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(3000),
      }
    );
    return response.ok;
  } catch (error) {
    console.warn("Strapi服务器连接检查失败:", error);
    return false;
  }
};

/**
 * 验证 API 端点和参数
 */
export const validateAPIEndpoint = async () => {
  try {
    const testUrl = `${STRAPI_URL}/api/posts?pagination[page]=1&pagination[pageSize]=1`;
    console.log("测试 API URL:", testUrl);

    const response = await fetch(testUrl);
    const data = await response.json();

    console.log("API 测试响应:", {
      status: response.status,
      ok: response.ok,
      data: JSON.stringify(data, null, 2),
    });

    return response.ok;
  } catch (error) {
    console.error("API 验证失败:", error);
    return false;
  }
};

/**
 * 获取媒体URL
 * @param media 媒体对象
 * @returns 媒体URL
 */
export const getStrapiMedia = (
  media: StrapiMediaObject | string | null
): string | null => {
  if (!media) return null;

  try {
    // 处理包含直接url属性的对象（Strapi v5新格式）
    if (typeof media === "object" && media.url) {
      const url = media.url;
      return url.startsWith("/") ? getStrapiURL(url) : url;
    }

    // 处理直接的URL字符串
    if (typeof media === "string") {
      return media.startsWith("/") ? getStrapiURL(media) : media;
    }

    // 以下逻辑只处理对象类型的media
    const mediaObj = media as StrapiMediaObject;

    // 处理标准Strapi媒体对象
    if (
      mediaObj.data &&
      mediaObj.data.attributes &&
      mediaObj.data.attributes.url
    ) {
      const { url } = mediaObj.data.attributes;
      return url.startsWith("/") ? getStrapiURL(url) : url;
    }

    // Strapi v5可能返回的格式
    if (
      mediaObj.data &&
      Array.isArray(mediaObj.data) &&
      mediaObj.data[0]?.attributes?.url
    ) {
      const { url } = mediaObj.data[0].attributes;
      return url.startsWith("/") ? getStrapiURL(url) : url;
    }

    // 检查是否有attributes字段（无data嵌套）
    if (mediaObj.attributes && mediaObj.attributes.url) {
      const { url } = mediaObj.attributes;
      return url.startsWith("/") ? getStrapiURL(url) : url;
    }

    // 处理可能的formats字段
    if (mediaObj.data?.attributes?.formats?.thumbnail?.url) {
      const { url } = mediaObj.data.attributes.formats.thumbnail;
      return url.startsWith("/") ? getStrapiURL(url) : url;
    }

    console.warn("无法解析媒体对象:", JSON.stringify(mediaObj, null, 2));
    return null;
  } catch (error) {
    console.error("getStrapiMedia 错误:", error);
    return null;
  }
};

/**
 * 基础请求方法 - 增强版本
 * @param path API路径
 * @param urlParamsObject 查询参数对象
 * @param options 请求选项
 * @returns 响应数据
 */
export const fetchAPI = async (
  path: string,
  urlParamsObject = {},
  options = {}
) => {
  // 首先检查开发环境和连接状态
  if (process.env.NODE_ENV === "development") {
    const isConnected = await checkStrapiConnection();
    if (!isConnected) {
      console.warn("Strapi服务器未连接，返回模拟数据");
      return getMockData(path);
    }
  }

  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(10000),
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
  };

  // 使用qs构建查询参数
  const queryString = qs.stringify(urlParamsObject, {
    encodeValuesOnly: true,
  });

  const apiPath = path.startsWith("/api") ? path : `/api${path}`;
  const requestUrl = getStrapiURL(
    `${apiPath}${queryString ? `?${queryString}` : ""}`
  );

  console.log(`正在请求Strapi API: ${requestUrl}`);

  try {
    const response = await fetch(requestUrl, mergedOptions);
    console.log(`响应状态: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      // 尝试获取详细的错误信息
      let errorDetails = "";
      try {
        const errorData = await response.json();
        console.error("Strapi 错误响应:", JSON.stringify(errorData, null, 2));
        errorDetails = errorData.error?.message || JSON.stringify(errorData);
      } catch (e) {
        errorDetails = await response.text();
      }

      console.error(
        `Strapi API 响应错误: ${response.status} ${response.statusText}`,
        errorDetails
      );
      throw new Error(
        `Strapi API error: ${response.statusText} - ${errorDetails}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Strapi API 请求失败:`, error);

    if (process.env.NODE_ENV === "development") {
      console.log("网络错误，返回模拟数据...");
      return getMockData(path);
    }

    throw error;
  }
};

/**
 * 获取模拟数据
 * @param path API路径
 * @returns 模拟数据
 */
const getMockData = (path: string) => {
  console.log(`返回模拟数据 for path: ${path}`);

  if (path === "/posts" || path === "/api/posts") {
    return {
      data: [
        {
          id: 1,
          attributes: {
            Title: "模拟文章1",
            Content: "这是模拟的文章内容，因为无法连接到Strapi服务器。",
            Summary: "模拟文章摘要1",
            Slug: "mock-post-1",
            PublishDate: new Date().toISOString(),
            CoverImage: null,
            categories: { data: [] },
            tags: { data: [] },
          },
        },
        {
          id: 2,
          attributes: {
            Title: "模拟文章2",
            Content: "这是另一篇模拟的文章内容。",
            Summary: "模拟文章摘要2",
            Slug: "mock-post-2",
            PublishDate: new Date().toISOString(),
            CoverImage: null,
            categories: { data: [] },
            tags: { data: [] },
          },
        },
      ],
      meta: {
        pagination: { page: 1, pageSize: 10, pageCount: 1, total: 2 },
      },
    };
  }

  if (path === "/categories" || path === "/api/categories") {
    return {
      data: [
        {
          id: 1,
          attributes: {
            name: "技术",
            posts: { data: [] },
          },
        },
      ],
    };
  }

  if (path === "/tags" || path === "/api/tags") {
    return {
      data: [
        {
          id: 1,
          attributes: {
            name: "JavaScript",
            posts: { data: [] },
          },
        },
      ],
    };
  }

  return { data: null };
};

/**
 * 获取所有文章
 * @param params 查询参数
 * @returns 文章列表
 */
export const getPosts = async (params: StrapiParams = {}) => {
  console.log("调用getPosts, 参数:", JSON.stringify(params));

  try {
    // 构建查询参数
    const queryParams: StrapiParams = {
      sort: ["PublishDate:desc"],
      populate: "*", // 简化populate参数，避免复杂嵌套导致的400错误
      pagination: {
        page: 1,
        pageSize: 25,
      },
    };

    // 正确合并参数
    const mergedParams = {
      ...queryParams,
      ...params,
      // 特别处理分页参数
      pagination: {
        ...queryParams.pagination,
        ...(params.pagination || {}),
      },
    };

    // 如果传入了 limit 参数，转换为 pageSize
    if (params.pagination?.limit) {
      mergedParams.pagination.pageSize = params.pagination.limit;
      delete (mergedParams.pagination as any).limit;
    }

    console.log("最终API参数:", JSON.stringify(mergedParams));

    return await fetchAPI("/posts", mergedParams);
  } catch (error) {
    console.error("getPosts 错误:", error);

    // 如果请求失败，尝试最简单的请求
    console.log("尝试简化的请求...");
    try {
      return await fetchAPI("/posts", {
        pagination: {
          page: 1,
          pageSize:
            params.pagination?.pageSize || params.pagination?.limit || 5,
        },
      });
    } catch (fallbackError) {
      console.error("简化请求也失败了:", fallbackError);

      // 开发环境返回模拟数据
      if (process.env.NODE_ENV === "development") {
        return getMockData("/posts");
      }

      throw fallbackError;
    }
  }
};

/**
 * 获取单篇文章 - 增强版本
 * @param slug 文章别名
 * @returns 文章详情
 */
export async function getPostBySlug(slug: string) {
  try {
    console.log("getPostBySlug: 开始获取文章, slug:", slug);

    // 检查slug是否有效
    if (!slug || slug === "undefined") {
      console.error("getPostBySlug: slug无效:", slug);
      return null;
    }

    // 在开发环境下先检查连接
    if (process.env.NODE_ENV === "development") {
      const isConnected = await checkStrapiConnection();
      if (!isConnected) {
        console.log("getPostBySlug: Strapi未连接，返回模拟数据");
        return {
          Title: `模拟文章 - ${slug}`,
          Content:
            "这是模拟的文章内容，因为无法连接到Strapi服务器。您可以：\n\n1. 检查Strapi服务器是否正在运行\n2. 确认环境变量NEXT_PUBLIC_STRAPI_URL是否正确配置\n3. 检查网络连接是否正常",
          Summary: "模拟文章摘要",
          Slug: slug,
          PublishDate: new Date().toISOString(),
          CoverImage: null,
          categories: { data: [] },
          tags: { data: [] },
        };
      }
    }

    // 使用fetchAPI统一处理请求
    const params = {
      filters: {
        Slug: {
          $eq: slug,
        },
      },
      populate: "*",
    };

    const response = await fetchAPI("/posts", params);

    if (response.data && response.data.length > 0) {
      const post = response.data[0].attributes || response.data[0];
      console.log("getPostBySlug: 找到文章:", post.Title);
      return post;
    }

    console.log("getPostBySlug: 未找到文章");
    return null;
  } catch (error) {
    console.error(`getPostBySlug: 获取文章失败 (slug: ${slug})`, error);

    // 开发环境下返回模拟数据
    if (process.env.NODE_ENV === "development") {
      console.log("getPostBySlug: 发生错误，返回模拟数据");
      return {
        Title: `模拟文章 - ${slug}`,
        Content: `网络连接失败，显示模拟内容。\n\n错误信息: ${
          error instanceof Error ? error.message : "未知错误"
        }\n\n请检查：\n1. Strapi服务器是否运行在 ${STRAPI_URL}\n2. 网络连接是否正常\n3. 防火墙设置是否阻止了连接`,
        Summary: "模拟文章摘要（网络错误）",
        Slug: slug,
        PublishDate: new Date().toISOString(),
        CoverImage: null,
        categories: { data: [] },
        tags: { data: [] },
      };
    }

    return null;
  }
}
/**
 * 获取相关文章（基于标签）
 * @param currentSlug 当前文章的slug
 * @param tags 标签名称数组
 * @param limit 返回文章数量限制
 * @returns 相关文章列表
 */
export const getRelatedPosts = async (
  currentSlug: string,
  tags: string[],
  limit: number = 2
) => {
  console.log(
    "调用getRelatedPosts, 当前文章:",
    currentSlug,
    "标签:",
    tags,
    "限制:",
    limit
  );

  // 增强参数校验
  if (!currentSlug || currentSlug.trim() === "") {
    console.error("getRelatedPosts: currentSlug为空或无效!", {
      currentSlug,
      type: typeof currentSlug,
    });
    return [];
  }

  if (!tags || tags.length === 0) {
    console.log("getRelatedPosts: 没有标签，返回空数组");
    return [];
  }

  // 过滤掉空的标签名
  const validTags = tags.filter((tag) => tag && tag.trim() !== "");
  if (validTags.length === 0) {
    console.log("getRelatedPosts: 没有有效标签，返回空数组");
    return [];
  }

  console.log("getRelatedPosts: 使用有效标签:", validTags);

  try {
    // 在开发环境下先检查连接
    if (process.env.NODE_ENV === "development") {
      const isConnected = await checkStrapiConnection();
      if (!isConnected) {
        console.log("getRelatedPosts: Strapi未连接，返回模拟数据");
        return [
          {
            id: 1,
            Title: "模拟相关文章1",
            Summary: "这是模拟的相关文章摘要1",
            slug: "mock-related-1",
            PublishDate: new Date().toISOString(),
            CoverImage: null,
            tags: [{ id: 1, name: tags[0] }],
            categories: [],
          },
          {
            id: 2,
            Title: "模拟相关文章2",
            Summary: "这是模拟的相关文章摘要2",
            slug: "mock-related-2",
            PublishDate: new Date().toISOString(),
            CoverImage: null,
            tags: [{ id: 2, name: tags[0] }],
            categories: [],
          },
        ];
      }
    }

    // 构建标签过滤条件
    const tagFilters = tags.map((tag) => ({ name: { $eq: tag } }));

    const params: StrapiParams = {
      filters: {
        $and: [
          // 排除当前文章
          {
            Slug: {
              $ne: currentSlug,
            },
          },
          // 包含任意一个指定标签
          {
            tags: {
              $or: tagFilters,
            },
          },
        ],
      },
      populate: {
        CoverImage: true,
        tags: true,
        categories: true,
      },
      sort: ["PublishDate:desc"],
      pagination: {
        page: 1,
        pageSize: limit,
      },
    };

    console.log("getRelatedPosts: 请求参数:", JSON.stringify(params, null, 2));

    const response = await fetchAPI("/posts", params);

    if (!response.data || !Array.isArray(response.data)) {
      console.warn("getRelatedPosts: 响应数据格式不正确:", response);
      return [];
    }

    // 转换数据格式
    const relatedPosts = response.data.map((item: any) => {
      const attributes = item.attributes || item;
      return {
        id: item.id,
        Title: attributes.Title,
        Summary: attributes.Summary,
        Content: attributes.Content,
        slug: attributes.Slug,
        PublishDate: attributes.PublishDate,
        createdAt: attributes.createdAt,
        CoverImage: attributes.CoverImage,
        tags:
          attributes.tags?.data?.map((tag: any) => ({
            id: tag.id,
            name: tag.attributes?.name || tag.name,
          })) || [],
        categories:
          attributes.categories?.data?.map((category: any) => ({
            id: category.id,
            name: category.attributes?.name || category.name,
          })) || [],
      };
    });

    console.log(`getRelatedPosts: 找到 ${relatedPosts.length} 篇相关文章`);
    return relatedPosts;
  } catch (error) {
    console.error("getRelatedPosts: 获取相关文章时出错:", error);

    // 开发环境下返回模拟数据
    if (process.env.NODE_ENV === "development") {
      console.log("getRelatedPosts: 发生错误，返回模拟数据");
      return [
        {
          id: 1,
          Title: "模拟相关文章1（错误情况）",
          Summary: "这是模拟的相关文章摘要1",
          slug: "mock-related-error-1",
          PublishDate: new Date().toISOString(),
          CoverImage: null,
          tags: [{ id: 1, name: tags[0] || "默认标签" }],
          categories: [],
        },
      ];
    }

    return [];
  }
};
/**
 * 获取所有分类
 * @param params 查询参数
 * @returns 分类列表
 */
export const getCategories = async (params: StrapiParams = {}) => {
  console.log("调用getCategories, 参数:", JSON.stringify(params));

  return await fetchAPI("/categories", {
    ...params,
    populate: ["posts"],
    sort: ["name:asc"],
  });
};

/**
 * 获取单个分类
 * @param slug 分类别名
 * @param params 查询参数
 * @returns 分类详情
 */
export const getCategoryBySlug = async (
  slug: string,
  params: StrapiParams = {}
) => {
  console.log(
    "调用getCategoryBySlug, slug:",
    slug,
    "原始参数:",
    JSON.stringify(params)
  );

  if (!slug) {
    console.error("getCategoryBySlug: slug为空!");
    return null;
  }

  // 确保 slug 已解码
  let decodedSlug = slug;
  try {
    decodedSlug = decodeURIComponent(slug);
  } catch (e) {
    console.error("解码slug时出错:", e);
  }

  console.log("getCategoryBySlug: 使用解码后的slug:", decodedSlug);

  const filters = {
    name: {
      $eq: decodedSlug,
    },
  };

  const defaultParams: StrapiParams = {
    filters,
    populate: {
      "*": true,
      posts: {
        populate: {
          "*": true,
          CoverImage: true,
          categories: true,
          tags: true,
        },
      },
    },
  };

  const mergedParams: StrapiParams = {
    ...defaultParams,
    ...params,
    filters: {
      ...defaultParams.filters,
      ...(params.filters || {}),
    },
    populate: params.populate || defaultParams.populate,
  };

  console.log("合并后的参数:", JSON.stringify(mergedParams));

  try {
    const response = await fetchAPI("/categories", mergedParams);

    console.log("API响应:", JSON.stringify(response));

    if (!response.data || response.data.length === 0) {
      console.log(`未找到分类: "${decodedSlug}"`);
      return null;
    }

    const category = response.data[0];
    console.log(
      `找到分类: "${decodedSlug}", ID: ${category.id}, 文章数: ${
        category.posts?.length || 0
      }`
    );

    return category;
  } catch (error) {
    console.error("getCategoryBySlug 错误:", error);
    return null;
  }
};

/**
 * 获取所有标签
 * @param params 查询参数
 * @returns 标签列表
 */
export const getTags = async (params: StrapiParams = {}) => {
  console.log("调用getTags, 参数:", JSON.stringify(params));

  return await fetchAPI("/tags", {
    ...params,
    populate: ["posts"],
    sort: ["name:asc"],
  });
};

/**
 * 获取单个标签
 * @param slug 标签别名
 * @param params 查询参数
 * @returns 标签详情
 */
export const getTagBySlug = async (slug: string, params: StrapiParams = {}) => {
  console.log(
    "调用getTagBySlug, slug:",
    slug,
    "原始参数:",
    JSON.stringify(params)
  );

  if (!slug) {
    console.error("getTagBySlug: slug为空!");
    return null;
  }

  let decodedSlug = slug;
  try {
    decodedSlug = decodeURIComponent(slug);
  } catch (e) {
    console.error("解码slug时出错:", e);
  }

  console.log("getTagBySlug: 使用解码后的slug:", decodedSlug);

  const filters = {
    name: {
      $eq: decodedSlug,
    },
  };

  const defaultParams: StrapiParams = {
    filters,
    populate: { "*": true },
  };

  const mergedParams: StrapiParams = {
    ...defaultParams,
    ...params,
    filters: {
      ...defaultParams.filters,
      ...(params.filters || {}),
    },
  };

  console.log("合并后的参数:", JSON.stringify(mergedParams));

  try {
    const response = await fetchAPI("/tags", {
      filters: mergedParams.filters,
      populate: mergedParams.populate,
    });

    console.log("API响应:", JSON.stringify(response));

    if (!response.data || response.data.length === 0) {
      console.log(`未找到标签: "${decodedSlug}"`);
      return null;
    }

    const tag = response.data[0];
    console.log(
      `找到标签: "${decodedSlug}", ID: ${tag.id}, 文章数: ${
        tag.posts?.length || 0
      }`
    );

    return tag;
  } catch (error) {
    console.error("getTagBySlug 错误:", error);
    return null;
  }
};
