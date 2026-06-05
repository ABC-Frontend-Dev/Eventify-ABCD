// app/api/authors/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type AuthorBody = {
    name: string;
    email: string;
    bio?: string;
    avatar?: string;
};

export async function GET() {
    try {
        const authors = await prisma.author.findMany({
            orderBy: {
                name: "asc",
            },
            include: {
                _count: {
                    select: { blogs: true },
                },
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: authors,
                count: authors.length,
            },
            {
                status: 200,
            },
        );
    } catch (error) {
        console.error("GET /api/authors error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch authors.",
            },
            { status: 500 },
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body: AuthorBody = await request.json();

        if (!body.name || !body.email) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Name and email are required.",
                },
                { status: 400 },
            );
        }

        // Check if email already exists
        const existingAuthor = await prisma.author.findUnique({
            where: { email: body.email },
        });

        if (existingAuthor) {
            return NextResponse.json(
                {
                    success: false,
                    error: "An author with this email already exists.",
                },
                { status: 400 },
            );
        }

        const newAuthor = await prisma.author.create({
            data: {
                name: body.name,
                email: body.email,
                bio: body.bio || null,
                avatar: body.avatar || null,
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: newAuthor,
                message: "Author created successfully.",
            },
            {
                status: 201,
            },
        );
    } catch (error) {
        console.error("POST /api/authors error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to create author.",
            },
            { status: 500 },
        );
    }
}
