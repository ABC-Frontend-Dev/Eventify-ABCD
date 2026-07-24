// components/layout/HomeBlogs/TopReads.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { GoesOutComesInUnderline } from "@/components/ui/underline-animation";
import { Loader2, TrendingUp } from "lucide-react";

interface BlogItem {
    id: number;
    slug: string;
    title: string;
    description: string;
    thumbnail: string;
    thumbnailAlt: string | null;
    viewCount: number;
    author: {
        name: string;
    };
    category: {
        name: string;
    };
}

export default function TopReads() {
    const [blogs, setBlogs] = useState<BlogItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTopReads();
    }, []);

    const fetchTopReads = async () => {
        try {
            setLoading(true);
            // Fetch 5 blogs (we'll skip the first one which is featured)
            const response = await fetch("/api/blogs/top-reads?limit=5&days=0");
            const result = await response.json();

            if (result.success && result.data.length > 0) {
                // Skip the first blog (it's featured in FeaturedBlogsCard)
                // Take the next 4 blogs
                const topReadBlogs = result.data.slice(1, 5);
                setBlogs(topReadBlogs);
            } else {
                console.error("Failed to fetch top reads");
            }
        } catch (error) {
            console.error("Error fetching top reads:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-122.5 w-full relative">
                <div className="absolute -top-12 w-full flex items-end justify-between">
                    <h2 className="shrink-0 text-xl lg:text-4xl leading-8 font-helvetica-medium tracking-tight text-footer-bg">Top reads</h2>
                </div>
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                </div>
            </div>
        );
    }

    if (blogs.length === 0) {
        return (
            <div className="max-w-122.5 w-full relative">
                <div className="absolute -top-12 w-full flex items-end justify-between">
                    <h2 className="shrink-0 text-xl lg:text-4xl leading-8 font-helvetica-medium tracking-tight text-footer-bg">Top reads</h2>
                </div>
                <div className="text-center py-12 text-slate-500">
                    <p>No top reads available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-122.5 w-full relative">
            <div className="absolute -top-12 w-full flex items-end justify-between">
                <h2 className="shrink-0 text-xl lg:text-4xl leading-8 font-helvetica-medium tracking-tight text-footer-bg">Top reads</h2>
                <Link href="/blogs" className="shrink-0 text-base font-helvetica text-primary text-center overflow-hidden max-w-max w-fit block">
                    <GoesOutComesInUnderline label="View All" direction="right" className="" />
                </Link>
            </div>

            <div className="relative space-y-1.5">
                {/* Cards */}
                {blogs.map((blog) => {
                    const altText = blog.thumbnailAlt || blog.title;
                    const truncatedDescription = blog.description.substring(0, 80) + (blog.description.length > 80 ? "..." : "");

                    return (
                        <div key={blog.id} className="blog-card group relative w-full h-32.5 lg:h-41 overflow-hidden cursor-pointer">
                            <Link href={`/blogs/${blog.slug}`}>
                                <figure className="w-full h-full">
                                    <Image
                                        src={blog.thumbnail}
                                        width={1000}
                                        height={1000}
                                        alt={altText}
                                        className="w-full h-41 object-cover object-center transition-transform duration-500 group-hover:scale-101"
                                    />
                                </figure>

                                <div
                                    className="absolute inset-0 z-20 translate-y-full opacity-100 transition-transform duration-500 ease-in-out group-hover:translate-y-0"
                                    style={{ willChange: "transform" }}
                                >
                                    <div className="relative flex h-full w-full flex-col items-center justify-center bg-black/60 px-5 py-5 lg:px-12.75 lg:py-7.5">
                                        <p className="text-center text-base lg:text-xl leading-5.5 lg:leading-6 tracking-wide font-helvetica-medium text-white">{blog.title}</p>

                                        <p className="mt-2 text-center text-xs lg:text-sm leading-4 lg:leading-4.5 tracking-wider font-helvetica text-white/90">
                                            {blog.author.name} • {blog.category.name}
                                        </p>

                                        <p className="mt-3 text-center text-xs text-white/80 flex items-center justify-center gap-1">
                                            <TrendingUp className="h-3 w-3" />
                                            {blog.viewCount.toLocaleString()} views
                                        </p>

                                        <p className="mt-3 text-center text-xs lg:text-sm leading-4 lg:leading-4.5 tracking-wider font-helvetica text-white">{truncatedDescription}</p>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
