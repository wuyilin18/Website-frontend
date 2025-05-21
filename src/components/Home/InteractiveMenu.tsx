// components/SmoothRightMenu.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

const menuItems = [
  { text: "Embedded Developer", href: "/embedded" },
  { text: "Web Developer", href: "/web" },
  { text: "Graphic Designer", href: "/graphic-design" },
  { text: "Music Enthusiast", href: "/music" },
  { text: "Anime Enthusiast", href: "/Anime" },
  { text: "Comic Enthusiast", href: "/Comic" },
];

export default function SmoothRightMenu() {
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  return (
    <div className="fixed right-0 mt-7 top-0 flex items-center pr-4">
      <nav className="text-right">
        <ul>
          {menuItems.map((item, index) => (
            <li
              key={index}
              onMouseEnter={() => setHoveredItem(index)}
              onMouseLeave={() => setHoveredItem(null)}
              className="transform transition-all duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
            >
              <Link href={item.href} className="block">
                <span
                  className={`
                    text-xl font-light inline-block mt-3
                    ${
                      hoveredItem === index
                        ? "text-2xl font-medium opacity-100 scale-1.3"
                        : hoveredItem === null
                        ? "opacity-100"
                        : "opacity-30 blur-[0.8px] scale-0.9"
                    }
                    transform transition-all duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)]
                  `}
                >
                  {item.text}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
