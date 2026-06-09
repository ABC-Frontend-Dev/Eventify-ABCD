"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import BlogTextReveal from "./BlogTextReveal";
import BlogListReveal from "./BlogListReveal";

gsap.registerPlugin(ScrollTrigger);

interface BlogContentProps {
    content: string;
}

export default function BlogContent({ content }: BlogContentProps) {
    const articleRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const article = articleRef.current;
        if (!article) return;

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
                duration: chars.length * 0.02, // total duration based on number of chars
            });
        });

        return () => {
            tl.scrollTrigger?.kill();
            tl.kill();
        };
    }, []);

    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    const nodes = Array.from(doc.body.childNodes);

    return (
        <article ref={articleRef} className="blog-page-wrapper">
            {nodes.map((node, index) => {
                const el = node as Element;

                if (node.nodeName === "P") {
                    const text = el.textContent || "";

                    if (!text.trim()) return null;

                    return <BlogTextReveal key={index} text={text} />;
                }

                if (node.nodeName === "UL") {
                    return <BlogListReveal key={index} html={el.outerHTML} ordered={false} />;
                }

                if (node.nodeName === "OL") {
                    return <BlogListReveal key={index} html={el.outerHTML} ordered={true} />;
                }

                return (
                    <div
                        key={index}
                        dangerouslySetInnerHTML={{
                            __html: el.outerHTML || node.textContent || "",
                        }}
                    />
                );
            })}
        </article>
    );
}
