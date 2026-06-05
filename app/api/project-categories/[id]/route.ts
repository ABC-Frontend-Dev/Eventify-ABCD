// app/api/project-categories/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type UpdateCategoryBody = {
    name?: string;
    description?: string;
};

// GET SINGLE CATEGORY
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const categoryId = parseInt(id);

        if (isNaN(categoryId)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid category ID.",
                },
                {
                    status: 400,
                },
            );
        }

        const category = await prisma.projectCategory.findUnique({
            where: {
                id: categoryId,
            },
            include: {
                _count: {
                    select: { project: true },
                },
            },
        });

        if (!category) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Category with id: ${categoryId} not found.`,
                },
                {
                    status: 404,
                },
            );
        }

        return NextResponse.json(
            {
                success: true,
                data: category,
            },
            {
                status: 200,
            },
        );
    } catch (error) {
        console.error("GET /api/project-categories/[id] error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch category.",
            },
            { status: 500 },
        );
    }
}

// UPDATE CATEGORY
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const categoryId = parseInt(id);

        if (isNaN(categoryId)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid category ID.",
                },
                {
                    status: 400,
                },
            );
        }

        const body: UpdateCategoryBody = await request.json();

        const existingCategory = await prisma.projectCategory.findUnique({
            where: {
                id: categoryId,
            },
        });

        if (!existingCategory) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Category not found.",
                },
                {
                    status: 404,
                },
            );
        }

        // Check if new name conflicts with existing category
        if (body.name && body.name !== existingCategory.name) {
            const nameConflict = await prisma.projectCategory.findFirst({
                where: {
                    name: {
                        equals: body.name,
                        mode: "insensitive",
                    },
                    id: {
                        not: categoryId,
                    },
                },
            });

            if (nameConflict) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Category with this name already exists.",
                    },
                    { status: 400 },
                );
            }
        }

        const updatedCategory = await prisma.projectCategory.update({
            where: {
                id: categoryId,
            },
            data: {
                name: body.name?.trim() ?? existingCategory.name,
                description: body.description?.trim() ?? existingCategory.description,
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: updatedCategory,
                message: "Category updated successfully.",
            },
            {
                status: 200,
            },
        );
    } catch (error) {
        console.error("PUT /api/project-categories/[id] error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to update category.",
            },
            {
                status: 500,
            },
        );
    }
}

// DELETE CATEGORY
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const categoryId = parseInt(id);

        if (isNaN(categoryId)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid category ID.",
                },
                {
                    status: 400,
                },
            );
        }

        const existingCategory = await prisma.projectCategory.findUnique({
            where: {
                id: categoryId,
            },
            include: {
                _count: {
                    select: { project: true },
                },
            },
        });

        if (!existingCategory) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Category not found.",
                },
                {
                    status: 404,
                },
            );
        }

        // Check if category has projects
        if (existingCategory._count.project > 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Cannot delete category. It has ${existingCategory._count.project} project(s) associated with it.`,
                },
                {
                    status: 400,
                },
            );
        }

        await prisma.projectCategory.delete({
            where: {
                id: categoryId,
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: "Category deleted successfully.",
            },
            {
                status: 200,
            },
        );
    } catch (error) {
        console.error("DELETE /api/project-categories/[id] error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to delete category.",
            },
            {
                status: 500,
            },
        );
    }
}
