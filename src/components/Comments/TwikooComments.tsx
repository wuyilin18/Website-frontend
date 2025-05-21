"use client";

import React, { useEffect, useRef, useMemo } from "react";
import Script from "next/script";

interface TwikooProps {
  vercelUrl?: string; // Vercel 部署的 Twikoo 服务地址
  path?: string;
  title?: string;
  className?: string;
}

export const TwikooComments: React.FC<TwikooProps> = ({
  vercelUrl = "https://twikoo-api.wuyilin18.top/",
  path,
  title,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  // 使用 useMemo 创建稳定的配置对象
  const twikooConfig = useMemo(
    () => ({
      envId: vercelUrl,
      el: "#twikoo-comments",
      path:
        path || (typeof window !== "undefined" ? window.location.pathname : ""),
      lang: "zh-CN",
    }),
    [vercelUrl, path]
  );

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      containerRef.current &&
      !initialized.current
    ) {
      const initTwikoo = () => {
        try {
          window.twikoo?.init(twikooConfig);
          initialized.current = true;
        } catch (error) {
          console.error("Failed to initialize Twikoo:", error);
        }
      };

      if (window.twikoo) {
        initTwikoo();
      } else {
        window.addEventListener("twikoo:loaded", initTwikoo);
        return () => window.removeEventListener("twikoo:loaded", initTwikoo);
      }
    }
  }, [twikooConfig]); // 只依赖 twikooConfig 对象

  return (
    <div className={`twikoo-container ${className}`}>
      {title && (
        <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-200">
          {title}
        </h3>
      )}
      <Script
        src="https://cdn.staticfile.org/twikoo/1.6.22/twikoo.all.min.js"
        strategy="lazyOnload"
        onLoad={() => {
          window.dispatchEvent(new Event("twikoo:loaded"));
        }}
      />
      <div
        id="twikoo-comments"
        ref={containerRef}
        className="twikoo-comments-wrapper backdrop-blur-sm"
      ></div>
    </div>
  );
};

declare global {
  interface Window {
    twikoo: {
      init: (config: {
        envId: string;
        el: string;
        path?: string;
        region?: string;
        lang?: string;
        visitor?: boolean;
        [key: string]: string | boolean | undefined;
      }) => void;
    };
  }
}
