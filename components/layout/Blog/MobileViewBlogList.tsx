// components/layout/Blog/MobileViewBlogList.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader2 } from "lucide-react";

interface BlogItem {
    id: number;
    slug: string;
    title: string;
    description: string;
    thumbnail: string;
    thumbnailAlt: string | null;
    author: {
        name: string;
    };
    category: {
        name: string;
    };
    createdAt: string;
    timeToRead: string | null;
}

export function MobileViewBlogList() {
    const searchParams = useSearchParams();
    const [blogs, setBlogs] = useState<BlogItem[]>([]);
    const [loading, setLoading] = useState(true);

    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";

    useEffect(() => {
        fetchBlogs();
    }, [search, category]);

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            params.append("status", "PUBLISHED");

            if (search) {
                params.append("search", search);
            }
            if (category) {
                params.append("categoryId", category);
            }

            const response = await fetch(`/api/blogs?${params.toString()}`);
            const data = await response.json();

            if (data.success) {
                setBlogs(data.data);
            }
        } catch (error) {
            console.error("Error fetching blogs:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    if (loading) {
        return (
            <div className="lg:hidden flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    if (blogs.length === 0) {
        return (
            <div className="lg:hidden flex items-center justify-center py-16">
                <p className="text-slate-500">No blogs found</p>
            </div>
        );
    }

    return (
        <div className="lg:hidden space-y-4 mt-7.5">
            {blogs.map((blog) => (
                <Link key={blog.id} href={`/blogs/${blog.slug}`}>
                    <div className="relative group overflow-hidden rounded-lg">
                        <figure className="h-48 w-full overflow-hidden">
                            <Image
                                src={blog.thumbnail}
                                alt={blog.thumbnailAlt || blog.title}
                                width={1000}
                                height={1000}
                                className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                            />
                        </figure>
                        <div className="absolute w-full bottom-0 left-0 p-4 blog-page-gradient z-10">
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="text-xs font-helvetica-neue-roman font-light text-white bg-primary/80 px-2 py-1 rounded w-fit capitalize">{blog.category.name}</div>
                            </div>
                            <div className="text-sm leading-4 font-helvetica-medium font-medium text-white line-clamp-2 mb-2">{blog.title}</div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <ul className="flex items-center gap-1.5">
                                    <li>
                                        <p className="font-helvetica-neue-roman font-normal text-white text-xs leading-3.5">{blog.author.name}</p>
                                    </li>
                                    <li className="w-1 h-1 rounded-full bg-white"></li>
                                    <li>
                                        <p className="font-helvetica-neue-roman font-normal text-white text-xs leading-3.5">{formatDate(blog.createdAt)}</p>
                                    </li>
                                    <li className="w-1 h-1 rounded-full bg-white"></li>
                                    <li>
                                        <p className="font-helvetica-neue-roman font-normal text-white text-xs leading-3.5">{blog.timeToRead}</p>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
