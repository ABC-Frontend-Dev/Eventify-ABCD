// components/Editor/TableOfContents.tsx
"use client";

import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface HeadingItem {
    id: string;
    text: string;
    level: number;
}

interface TableOfContentsProps {
    headings: HeadingItem[];
    levels?: number[];
    showIndentation?: boolean;
}

export default function TableOfContents({ headings, levels, showIndentation = true }: TableOfContentsProps) {
    const [activeId, setActiveId] = useState<string>("");

    // Filter headings by levels if specified
    const filteredHeadings = levels ? headings.filter((h) => levels.includes(h.level)) : headings;

    const scrollToHeading = (id: string) => {
        setActiveId(id);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    if (filteredHeadings.length === 0) {
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
                {filteredHeadings.map((heading, index) => (
                    <button
                        key={`${heading.id}-${index}`}
                        onClick={() => scrollToHeading(heading.id)}
                        className={`
                            w-full text-left px-3 py-2 rounded-md text-sm transition-colors
                            ${activeId === heading.id ? "bg-blue-100 text-blue-900 font-medium" : "text-slate-700 hover:bg-slate-100"}
                        `}
                        style={{
                            paddingLeft: showIndentation ? `${(heading.level - 1) * 12 + 12}px` : "12px",
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
