"use client";

import React from "react";
import ArticleCard from "@/components/ArticleCard";

// 定义CoverImage类型
interface CoverImageType {
  id?: number;
  documentId?: string;
  url?: string;
  width?: number;
  height?: number;
  alternativeText?: string;
  data?: {
    id?: number;
    attributes?: {
      url?: string;
      formats?: Record<string, { url: string }>;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

// 定义更完整的 Post 类型接口，支持嵌套结构
interface Post {
  id: number;
  attributes?: {
    Title: string;
    Slug: string;
    PublishDate: string;
    Summary?: string;
    Content?: string;
    CoverImage?: CoverImageType;
    categories?: {
      data: Array<{
        id: number;
        attributes: {
          name: string;
        };
      }>;
    };
    tags?: {
      data: Array<{
        id: number;
        attributes: {
          name: string;
        };
      }>;
    };
  };
  // 支持扁平结构
  Title?: string;
  Slug?: string;
  PublishDate?: string;
  Summary?: string;
  Content?: string;
  CoverImage?: CoverImageType;
  categories?: Array<{ id: number; name: string }>;
  tags?: Array<{ id: number; name: string }>;
}

interface ArticleListProps {
  posts: {
    data: Post[];
  };
  className?: string; // 添加 className 属性
}

function getFullImageUrl(url?: string) {
  if (!url) return "https://cdn.wuyilin18.top/img/7245943.png";
  return url.startsWith("/uploads/") ? `http://localhost:1337${url}` : url;
}

export default function ArticleList({
  posts,
  className = "",
}: ArticleListProps) {
  // 日志输出实际数据结构
  console.log("文章数据 posts:", JSON.stringify(posts, null, 2));

  if (!posts.data || posts.data.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-lg text-gray-600 dark:text-gray-400">暂无文章</p>
      </div>
    );
  }
  // 合并默认网格布局和传入的类名
  const gridClasses = `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ${className}`;

  return (
    <div className={gridClasses}>
      {posts.data.map((post: Post) => {
        // 处理嵌套结构和扁平结构
        const title = post.attributes?.Title || post.Title || "无标题";
        const slug = post.attributes?.Slug || post.Slug || String(post.id);
        const publishDate =
          post.attributes?.PublishDate || post.PublishDate || "";

        // 处理分类信息
        let categories: string[] = ["未分类"];
        if (
          post.attributes?.categories?.data &&
          post.attributes.categories.data.length > 0
        ) {
          categories = post.attributes.categories.data.map(
            (cat) => cat.attributes.name
          );
        } else if (
          post.categories &&
          Array.isArray(post.categories) &&
          post.categories.length > 0
        ) {
          categories = post.categories.map((cat) => cat.name);
        }

        // 处理标签信息
        let tags: string[] = [];
        if (
          post.attributes?.tags?.data &&
          post.attributes.tags.data.length > 0
        ) {
          tags = post.attributes.tags.data.map((tag) => tag.attributes.name);
        } else if (post.tags && post.tags.length > 0) {
          tags = post.tags.map((tag) => tag.name);
        }

        // 处理封面图片 - 通用模板
        let image = "https://cdn.wuyilin18.top/img/7245943.png";
        if (post.CoverImage && typeof post.CoverImage.url === "string") {
          image = getFullImageUrl(post.CoverImage.url);
        } else if (post.CoverImage && post.CoverImage.data?.attributes?.url) {
          image = getFullImageUrl(post.CoverImage.data.attributes.url);
        }

        // 格式化日期
        const formattedDate = publishDate
          ? new Date(publishDate).toLocaleDateString("zh-CN")
          : "";

        return (
          <ArticleCard
            key={post.id}
            title={title}
            category={categories}
            date={formattedDate}
            tag={tags}
            image={image}
            slug={slug}
          />
        );
      })}
    </div>
  );
}
