import { notFound } from "next/navigation";
import Image from "next/image";
import Breadcrumb from "@/components/common/Breadcrumb";
import BlogToc from "@/components/layout/Blog/BlogToc";
import { RelatedBlogList } from "@/components/layout/Blog/RelatedBlog";
import BlogContent from "@/components/layout/Blog/BlogContent";
import { ShareBtn } from "@/components/layout/ShareOn/ShareOn";
import BlogBannerReveal from "@/components/layout/Blog/BlogBannerReveal";

// ── Types ────────────────────────────────────────────────
interface Author {
    id: number;
    name: string;
    avatar: string | null;
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
    keywords: string[];
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
    createdAt: string;
}

// ── Base URL helper ──────────────────────────────────────
function getBaseUrl() {
    if (process.env.NEXT_PUBLIC_SITE_URL) {
        return process.env.NEXT_PUBLIC_SITE_URL;
    }
    return "http://localhost:3000";
}

// ── Data fetchers ────────────────────────────────────────
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

async function getRelatedBlogs(categoryId: number, excludeId: number): Promise<RelatedBlog[]> {
    try {
        const res = await fetch(`${getBaseUrl()}/api/blogs?categoryId=${categoryId}&status=PUBLISHED&sortBy=latest`, { next: { revalidate: 60 } });

        if (!res.ok) return [];

        const result = await res.json();

        if (!result.success) return [];

        return (result.data as RelatedBlog[]).filter((b) => b.id !== excludeId).slice(0, 2);
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

        return (result.data as { slug: string }[]).map((b) => b.slug);
    } catch (error) {
        console.error("getAllPublishedSlugs error:", error);
        return [];
    }
}

// ── Static params ────────────────────────────────────────
export async function generateStaticParams() {
    const slugs = await getAllPublishedSlugs();
    return slugs.map((slug) => ({ slug }));
}

// ── Metadata ─────────────────────────────────────────────
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
        keywords: blog.keywords.join(", "),
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

// ── Helpers ───────────────────────────────────────────────
function formatDate(date: string) {
    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    }).format(new Date(date));
}

// ── Page ──────────────────────────────────────────────────
export default async function BlogPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const blog = await getBlogBySlug(slug);
    if (!blog) notFound();

    const relatedBlogs = await getRelatedBlogs(blog.categoryId, blog.id);

    return (
        <section className="mt-0 lg:mt-25 scroll-mt-14">
            <div className="absolute top-16 md:top-12 lg:top-16 left-0 w-full h-80 lg:h-140 after:absolute after:top-0 after:left-0 after:w-full after:h-full after:bg-black/20 after:z-10 after:backdrop-blur-sm">
                <figure>
                    <Image src={blog.banner_image || blog.thumbnail} alt={blog.title} fill priority className="object-cover" />
                </figure>
                <div className="max-w-360 px-5 lg:px-20 absolute left-1/2 -translate-x-1/2 top-6 md:top-12 lg:top-16 w-full z-20 text-white">
                    <div className="text-xl lg:text-[40px] leading-6 lg:leading-10 font-helvetica font-bold tracking-wide">Blog</div>
                    <Breadcrumb props={{ className: "mt-1.5 md:mt-3.5 text-white" }} />
                </div>
            </div>

            <div className="relative max-w-360 w-full mx-auto px-2.5 lg:px-20 pb-9 z-20">
                <div className="mt-40 lg:mt-64 z-40">
                    {/* Banner Image */}
                    <div className="relative rounded-[8px] overflow-hidden">
                        <BlogBannerReveal desktopSrc={blog.banner_image} mobileSrc={blog.thumbnail} alt={blog.title} />
                        <div className="absolute top-1.5 lg:top-3.5 right-1.5 lg:right-3.5 border border-primary/80 bg-primary/80 rounded-[6px] py-1 px-2 md:px-3 capitalize text-sm lg:text-lg font-helvetica-thin md:font-helvetica-neue-roman tracking-wide w-fit text-white">
                            {blog.category.name}
                        </div>

                        {/* Blog Header */}
                        <div className="absolute left-0 bottom-0 w-full h-68.5 lg:h-113.75 max-w-360 text-white bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,#000000_83.83%)]">
                            <div className="absolute left-0 bottom-0 px-4.5 lg:px-7.5 pb-4.5 lg:pb-7.5 w-full h-fit">
                                <h1 className="mt-2 text-lg lg:text-[30px] leading-5.5 lg:leading-9 tracking-wide font-product-sans-bold font-bold text-white">{blog.title}</h1>
                                <p className="mt-2 text-sm leading-4 tracking-wide text-white font-helvetica font-extralight">{blog.description}</p>

                                <div className="mt-2.75 flex items-center gap-3">
                                    <figure className="h-10 w-10 rounded-full border overflow-hidden">
                                        <Image src={blog.author.avatar || "/default-avatar.png"} alt={blog.author.name} width={40} height={40} className="h-full w-full object-cover" />
                                    </figure>
                                    <div>
                                        <ul className="flex items-center gap-1.5">
                                            <li>
                                                <p className="font-product-sans-medium font-normal text-white text-sm leading-3.5">{blog.author.name}</p>
                                            </li>
                                            <li className="w-1.5 h-1.5 rounded-full bg-white" />
                                            <li>
                                                <p className="font-product-sans-medium font-normal text-white text-sm leading-3.5">{formatDate(blog.publishedAt || blog.createdAt)}</p>
                                            </li>
                                            {blog.timeToRead && (
                                                <>
                                                    <li className="w-1.5 h-1.5 rounded-full bg-white" />
                                                    <li>
                                                        <p className="font-product-sans-medium font-normal text-white text-sm leading-3.5">{blog.timeToRead}</p>
                                                    </li>
                                                </>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Blog Content and Sidebar */}
                    <div className="flex items-start justify-between flex-col lg:flex-row gap-x-10 mt-5">
                        {/* Blog Content */}
                        <div className="max-w-203 w-full">
                            <BlogContent content={blog.content} />
                        </div>

                        {/* Sidebar */}
                        <aside className="w-full max-w-107 pt-6 lg:sticky lg:top-25 self-start lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto">
                            <ShareBtn />
                            <BlogToc />
                            <div className="mt-10">
                                <p className="text-lg lg:text-2xl font-helvetica leading-8 font-extrabold text-slate-950">Related Blogs</p>
                                <RelatedBlogList blogs={relatedBlogs as any} />
                            </div>
                        </aside>
                    </div>
                </div>

                {/* Schema Markup */}
                {blog.schemaScript && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: blog.schemaScript }} />}
            </div>
        </section>
    );
}
