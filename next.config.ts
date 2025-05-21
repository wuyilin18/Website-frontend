import type { NextConfig } from "next";
import webpack from "webpack";
const getSharpAdapter = async () => {
  return (await import("responsive-loader/sharp")).default;
};

const nextConfig: NextConfig = {
  // 启用生产环境源地图（按需）
  productionBrowserSourceMaps: false, // 设为 false 可以减少内存使用

  // 图片优化配置
  images: {
    domains: [
      "cdn.wuyilin18.top",
      "p1.music.126.net",
      "ws.stream.qqmusic.qq.com",
      "y.gtimg.cn",
    ],
    deviceSizes: [640, 750, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96],
    minimumCacheTTL: 86400,
    formats: ["image/webp"], // 优先使用 webp 格式
  },

  // 实验性功能
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
    workerThreads: true, // 启用多线程构建
    cpus: 4, // 使用 4 个 CPU 核心
    // 如果使用 Next.js 13+ 可以添加这些优化
    optimizeServerReact: true,
    disableOptimizedLoading: false,
  },

  // 关闭类型检查（开发时）
  typescript: {
    ignoreBuildErrors: false, // 设为 true 可以加快构建但会跳过类型检查
  },

  // Webpack 配置
  webpack: async (config, { isServer, dev }) => {
    // 只在生产环境使用 responsive-loader
    if (!dev && !isServer) {
      const adapter = await getSharpAdapter();
      config.module.rules.push({
        test: /\.(png|jpg|jpeg|webp)$/i,
        use: [
          {
            loader: "responsive-loader",
            options: {
              adapter,
              sizes: [300, 600, 1200, 2000],
              placeholder: true,
              placeholderSize: 20,
              // 添加缓存避免重复处理
              cacheDirectory: true,
              cacheIdentifier: "responsive-loader",
            },
          },
        ],
      });
    }

    // 优化 moment.js 等库的本地化文件
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/locale$/,
        contextRegExp: /moment$/,
      })
    );

    return config;
  },

  // 构建输出配置
  eslint: {
    ignoreDuringBuilds: true, // 构建时忽略 ESLint
  },
};

export default nextConfig;
