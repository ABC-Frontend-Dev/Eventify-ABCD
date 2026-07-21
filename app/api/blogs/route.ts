import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

enum BlogStatus {
    DRAFT = "DRAFT",
    PUBLISHED = "PUBLISHED",
    ARCHIVED = "ARCHIVED",
}

type BlogBody = {
    title: string;
    slug: string;
    description: string;
    content: string;
    status: BlogStatus;
    publishedAt?: Date | null;
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    thumbnail: string;
    banner_image: string;
    canonical: string;
    schemaScript: string;
    timeToRead?: string;
    authorId: number;
    categoryId: number;
};

// ── Slug validation helper ──────────────────────────────────
function isValidSlug(slug: string): boolean {
    // Only allow lowercase alphanumeric, hyphens, and underscores
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

// ── Format slug helper ──────────────────────────────────────
function formatSlug(slug: string): string {
    return slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-_]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Get query parameters
        const search = searchParams.get("search");
        const slug = searchParams.get("slug");
        const status = searchParams.get("status");
        const categoryId = searchParams.get("categoryId");
        const authorId = searchParams.get("authorId");
        const sortBy = searchParams.get("sortBy") || "latest";
        const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;

        // Build where clause
        const where: any = {};

        // Slug filter
        if (slug) {
            // Validate slug format
            if (!isValidSlug(slug)) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Invalid slug format",
                        data: null,
                    },
                    { status: 400 },
                );
            }
            where.slug = slug;
        }

        // Search filter
        if (search) {
            where.OR = [{ title: { contains: search, mode: "insensitive" } }, { description: { contains: search, mode: "insensitive" } }, { content: { contains: search, mode: "insensitive" } }];
        }

        // Status filter
        if (status && Object.values(BlogStatus).includes(status as BlogStatus)) {
            where.status = status;
        }

        // Category filter
        if (categoryId) {
            where.categoryId = parseInt(categoryId);
        }

        // Author filter
        if (authorId) {
            where.authorId = parseInt(authorId);
        }

        // Build orderBy clause
        let orderBy: any = {};
        switch (sortBy) {
            case "latest":
                orderBy = { createdAt: "desc" };
                break;
            case "oldest":
                orderBy = { createdAt: "asc" };
                break;
            case "title-asc":
                orderBy = { title: "asc" };
                break;
            case "title-desc":
                orderBy = { title: "desc" };
                break;
            default:
                orderBy = { createdAt: "desc" };
        }

        const blogs = await prisma.blog.findMany({
            where,
            orderBy,
            take: limit,
            include: {
                author: true,
                category: true,
            },
        });

        // If searching by slug and no results found, return 404
        if (slug && blogs.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Blog not found",
                    data: null,
                },
                { status: 404 },
            );
        }

        return NextResponse.json(
            {
                success: true,
                data: blogs,
                count: blogs.length,
            },
            {
                status: 200,
            },
        );
    } catch (error) {
        console.error("GET /api/blogs error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch blogs.",
            },
            { status: 500 },
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body: BlogBody = await request.json();

        // Validation
        if (!body.title || !body.slug || !body.description || !body.content) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Title, slug, description, and content are required.",
                },
                { status: 400 },
            );
        }

        if (!body.authorId || !body.categoryId) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Author and category are required.",
                },
                { status: 400 },
            );
        }

        // Validate and format slug
        if (!isValidSlug(body.slug)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid slug format. Use only lowercase letters, numbers, and hyphens.",
                },
                { status: 400 },
            );
        }

        // Check if slug already exists
        const existingBlog = await prisma.blog.findUnique({
            where: { slug: body.slug },
        });

        if (existingBlog) {
            return NextResponse.json(
                {
                    success: false,
                    error: "A blog with this slug already exists.",
                },
                { status: 400 },
            );
        }

        // Verify author exists
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

        // Verify category exists
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

        const newBlog = await prisma.blog.create({
            data: {
                title: body.title,
                slug: body.slug,
                description: body.description,
                content: body.content,
                status: body.status || BlogStatus.DRAFT,
                publishedAt: body.status === BlogStatus.PUBLISHED ? new Date() : null,
                metaTitle: body.metaTitle || body.title,
                metaDescription: body.metaDescription || body.description,
                keywords: body.keywords || [],
                thumbnail: body.thumbnail,
                banner_image: body.banner_image,
                canonical: body.canonical,
                schemaScript: body.schemaScript || "",
                timeToRead: body.timeToRead,
                authorId: body.authorId,
                categoryId: body.categoryId,
            },
            include: {
                author: true,
                category: true,
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: newBlog,
                message: "Blog created successfully.",
            },
            {
                status: 201,
            },
        );
    } catch (error) {
        console.error("POST /api/blogs error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to create blog.",
            },
            { status: 500 },
        );
    }
}
