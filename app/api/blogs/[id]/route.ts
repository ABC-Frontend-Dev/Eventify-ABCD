// app/api/blogs/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const DEFAULT_AUTHOR_NAME = "Eventify";
const DEFAULT_CATEGORY_NAME = "Activations";

enum BlogStatus {
    DRAFT = "DRAFT",
    PUBLISHED = "PUBLISHED",
    ARCHIVED = "ARCHIVED",
}

type UpdateBlogBody = {
    title?: string;
    slug?: string;
    description?: string;
    content?: string;
    status?: BlogStatus;
    publishedAt?: Date | null;
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    thumbnail?: string;
    thumbnailAlt?: string;
    banner_image?: string;
    bannerImageAlt?: string;
    canonical?: string;
    schemaScript?: string;
    timeToRead?: string;
    authorId?: number | null; // ✅ optional
    categoryId?: number | null; // ✅ optional
};

function isValidSlug(slug: string): boolean {
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

// ── GET single blog ───────────────────────────────────────────────────────────
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const blogId = parseInt(id);

        if (isNaN(blogId)) {
            return NextResponse.json({ success: false, error: "Invalid blog ID." }, { status: 400 });
        }

        const blog = await prisma.blog.findUnique({
            where: { id: blogId },
            include: { author: true, category: true },
        });

        if (!blog) {
            return NextResponse.json({ success: false, error: `Blog with id: ${blogId} not found.` }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: blog }, { status: 200 });
    } catch (error) {
        console.error("GET /api/blogs/[id] error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch blog." }, { status: 500 });
    }
}

// ── PUT (update) ──────────────────────────────────────────────────────────────
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const blogId = parseInt(id);

        if (isNaN(blogId)) {
            return NextResponse.json({ success: false, error: "Invalid blog ID." }, { status: 400 });
        }

        const body: UpdateBlogBody = await request.json();

        const existingBlog = await prisma.blog.findUnique({ where: { id: blogId } });
        if (!existingBlog) {
            return NextResponse.json({ success: false, error: "Blog not found." }, { status: 404 });
        }

        // ── Slug validation ───────────────────────────────────────────────────
        if (body.slug && body.slug !== existingBlog.slug) {
            if (!isValidSlug(body.slug)) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Invalid slug format. Use only lowercase letters, numbers, and hyphens.",
                    },
                    { status: 400 },
                );
            }
            const slugConflict = await prisma.blog.findUnique({ where: { slug: body.slug } });
            if (slugConflict) {
                return NextResponse.json({ success: false, error: "A blog with this slug already exists." }, { status: 400 });
            }
        }

        // ── Resolve authorId ──────────────────────────────────────────────────
        let resolvedAuthorId: number = existingBlog.authorId;

        if (body.authorId !== undefined && body.authorId !== null) {
            const authorExists = await prisma.author.findUnique({
                where: { id: body.authorId },
            });
            if (!authorExists) {
                return NextResponse.json({ success: false, error: "Author not found." }, { status: 404 });
            }
            resolvedAuthorId = body.authorId;
        } else if (body.authorId === null) {
            // explicitly cleared → fall back to default
            const defaultAuthor = await prisma.author.findFirst({
                where: { name: { equals: DEFAULT_AUTHOR_NAME, mode: "insensitive" } },
            });
            if (defaultAuthor) resolvedAuthorId = defaultAuthor.id;
        }

        // ── Resolve categoryId ────────────────────────────────────────────────
        let resolvedCategoryId: number = existingBlog.categoryId;

        if (body.categoryId !== undefined && body.categoryId !== null) {
            const categoryExists = await prisma.blogCategory.findUnique({
                where: { id: body.categoryId },
            });
            if (!categoryExists) {
                return NextResponse.json({ success: false, error: "Category not found." }, { status: 404 });
            }
            resolvedCategoryId = body.categoryId;
        } else if (body.categoryId === null) {
            // explicitly cleared → fall back to default
            const defaultCategory = await prisma.blogCategory.findFirst({
                where: { name: { equals: DEFAULT_CATEGORY_NAME, mode: "insensitive" } },
            });
            if (defaultCategory) resolvedCategoryId = defaultCategory.id;
        }

        // ── Publish date handling ─────────────────────────────────────────────
        let publishedAt = existingBlog.publishedAt;
        if (body.status === BlogStatus.PUBLISHED && existingBlog.status !== BlogStatus.PUBLISHED) {
            publishedAt = new Date();
        } else if (body.status && body.status !== BlogStatus.PUBLISHED) {
            publishedAt = null;
        }

        const updatedBlog = await prisma.blog.update({
            where: { id: blogId },
            data: {
                title: body.title ?? existingBlog.title,
                slug: body.slug ?? existingBlog.slug,
                description: body.description ?? existingBlog.description,
                content: body.content ?? existingBlog.content,
                status: body.status ?? existingBlog.status,
                publishedAt,
                metaTitle: body.metaTitle ?? existingBlog.metaTitle,
                metaDescription: body.metaDescription ?? existingBlog.metaDescription,
                keywords: body.keywords ?? existingBlog.keywords,
                thumbnail: body.thumbnail ?? existingBlog.thumbnail,
                thumbnailAlt: body.thumbnailAlt ?? existingBlog.thumbnailAlt,
                banner_image: body.banner_image ?? existingBlog.banner_image,
                bannerImageAlt: body.bannerImageAlt ?? existingBlog.bannerImageAlt,
                canonical: body.canonical ?? existingBlog.canonical,
                schemaScript: body.schemaScript ?? existingBlog.schemaScript,
                // ✅ keep existing value or fall back to "5 min read"
                timeToRead: body.timeToRead ?? existingBlog.timeToRead ?? "5 min read",
                authorId: resolvedAuthorId,
                categoryId: resolvedCategoryId,
            },
            include: { author: true, category: true },
        });

        return NextResponse.json({ success: true, data: updatedBlog, message: "Blog updated successfully." }, { status: 200 });
    } catch (error) {
        console.error("PUT /api/blogs/[id] error:", error);
        return NextResponse.json({ success: false, error: "Failed to update blog." }, { status: 500 });
    }
}

// ── DELETE ────────────────────────────────────────────────────────────────────
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const blogId = parseInt(id);

        if (isNaN(blogId)) {
            return NextResponse.json({ success: false, error: "Invalid blog ID." }, { status: 400 });
        }

        const existingBlog = await prisma.blog.findUnique({ where: { id: blogId } });
        if (!existingBlog) {
            return NextResponse.json({ success: false, error: "Blog not found." }, { status: 404 });
        }

        await prisma.blog.delete({ where: { id: blogId } });

        return NextResponse.json({ success: true, message: "Blog deleted successfully." }, { status: 200 });
    } catch (error) {
        console.error("DELETE /api/blogs/[id] error:", error);
        return NextResponse.json({ success: false, error: "Failed to delete blog." }, { status: 500 });
    }
}
