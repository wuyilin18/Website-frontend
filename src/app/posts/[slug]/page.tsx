import { Metadata } from "next";

// 定义参数类型
type Params = {
  slug: string;
};

// 为每篇文章生成元数据
export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  // 这里可以从API或数据库获取文章信息
  // 这是一个示例实现，实际使用时需要替换为真实的数据获取逻辑
  const article = {
    title: `${params.slug}`, // 使用slug作为标题（示例）
    description: `这是关于${params.slug}的详细文章`,
  };

  return {
    title: article.title, // 这将显示为 "文章标题 | 十八加十八"
    description: article.description,
    openGraph: {
      title: `${article.title} | 十八加十八`,
      description: article.description,
    },
  };
}

// 直接导出函数，让 Next.js 自动推断类型
export default function ArticlePage({ params }: { params: Params }) {
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">文章: {params.slug}</h1>
      <p>这里将显示文章内容...</p>
    </div>
  );
}
