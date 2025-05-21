"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { FiClock } from "react-icons/fi";
import TooltipPortal from "@/components/Home/TooltipPortal";

interface ThemeNavItemProps {
  windowWidth: number;
  delay?: number;
  animationType?: string;
}

export function ThemeNavItem({
  windowWidth,
  delay = 1000,
  animationType = "spring",
}: ThemeNavItemProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isTapped, setIsTapped] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const iconControls = useAnimation();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const navItemRef = useRef<HTMLDivElement>(null);

  // 初始化
  useEffect(() => {
    setMounted(true);
    setIsReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );

    // 检查是否在自动模式
    const storedAutoMode = localStorage.getItem("themeAutoMode") === "true";
    setAutoMode(storedAutoMode);

    // 监听自动模式变化
    const handleStorageChange = () => {
      const newAutoMode = localStorage.getItem("themeAutoMode") === "true";
      setAutoMode(newAutoMode);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // 根据窗口宽度计算动画参数
  const animationScale = windowWidth < 768 ? 1.05 : 1.1;
  const marginChange = windowWidth < 768 ? "0.5rem" : "0.75rem";

  // 切换主题
  const toggleTheme = () => {
    // 如果是自动模式，切换到手动模式，并保持当前主题
    if (autoMode) {
      localStorage.setItem("themeAutoMode", "false");
      localStorage.setItem("userThemeOverride", "true");
      setAutoMode(false);
      return;
    }

    // 否则在亮/暗模式间切换
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);

    // 标记用户已手动设置主题
    localStorage.setItem("userThemeOverride", "true");

    // 发送主题变更事件
    window.dispatchEvent(
      new CustomEvent("themechange", {
        detail: { theme: newTheme },
      })
    );
  };

  // 处理鼠标悬浮状态
  const handleMouseEnter = () => {
    setIsHovered(true);

    // 获取位置
    if (navItemRef.current) {
      setAnchorRect(navItemRef.current.getBoundingClientRect());
    }

    // 清除任何现有的计时器
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // 设置新的计时器
    timerRef.current = setTimeout(() => {
      setShowTooltip(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowTooltip(false);

    // 清除计时器
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // 监听滚动和调整大小以更新位置
  useEffect(() => {
    const updatePosition = () => {
      if (navItemRef.current && showTooltip) {
        setAnchorRect(navItemRef.current.getBoundingClientRect());
      }
    };

    window.addEventListener("scroll", updatePosition);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, [showTooltip]);

  // 为图标设置动画
  useEffect(() => {
    if (isHovered) {
      iconControls.start({
        scale: animationScale,
        margin: marginChange,
      });
    } else {
      iconControls.start({
        scale: 1,
        margin: "0.25rem",
      });
    }
  }, [isHovered, iconControls, animationScale, marginChange]);

  // 点击涟漪效果
  useEffect(() => {
    if (isTapped) {
      const timer = setTimeout(() => setIsTapped(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isTapped]);

  // 清理计时器
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  if (!mounted) {
    return <div className="w-10 h-10" />; // 占位元素
  }

  return (
    <div className="relative flex items-center justify-center" ref={navItemRef}>
      <button
        className="relative group"
        onClick={toggleTheme}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={() => {
          handleMouseEnter();
          setIsTapped(true);
        }}
        onTouchEnd={handleMouseLeave}
        aria-label="切换主题"
      >
        {/* 图标容器 */}
        <motion.div
          className={cn(
            "p-2 rounded-full relative overflow-hidden transition-colors",
            isHovered
              ? "bg-gray-200 dark:bg-gray-700 text-[#9D4EDD] dark:text-[#FF9470]"
              : "bg-transparent text-gray-600 dark:text-gray-400"
          )}
          animate={iconControls}
          transition={{
            type: animationType,
            bounce: 0.5,
          }}
          whileTap={{
            scale: 0.95,
          }}
        >
          {isTapped && (
            <motion.span
              className="absolute inset-0 bg-black/10 rounded-full"
              initial={{ opacity: 0.5, scale: 0 }}
              animate={{ opacity: 0, scale: 2 }}
              transition={{ duration: 0.3 }}
            />
          )}

          {/* 自动模式指示器 */}
          {autoMode && (
            <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#56CFE1] rounded-full flex items-center justify-center animate-pulse z-20">
              <FiClock className="w-1.5 h-1.5 text-white" />
            </div>
          )}

          {/* 主题图标 */}
          <div className="w-6 h-6 relative z-1 overflow-hidden rounded-full">
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
                      className="w-3 h-3 bg-gray-100 rounded-full absolute shadow-[0_0_5px_rgba(255,255,255,0.5)]"
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
                      className="w-3.5 h-3.5 bg-yellow-300 rounded-full shadow-[0_0_10px_rgba(255,204,0,0.8)]"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 电路背景 */}
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 40 40"
            className="absolute inset-0 pointer-events-none opacity-30"
          >
            <path
              d="M10,20 H15 C17,20 17,15 20,15 H25 C27,15 27,20 30,20"
              stroke="#9D4EDD"
              strokeWidth="0.7"
              fill="none"
              style={{ animationDuration: "3s" }}
            />
            <path
              d="M5,25 C10,23 15,27 20,25 C25,23 30,27 35,25"
              stroke="#9D4EDD"
              strokeWidth="0.5"
              strokeOpacity="0.5"
              fill="none"
            />
          </svg>
        </motion.div>
      </button>

      {/* 使用TooltipPortal组件 */}
      <TooltipPortal
        text={
          autoMode
            ? "自动切换主题中"
            : theme === "dark"
            ? "切换到亮色主题"
            : "切换到暗色主题"
        }
        anchorRect={anchorRect}
        isVisible={showTooltip}
      />
    </div>
  );
}
