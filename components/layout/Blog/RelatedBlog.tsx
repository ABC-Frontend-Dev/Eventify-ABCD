// components/layout/Blog/RelatedBlog.tsx
"use client";

import { Fragment, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";

interface Blog {
    id: number;
    title: string;
    slug: string;
    description: string;
    thumbnail: string;
    thumbnailAlt?: string | null;
    createdAt: string;
    timeToRead?: string | null;
    author?: {
        name: string;
    } | null;
    category?: {
        name: string;
    } | null;
}

interface RelatedBlogListProps {
    blogs: Blog[];
    fallbackBlogs?: Blog[];
    currentBlogId?: number;
    currentBlogSlug?: string;
}

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

export function RelatedBlogList({ blogs, fallbackBlogs = [], currentBlogId, currentBlogSlug }: RelatedBlogListProps) {
    const displayBlogs = useMemo(() => {
        const source = blogs.length > 0 ? blogs : fallbackBlogs;
        const seen = new Set<string>();

        return source
            .filter((blog) => {
                if (currentBlogId !== undefined && blog.id === currentBlogId) return false;
                if (currentBlogSlug && blog.slug === currentBlogSlug) return false;

                const key = blog.slug || String(blog.id);
                if (seen.has(key)) return false;

                seen.add(key);
                return true;
            })
            .slice(0, 3);
    }, [blogs, fallbackBlogs, currentBlogId, currentBlogSlug]);

    if (displayBlogs.length === 0) {
        return (
            <div className="mt-3.75">
                <p className="text-sm text-slate-600 font-helvetica">No related blogs available</p>
            </div>
        );
    }

    return (
        <div className="mt-3.75">
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {displayBlogs.map((blog) => {
                    const metaItems = [blog.author?.name ?? "Eventify", formatDate(blog.createdAt), blog.timeToRead ?? null].filter(Boolean) as string[];

                    return (
                        <li key={blog.id} className="min-w-0 relative">
                            <Link href={`/blogs/${blog.slug}`} className="group block h-full">
                                <div className="absolute top-3 right-3 z-40 border border-primary/80 bg-primary/80 rounded-[6px] px-2 py-1 capitalize text-xs lg:text-sm font-helvetica tracking-wide font-light w-fit text-white">
                                    {blog.category?.name ?? "Blog"}
                                </div>

                                <figure className="h-80 w-full overflow-hidden">
                                    <Image
                                        src={blog.thumbnail}
                                        alt={blog.thumbnailAlt || blog.title}
                                        width={1000}
                                        height={1000}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                </figure>

                                <div className="absolute w-full bottom-0 left-0 p-3.5 blog-page-gradient z-10">
                                    <div className="text-sm lg:text-[16px] leading-4.5 lg:leading-5 font-helvetica-medium font-medium text-white line-clamp-2">{blog.title}</div>

                                    <div className="mt-2 lg:mt-2.75 flex items-center gap-3">
                                        <ul className="flex flex-wrap items-center gap-1.5">
                                            {metaItems.map((item, index) => (
                                                <Fragment key={`${blog.id}-${item}-${index}`}>
                                                    <li>
                                                        <p className="font-helvetica-neue-roman font-normal text-white text-xs leading-3.5">{item}</p>
                                                    </li>

                                                    {index < metaItems.length - 1 && <li className="w-1.5 h-1.5 rounded-full bg-white"></li>}
                                                </Fragment>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

/**
 * Optional backward-compatible sample component.
 * Keeps export name alive if used somewhere else.
 */
export function RelatedBlog() {
    const card: Blog[] = [
        {
            id: 1,
            slug: "how-to-choose-the-right-event-management-software",
            title: "How to Choose the Right Event Management Software",
            description: "Choosing the right event management software can make or break your workflow.",
            thumbnail: "/images/blogs/Group 48531.png",
            thumbnailAlt: "How to Choose the Right Event Management Software",
            createdAt: "2023-05-15",
            timeToRead: "5 min read",
            author: { name: "Eventify" },
            category: { name: "Events" },
        },
        {
            id: 2,
            slug: "best-practices-for-running-modern-events",
            title: "Best Practices for Running Modern Events",
            description: "A practical guide to planning and managing better event experiences.",
            thumbnail: "/images/blogs/Group 48531.png",
            thumbnailAlt: "Best Practices for Running Modern Events",
            createdAt: "2023-06-20",
            timeToRead: "4 min read",
            author: { name: "Eventify" },
            category: { name: "Events" },
        },
        {
            id: 3,
            slug: "ways-to-improve-attendee-engagement",
            title: "Ways to Improve Attendee Engagement",
            description: "Simple strategies to create stronger attendee interaction.",
            thumbnail: "/images/blogs/Group 48531.png",
            thumbnailAlt: "Ways to Improve Attendee Engagement",
            createdAt: "2023-07-10",
            timeToRead: "6 min read",
            author: { name: "Eventify" },
            category: { name: "Engagement" },
        },
    ];

    return <RelatedBlogList blogs={card} />;
}
