"use client";

import { useEffect, useState, useCallback } from "react";
import { useTheme } from "next-themes";
import { Button } from "./button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { FiClock } from "react-icons/fi";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const { theme, setTheme } = useTheme();

  // 检查是否在自动模式
  useEffect(() => {
    // 从本地存储获取配置
    const storedAutoMode = localStorage.getItem("themeAutoMode") === "true";
    setAutoMode(storedAutoMode);
  }, []);

  // 初始化效果
  useEffect(() => {
    setMounted(true);
    setIsReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }, []);

  // 切换主题模式 (自动/手动)
  const toggleAutoMode = useCallback(() => {
    const newAutoMode = !autoMode;
    setAutoMode(newAutoMode);
    localStorage.setItem("themeAutoMode", String(newAutoMode));

    // 如果切换到自动模式，立即应用基于时间的主题并清除用户覆盖设置
    if (newAutoMode) {
      // 根据当前时间切换主题
      const currentHour = new Date().getHours();
      const isDaytime = currentHour >= 6 && currentHour < 18;
      const newTheme = isDaytime ? "light" : "dark";
      setTheme(newTheme);

      // 清除用户主题覆盖设置
      localStorage.setItem("userThemeOverride", "false");

      // 触发自动模式变更事件
      window.dispatchEvent(new Event("autoModeChange"));

      // 触发主题变更事件
      window.dispatchEvent(
        new CustomEvent("themechange", {
          detail: { theme: newTheme },
        })
      );
    }
  }, [autoMode, setTheme]);

  // 优化的主题切换处理
  const toggleTheme = useCallback(() => {
    // 只有在非自动模式下才允许手动切换
    if (!autoMode) {
      const newTheme = theme === "dark" ? "light" : "dark";
      setTheme(newTheme);

      // 标记用户已手动设置主题
      localStorage.setItem("userThemeOverride", "true");

      // Dispatch custom event when theme changes
      window.dispatchEvent(
        new CustomEvent("themechange", {
          detail: { theme: newTheme },
        })
      );
    } else {
      // 如果当前是自动模式，点击按钮会切换到手动模式并保持当前主题
      setAutoMode(false);
      localStorage.setItem("themeAutoMode", "false");
      localStorage.setItem("userThemeOverride", "true");
    }
  }, [theme, setTheme, autoMode]);

  if (!mounted) {
    return (
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" className="will-change-transform">
          <div className="w-6 h-6" /> {/* 占位元素 */}
        </Button>
        <Button variant="ghost" size="icon" className="will-change-transform">
          <div className="w-6 h-6" /> {/* 占位元素 */}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {/* 主题切换按钮 */}
      <motion.div
        layout
        transition={{
          type: "spring",
          stiffness: 350,
          damping: 25,
        }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={cn(
            "will-change-transform transition-colors duration-200 p-0 w-7 h-7",
            "rounded-full overflow-hidden",
            isHovered ? "bg-opacity-20" : "bg-transparent"
          )}
        >
          <div className="relative w-full h-full overflow-hidden rounded-full">
            <AnimatePresence mode="wait" initial={false}>
              {theme === "dark" ? (
                <motion.div
                  key="night-scene"
                  initial={
                    isReducedMotion
                      ? { opacity: 0 }
                      : { opacity: 0, scale: 0.8 }
                  }
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 w-full h-full"
                >
                  {/* Dark mode - Night scene */}
                  <div className="w-full h-full bg-gradient-to-b from-[#0f1729] to-[#2c3e50] rounded-full flex items-center justify-center relative">
                    {/* Moon */}
                    <motion.div
                      initial={{ x: -6 }}
                      animate={{ x: 0 }}
                      className="w-3.5 h-3.5 bg-gray-100 rounded-full absolute shadow-[0_0_5px_rgba(255,255,255,0.5)]"
                      style={{ top: "25%", left: "30%" }}
                    />
                    {/* Stars */}
                    {!isReducedMotion && (
                      <>
                        <motion.div
                          animate={{
                            opacity: [0.5, 1, 0.5],
                            scale: [0.8, 1, 0.8],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "reverse",
                          }}
                          className="w-0.5 h-0.5 bg-white rounded-full absolute"
                          style={{ top: "20%", right: "30%" }}
                        />
                        <motion.div
                          animate={{
                            opacity: [0.5, 1, 0.5],
                            scale: [0.8, 1, 0.8],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            repeatType: "reverse",
                            delay: 0.5,
                          }}
                          className="w-0.5 h-0.5 bg-white rounded-full absolute"
                          style={{ top: "40%", right: "20%" }}
                        />
                        <motion.div
                          animate={{
                            opacity: [0.5, 1, 0.5],
                            scale: [0.8, 1, 0.8],
                          }}
                          transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            repeatType: "reverse",
                            delay: 1,
                          }}
                          className="w-0.5 h-0.5 bg-white rounded-full absolute"
                          style={{ top: "30%", left: "20%" }}
                        />
                      </>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="day-scene"
                  initial={
                    isReducedMotion
                      ? { opacity: 0 }
                      : { opacity: 0, scale: 0.8 }
                  }
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 w-full h-full"
                >
                  {/* Light mode - Day scene */}
                  <div className="w-full h-full bg-gradient-to-b from-[#56CFE1] to-[#7FD3F2] rounded-full flex items-center justify-center relative">
                    {/* Sun */}
                    <motion.div
                      initial={{ y: 6 }}
                      animate={{ y: 0 }}
                      className="w-4 h-4 bg-yellow-300 rounded-full shadow-[0_0_10px_rgba(255,204,0,0.8)]"
                    />
                    {/* Clouds */}
                    {!isReducedMotion && (
                      <>
                        <motion.div
                          animate={{ x: [0, 3, 0] }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            repeatType: "reverse",
                          }}
                          className="absolute w-2.5 h-1.5 bg-white rounded-full left-1 top-2"
                        />
                        <motion.div
                          animate={{ x: [0, -2, 0] }}
                          transition={{
                            duration: 5,
                            repeat: Infinity,
                            repeatType: "reverse",
                          }}
                          className="absolute w-2 h-1 bg-white rounded-full right-1.5 top-1.5"
                        />
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <span className="sr-only">Toggle theme</span>
        </Button>
      </motion.div>

      {/* 自动模式按钮 */}
      <motion.div
        layout
        transition={{
          type: "spring",
          stiffness: 350,
          damping: 25,
        }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleAutoMode}
          className={cn(
            "will-change-transform transition-colors duration-200 p-0 w-7 h-7",
            "rounded-full overflow-hidden",
            autoMode
              ? "bg-[#56CFE1]/20 text-[#56CFE1]"
              : "bg-transparent text-gray-600 dark:text-gray-400"
          )}
        >
          <FiClock className="w-4 h-4" />
          <span className="sr-only">Toggle auto theme mode</span>
        </Button>
      </motion.div>
    </div>
  );
}
