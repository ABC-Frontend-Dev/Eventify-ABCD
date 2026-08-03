"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BlogItem {
    id: number;
    slug: string;
    title: string;
    description: string;
    thumbnail: string;
    thumbnailAlt: string | null;
    author: { name: string };
    category: { id: number; name: string };
    createdAt: string;
    timeToRead: string | null;
}

interface Category {
    id: number;
    name: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function CategoryBadge({ name }: { name: string }) {
    return (
        <div className="absolute top-2 right-2 z-40 border border-primary/80 bg-primary/80 rounded-[4px] px-1.5 py-0.75 capitalize text-xs lg:text-xs font-helvetica tracking-wide font-light w-fit text-white">
            {name}
        </div>
    );
}

function BlogMeta({ blog }: { blog: BlogItem }) {
    return (
        <div className="mt-8 flex items-center gap-1.5 flex-wrap">
            {/* <li>
                <p className="font-helvetica-neue-roman font-normal text-white text-[10px] leading-3.5">{blog.author.name}</p>
            </li> */}
            {/* <li className="w-1.5 h-1.5 rounded-full bg-white" /> */}
            {/* <li> */}
            <p className="font-helvetica-neue-roman font-normal text-white text-[10px] leading-3.5">{formatDate(blog.createdAt)}</p>
            {/* </li> */}
            {/* <li className="w-1.5 h-1.5 rounded-full bg-white" />
            <li>
                <p className="font-helvetica-neue-roman font-normal text-white text-[10px] leading-3.5">{blog.timeToRead}</p>
            </li> */}
        </div>
    );
}

// ─── Category Carousel ────────────────────────────────────────────────────────

function CategoryCarousel({ category, blogs }: { category: Category; blogs: BlogItem[] }) {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: blogs.length > 3,
        align: "start",
        containScroll: "trimSnaps",
    });

    const [prevDisabled, setPrevDisabled] = useState(true);
    const [nextDisabled, setNextDisabled] = useState(false);

    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setPrevDisabled(!emblaApi.canScrollPrev());
        setNextDisabled(!emblaApi.canScrollNext());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on("select", onSelect);
        emblaApi.on("reInit", onSelect);
        return () => {
            emblaApi.off("select", onSelect);
            emblaApi.off("reInit", onSelect);
        };
    }, [emblaApi, onSelect]);

    if (blogs.length === 0) return null;

    return (
        <div className="mt-9">
            {/* Category heading */}
            <h2 className="font-helvetica font-bold text-2xl lg:text-[30px] leading-7 lg:leading-9 mb-5">{category.name}</h2>

            {/* Carousel */}
            <div className="relative">
                <div className="overflow-hidden" ref={emblaRef}>
                    <div className="flex gap-3">
                        {blogs.map((blog) => (
                            <div key={blog.id} className="flex-[0_0_100%] sm:flex-[0_0_calc(50%-6px)] lg:flex-[0_0_calc(33.333%-8px)] min-w-0 relative">
                                <Link href={`/blogs/${blog.slug}`}>
                                    {/* <CategoryBadge name={blog.category.name} /> */}
                                    <figure className="h-72 lg:h-80 w-full overflow-hidden">
                                        <Image
                                            src={blog.thumbnail}
                                            alt={blog.thumbnailAlt || blog.title}
                                            width={800}
                                            height={600}
                                            className="h-full w-full object-cover hover:scale-105 transition-transform duration-500"
                                        />
                                    </figure>
                                    <div className="absolute w-full bottom-0 left-0 p-4 blog-page-gradient z-10">
                                        <BlogMeta blog={blog} />
                                        <div className="text-sm lg:text-[16px] leading-4.5 lg:leading-5 font-helvetica-medium font-medium text-white line-clamp-2">{blog.title}</div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Left / Right buttons — inside the carousel */}
                {blogs.length > 1 && (
                    <>
                        <button
                            onClick={scrollPrev}
                            disabled={prevDisabled}
                            aria-label="Previous"
                            className="absolute left-3 top-1/2 -translate-y-1/2 z-20
                                w-10 h-10 rounded-full bg-white/90 shadow-md
                                flex items-center justify-center
                                hover:bg-primary group
                                disabled:opacity-30 disabled:cursor-not-allowed
                                transition-all duration-200"
                        >
                            <ChevronLeft className="w-5 h-5 text-primary group-hover:text-white transition-colors" />
                        </button>
                        <button
                            onClick={scrollNext}
                            disabled={nextDisabled}
                            aria-label="Next"
                            className="absolute right-3 top-1/2 -translate-y-1/2 z-20
                                w-10 h-10 rounded-full bg-white/90 shadow-md
                                flex items-center justify-center
                                hover:bg-primary group
                                disabled:opacity-30 disabled:cursor-not-allowed
                                transition-all duration-200"
                        >
                            <ChevronRight className="w-5 h-5 text-primary group-hover:text-white transition-colors" />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

// ─── Recent blogs grid (6 cards) ─────────────────────────────────────────────

function RecentBlogsGrid({ blogs, loading }: { blogs: BlogItem[]; loading: boolean }) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    if (blogs.length === 0) {
        return (
            <div className="flex items-center justify-center py-16">
                <p className="text-slate-500">No blogs found</p>
            </div>
        );
    }

    // Large hero card (first blog)
    const [hero, ...rest] = blogs;

    return (
        <div className="space-y-3">
            {/* Hero card — full width */}
            <div className="relative w-full">
                <Link href={`/blogs/${hero.slug}`}>
                    <CategoryBadge name={hero.category.name} />
                    <figure className="h-72 lg:h-[480px] w-full overflow-hidden relative after:absolute after:inset-0 after:bg-black/20 after:pointer-events-none">
                        <Image src={hero.thumbnail} alt={hero.thumbnailAlt || hero.title} width={1400} height={800} className="h-full w-full object-cover" priority />
                    </figure>
                    <div className="absolute w-full bottom-0 left-0 p-5 blog-page-gradient z-10">
                        <BlogMeta blog={hero} />
                        <div className="text-lg lg:text-[26px] leading-6 lg:leading-8 tracking-wide font-helvetica-medium text-white line-clamp-2">{hero.title}</div>
                        <div className="hidden lg:block text-sm leading-4 text-white font-helvetica font-light">{hero.description}</div>
                    </div>
                </Link>
            </div>

            {/* Remaining 5 blogs — 2 col on mobile, 5-col on desktop (equal width) */}
            {rest.length > 0 && (
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                    {rest.map((blog) => (
                        <div key={blog.id} className="relative">
                            <Link href={`/blogs/${blog.slug}`}>
                                <CategoryBadge name={blog.category.name} />
                                <figure className="h-44 lg:h-52 w-full overflow-hidden">
                                    <Image
                                        src={blog.thumbnail}
                                        alt={blog.thumbnailAlt || blog.title}
                                        width={600}
                                        height={400}
                                        className="h-full w-full object-cover hover:scale-105 transition-transform duration-500"
                                    />
                                </figure>
                                <div className="absolute w-full bottom-0 left-0 p-3 blog-page-gradient z-10">
                                    <BlogMeta blog={blog} />
                                    <div className="text-xs lg:text-xs leading-3.75 font-helvetica-medium text-white line-clamp-2">{blog.title}</div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Main page content ────────────────────────────────────────────────────────

function BlogListContent() {
    const [recentBlogs, setRecentBlogs] = useState<BlogItem[]>([]);
    const [recentLoading, setRecentLoading] = useState(true);

    const [categories, setCategories] = useState<Category[]>([]);
    const [categoryBlogs, setCategoryBlogs] = useState<Record<number, BlogItem[]>>({});
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    // ── Fetch recent blogs (6 latest published) ───────────────────────────────

    useEffect(() => {
        const fetchRecent = async () => {
            try {
                const res = await fetch("/api/blogs?status=PUBLISHED&sortBy=latest&limit=6");
                const data = await res.json();
                if (data.success) setRecentBlogs(data.data);
            } catch (e) {
                console.error("Failed to fetch recent blogs:", e);
            } finally {
                setRecentLoading(false);
            }
        };
        fetchRecent();
    }, []);

    // ── Fetch all categories + 3 latest blogs per category ───────────────────

    useEffect(() => {
        const fetchCategoriesWithBlogs = async () => {
            try {
                // 1. Get all categories
                const catRes = await fetch("/api/blog-categories");
                const catData = await catRes.json();
                if (!catData.success) return;

                const allCategories: Category[] = catData.data;

                // 2. For each category fetch 3 latest published blogs in parallel
                const results = await Promise.all(
                    allCategories.map((cat) =>
                        fetch(`/api/blogs?status=PUBLISHED&categoryId=${cat.id}&sortBy=latest&limit=3`)
                            .then((r) => r.json())
                            .then((d) => ({
                                categoryId: cat.id,
                                blogs: d.success ? (d.data as BlogItem[]) : [],
                            }))
                            .catch(() => ({ categoryId: cat.id, blogs: [] })),
                    ),
                );

                // 3. Only keep categories that have at least 1 published blog
                const blogsMap: Record<number, BlogItem[]> = {};
                results.forEach(({ categoryId, blogs }) => {
                    if (blogs.length > 0) blogsMap[categoryId] = blogs;
                });

                const activeCategories = allCategories.filter((cat) => blogsMap[cat.id]?.length > 0);

                setCategories(activeCategories);
                setCategoryBlogs(blogsMap);
            } catch (e) {
                console.error("Failed to fetch categories:", e);
            } finally {
                setCategoriesLoading(false);
            }
        };

        fetchCategoriesWithBlogs();
    }, []);

    return (
        <div className="max-w-360 w-full mx-auto px-5 lg:px-20 pb-16 mt-20 lg:mt-25">
            {/* ── Page heading ─────────────────────────────────────────────── */}
            <div className="mb-7.5">
                <div className="text-2xl lg:text-[40px] leading-7 lg:leading-10 font-helvetica font-bold tracking-wide">Blog</div>
                <Breadcrumb props={{ className: "mt-3.5" }} />
            </div>

            {/* ── Section 1: Recent Blogs ───────────────────────────────────── */}
            <section>
                <h2 className="font-helvetica font-bold text-2xl lg:text-[34px] leading-7 lg:leading-10 mb-5">Recent Blogs</h2>
                <RecentBlogsGrid blogs={recentBlogs} loading={recentLoading} />
            </section>

            {/* ── Section 2: Category carousels ─────────────────────────────── */}
            <section className="mt-10">
                {categoriesLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                    </div>
                ) : (
                    categories.map((cat) => <CategoryCarousel key={cat.id} category={cat} blogs={categoryBlogs[cat.id] ?? []} />)
                )}
            </section>
        </div>
    );
}

// ─── Page export ──────────────────────────────────────────────────────────────

export default function Blog() {
    return (
        <Suspense fallback={<BlogPageSkeleton />}>
            <BlogListContent />
        </Suspense>
    );
}

function BlogPageSkeleton() {
    return (
        <div className="max-w-360 w-full mx-auto px-5 lg:px-20 pb-9 mt-20 lg:mt-25 animate-pulse">
            <div className="h-10 bg-slate-200 rounded w-32 mb-7.5" />
            <div className="h-8 bg-slate-200 rounded w-48 mb-5" />
            <div className="h-[480px] bg-slate-200 rounded mb-3" />
            <div className="grid grid-cols-5 gap-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-52 bg-slate-200 rounded" />
                ))}
            </div>
            <div className="mt-16 space-y-9">
                {[...Array(3)].map((_, i) => (
                    <div key={i}>
                        <div className="h-8 bg-slate-200 rounded w-40 mb-5" />
                        <div className="grid grid-cols-3 gap-3">
                            {[...Array(3)].map((_, j) => (
                                <div key={j} className="h-80 bg-slate-200 rounded" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
