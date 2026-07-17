import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type ComparisonBody = {
    title: string;
    description?: string;
    beforeImage: string;
    afterImage: string;
    order?: number;
};

export async function GET(request: NextRequest) {
    try {
        const comparisons = await prisma.comparison.findMany({
            orderBy: {
                order: "asc",
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: comparisons,
                count: comparisons.length,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("GET /api/comparisons error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch comparisons." }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body: ComparisonBody = await request.json();

        if (!body.title || !body.beforeImage || !body.afterImage) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Title, beforeImage, and afterImage are required.",
                },
                { status: 400 },
            );
        }

        const maxOrder = await prisma.comparison.findFirst({
            orderBy: { order: "desc" },
            select: { order: true },
        });

        const newComparison = await prisma.comparison.create({
            data: {
                title: body.title,
                description: body.description || null,
                beforeImage: body.beforeImage,
                afterImage: body.afterImage,
                order: body.order ?? (maxOrder?.order ?? 0) + 1,
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: newComparison,
                message: "Comparison created successfully.",
            },
            { status: 201 },
        );
    } catch (error) {
        console.error("POST /api/comparisons error:", error);
        return NextResponse.json({ success: false, error: "Failed to create comparison." }, { status: 500 });
    }
}
