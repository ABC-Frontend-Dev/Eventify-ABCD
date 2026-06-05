// app/api/authors/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type UpdateAuthorBody = {
    name: string;
    email: string;
    bio?: string;
    avatar?: string;
};

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const authorId = parseInt(id);

        if (isNaN(authorId)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid author ID.",
                },
                { status: 400 },
            );
        }

        const author = await prisma.author.findUnique({
            where: { id: authorId },
            include: {
                _count: {
                    select: { blogs: true },
                },
            },
        });

        if (!author) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Author not found.",
                },
                { status: 404 },
            );
        }

        return NextResponse.json(
            {
                success: true,
                data: author,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("GET /api/authors/[id] error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch author.",
            },
            { status: 500 },
        );
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const authorId = parseInt(id);

        if (isNaN(authorId)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid author ID.",
                },
                { status: 400 },
            );
        }

        const body: UpdateAuthorBody = await request.json();

        const existingAuthor = await prisma.author.findUnique({
            where: { id: authorId },
        });

        if (!existingAuthor) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Author not found.",
                },
                { status: 404 },
            );
        }

        // Check if email conflicts
        if (body.email && body.email !== existingAuthor.email) {
            const emailConflict = await prisma.author.findUnique({
                where: { email: body.email },
            });

            if (emailConflict) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "An author with this email already exists.",
                    },
                    { status: 400 },
                );
            }
        }

        const updatedAuthor = await prisma.author.update({
            where: { id: authorId },
            data: {
                name: body.name ?? existingAuthor.name,
                email: body.email ?? existingAuthor.email,
                bio: body.bio ?? existingAuthor.bio,
                avatar: body.avatar ?? existingAuthor.avatar,
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: updatedAuthor,
                message: "Author updated successfully.",
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("PUT /api/authors/[id] error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to update author.",
            },
            { status: 500 },
        );
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const authorId = parseInt(id);

        if (isNaN(authorId)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid author ID.",
                },
                { status: 400 },
            );
        }

        const existingAuthor = await prisma.author.findUnique({
            where: { id: authorId },
            include: {
                _count: {
                    select: { blogs: true },
                },
            },
        });

        if (!existingAuthor) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Author not found.",
                },
                { status: 404 },
            );
        }

        // Check if author has blogs
        if (existingAuthor._count.blogs > 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Cannot delete author. They have ${existingAuthor._count.blogs} blog(s) associated with them.`,
                },
                { status: 400 },
            );
        }

        await prisma.author.delete({
            where: { id: authorId },
        });

        return NextResponse.json(
            {
                success: true,
                message: "Author deleted successfully.",
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("DELETE /api/authors/[id] error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to delete author.",
            },
            { status: 500 },
        );
    }
}
