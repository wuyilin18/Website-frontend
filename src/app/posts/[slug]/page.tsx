import { Metadata } from "next";
import { getPostBySlug } from "@/lib/strapi";
import Link from "next/link";
import PostImage from "@/components/PostImage";
import StrapiContentRenderer from "@/components/StrapiContentRenderer";
import "@/components/Comments/styles/twikoo-custom.css";
import { TwikooComments } from "@/components/Comments/TwikooComments";
import { AuthorBlock } from "@/components/post/AuthorBlock";
import { TableOfContents } from "@/components/post/TableOfContents";
import { ArticleTimeline } from "@/components/post/ArticleTimeline";
import {
  FamilyButton,
  FamilyButtonContent,
} from "@/components/ui/family-button";
import FullMusicPlayer from "@/components/FullMusicPlayerWrapper";
import { getRelatedPosts } from "@/lib/strapi";
import { RelatedPosts } from "@/components/post/RelatedPosts";

type Params = {
  slug: string;
};
type Category = { id: number; name: string };
type Tag = { id: number; name: string };

function checkApiUrl() {
  const apiUrl =
    process.env.NEXT_PUBLIC_STRAPI_URL || process.env.STRAPI_API_URL;
  if (!apiUrl) {
    console.warn("Strapi API URL 环境变量未设置，使用默认值");
  }
  return apiUrl || "http://localhost:1337";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const apiUrl = checkApiUrl();
  console.log(`使用Strapi API地址: ${apiUrl}`);

  const resolvedParams = await params;
  const post = await getPostBySlug(resolvedParams.slug);

  if (!post) {
    return {
      title: "文章不存在",
      description: "找不到请求的文章",
    };
  }

  return {
    title: post.Title,
    description: post.Summary || post.Title,
    openGraph: {
      title: `${post.Title} | 十八加十八`,
      description: post.Summary || post.Title,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const apiUrl = checkApiUrl();
  console.log(`使用Strapi API地址: ${apiUrl}`);

  const resolvedParams = await params;
  console.log("解析的参数:", resolvedParams);

  const post = await getPostBySlug(resolvedParams.slug);

  if (!post) {
    return (
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-6">文章不存在</h1>
        <p>
          找不到请求的文章 "{resolvedParams.slug}"，请返回
          <Link href="/posts" className="text-blue-500 hover:underline ml-1">
            文章列表
          </Link>
        </p>
      </div>
    );
  }

  // 封面图片处理
  let coverImageUrl = "https://cdn.wuyilin18.top/img/7245943.png";
  if (post.CoverImage) {
    try {
      if (typeof post.CoverImage === "string") {
        coverImageUrl = post.CoverImage.startsWith("/")
          ? `${apiUrl}${post.CoverImage}`
          : post.CoverImage;
      } else if (post.CoverImage.url) {
        coverImageUrl = post.CoverImage.url.startsWith("/")
          ? `${apiUrl}${post.CoverImage.url}`
          : post.CoverImage.url;
      } else if (post.CoverImage.data?.attributes?.url) {
        const url = post.CoverImage.data.attributes.url;
        coverImageUrl = url.startsWith("/") ? `${apiUrl}${url}` : url;
      }
    } catch (error) {
      console.error("处理封面图片时出错:", error);
    }
  }

  const categories: Category[] = post.categories || [];
  const tags: Tag[] = post.tags || [];

  // 获取相关文章
  const tagNames = tags.map((tag) => tag.name);

  // 添加调试日志和数据校验
  console.log("文章数据:", {
    title: post.Title,
    slug: post.Slug,
    slug_lowercase: post.slug,
    tags: tagNames,
  });

  // 使用正确的字段名 (Slug 而不是 slug)
  const currentSlug = post.Slug || post.slug || resolvedParams.slug;
  console.log("使用的 slug:", currentSlug);

  const relatedPosts =
    currentSlug && tagNames.length > 0
      ? await getRelatedPosts(currentSlug, tagNames, 2)
      : [];

  console.log("获取到的相关文章数量:", relatedPosts.length);

  return (
    <div className="min-h-screen w-full pt-28 md:pt-32 pb-20 bg-gradient-to-b from-[#f5f7fa] to-[#f7f9f7] dark:from-[#2a2c31] dark:to-[#232528] transition-colors duration-500">
      {/* CSS样式保持不变 */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translate3d(0, 10px, 0); }
          to { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        @keyframes floatUp {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes scaleIn {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-float-up {
          animation: floatUp 0.8s ease-out forwards;
        }
        .animate-scale-in {
          animation: scaleIn 0.8s ease-out forwards;
        }
        /* 其他动画样式... */
        `,
        }}
      />

      {/* 背景装饰保持不变 */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* 背景装饰代码保持不变 */}
      </div>

      <div className="container mx-auto px-4">
        {/* 新的布局结构 */}
        <div className="flex flex-col xl:flex-row gap-8 max-w-7xl mx-auto">
          {/* 主内容区域 */}
          <div className="flex-1 min-w-0">
            {/* 文章内容区域 - 使用 TracingBeam 包裹 */}
            <ArticleTimeline>
              <div
                id="article-content"
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition-all duration-500 p-8 md:p-12 relative backdrop-blur-sm bg-opacity-60 dark:bg-opacity-40 opacity-0 animate-scale-in"
                style={{
                  animationDelay: "0.3s",
                  boxShadow:
                    "0 10px 40px rgba(0, 0, 0, 0.05), 0 0 20px rgba(0, 0, 0, 0.03)",
                  border: "1px solid rgba(150, 150, 150, 0.1)",
                }}
              >
                {/* 装饰性线条 */}
                <div className="absolute top-10 left-10 w-20 h-20 border-t border-l border-gray-300 dark:border-gray-600 opacity-30 rounded-tl-lg"></div>
                <div className="absolute bottom-10 right-10 w-20 h-20 border-b border-r border-gray-300 dark:border-gray-600 opacity-30 rounded-br-lg"></div>

                {/* 文章头部 */}
                <div className="mb-8 relative z-10">
                  <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#505050] to-[#808080] dark:from-[#a0a0a0] dark:to-[#d0d0d0] animate-float-up">
                    {post.Title}
                  </h1>

                  {/* 发布时间 */}
                  {post.PublishDate && (
                    <div
                      className="text-gray-500 dark:text-gray-400 mb-4 animate-float-up"
                      style={{ animationDelay: "0.1s" }}
                    >
                      <span className="inline-flex items-center">
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        发布时间:{" "}
                        {new Date(post.PublishDate).toLocaleDateString("zh-CN")}
                      </span>
                    </div>
                  )}

                  {/* 分类 */}
                  {categories.length > 0 && (
                    <div
                      className="flex items-center mb-4 animate-float-up"
                      style={{ animationDelay: "0.2s" }}
                    >
                      <span className="mr-3 text-gray-600 dark:text-gray-400 font-medium">
                        分类:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                          <Link
                            key={category.id}
                            href={`/categories/${encodeURIComponent(
                              category.name
                            )}`}
                            className="px-4 py-2 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 text-green-800 dark:text-green-300 rounded-full text-sm font-medium hover:from-green-100 hover:to-green-200 dark:hover:from-green-800/30 dark:hover:to-green-700/30 transition-all duration-300 transform hover:scale-105 hover:shadow-md"
                          >
                            {category.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 标签 */}
                  {tags.length > 0 && (
                    <div
                      className="flex items-center animate-float-up"
                      style={{ animationDelay: "0.3s" }}
                    >
                      <span className="mr-3 text-gray-600 dark:text-gray-400 font-medium">
                        标签:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <Link
                            key={tag.id}
                            href={`/tags/${encodeURIComponent(tag.name)}`}
                            className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600/50 transition-all duration-300 transform hover:scale-105 border border-gray-200 dark:border-gray-600"
                          >
                            #{tag.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 封面图片 */}
                {coverImageUrl && (
                  <div
                    className="mb-10 rounded-xl overflow-hidden shadow-lg animate-scale-in"
                    style={{ animationDelay: "0.4s" }}
                  >
                    <PostImage
                      src={coverImageUrl}
                      alt={post.Title || "文章封面"}
                    />
                  </div>
                )}

                {/* 文章摘要 */}
                {post.Summary && (
                  <div
                    className="mb-10 p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/30 dark:to-gray-600/30 rounded-xl border-l-4 border-green-500 dark:border-green-400 animate-float-up"
                    style={{ animationDelay: "0.5s" }}
                  >
                    <p className="text-gray-700 dark:text-gray-300 italic text-lg leading-relaxed">
                      {post.Summary}
                    </p>
                  </div>
                )}

                {/* 文章内容 */}
                <div
                  className="prose prose-lg dark:prose-invert max-w-none animate-float-up"
                  style={{ animationDelay: "0.6s" }}
                >
                  <div className="relative">
                    {Array.isArray(post.Content) && post.Content[0]?.type ? (
                      <StrapiContentRenderer content={post.Content} />
                    ) : Array.isArray(post.Content) ? (
                      post.Content.map((line: string | object, idx: number) => {
                        if (
                          typeof line === "string" &&
                          line.match(/^https?:\/\/.+\.(jpg|png|jpeg|webp)$/i)
                        ) {
                          return (
                            <div
                              key={idx}
                              className="my-8 rounded-lg overflow-hidden shadow-md"
                            >
                              <img
                                src={line}
                                alt=""
                                className="w-full max-w-3xl mx-auto"
                              />
                            </div>
                          );
                        }
                        return (
                          <p key={idx} className="mb-4 leading-relaxed">
                            {typeof line === "string"
                              ? line
                              : JSON.stringify(line)}
                          </p>
                        );
                      })
                    ) : typeof post.Content === "string" ? (
                      post.Content.split("\n").map(
                        (line: string, idx: number) => {
                          if (
                            line.match(/^https?:\/\/.+\.(jpg|png|jpeg|webp)$/i)
                          ) {
                            return (
                              <div
                                key={idx}
                                className="my-8 rounded-lg overflow-hidden shadow-md"
                              >
                                <img
                                  src={line}
                                  alt=""
                                  className="w-full max-w-3xl mx-auto"
                                />
                              </div>
                            );
                          }
                          return (
                            <p key={idx} className="mb-4 leading-relaxed">
                              {line}
                            </p>
                          );
                        }
                      )
                    ) : (
                      <div className="text-gray-500 dark:text-gray-400 italic text-center py-12">
                        {process.env.NODE_ENV === "development"
                          ? "开发模式：Strapi服务器未连接，显示模拟内容"
                          : "这里将显示文章内容..."}
                      </div>
                    )}
                  </div>
                </div>

                {/* 在文章内容结束后，评论区之前添加相关文章推荐 */}
                {relatedPosts.length > 0 && (
                  <RelatedPosts posts={relatedPosts} apiUrl={apiUrl} />
                )}

                {/* 底部装饰 */}
                <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-center space-x-4 text-gray-500 dark:text-gray-400">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <rect
                        x="6"
                        y="6"
                        width="12"
                        height="12"
                        rx="1"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                    </svg>
                    <span className="text-sm">硅原游牧 · 云端数字史诗</span>
                  </div>
                </div>

                {/* 评论区域 */}
                <div className="mt-12 mb-20">
                  <div className="w-full flex justify-center mb-8">
                    <div className="w-24 h-0.5 bg-gradient-to-r from-[#56CFE1] to-[#9D4EDD] dark:from-[#56CFE1] dark:to-[#FF9470] rounded-full opacity-50"></div>
                  </div>
                  <div className="w-full relative max-w-4xl mx-auto">
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#56CFE1] to-[#9D4EDD] dark:from-[#56CFE1] dark:to-[#FF9470] rounded-lg blur-sm opacity-15"></div>
                    <div className="relative w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-6 overflow-hidden border border-gray-100 dark:border-gray-700">
                      {/* 墨水滴装饰 - 右上角 */}
                      <div className="absolute top-6 right-6 w-24 h-24 pointer-events-none opacity-10">
                        <svg
                          viewBox="0 0 100 100"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M50,10 C65,10 80,25 90,45 C95,65 85,85 50,90 C15,85 5,65 10,45 C20,25 35,10 50,10 Z"
                            fill="currentColor"
                            className="text-gray-700 dark:text-gray-300"
                          />
                        </svg>
                      </div>

                      {/* 墨水滴装饰 - 左下角 */}
                      <div className="absolute bottom-8 left-8 w-16 h-16 pointer-events-none opacity-10 rotate-45">
                        <svg
                          viewBox="0 0 100 100"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M50,10 C65,10 80,25 90,45 C95,65 85,85 50,90 C15,85 5,65 10,45 C20,25 35,10 50,10 Z"
                            fill="currentColor"
                            className="text-gray-700 dark:text-gray-300"
                          />
                        </svg>
                      </div>
                      <div className="mb-6 relative z-10">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                          <span className="w-8 h-8 rounded-full bg-gradient-to-r from-[#56CFE1] to-[#9D4EDD] dark:from-[#56CFE1] dark:to-[#FF9470] flex items-center justify-center text-white mr-3">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="w-5 h-5"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                          留言板 ✨
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-sm ml-11">
                          欢迎来到我的留言板，留下你的足迹，与我分享你的想法和感受。
                        </p>
                        <p className="text-gray-400 dark:text-gray-500 text-sm ml-15 mt-2">
                          点击文本框会有惊喜哦`(｡•̀ᴗ-)✧
                        </p>
                      </div>

                      <div className="relative z-10">
                        <TwikooComments vercelUrl="https://twikoo-api.wuyilin18.top/" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ArticleTimeline>

            {/* 音乐播放器 */}
            <FamilyButton>
              <FamilyButtonContent>
                <FullMusicPlayer />
              </FamilyButtonContent>
            </FamilyButton>
          </div>

          {/* 右侧边栏 */}
          <div className="hidden xl:block xl:w-80 flex-shrink-0 space-y-6">
            <AuthorBlock />
            <TableOfContents />
          </div>
        </div>

        {/* 移动端侧边栏内容 */}
        <div className="xl:hidden mt-8 space-y-6">
          <AuthorBlock />
          <TableOfContents />
        </div>
      </div>
    </div>
  );
}
