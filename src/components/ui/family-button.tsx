"use client";

import { FC, ReactNode, useState } from "react";
import { PlusIcon, XIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { cn } from "@/lib/utils";

const CONTAINER_SIZE = 200;
const CONTAINER_HEIGHT = 220; // 减小容器高度，仅保留足够的空间

interface FamilyButtonProps {
  children: React.ReactNode;
  position?: "bottom-right" | "custom";
  className?: string;
}

const FamilyButton: React.FC<FamilyButtonProps> = ({
  children,
  position = "bottom-right",
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleExpand = () => setIsExpanded(!isExpanded);

  return (
    <div
      className={cn(
        "rounded-[24px] border border-black/10 shadow-sm dark:border-neutral-800",
        "bg-gradient-to-b from-neutral-800 to-black overflow-hidden",
        isExpanded ? "w-[204px]" : "",
        position === "bottom-right" && "fixed bottom-8 right-8 z-50",
        className
      )}
    >
      <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.div
            key="expanded"
            initial={{
              borderRadius: 21,
              width: "4rem",
              height: "4rem",
              opacity: 0.8,
            }}
            animate={{
              borderRadius: 20,
              width: CONTAINER_SIZE,
              height: CONTAINER_HEIGHT,
              opacity: 1,
              transition: {
                type: "spring",
                damping: 25,
                stiffness: 400,
              },
            }}
            exit={{
              borderRadius: 21,
              width: "4rem",
              height: "4rem",
              opacity: 0,
              transition: {
                duration: 0.2,
              },
            }}
            className="flex flex-col"
          >
            {/* 上部分：内容容器 */}
            <div className="overflow-hidden bg-gradient-to-b from-neutral-800 to-black rounded-t-[22px] flex-1">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: {
                    delay: 0.2,
                    duration: 0.3,
                    ease: "easeOut",
                  },
                }}
                className="h-full"
              >
                {children}
              </motion.div>
            </div>

            {/* 下部分：关闭按钮容器 */}
            <div className="h-[50px] flex items-center justify-center bg-black">
              <motion.button
                initial={{ rotate: 180, scale: 0.8 }}
                animate={{
                  rotate: 0,
                  scale: 1,
                  transition: {
                    delay: 0.1,
                    duration: 0.3,
                  },
                }}
                onClick={toggleExpand}
                className="p-[10px] group bg-neutral-800 border border-neutral-700 hover:border-neutral-600 text-orange-50 rounded-full transition-colors duration-300"
              >
                <XIcon className="h-6 w-6 text-neutral-400 group-hover:text-neutral-300" />
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: 1,
              transition: {
                type: "spring",
                damping: 25,
                stiffness: 400,
              },
            }}
            exit={{
              opacity: 0,
              scale: 0.8,
              transition: {
                duration: 0.2,
              },
            }}
            className="w-16 h-16 rounded-full bg-gradient-to-b from-neutral-700 to-neutral-900 flex items-center justify-center cursor-pointer border border-neutral-800"
            onClick={toggleExpand}
          >
            <motion.div
              className="p-[10px] group bg-cyan-500 text-black border border-cyan-600 rounded-full shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <PlusIcon className="h-7 w-7" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// 简单的子组件用于组织内容
export const FamilyButtonContent: FC<{
  children: ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div className={cn("w-full h-full px-3 py-2 text-sm", className)}>
    {children}
  </div>
);

export { FamilyButton };
export default FamilyButton;
