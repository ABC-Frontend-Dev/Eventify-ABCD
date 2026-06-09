// app/(frontend)/blog/[slug]/page.tsx
import { notFound } from "next/navigation";
import Image from "next/image";
import Breadcrumb from "@/components/common/Breadcrumb";
import BlogToc from "@/components/layout/Blog/BlogToc";
import { RelatedBlogList } from "@/components/layout/Blog/RelatedBlog";
import prisma from "@/lib/prisma";
import BlogContent from "@/components/layout/Blog/BlogContent";

// Generate static params for all published blogs
export async function generateStaticParams() {
    const blogs = await prisma.blog.findMany({
        where: {
            status: "PUBLISHED",
        },
        select: {
            slug: true,
        },
    });

    return blogs.map((blog) => ({
        slug: blog.slug,
    }));
}

// Generate metadata for SEO
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

    if (!blog) {
        return {
            title: "Blog Not Found",
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
        alternates: {
            canonical: blog.canonical,
        },
    };
}

// Helper function to format date
function formatDate(date: Date) {
    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    }).format(new Date(date));
}

export default async function BlogPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // Fetch blog with author and category
    const blog = await prisma.blog.findUnique({
        where: {
            slug: slug,
            status: "PUBLISHED",
        },
        include: {
            author: true,
            category: true,
        },
    });

    // If blog not found, show 404
    if (!blog) {
        notFound();
    }

    // Fetch related blogs from same category
    const relatedBlogs = await prisma.blog.findMany({
        where: {
            categoryId: blog.categoryId,
            status: "PUBLISHED",
            id: {
                not: blog.id,
            },
        },
        take: 2, // Only 2 blogs as per your design
        orderBy: {
            createdAt: "desc",
        },
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
        <div className="max-w-360 w-full mx-auto px-5 lg:px-20 pt-9 lg:py-9">
            <div>
                <div className="text-[40px] leading-10 font-helvetica font-bold tracking-wide">Blog</div>
                <Breadcrumb props={{ className: "mt-3.5" }} />
            </div>

            <div className="mt-7.5">
                {/* Banner Image */}
                <div className="">
                    <div className="max-w-max w-full h-68.5 lg:h-143.75">
                        <figure className="h-68.5 lg:h-142.25 w-full overflow-hidden relative after:absolute after:w-full after:h-full after:inset-0 after:bg-black/20 after:pointer-events-none">
                            <Image src={blog.banner_image} alt={blog.title} width={1000} height={1000} className="h-full w-full object-cover hidden lg:block" priority />
                            <Image src={blog.thumbnail} alt={blog.title} width={1000} height={1000} className="h-full w-full object-cover block lg:hidden" priority />
                        </figure>
                    </div>
                </div>

                {/* Blog Header */}
                <div className="mt-5">
                    <div className="border border-primary/80 bg-primary/80 rounded-[6px] p-2.5 capitalize text-lg font-product-sans-medium font-light w-fit text-white">{blog.category.name}</div>
                    <h1 className="mt-2 text-[30px] leading-9 tracking-wide font-product-sans-bold font-bold text-slate-950">{blog.title}</h1>
                    <p className="mt-2 text-sm leading-4 tracking-wide text-slate-950 font-helvetica font-extralight">{blog.description}</p>
                    <div className="mt-2.75 flex items-center gap-3">
                        <figure className="h-10 w-10 rounded-full overflow-hidden">
                            <Image src={blog.author.avatar || "/default-avatar.png"} alt={blog.author.name} width={40} height={40} className="h-full w-full object-cover" />
                        </figure>
                        <ul className="flex items-center gap-1.5">
                            <li className="">
                                <p className="font-product-sans-medium font-normal text-slate-950 text-sm leading-3.5">{blog.author.name}</p>
                            </li>
                            <li className="w-1.5 h-1.5 rounded-full bg-slate-950"></li>
                            <li className="">
                                <p className="font-product-sans-medium font-normal text-slate-950 text-sm leading-3.5">{formatDate(blog.publishedAt || blog.createdAt)}</p>
                            </li>
                            {blog.timeToRead && (
                                <>
                                    <li className="w-1.5 h-1.5 rounded-full bg-slate-950"></li>
                                    <li className="">
                                        <p className="font-product-sans-medium font-normal text-slate-950 text-sm leading-3.5">{blog.timeToRead}</p>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Blog Content and Sidebar */}
                <div className="flex items-start justify-between flex-col lg:flex-row gap-x-10 mt-5 relative">
                    <div className="max-w-203 w-full h-full">
                        <BlogContent content={blog.content} />
                    </div>

                    <aside className="w-full max-w-107 sticky top-5 self-start">
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
        </div>
    );
}
