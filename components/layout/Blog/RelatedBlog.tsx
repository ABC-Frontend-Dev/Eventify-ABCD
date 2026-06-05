// components/layout/Blog/RelatedBlog.tsx
"use client";

import Link from "next/link";

interface Blog {
    id: number;
    title: string;
    slug: string;
    description: string;
    thumbnail: string;
    createdAt: Date;
}

interface RelatedBlogListProps {
    blogs: Blog[];
}

export function RelatedBlogList({ blogs }: RelatedBlogListProps) {
    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        }).format(new Date(date));
    };

    // Truncate text helper
    const truncate = (text: string, maxLength: number) => {
        if (text.length <= maxLength) return text;
        return text.slice(0, maxLength) + "...";
    };

    if (blogs.length === 0) {
        return (
            <div className="mt-3.75">
                <p className="text-sm text-slate-600 font-helvetica">No related blogs available</p>
            </div>
        );
    }

    return (
        <ul className="mt-3.75 space-y-4.25">
            {blogs.map((item) => (
                <li key={item.id}>
                    <Link href={`/blog/${item.slug}`} className="group relative block">
                        <div className="flex flex-row items-center">
                            <div className="shrink-0 h-32.5 w-32.5 overflow-hidden">
                                <img src={item.thumbnail} alt={item.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                            </div>
                            <div className="ml-3.75">
                                <p className="font-helvetica font-semibold text-base leading-5 tracking-wider text-shadow-slate-600">{formatDate(item.createdAt)}</p>
                                <p className="mt-1 font-product-sans-light font-semibold text-lg leading-6 tracking-wider group-hover:text-primary transition-colors">{truncate(item.title, 45)}</p>
                            </div>
                        </div>
                    </Link>
                </li>
            ))}
        </ul>
    );
}

// Keep the old component for backward compatibility if needed elsewhere
export function RelatedBlog() {
    const card = [
        {
            id: 1,
            name: "How to Choose the Right Event Manageme...",
            description: "Choosing the right event management software can make or break yo...",
            image: "/images/blogs/Group 48531.png",
            date: "May 15, 2023",
        },
        {
            id: 2,
            name: "How to Choose the Right Event Manageme...",
            description: "Choosing the right event management software can make or break yo...",
            image: "/images/blogs/Group 48531.png",
            date: "June 20, 2023",
        },
    ];

    return (
        <ul className="mt-3.75 space-y-4.25">
            {card.map((item) => (
                <li key={item.id}>
                    <div className="group relative">
                        <div className="flex flex-row items-center">
                            <div className="shrink-0 h-32.5 w-32.5 overflow-hidden">
                                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                            </div>
                            <div className="ml-3.75">
                                <p className="font-helvetica font-semibold text-base leading-5 tracking-wider text-shadow-slate-600">{item.date}</p>
                                <p className="mt-1 font-product-sans-light font-semibold text-lg leading-6 tracking-wider">{item.name}</p>
                            </div>
                        </div>
                    </div>
                </li>
            ))}
        </ul>
    );
}
