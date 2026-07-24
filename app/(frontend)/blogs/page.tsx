// app/(frontend)/blog/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import BlogListHeader from "@/components/layout/Blog/BlogListHeader";
import { EmblaCarousel } from "@/components/layout/Blog/BlogListCarouselCard";
import { MobileViewBlogList } from "@/components/layout/Blog/MobileViewBlogList";
import Image from "next/image";
import Link from "next/link";
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

function BlogListContent() {
    const searchParams = useSearchParams();
    const [blogs, setBlogs] = useState<BlogItem[]>([]);
    const [carouselBlogs, setCarouselBlogs] = useState<BlogItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [carouselLoading, setCarouselLoading] = useState(true);

    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";

    useEffect(() => {
        fetchFilteredBlogs();
    }, [search, category]);

    // Carousel is intentionally independent of search/category — it always
    // shows the latest published blogs, per your answer above.
    useEffect(() => {
        fetchCarouselBlogs();
    }, []);

    const fetchFilteredBlogs = async () => {
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

    const fetchCarouselBlogs = async () => {
        try {
            setCarouselLoading(true);
            const response = await fetch("/api/blogs?status=PUBLISHED&sortBy=latest&limit=20");
            const data = await response.json();

            if (data.success) {
                setCarouselBlogs(data.data);
            }
        } catch (error) {
            console.error("Error fetching carousel blogs:", error);
        } finally {
            setCarouselLoading(false);
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const displayBlogs = blogs.slice(0, 4); // Show max 4 blogs in the featured section

    const renderBlogCards = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                </div>
            );
        }

        if (displayBlogs.length === 0) {
            return (
                <div className="flex items-center justify-center py-16">
                    <p className="text-slate-500">No blogs found</p>
                </div>
            );
        }

        // 4+ results: 1 large featured card + 3-card grid (your current layout)
        if (displayBlogs.length >= 4) {
            return (
                <div className="flex items-start justify-center flex-col lg:flex-row gap-5">
                    {/* Left: First large blog */}
                    <div className="max-w-full lg:max-w-157.5 w-full h-full relative">
                        <Link href={`/blog/${displayBlogs[0].slug}`}>
                            <div className="absolute top-3 lg:top-5 right-3 lg:right-5 z-40 border border-primary/80 bg-primary/80 rounded-[6px] p-2 lg:p-2.5 capitalize text-xs lg:text-sm font-product-sans-medium font-light w-fit text-white">
                                {displayBlogs[0].category.name}
                            </div>
                            <figure className="h-68.5 lg:h-142.25 w-full overflow-hidden relative after:absolute after:w-full after:h-full after:inset-0 after:bg-black/20 after:pointer-events-none">
                                <Image src={displayBlogs[0].thumbnail} alt={displayBlogs[0].thumbnailAlt || displayBlogs[0].title} width={1000} height={1000} className="h-full w-full object-cover" />
                            </figure>
                            <div className="absolute w-full bottom-0 left-0 p-5 blog-page-gradient z-10">
                                <div className="text-sm lg:text-[20px] leading-4.5 lg:leading-6.5 tracking-wide font-product-sans-bold font-extralight text-white line-clamp-2">
                                    {displayBlogs[0].title}
                                </div>
                                <div className="hidden lg:block mt-2 text-sm leading-4 tracking-wide text-white font-helvetica font-light">{displayBlogs[0].description}</div>
                                <div className="mt-2 lg:mt-2.75 flex items-center gap-3">
                                    <ul className="flex items-center gap-1.5">
                                        <li>
                                            <p className="font-product-sans-medium font-normal text-white text-xs leading-3.5">{displayBlogs[0].author.name}</p>
                                        </li>
                                        <li className="w-1.5 h-1.5 rounded-full bg-white"></li>
                                        <li>
                                            <p className="font-product-sans-medium font-normal text-white text-xs leading-3.5">{formatDate(displayBlogs[0].createdAt)}</p>
                                        </li>
                                        <li className="w-1.5 h-1.5 rounded-full bg-white"></li>
                                        <li>
                                            <p className="font-product-sans-medium font-normal text-white text-xs leading-3.5">{displayBlogs[0].timeToRead}</p>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Right: Grid of 3 blogs */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 grid-rows-3 lg:grid-rows-2 gap-y-5 lg:gap-5">
                        {displayBlogs[1] && (
                            <div className="col-span-2 relative">
                                <Link href={`/blog/${displayBlogs[1].slug}`}>
                                    <div className="absolute top-3 lg:top-5 right-3 lg:right-5 z-40 border border-primary/80 bg-primary/80 rounded-[6px] p-2 lg:p-2.5 capitalize text-xs lg:text-sm font-product-sans-medium font-light w-fit text-white">
                                        {displayBlogs[1].category.name}
                                    </div>
                                    <figure className="h-68.5 max-w-157.5 w-full overflow-hidden">
                                        <Image
                                            src={displayBlogs[1].thumbnail}
                                            alt={displayBlogs[1].thumbnailAlt || displayBlogs[1].title}
                                            width={1000}
                                            height={1000}
                                            className="h-full w-full object-cover"
                                        />
                                    </figure>
                                    <div className="absolute w-full bottom-0 left-0 px-5 py-[14.67px] blog-page-gradient z-10">
                                        <div className="text-sm lg:text-[18px] leading-4.5 lg:leading-6.5 font-product-sans-bold font-medium text-white line-clamp-2">{displayBlogs[1].title}</div>
                                        <div className="mt-2 lg:mt-2.75 flex items-center gap-3">
                                            <ul className="flex items-center gap-1.5">
                                                <li>
                                                    <p className="font-product-sans-medium font-normal text-white text-xs leading-3.5">{displayBlogs[1].author.name}</p>
                                                </li>
                                                <li className="w-1.5 h-1.5 rounded-full bg-white"></li>
                                                <li>
                                                    <p className="font-product-sans-medium font-normal text-white text-xs leading-3.5">{formatDate(displayBlogs[1].createdAt)}</p>
                                                </li>
                                                <li className="w-1.5 h-1.5 rounded-full bg-white"></li>
                                                <li>
                                                    <p className="font-product-sans-medium font-normal text-white text-xs leading-3.5">{displayBlogs[1].timeToRead}</p>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        )}

                        {displayBlogs[2] && (
                            <div className="row-start-2 col-start-1 relative">
                                <Link href={`/blog/${displayBlogs[2].slug}`}>
                                    <div className="absolute top-3 lg:top-5 right-3 lg:right-5 z-40 border border-primary/80 bg-primary/80 rounded-[6px] p-2 lg:p-2.5 capitalize text-xs lg:text-sm font-product-sans-medium font-light w-fit text-white">
                                        {displayBlogs[2].category.name}
                                    </div>
                                    <figure className="h-68.5 w-full overflow-hidden">
                                        <Image
                                            src={displayBlogs[2].thumbnail}
                                            alt={displayBlogs[2].thumbnailAlt || displayBlogs[2].title}
                                            width={1000}
                                            height={1000}
                                            className="h-full w-full object-cover"
                                        />
                                    </figure>
                                    <div className="absolute w-full bottom-0 left-0 p-3.5 blog-page-gradient z-10">
                                        <div className="text-sm lg:text-[16px] leading-4.5 lg:leading-5 font-product-sans-bold font-medium text-white line-clamp-2">{displayBlogs[2].title}</div>
                                        <div className="mt-2 lg:mt-2.75 flex items-center gap-3">
                                            <ul className="flex items-center gap-1.5">
                                                <li>
                                                    <p className="font-product-sans-medium font-normal text-white text-xs leading-3.5">{displayBlogs[2].author.name}</p>
                                                </li>
                                                <li className="w-1.5 h-1.5 rounded-full bg-white"></li>
                                                <li>
                                                    <p className="font-product-sans-medium font-normal text-white text-xs leading-3.5">{formatDate(displayBlogs[2].createdAt)}</p>
                                                </li>
                                                <li className="w-1.5 h-1.5 rounded-full bg-white"></li>
                                                <li>
                                                    <p className="font-product-sans-medium font-normal text-white text-xs leading-3.5">{displayBlogs[2].timeToRead}</p>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        )}

                        {displayBlogs[3] && (
                            <div className="row-start-3 lg:row-start-2 col-start-1 lg:col-start-2 relative">
                                <Link href={`/blog/${displayBlogs[3].slug}`}>
                                    <div className="absolute top-3 lg:top-5 right-3 lg:right-5 z-40 border border-primary/80 bg-primary/80 rounded-[6px] p-2 lg:p-2.5 capitalize text-xs lg:text-sm font-product-sans-medium font-light w-fit text-white">
                                        {displayBlogs[3].category.name}
                                    </div>
                                    <figure className="h-68.5 w-full overflow-hidden">
                                        <Image
                                            src={displayBlogs[3].thumbnail}
                                            alt={displayBlogs[3].thumbnailAlt || displayBlogs[3].title}
                                            width={1000}
                                            height={1000}
                                            className="h-full w-full object-cover"
                                        />
                                    </figure>
                                    <div className="absolute w-full bottom-0 left-0 p-3.5 blog-page-gradient z-10">
                                        <div className="text-sm lg:text-[16px] leading-4.5 lg:leading-5 font-product-sans-bold font-medium text-white line-clamp-2">{displayBlogs[3].title}</div>
                                        <div className="mt-2 lg:mt-2.75 flex items-center gap-3">
                                            <ul className="flex items-center gap-1.5">
                                                <li>
                                                    <p className="font-product-sans-medium font-normal text-white text-xs leading-3.5">{displayBlogs[3].author.name}</p>
                                                </li>
                                                <li className="w-1.5 h-1.5 rounded-full bg-white"></li>
                                                <li>
                                                    <p className="font-product-sans-medium font-normal text-white text-xs leading-3.5">{formatDate(displayBlogs[3].createdAt)}</p>
                                                </li>
                                                <li className="w-1.5 h-1.5 rounded-full bg-white"></li>
                                                <li>
                                                    <p className="font-product-sans-medium font-normal text-white text-xs leading-3.5">{displayBlogs[3].timeToRead}</p>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        // 1–3 results: simple 2-column grid
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {displayBlogs.map((blog) => (
                    <div key={blog.id} className="relative">
                        <Link href={`/blog/${blog.slug}`}>
                            <div className="absolute top-3 lg:top-5 right-3 lg:right-5 z-40 border border-primary/80 bg-primary/80 rounded-[6px] p-2 lg:p-2.5 capitalize text-xs lg:text-sm font-product-sans-medium font-light w-fit text-white">
                                {blog.category.name}
                            </div>
                            <figure className="h-68.5 lg:h-80 w-full overflow-hidden relative after:absolute after:w-full after:h-full after:inset-0 after:bg-black/20 after:pointer-events-none">
                                <Image src={blog.thumbnail} alt={blog.thumbnailAlt || blog.title} width={1000} height={1000} className="h-full w-full object-cover" />
                            </figure>
                            <div className="absolute w-full bottom-0 left-0 p-5 blog-page-gradient z-10">
                                <div className="text-sm lg:text-[18px] leading-4.5 lg:leading-6.5 tracking-wide font-product-sans-bold font-extralight text-white line-clamp-2">{blog.title}</div>
                                <div className="mt-2 lg:mt-2.75 flex items-center gap-3">
                                    <ul className="flex items-center gap-1.5">
                                        <li>
                                            <p className="font-product-sans-medium font-normal text-white text-xs leading-3.5">{blog.author.name}</p>
                                        </li>
                                        <li className="w-1.5 h-1.5 rounded-full bg-white"></li>
                                        <li>
                                            <p className="font-product-sans-medium font-normal text-white text-xs leading-3.5">{formatDate(blog.createdAt)}</p>
                                        </li>
                                        <li className="w-1.5 h-1.5 rounded-full bg-white"></li>
                                        <li>
                                            <p className="font-product-sans-medium font-normal text-white text-xs leading-3.5">{blog.timeToRead}</p>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="max-w-360 w-full mx-auto px-5 lg:px-20 pb-9 mt-20 lg:mt-25">
            <BlogListHeader />

            <div className="mt-7.5">{renderBlogCards()}</div>

            {/* Carousel Section — always latest published blogs, independent of search/category */}
            <div className="mt-11.25">
                <h2 className="font-helvetica font-bold text-2xl lg:text-[34px] leading-7 lg:leading-10 mb-4">{displayBlogs.length >= 4 ? "Global Highlights" : "Latest Blogs"}</h2>
                <EmblaCarousel blogs={carouselBlogs} loading={carouselLoading} />
                {/* No props needed — it reads search/category from the URL itself,
                    same as BlogListHeader, and fetches independently. */}
                <MobileViewBlogList />
            </div>
        </div>
    );
}

export default function Blog() {
    return (
        <Suspense fallback={<BlogPageSkeleton />}>
            <BlogListContent />
        </Suspense>
    );
}

function BlogPageSkeleton() {
    return (
        <div className="max-w-360 w-full mx-auto px-5 lg:px-20 pb-9 mt-20 lg:mt-25">
            <div className="flex items-start justify-between flex-col lg:flex-row gap-4 animate-pulse">
                <div className="h-10 bg-slate-200 rounded w-32"></div>
                <div className="flex gap-4">
                    <div className="w-147 h-15 bg-slate-200 rounded"></div>
                    <div className="w-62 h-15 bg-slate-200 rounded"></div>
                </div>
            </div>
            <div className="mt-7.5 h-96 bg-slate-200 rounded animate-pulse"></div>
        </div>
    );
}
