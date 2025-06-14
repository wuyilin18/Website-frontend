"use client";

import Link from "next/link";
import PostImage from "@/components/PostImage";

interface Post {
  id: number;
  Title: string;
  Summary?: string;
  slug: string;
  PublishDate?: string;
  CoverImage?: any;
  tags: Array<{ id: number; name: string }>;
  categories: Array<{ id: number; name: string }>;
}

interface RelatedPostsProps {
  posts: Post[];
  apiUrl: string;
}

export const RelatedPosts = ({ posts, apiUrl }: RelatedPostsProps) => {
  if (!posts || posts.length === 0) {
    return null;
  }

  // 处理封面图片URL
  const getCoverImageUrl = (coverImage: any): string => {
    const defaultImage = "https://cdn.wuyilin18.top/img/7245943.png";

    if (!coverImage) return defaultImage;

    try {
      if (typeof coverImage === "string") {
        return coverImage.startsWith("/")
          ? `${apiUrl}${coverImage}`
          : coverImage;
      } else if (coverImage.url) {
        return coverImage.url.startsWith("/")
          ? `${apiUrl}${coverImage.url}`
          : coverImage.url;
      } else if (coverImage.data?.attributes?.url) {
        const url = coverImage.data.attributes.url;
        return url.startsWith("/") ? `${apiUrl}${url}` : url;
      }
    } catch (error) {
      console.error("处理封面图片时出错:", error);
    }

    return defaultImage;
  };

  return (
    <div className="mt-16 mb-12">
      {/* 装饰性分隔线 */}
      <div className="w-full flex justify-center mb-8">
        <div className="w-24 h-0.5 bg-gradient-to-r from-[#56CFE1] to-[#9D4EDD] dark:from-[#56CFE1] dark:to-[#FF9470] rounded-full opacity-50"></div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition-all duration-500 p-8 md:p-12 relative backdrop-blur-sm bg-opacity-60 dark:bg-opacity-40">
        {/* 渐变背景装饰 */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#56CFE1] to-[#9D4EDD] dark:from-[#56CFE1] dark:to-[#FF9470] opacity-5"></div>

        {/* 装饰性线条 */}
        <div className="absolute top-10 left-10 w-20 h-20 border-t border-l border-gray-300 dark:border-gray-600 opacity-30 rounded-tl-lg"></div>
        <div className="absolute bottom-10 right-10 w-20 h-20 border-b border-r border-gray-300 dark:border-gray-600 opacity-30 rounded-br-lg"></div>

        {/* 标题栏 */}
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-[#56CFE1] to-[#9D4EDD] dark:from-[#56CFE1] dark:to-[#FF9470] rounded-lg flex items-center justify-center mr-3 shadow-md">
              <svg
                className="w-4 h-4 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              喜欢这篇文章的人也看了
            </h2>
          </div>
          <Link
            href="/posts"
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm font-medium transition-colors duration-300"
          >
            随便逛逛
          </Link>
        </div>

        {/* 文章列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          {posts.map((post, index) => (
            <Link
              key={post.id}
              href={`/posts/${post.slug}`}
              className="group block"
            >
              <div className="bg-gray-100 dark:bg-gray-700/50 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                {/* 封面图片 */}
                <div className="aspect-video relative overflow-hidden">
                  <PostImage
                    src={getCoverImageUrl(post.CoverImage)}
                    alt={post.Title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {/* 渐变遮罩 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* 文章信息 */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    {post.Title}
                  </h3>

                  {post.Summary && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4">
                      {post.Summary}
                    </p>
                  )}

                  {/* 标签 */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag.id}
                          className="px-2 py-1 bg-gradient-to-r from-[#56CFE1]/20 to-[#9D4EDD]/20 dark:from-[#56CFE1]/20 dark:to-[#FF9470]/20 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium"
                        >
                          #{tag.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* 发布时间 */}
                  {post.PublishDate && (
                    <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                      {new Date(post.PublishDate).toLocaleDateString("zh-CN")}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* 装饰性背景图案 */}
        <div className="absolute top-4 right-4 w-16 h-16 opacity-10 pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="20" cy="20" r="2" className="fill-[#56CFE1]">
              <animate
                attributeName="opacity"
                values="0.3;1;0.3"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
            <circle
              cx="50"
              cy="30"
              r="1.5"
              className="fill-[#9D4EDD] dark:fill-[#FF9470]"
            >
              <animate
                attributeName="opacity"
                values="0.5;1;0.5"
                dur="2.5s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="80" cy="50" r="1" className="fill-[#56CFE1]">
              <animate
                attributeName="opacity"
                values="0.2;0.8;0.2"
                dur="3s"
                repeatCount="indefinite"
              />
            </circle>
          </svg>
        </div>
      </div>
    </div>
  );
};
