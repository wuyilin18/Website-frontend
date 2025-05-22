"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeNotification } from "./ThemeNotification";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false);
  const [isChangingTheme, setIsChangingTheme] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<string | undefined>(
    undefined
  );
  const [userOverride, setUserOverride] = useState(false);
  const [isAutoModeActive, setIsAutoModeActive] = useState(false);

  // 根据系统时间设置主题
  const setThemeByTime = () => {
    // 如果用户已手动设置主题，则不进行自动切换
    if (userOverride) return;

    // 检查自动模式是否启用
    const autoMode = localStorage.getItem("themeAutoMode") === "true";
    if (!autoMode) return;

    if (typeof window !== "undefined") {
      const currentHour = new Date().getHours();
      const isDaytime = currentHour >= 6 && currentHour < 18; // 6:00 AM to 6:00 PM is daytime

      // 获取document元素来设置主题
      const doc = window.document.documentElement;
      const currentTheme = isDaytime ? "light" : "dark";

      if (isDaytime) {
        // 白天模式
        doc.classList.remove("dark");
        doc.classList.add("light");
      } else {
        // 夜间模式
        doc.classList.remove("light");
        doc.classList.add("dark");
      }

      // 保存主题设置
      localStorage.setItem("theme", currentTheme);

      // 更新主题状态
      setCurrentTheme(currentTheme);
    }
  };

  useEffect(() => {
    setMounted(true);
    setIsReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );

    // 检查用户是否已经手动设置了主题
    const hasUserOverride =
      localStorage.getItem("userThemeOverride") === "true";
    setUserOverride(hasUserOverride);

    // 检查自动模式是否启用
    const autoMode = localStorage.getItem("themeAutoMode") === "true";
    setIsAutoModeActive(autoMode && !hasUserOverride);

    // 只有当启用了自动模式且用户没有手动设置主题时，才根据时间自动设置
    if (autoMode && !hasUserOverride) {
      setThemeByTime();
    }

    // 设置定时检查时间变化 (每分钟检查一次)
    const intervalId = setInterval(() => {
      setThemeByTime();
    }, 60000);

    // 监听主题变更事件
    const handleThemeChange = (e: CustomEvent) => {
      const newTheme = e.detail?.theme;
      const isAutoMode = !!e.detail?.isAutoMode;

      if (!isReducedMotion) {
        setIsChangingTheme(true);
        setCurrentTheme(newTheme);
        setTimeout(() => setIsChangingTheme(false), 800);
      }

      if (isAutoMode) {
        // 启用自动模式
        setUserOverride(false);
        setIsAutoModeActive(true);
        localStorage.setItem("userThemeOverride", "false");
      } else {
        // 标记用户已手动设置了主题
        setUserOverride(true);
        setIsAutoModeActive(false);
        localStorage.setItem("userThemeOverride", "true");
      }
    };

    // 监听自动模式切换事件
    const handleAutoModeChange = () => {
      const autoMode = localStorage.getItem("themeAutoMode") === "true";
      const userOverrideValue =
        localStorage.getItem("userThemeOverride") === "true";

      setIsAutoModeActive(autoMode && !userOverrideValue);

      if (autoMode && !userOverrideValue) {
        setUserOverride(false);
        setThemeByTime(); // 立即应用基于时间的主题
      }
    };

    window.addEventListener("themechange", handleThemeChange as EventListener);
    window.addEventListener(
      "autoModeChange",
      handleAutoModeChange as EventListener
    );

    return () => {
      window.removeEventListener(
        "themechange",
        handleThemeChange as EventListener
      );
      window.removeEventListener(
        "autoModeChange",
        handleAutoModeChange as EventListener
      );
      clearInterval(intervalId);
    };
  }, [isReducedMotion, userOverride]);

  if (!mounted) {
    return (
      <div
        className={props.defaultTheme || "light"}
        style={{ visibility: "hidden" }}
      >
        {children}
      </div>
    );
  }

  return (
    <NextThemesProvider {...props} enableSystem={false}>
      {children}

      {/* Theme transition overlay */}
      <AnimatePresence>
        {isChangingTheme && !isReducedMotion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="fixed inset-0 z-[9999] pointer-events-none bg-black dark:bg-white"
          />
        )}
      </AnimatePresence>

      {/* Theme change notification */}
      <ThemeNotification theme={currentTheme} />
    </NextThemesProvider>
  );
}
