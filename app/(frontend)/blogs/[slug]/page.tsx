import { notFound } from "next/navigation";
import Image from "next/image";
import Breadcrumb from "@/components/common/Breadcrumb";
import BlogToc from "@/components/layout/Blog/BlogToc";
import { RelatedBlogList } from "@/components/layout/Blog/RelatedBlog";
import BlogContent from "@/components/layout/Blog/BlogContent";
import { ShareBtn } from "@/components/layout/ShareOn/ShareOn";
import BlogBannerReveal from "@/components/layout/Blog/BlogBannerReveal";
import { ViewTracker } from "@/components/layout/Blog/ViewTracker";

// ── Types ────────────────────────────────────────────────────────────────────

interface Author {
    id: number;
    name: string;
    role: string;
    avatar: string | null;
    bio: string | null;
}
interface Category {
    id: number;
    name: string;
}

interface Blog {
    id: number;
    title: string;
    slug: string;
    description: string;
    content: string;
    status: string;
    publishedAt: string | null;
    createdAt: string;
    metaTitle: string | null;
    metaDescription: string | null;
    keywords: string[] | null;
    thumbnail: string;
    banner_image: string | null;
    canonical: string | null;
    schemaScript: string | null;
    timeToRead: string | null;
    categoryId: number;
    author: Author;
    category: Category;
}

interface RelatedBlog {
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

// ── Base URL ─────────────────────────────────────────────────────────────────

function getBaseUrl() {
    if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
    return "http://localhost:3000";
}

// ── Data fetchers ─────────────────────────────────────────────────────────────

async function getBlogBySlug(slug: string): Promise<Blog | null> {
    try {
        const res = await fetch(`${getBaseUrl()}/api/blogs?slug=${encodeURIComponent(slug)}&status=PUBLISHED`, { next: { revalidate: 60 } });
        if (!res.ok) return null;
        const result = await res.json();
        if (!result.success || !result.data?.length) return null;
        return result.data[0] as Blog;
    } catch (error) {
        console.error("getBlogBySlug error:", error);
        return null;
    }
}

/**
 * Builds a list of exactly up to 3 related blogs:
 *
 * 1. Same-category blogs first (excluding current), sorted by latest.
 * 2. If same-category gives fewer than 3, fill remaining slots with the
 *    most-recently-published blogs from ANY other category (excluding the
 *    current blog AND the same-category blogs already picked).
 *
 * Everything is deterministic (sorted by date) so there are zero
 * hydration mismatches between server and client.
 */
async function getRelatedBlogs(categoryId: number, excludeId: number): Promise<RelatedBlog[]> {
    const LIMIT = 3;

    try {
        // Fetch all published blogs in one request — our site has only 5-8,
        // so this is cheap and lets us do the logic entirely in JS.
        const res = await fetch(`${getBaseUrl()}/api/blogs?status=PUBLISHED&sortBy=latest`, { next: { revalidate: 60 } });

        if (!res.ok) return [];

        const result = await res.json();
        if (!result.success || !result.data?.length) return [];

        const all = result.data as RelatedBlog[];

        // ── Step 1: same-category blogs (exclude current) ──────────────────
        const sameCat = all.filter((b) => b.id !== excludeId && (b as unknown as { categoryId: number }).categoryId === categoryId);

        // ── Step 2: if we already have 3, we're done ───────────────────────
        if (sameCat.length >= LIMIT) {
            return sameCat.slice(0, LIMIT);
        }

        // ── Step 3: collect IDs already picked ────────────────────────────
        const pickedIds = new Set<number>([excludeId, ...sameCat.map((b) => b.id)]);

        // ── Step 4: fill with most-recent blogs from other categories ──────
        const fillers = all.filter((b) => !pickedIds.has(b.id));

        // Step 5: merge and return exactly LIMIT blogs
        return [...sameCat, ...fillers].slice(0, LIMIT);
    } catch (error) {
        console.error("getRelatedBlogs error:", error);
        return [];
    }
}

async function getAllPublishedSlugs(): Promise<string[]> {
    try {
        const res = await fetch(`${getBaseUrl()}/api/blogs?status=PUBLISHED`, { next: { revalidate: 3600 } });
        if (!res.ok) return [];
        const result = await res.json();
        if (!result.success) return [];

        const rawSlugs =
            (result.data as {
                slug: string | null | undefined;
                id?: number;
                title?: string;
            }[]) ?? [];

        const validEntries = rawSlugs.filter((b) => typeof b.slug === "string" && b.slug.trim().length > 0);

        const skipped = rawSlugs.length - validEntries.length;
        if (skipped > 0) {
            console.warn(
                `⚠️ getAllPublishedSlugs: skipped ${skipped} published blog(s) with a missing/empty slug.`,
                rawSlugs.filter((b) => !b.slug).map((b) => ({ id: b.id, title: b.title })),
            );
        }

        return validEntries.map((b) => b.slug as string);
    } catch (error) {
        console.error("getAllPublishedSlugs error:", error);
        return [];
    }
}

// ── Static params ─────────────────────────────────────────────────────────────

export async function generateStaticParams() {
    const slugs = await getAllPublishedSlugs();
    return slugs.map((slug) => ({ slug }));
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const blog = await getBlogBySlug(slug);

    if (!blog) {
        return {
            title: "Blog Not Found",
            description: "The blog post you're looking for doesn't exist.",
        };
    }

    return {
        title: blog.metaTitle || blog.title,
        description: blog.metaDescription || blog.description,
        keywords: (blog.keywords ?? []).join(", "),
        openGraph: {
            title: blog.metaTitle || blog.title,
            description: blog.metaDescription || blog.description,
            images: [blog.banner_image || blog.thumbnail],
        },
        twitter: {
            card: "summary_large_image",
            title: blog.metaTitle || blog.title,
            description: blog.metaDescription || blog.description,
            images: [blog.banner_image || blog.thumbnail],
        },
        alternates: { canonical: blog.canonical },
    };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(date: string) {
    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    }).format(new Date(date));
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function BlogPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const blog = await getBlogBySlug(slug);
    if (!blog) notFound();

