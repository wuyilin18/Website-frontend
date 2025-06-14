import React from "react";

interface Block {
  type: string;
  level?: number;
  children?: Array<{ type: string; text: string; bold?: boolean }>;
}

export default function StrapiContentRenderer({
  content,
}: {
  content: Block[];
}) {
  if (!Array.isArray(content)) return null;
  return (
    <div>
      {content.map((block, idx) => {
        if (block.type === "heading") {
          const tag = `h${block.level || 1}`;
          return React.createElement(
            tag,
            { key: idx, style: { fontWeight: "bold", margin: "1em 0" } },
            block.children?.map((c) => c.text).join("")
          );
        }
        if (block.type === "paragraph") {
          return (
            <p key={idx} style={{ margin: "0.5em 0" }}>
              {block.children?.map((c) => c.text).join("")}
            </p>
          );
        }
        // 其它类型可扩展
        return null;
      })}
    </div>
  );
}
