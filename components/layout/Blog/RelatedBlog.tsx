"use client";

import { Fragment } from "react";
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
    author?: { name: string } | null;
    category?: { name: string } | null;
}

interface RelatedBlogListProps {
    blogs: Blog[];
}

const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });

export function RelatedBlogList({ blogs }: RelatedBlogListProps) {
    if (!blogs.length) {
        return (
            <div className="mt-2 sm:mt-2.5 md:mt-3.25 lg:mt-3.75">
                <p className="text-sm text-slate-600 font-helvetica">No related blogs available</p>
            </div>
        );
    }

    return (
        <div className="mt-2 sm:mt-2.5 md:mt-3.25 lg:mt-3.75">
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {blogs.map((blog) => {
                    const metaItems = [blog.author?.name ?? "Eventify", formatDate(blog.createdAt), blog.timeToRead ?? null].filter(Boolean) as string[];

                    return (
                        <li key={blog.id} className="min-w-0 relative">
                            <Link href={`/blogs/${blog.slug}`} className="group block h-full">
                                {/* Category badge */}
                                <div className="absolute top-3 right-3 z-40 border border-primary/80 bg-primary/80 rounded-[6px] px-2 py-1 capitalize text-xs lg:text-sm font-helvetica tracking-wide font-light w-fit text-white">
                                    {blog.category?.name ?? "Blog"}
                                </div>

                                {/* Thumbnail */}
                                <figure className="h-60 sm:h-65 md:h-70 lg:h-80 w-full overflow-hidden">
                                    <Image
                                        src={blog.thumbnail}
                                        alt={blog.thumbnailAlt || blog.title}
                                        width={1000}
                                        height={1000}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                </figure>

                                {/* Overlay */}
                                <div className="absolute w-full bottom-0 left-0 p-3.5 blog-page-gradient z-10">
                                    <div className="text-sm lg:text-[16px] leading-4.5 lg:leading-5 font-helvetica-medium font-medium text-white line-clamp-2">{blog.title}</div>

                                    <div className="mt-2 lg:mt-2.75 flex items-center gap-3">
                                        <ul className="flex flex-wrap items-center gap-1.5">
                                            {metaItems.map((item, index) => (
                                                <Fragment key={`${blog.id}-${item}-${index}`}>
                                                    <li>
                                                        <p className="font-helvetica-neue-roman font-normal text-white text-xs leading-3.5">{item}</p>
                                                    </li>
                                                    {index < metaItems.length - 1 && <li className="w-1.5 h-1.5 rounded-full bg-white" />}
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
