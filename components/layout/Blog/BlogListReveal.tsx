// components/layout/Blog/BlogListReveal.tsx
"use client";

import { useMemo } from "react";

interface BlogListRevealProps {
    html: string;
    ordered: boolean;
}

export default function BlogListReveal({ html, ordered }: BlogListRevealProps) {
    const items = useMemo(() => {
        // Only run DOMParser in the browser
        if (typeof window === "undefined") return [];

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        return Array.from(doc.querySelectorAll("li")).map((li) => li.textContent || "");
    }, [html]);

    const Tag = ordered ? "ol" : "ul";

    return (
        <Tag className={`blog-reveal-block ${ordered ? "list-decimal" : "list-disc"} pl-6 mt-4`}>
            {items.map((item, i) => (
                <li key={i} className="mt-2">
                    {item.split("").map((char, j) => (
                        <span
                            key={j}
                            className="reveal-char text-gray-400"
                            style={{
                                whiteSpace: char === " " ? "pre" : "normal",
                            }}
                        >
                            {char}
                        </span>
                    ))}
                </li>
            ))}
        </Tag>
    );
}
