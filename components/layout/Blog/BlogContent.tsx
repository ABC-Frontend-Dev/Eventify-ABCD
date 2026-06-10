// components/layout/Blog/BlogContent.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import BlogTextReveal from "./BlogTextReveal";
import BlogListReveal from "./BlogListReveal";

gsap.registerPlugin(ScrollTrigger);

interface BlogContentProps {
    content: string;
}

interface ParsedNode {
    index: number;
    tagName: string;
    text: string;
    html: string;
}

export default function BlogContent({ content }: BlogContentProps) {
    const articleRef = useRef<HTMLElement>(null);
    const [parsedNodes, setParsedNodes] = useState<ParsedNode[]>([]);

    // Parse content only on client side
    useEffect(() => {
        if (typeof window === "undefined") return;

        const parser = new DOMParser();
        const doc = parser.parseFromString(content, "text/html");
        const nodes = Array.from(doc.body.childNodes);

        const parsed: ParsedNode[] = nodes.map((node, index) => {
            const el = node as Element;
            return {
                index,
                tagName: node.nodeName,
                text: el.textContent || "",
                html: el.outerHTML || node.textContent || "",
            };
        });

        setParsedNodes(parsed);
    }, [content]);

    useEffect(() => {
        const article = articleRef.current;
        if (!article || parsedNodes.length === 0) return;

        const blocks = article.querySelectorAll<HTMLElement>(".blog-reveal-block");

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: article,
                start: "top 75%",
                end: "bottom bottom",
                scrub: 2,
            },
        });

        blocks.forEach((block) => {
            const chars = block.querySelectorAll(".reveal-char");

            tl.to(chars, {
                color: "var(--color-primary)",
                stagger: 0.02,
                ease: "none",
                duration: chars.length * 0.02,
            });
        });

        return () => {
            tl.scrollTrigger?.kill();
            tl.kill();
        };
    }, [parsedNodes]);

    // Show loading skeleton while parsing
    if (parsedNodes.length === 0) {
        return (
            <article ref={articleRef} className="blog-page-wrapper">
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
            </article>
        );
    }

    return (
        <article ref={articleRef} className="blog-page-wrapper">
            {parsedNodes.map((node) => {
                if (node.tagName === "P") {
                    const text = node.text || "";
                    if (!text.trim()) return null;
                    return <BlogTextReveal key={node.index} text={text} />;
                }

                if (node.tagName === "UL") {
                    return <BlogListReveal key={node.index} html={node.html} ordered={false} />;
                }

                if (node.tagName === "OL") {
                    return <BlogListReveal key={node.index} html={node.html} ordered={true} />;
                }

                return <div key={node.index} dangerouslySetInnerHTML={{ __html: node.html }} />;
            })}
        </article>
    );
}
