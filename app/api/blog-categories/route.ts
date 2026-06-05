// app/api/project-categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type BlogCategoryBody = {
    name: string;
    description?: string;
};

export async function GET() {
    try {
        const categories = await prisma.blogCategory.findMany({
            orderBy: {
                id: "asc",
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: categories,
                count: categories.length,
            },
            {
                status: 200,
            },
        );
    } catch (error) {
        console.log("GET /api/blog-categories error: ", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch categories data.",
            },
            { status: 500 },
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body: BlogCategoryBody = await request.json();

        if (!body.name || !body.name.trim()) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Category name is required.",
                },
                { status: 400 },
            );
        }

        // Check if category already exists
        const existingCategory = await prisma.blogCategory.findFirst({
            where: {
                name: {
                    equals: body.name,
                    mode: "insensitive",
                },
            },
        });

        if (existingCategory) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Category with this name already exists.",
                },
                { status: 400 },
            );
        }

        const newCategory = await prisma.blogCategory.create({
            data: {
                name: body.name.trim(),
                description: body.description?.trim() || null,
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: newCategory,
                message: "Category created successfully.",
            },
            {
                status: 201,
            },
        );
    } catch (error) {
        console.error("POST /api/blog-categories error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to create category.",
            },
            { status: 500 },
        );
    }
}
