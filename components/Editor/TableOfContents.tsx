// components/Editor/TableOfContents.tsx
"use client";

import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Heading {
    id: string;
    text: string;
    level: number;
}

interface TableOfContentsProps {
    content: string;
}

export default function TableOfContents({ content }: TableOfContentsProps) {
    const [headings, setHeadings] = useState<Heading[]>([]);
    const [activeId, setActiveId] = useState<string>("");

    useEffect(() => {
        // Extract headings from HTML content
        const extractHeadings = () => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(content, "text/html");
            const headingElements = doc.querySelectorAll("h1, h2, h3, h4, h5, h6");

            const extractedHeadings: Heading[] = [];
            headingElements.forEach((heading, index) => {
                const level = parseInt(heading.tagName.substring(1));
                const text = heading.textContent || "";
                const id = heading.id || `heading-${index}`;

                extractedHeadings.push({ id, text, level });
            });

            setHeadings(extractedHeadings);
        };

        if (content) {
            extractHeadings();
        } else {
            setHeadings([]);
        }
    }, [content]);

    const scrollToHeading = (id: string) => {
        setActiveId(id);
        // Note: This won't work in the editor preview, but will work in the actual blog page
    };

    if (headings.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </div>
                <p className="text-sm font-medium text-slate-600">No headings yet</p>
                <p className="text-xs text-slate-500 mt-1">Add headings to your content to see the table of contents</p>
            </div>
        );
    }

    return (
        <ScrollArea className="h-[calc(100vh-250px)]">
            <nav className="space-y-1">
                {headings.map((heading, index) => (
                    <button
                        key={index}
                        onClick={() => scrollToHeading(heading.id)}
                        className={`
                            w-full text-left px-3 py-2 rounded-md text-sm transition-colors
                            ${activeId === heading.id ? "bg-blue-100 text-blue-900 font-medium" : "text-slate-700 hover:bg-slate-100"}
                        `}
                        style={{
                            paddingLeft: `${(heading.level - 1) * 12 + 12}px`,
                        }}
                    >
                        <div className="flex items-start gap-2">
                            <span
                                className={`
                                    shrink-0 w-1.5 h-1.5 rounded-full mt-1.5
                                    ${activeId === heading.id ? "bg-blue-600" : "bg-slate-400"}
                                `}
                            />
                            <span className="line-clamp-2">{heading.text}</span>
                        </div>
                    </button>
                ))}
            </nav>
        </ScrollArea>
    );
}
