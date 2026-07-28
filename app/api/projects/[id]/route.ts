import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type UpdateProjectBody = {
    title?: string;
    description?: string | null;
    bannerImage?: string;
    images?: string[];
    categoryId?: number;
    clientId?: number | null; // ✅ NEW
    projectClientLogo?: string | null; // ✅ NEW
    hasTabs?: boolean;
    tabs?: Array<{
        id?: number;
        name: string;
        images: string[];
    }>;
};

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const projectId = Number(id);

        if (isNaN(projectId)) {
            return NextResponse.json({ success: false, message: "Invalid project ID." }, { status: 400 });
        }

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                category: true,
                client: true, // ✅ NEW
                tabs: {
                    orderBy: { order: "asc" },
                },
            },
        });

        if (!project) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Project with id: ${projectId} not found.`,
                },
                { status: 404 },
            );
        }

        return NextResponse.json({ success: true, data: project }, { status: 200 });
    } catch (error) {
        console.error("GET /api/projects/[id] error:", error);
        return NextResponse.json({ success: false, message: "Failed to fetch project." }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const projectId = Number(id);

        if (isNaN(projectId)) {
            return NextResponse.json({ success: false, message: "Invalid project ID." }, { status: 400 });
        }

        const body: UpdateProjectBody = await request.json();

        const existingProject = await prisma.project.findUnique({
            where: { id: projectId },
            include: { tabs: true },
        });

        if (!existingProject) {
            return NextResponse.json({ success: false, message: "Project not found." }, { status: 404 });
        }

        if (body.categoryId) {
            const existingCategory = await prisma.projectCategory.findUnique({
                where: { id: body.categoryId },
            });

            if (!existingCategory) {
                return NextResponse.json({ success: false, message: "Category not found." }, { status: 404 });
            }
        }

        // ✅ NEW: Validate client if provided
        if (body.clientId) {
            const clientExists = await prisma.clients.findUnique({
                where: { id: body.clientId },
            });
            if (!clientExists) {
                return NextResponse.json({ success: false, message: "Client not found." }, { status: 404 });
            }
        }

        if (body.hasTabs !== undefined) {
            if (body.hasTabs) {
                await prisma.projectTab.deleteMany({
                    where: { projectId },
                });

                if (body.tabs && body.tabs.length > 0) {
                    await prisma.projectTab.createMany({
                        data: body.tabs.map((tab, index) => ({
                            projectId,
                            name: tab.name,
                            images: tab.images,
                            order: index,
                        })),
                    });
                }
            } else {
                await prisma.projectTab.deleteMany({
                    where: { projectId },
                });
            }
        }

        const updatedProject = await prisma.project.update({
            where: { id: projectId },
            data: {
                title: body.title ?? existingProject.title,
                description: body.description !== undefined ? body.description?.trim() || null : existingProject.description,
                bannerImage: body.bannerImage ?? existingProject.bannerImage,
                images: body.hasTabs ? [] : (body.images ?? existingProject.images),
                categoryId: body.categoryId ?? existingProject.categoryId,
                clientId: body.clientId !== undefined ? body.clientId : existingProject.clientId, // ✅ NEW
                projectClientLogo: body.projectClientLogo !== undefined ? body.projectClientLogo : existingProject.projectClientLogo, // ✅ NEW
                hasTabs: body.hasTabs ?? existingProject.hasTabs,
            },
            include: {
                category: true,
                client: true, // ✅ NEW
                tabs: {
                    orderBy: { order: "asc" },
                },
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: updatedProject,
                message: "Project updated successfully.",
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("PUT /api/projects/[id] error:", error);
        return NextResponse.json({ success: false, message: "Failed to update project." }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const projectId = Number(id);

        if (isNaN(projectId)) {
            return NextResponse.json({ success: false, message: "Invalid project ID." }, { status: 400 });
        }

        const existingProject = await prisma.project.findUnique({
            where: { id: projectId },
        });

        if (!existingProject) {
            return NextResponse.json({ success: false, message: "Project not found." }, { status: 404 });
        }

        await prisma.project.delete({
            where: { id: projectId },
        });

        return NextResponse.json({ success: true, message: "Project deleted successfully." }, { status: 200 });
    } catch (error) {
        console.error("DELETE /api/projects/[id] error:", error);
        return NextResponse.json({ success: false, message: "Failed to delete project." }, { status: 500 });
    }
}
