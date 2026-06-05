// app/api/projects/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type ProjectBody = {
    title: string;
    description: string;
    bannerImage: string;
    images: string[];
    categoryId: number;
};

export async function GET() {
    try {
        const project = await prisma.project.findMany({
            orderBy: {
                id: "asc",
            },
            include: {
                category: true,
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: project,
                count: project.length,
            },
            {
                status: 200,
            },
        );
    } catch (error) {
        console.log("Get /api/projects error: ", error);

        return NextResponse.json({ success: false, error: "Failed to fetch Projects data." }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body: ProjectBody = await request.json();

        if (!body.title || !body.description || !body.bannerImage || !body.images || !body.categoryId) {
            return NextResponse.json({ success: false, error: "All fields are required." }, { status: 400 });
        }

        const newProject = await prisma.project.create({
            data: {
                title: body.title,
                description: body.description,
                bannerImage: body.bannerImage,
                images: body.images,
                categoryId: body.categoryId,
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
        return NextResponse.json({ success: false, error: "Failed to create Project." }, { status: 500 });
    }
}
