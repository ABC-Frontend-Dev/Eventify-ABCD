// app/api/blogs/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ── Default fallback names ────────────────────────────────────────────────────
const DEFAULT_AUTHOR_NAME = "Eventify";
const DEFAULT_CATEGORY_NAME = "Activations";

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
    thumbnailAlt?: string;
    banner_image: string;
    bannerImageAlt?: string;
    canonical: string;
    schemaScript: string;
    timeToRead?: string;
    authorId?: number | null; // ✅ now optional
    categoryId?: number | null; // ✅ now optional
};

function isValidSlug(slug: string): boolean {
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const search = searchParams.get("search");
        const slug = searchParams.get("slug");
        const status = searchParams.get("status");
        const categoryId = searchParams.get("categoryId");
        const authorId = searchParams.get("authorId");
        const sortBy = searchParams.get("sortBy") || "latest";
        const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;

        const where: any = {};

        if (slug) {
            if (!isValidSlug(slug)) {
                return NextResponse.json({ success: false, error: "Invalid slug format", data: null }, { status: 400 });
            }
            where.slug = slug;
        }

        if (search) {
            where.OR = [{ title: { contains: search, mode: "insensitive" } }, { description: { contains: search, mode: "insensitive" } }, { content: { contains: search, mode: "insensitive" } }];
        }

        if (status && Object.values(BlogStatus).includes(status as BlogStatus)) {
            where.status = status;
        }

        if (categoryId) where.categoryId = parseInt(categoryId);
        if (authorId) where.authorId = parseInt(authorId);

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
            include: { author: true, category: true },
        });

        if (slug && blogs.length === 0) {
            return NextResponse.json({ success: false, error: "Blog not found", data: null }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: blogs, count: blogs.length }, { status: 200 });
    } catch (error) {
        console.error("GET /api/blogs error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch blogs." }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body: BlogBody = await request.json();

        // ── Core content validation ───────────────────────────────────────────
        if (!body.title || !body.slug || !body.description || !body.content) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Title, slug, description, and content are required.",
                },
                { status: 400 },
            );
        }

        if (!isValidSlug(body.slug)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid slug format. Use only lowercase letters, numbers, and hyphens.",
                },
                { status: 400 },
            );
        }

        // ── Slug uniqueness ───────────────────────────────────────────────────
        const existingBlog = await prisma.blog.findUnique({ where: { slug: body.slug } });
        if (existingBlog) {
            return NextResponse.json({ success: false, error: "A blog with this slug already exists." }, { status: 400 });
        }

        // ── Resolve author (use provided ID → fallback to "Eventify") ────────
        let resolvedAuthorId: number;

        if (body.authorId) {
            const authorExists = await prisma.author.findUnique({
                where: { id: body.authorId },
            });
            if (!authorExists) {
                return NextResponse.json({ success: false, error: "Author not found." }, { status: 404 });
            }
            resolvedAuthorId = body.authorId;
        } else {
            // fallback: find by name
            const defaultAuthor = await prisma.author.findFirst({
                where: { name: { equals: DEFAULT_AUTHOR_NAME, mode: "insensitive" } },
            });
            if (!defaultAuthor) {
                return NextResponse.json(
                    {
                        success: false,
                        error: `Default author "${DEFAULT_AUTHOR_NAME}" not found. Please create it first.`,
                    },
                    { status: 404 },
                );
            }
            resolvedAuthorId = defaultAuthor.id;
        }

        // ── Resolve category (use provided ID → fallback to "Activations") ───
        let resolvedCategoryId: number;

        if (body.categoryId) {
            const categoryExists = await prisma.blogCategory.findUnique({
                where: { id: body.categoryId },
            });
            if (!categoryExists) {
                return NextResponse.json({ success: false, error: "Category not found." }, { status: 404 });
            }
            resolvedCategoryId = body.categoryId;
        } else {
            // fallback: find by name
            const defaultCategory = await prisma.blogCategory.findFirst({
                where: { name: { equals: DEFAULT_CATEGORY_NAME, mode: "insensitive" } },
            });
            if (!defaultCategory) {
                return NextResponse.json(
                    {
                        success: false,
                        error: `Default category "${DEFAULT_CATEGORY_NAME}" not found. Please create it first.`,
                    },
                    { status: 404 },
                );
            }
            resolvedCategoryId = defaultCategory.id;
        }

        // ── Create ────────────────────────────────────────────────────────────
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
                thumbnailAlt: body.thumbnailAlt || body.metaTitle || body.title,
                banner_image: body.banner_image,
                bannerImageAlt: body.bannerImageAlt || body.metaTitle || body.title,
                canonical: body.canonical,
                schemaScript: body.schemaScript || "",
                // ✅ default to "5 min read" if not provided
                timeToRead: body.timeToRead || "5 min read",
                authorId: resolvedAuthorId,
                categoryId: resolvedCategoryId,
            },
            include: { author: true, category: true },
        });

        return NextResponse.json({ success: true, data: newBlog, message: "Blog created successfully." }, { status: 201 });
    } catch (error) {
        console.error("POST /api/blogs error:", error);
        return NextResponse.json({ success: false, error: "Failed to create blog." }, { status: 500 });
    }
}
