import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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
    banner_image?: string;
    canonical?: string;
    schemaScript?: string;
    timeToRead?: string;
    authorId?: number;
    categoryId?: number;
};

// ── Slug validation helper ──────────────────────────────────
function isValidSlug(slug: string): boolean {
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

// GET SINGLE BLOG
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const blogId = parseInt(id);

        if (isNaN(blogId)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid blog ID.",
                },
                {
                    status: 400,
                },
            );
        }

        const blog = await prisma.blog.findUnique({
            where: {
                id: blogId,
            },
            include: {
                author: true,
                category: true,
            },
        });

        if (!blog) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Blog with id: ${blogId} not found.`,
                },
                {
                    status: 404,
                },
            );
        }

        return NextResponse.json(
            {
                success: true,
                data: blog,
            },
            {
                status: 200,
            },
        );
    } catch (error) {
        console.error("GET /api/blogs/[id] error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch blog.",
            },
            { status: 500 },
        );
    }
}

// UPDATE BLOG
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const blogId = parseInt(id);

        if (isNaN(blogId)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid blog ID.",
                },
                {
                    status: 400,
                },
            );
        }

        const body: UpdateBlogBody = await request.json();

        const existingBlog = await prisma.blog.findUnique({
            where: {
                id: blogId,
            },
        });

        if (!existingBlog) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Blog not found.",
                },
                {
                    status: 404,
                },
            );
        }

        // Check if new slug conflicts with existing blog
        if (body.slug && body.slug !== existingBlog.slug) {
            // Validate slug format
            if (!isValidSlug(body.slug)) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Invalid slug format. Use only lowercase letters, numbers, and hyphens.",
                    },
                    { status: 400 },
                );
            }

            const slugConflict = await prisma.blog.findUnique({
                where: { slug: body.slug },
            });

            if (slugConflict) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "A blog with this slug already exists.",
                    },
                    { status: 400 },
                );
            }
        }

        // Verify author if changed
        if (body.authorId && body.authorId !== existingBlog.authorId) {
            const authorExists = await prisma.author.findUnique({
                where: { id: body.authorId },
            });

            if (!authorExists) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Author not found.",
                    },
                    { status: 404 },
                );
            }
        }

        // Verify category if changed
        if (body.categoryId && body.categoryId !== existingBlog.categoryId) {
            const categoryExists = await prisma.blogCategory.findUnique({
                where: { id: body.categoryId },
            });

            if (!categoryExists) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Category not found.",
                    },
                    { status: 404 },
                );
            }
        }

        // Handle publish date
        let publishedAt = existingBlog.publishedAt;
        if (body.status === BlogStatus.PUBLISHED && existingBlog.status !== BlogStatus.PUBLISHED) {
            publishedAt = new Date();
        } else if (body.status && body.status !== BlogStatus.PUBLISHED) {
            publishedAt = null;
        }

        const updatedBlog = await prisma.blog.update({
            where: {
                id: blogId,
            },
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
                banner_image: body.banner_image ?? existingBlog.banner_image,
                canonical: body.canonical ?? existingBlog.canonical,
                schemaScript: body.schemaScript ?? existingBlog.schemaScript,
                timeToRead: body.timeToRead ?? existingBlog.timeToRead,
                authorId: body.authorId ?? existingBlog.authorId,
                categoryId: body.categoryId ?? existingBlog.categoryId,
            },
            include: {
                author: true,
                category: true,
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: updatedBlog,
                message: "Blog updated successfully.",
            },
            {
                status: 200,
            },
        );
    } catch (error) {
        console.error("PUT /api/blogs/[id] error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to update blog.",
            },
            {
                status: 500,
            },
        );
    }
}

// DELETE BLOG
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const blogId = parseInt(id);

        if (isNaN(blogId)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid blog ID.",
                },
                {
                    status: 400,
                },
            );
        }

        const existingBlog = await prisma.blog.findUnique({
            where: {
                id: blogId,
            },
        });

        if (!existingBlog) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Blog not found.",
                },
                {
                    status: 404,
                },
            );
        }

        await prisma.blog.delete({
            where: {
                id: blogId,
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: "Blog deleted successfully.",
            },
            {
                status: 200,
            },
        );
    } catch (error) {
        console.error("DELETE /api/blogs/[id] error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to delete blog.",
            },
            {
                status: 500,
            },
        );
    }
}
