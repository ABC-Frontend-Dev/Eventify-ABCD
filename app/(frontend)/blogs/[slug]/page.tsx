// app/(frontend)/blog/[slug]/page.tsx
import { notFound } from "next/navigation";
import Image from "next/image";
import Breadcrumb from "@/components/common/Breadcrumb";
import BlogToc from "@/components/layout/Blog/BlogToc";
import { RelatedBlogList } from "@/components/layout/Blog/RelatedBlog";
import prisma from "@/lib/prisma";
import BlogContent from "@/components/layout/Blog/BlogContent";
import { ShareBtn } from "@/components/layout/ShareOn/ShareOn";
import BlogBannerReveal from "@/components/layout/Blog/BlogBannerReveal";

export async function generateStaticParams() {
    const blogs = await prisma.blog.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true },
    });

    return blogs.map((blog) => ({ slug: blog.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const blog = await prisma.blog.findUnique({
        where: { slug },
        select: {
            title: true,
            metaTitle: true,
            description: true,
            metaDescription: true,
            keywords: true,
            thumbnail: true,
            banner_image: true,
            canonical: true,
        },
    });

    if (!blog) return { title: "Blog Not Found" };

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

function formatDate(date: Date) {
    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    }).format(new Date(date));
}

export default async function BlogPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const blog = await prisma.blog.findUnique({
        where: { slug, status: "PUBLISHED" },
        include: { author: true, category: true },
    });

    if (!blog) notFound();

    const relatedBlogs = await prisma.blog.findMany({
        where: {
            categoryId: blog.categoryId,
            status: "PUBLISHED",
            id: { not: blog.id },
        },
        take: 2,
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            thumbnail: true,
            createdAt: true,
        },
    });

    return (
        <section className="max-w-360 w-full mx-auto px-5 lg:px-20 pb-9 mt-20 lg:mt-25 scroll-mt-14">
            <div>
                <div className="text-[40px] leading-10 font-helvetica font-bold tracking-wide">Blog</div>
                <Breadcrumb props={{ className: "mt-3.5" }} />
            </div>

            <div className="mt-7.5">
                {/* Banner Image */}
                <BlogBannerReveal desktopSrc={blog.banner_image} mobileSrc={blog.thumbnail} alt={blog.title} />

                {/* Blog Header */}
                <div className="mt-5">
                    <div className="border border-primary/80 bg-primary/80 rounded-[6px] p-2.5 capitalize text-lg font-product-sans-medium font-light w-fit text-white">{blog.category.name}</div>
                    <h1 className="mt-2 text-[30px] leading-9 tracking-wide font-product-sans-bold font-bold text-slate-950">{blog.title}</h1>
                    <p className="mt-2 text-sm leading-4 tracking-wide text-slate-950 font-helvetica font-extralight">{blog.description}</p>
                    <div className="mt-2.75 flex items-center gap-3">
                        <figure className="h-10 w-10 rounded-full border overflow-hidden">
                            <Image src={blog.author.avatar || "/default-avatar.png"} alt={blog.author.name} width={40} height={40} className="h-full w-full object-cover" />
                        </figure>
                        <ul className="flex items-center gap-1.5">
                            <li>
                                <p className="font-product-sans-medium font-normal text-slate-950 text-sm leading-3.5">{blog.author.name}</p>
                            </li>
                            <li className="w-1.5 h-1.5 rounded-full bg-slate-950"></li>
                            <li>
                                <p className="font-product-sans-medium font-normal text-slate-950 text-sm leading-3.5">{formatDate(blog.publishedAt || blog.createdAt)}</p>
                            </li>
                            {blog.timeToRead && (
                                <>
                                    <li className="w-1.5 h-1.5 rounded-full bg-slate-950"></li>
                                    <li>
                                        <p className="font-product-sans-medium font-normal text-slate-950 text-sm leading-3.5">{blog.timeToRead}</p>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Blog Content and Sidebar */}
                <div className="flex items-start justify-between flex-col lg:flex-row gap-x-10 mt-5">
                    {/* Blog Content */}
                    <div className="max-w-203 w-full">
                        <BlogContent content={blog.content} />
                    </div>

                    {/* Sidebar — sticky with scroll if content overflows viewport */}
                    <aside className="w-full max-w-107 pt-6 lg:sticky lg:top-25 self-start lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto">
                        <ShareBtn />
                        <BlogToc />
                        <div className="mt-10">
                            <p className="text-2xl font-helvetica leading-8 font-extrabold text-slate-950">Related Blogs</p>
                            <RelatedBlogList blogs={relatedBlogs} />
                        </div>
                    </aside>
                </div>
            </div>

            {/* Schema Markup for SEO */}
            {blog.schemaScript && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: blog.schemaScript }} />}
        </section>
    );
}
