"use client";

interface BlogListRevealProps {
    html: string;
    ordered: boolean;
}

export default function BlogListReveal({ html, ordered }: BlogListRevealProps) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const items = Array.from(doc.querySelectorAll("li")).map((li) => li.textContent || "");

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
