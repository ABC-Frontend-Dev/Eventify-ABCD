// app/api/projects/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type UpdateProjectBody = {
    title?: string;
    description?: string;
    bannerImage?: string;
    images?: string[];
    categoryId?: number;
};

// GET SINGLE PROJECT
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const projectId = Number(id);

        if (isNaN(projectId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid project ID.",
                },
                {
                    status: 400,
                },
            );
        }

        const project = await prisma.project.findUnique({
            where: {
                id: projectId,
            },

            include: {
                category: true,
            },
        });

        if (!project) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Project not found.",
                },
                {
                    status: 404,
                },
            );
        }

        return NextResponse.json(
            {
                success: true,
                data: project,
            },
            {
                status: 200,
            },
        );
    } catch (error) {
        console.error("GET /api/projects/[id] error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch project.",
            },
            {
                status: 500,
            },
        );
    }
}

// UPDATE PROJECT
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const projectId = Number(id);

        if (isNaN(projectId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid project ID.",
                },
                {
                    status: 400,
                },
            );
        }

        const body: UpdateProjectBody = await request.json();

        const existingProject = await prisma.project.findUnique({
            where: {
                id: projectId,
            },
        });

        if (!existingProject) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Project not found.",
                },
                {
                    status: 404,
                },
            );
        }

        // CHECK CATEGORY EXISTS
        if (body.categoryId) {
            const existingCategory = await prisma.projectCategory.findUnique({
                where: {
                    id: body.categoryId,
                },
            });

            if (!existingCategory) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Category not found.",
                    },
                    {
                        status: 404,
                    },
                );
            }
        }

        const updatedProject = await prisma.project.update({
            where: {
                id: projectId,
            },

            data: {
                title: body.title ?? existingProject.title,
                description: body.description ?? existingProject.description,
                bannerImage: body.bannerImage ?? existingProject.bannerImage,
                images: body.images ?? existingProject.images,
                categoryId: body.categoryId ?? existingProject.categoryId,
            },

            include: {
                category: true,
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: updatedProject,
                message: "Project updated successfully.",
            },
            {
                status: 200,
            },
        );
    } catch (error) {
        console.error("PUT /api/projects/[id] error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to update project.",
            },
            {
                status: 500,
            },
        );
    }
}

// DELETE PROJECT
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const projectId = Number(id);

        if (isNaN(projectId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid project ID.",
                },
                {
                    status: 400,
                },
            );
        }

        const existingProject = await prisma.project.findUnique({
            where: {
                id: projectId,
            },
        });

        if (!existingProject) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Project not found.",
                },
                {
                    status: 404,
                },
            );
        }

        await prisma.project.delete({
            where: {
                id: projectId,
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: "Project deleted successfully.",
            },
            {
                status: 200,
            },
        );
    } catch (error) {
        console.error("DELETE /api/projects/[id] error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to delete project.",
            },
            {
                status: 500,
            },
        );
    }
}