    // Pass categoryId + excludeId — logic is fully server-side
    const relatedBlogs = await getRelatedBlogs(blog.categoryId, blog.id);

    return (
        <section className="mt-16 lg:mt-26 scroll-mt-1">
            <ViewTracker slug={slug} />

            <div className="relative max-w-300 w-full mx-auto px-2.5 lg:px-20 pb-9 z-20">
                <div className="w-full text-footer-bg">
                    <Breadcrumb props={{ className: "mt-1.5 md:mt-3.5 text-white" }} />

                    {/* <div className="mt-4 md:mt-5 lg:mt-7 flex gap-x-1.5 md:gap-x-3">
                        <p className="font-helvetica-neue-roman font-normal text-footer-bg text-xs md:text-sm leading-4 md:leading-3.5">{formatDate(blog.publishedAt || blog.createdAt)}</p>
                        <p className="font-helvetica-neue-roman font-normal text-footer-bg text-xs md:text-sm leading-4 md:leading-3.5">|</p>
                        <p className="font-helvetica-neue-roman font-normal text-footer-bg text-xs md:text-sm leading-4 md:leading-3.5">{blog.category.name}</p>
                    </div> */}

                    <h1 className="max-w-200 w-full mt-3 md:mt-4.5 text-sm sm:text-lg md:text-2xl lg:text-[30px] leading-5 sm:leading-5.5 md:leading-7 lg:leading-9 tracking-normal font-abc-laica-a-italic-variable-trial font-semibold text-primary">
                        {blog.title}
                    </h1>

                    {/* Author + Share row */}
                    <div className="mt-3 md:mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        {/* Author info */}
                        <div className="flex items-center gap-2.5">
                            {/* {blog.author.avatar && (
                                <div className="relative h-8 w-8 md:h-10 md:w-10 rounded-full overflow-hidden shrink-0 border border-white/20">
                                    <Image src={blog.author.avatar} alt={blog.author.name} fill className="object-cover" />
                                </div>
                            )} */}
                            <div>
                                <p className="text-xs md:text-sm font-helvetica-neue-roman text-footer-bg leading-tight">
                                    By: {blog.author.name}, {blog.author.role}
                                </p>
                            </div>

                            {/* <span className="text-slate-300 text-xs mx-1">·</span> */}

                            {/* Date */}
                            {/* <p className="text-[10px] md:text-xs text-slate-400">{formatDate(blog.publishedAt || blog.createdAt)}</p> */}

                            {/* Read time */}
                            {/* {blog.timeToRead && (
                                <>
                                    <span className="text-slate-300 text-xs mx-1">·</span>
                                    <p className="text-[10px] md:text-xs text-slate-400">{blog.timeToRead}</p>
                                </>
                            )} */}
                        </div>

                        <ShareBtn />
                    </div>
                </div>

                <div className="mt-5 lg:mt-8 z-40">
                    {/* Banner Image */}
                    <div className="relative overflow-hidden">
                        <BlogBannerReveal desktopSrc={blog.banner_image} mobileSrc={blog.thumbnail} alt={blog.title} />
                    </div>

                    {/* Blog Content */}
                    <div className="mt-5 max-w-max w-full">
                        <div>
                            <BlogContent content={blog.content} />
                        </div>

                        {/* Related Blogs */}
                        <div className="mt-4 sm:mt-5 md:mt-7 lg:mt-10">
                            <p className="text-lg lg:text-2xl font-helvetica-neue-roman md:font-helvetica leading-5.5 lg:leading-8 font-extrabold text-slate-950">Related Blogs</p>
                            <RelatedBlogList blogs={relatedBlogs} />
                        </div>
                    </div>
                </div>

                {/* Schema Markup */}
                {blog.schemaScript && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: blog.schemaScript }} />}
            </div>
        </section>
    );
}
