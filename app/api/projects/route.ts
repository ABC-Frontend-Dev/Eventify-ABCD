// app/api/projects/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type ProjectBody = {
    title: string;
    description: string;
    bannerImage: string;
    images: string[];
    categoryId: number;
    hasTabs?: boolean;
    tabs?: Array<{
        name: string;
        images: string[];
    }>;
};

export async function GET() {
    try {
        const projects = await prisma.project.findMany({
            orderBy: {
                id: "desc",
            },
            include: {
                category: true,
                tabs: {
                    orderBy: {
                        order: "asc",
                    },
                },
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: projects,
                count: projects.length,
            },
            {
                status: 200,
            },
        );
    } catch (error) {
        console.log("GET /api/projects error: ", error);
        return NextResponse.json({ success: false, error: "Failed to fetch Projects data." }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body: ProjectBody = await request.json();

        if (!body.title || !body.description || !body.bannerImage || !body.categoryId) {
            return NextResponse.json({ success: false, error: "Title, description, banner image, and category are required." }, { status: 400 });
        }

        // Validate tabs or images
        if (body.hasTabs) {
            if (!body.tabs || body.tabs.length === 0) {
                return NextResponse.json({ success: false, error: "At least one tab is required when tabs are enabled." }, { status: 400 });
            }
        } else {
            if (!body.images || body.images.length === 0) {
                return NextResponse.json({ success: false, error: "At least one image is required." }, { status: 400 });
            }
        }

        const newProject = await prisma.project.create({
            data: {
                title: body.title,
                description: body.description,
                bannerImage: body.bannerImage,
                categoryId: body.categoryId,
                hasTabs: body.hasTabs || false,
                images: body.hasTabs ? [] : body.images,
                tabs: body.hasTabs
                    ? {
                          create:
                              body.tabs?.map((tab, index) => ({
                                  name: tab.name,
                                  images: tab.images,
                                  order: index,
                              })) || [],
                      }
                    : undefined,
            },
            include: {
                category: true,
                tabs: true,
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: newProject,
                message: "Project created successfully.",
            },
            {
                status: 201,
            },
        );
    } catch (error) {
        console.error("POST /api/projects error:", error);
        return NextResponse.json({ success: false, error: "Failed to create Project." }, { status: 500 });
    }
}
