"use client";

import { useMemo } from "react";

interface BlogListRevealProps {
    html: string;
    ordered: boolean;
}

export default function BlogListReveal({ html, ordered }: BlogListRevealProps) {
    const items = useMemo(() => {
        if (typeof window === "undefined") return [];

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        return Array.from(doc.querySelectorAll("li")).map((li) => li.textContent || "");
    }, [html]);

    const Tag = ordered ? "ol" : "ul";

    return (
        <Tag className={`${ordered ? "list-decimal" : "list-disc"} pl-3 lg:pl-3 mt-4`}>
            {items.map((item, i) => (
                <li key={i} className="mt-2 text-gray-700">
                    {item}
                </li>
            ))}
        </Tag>
    );
}
