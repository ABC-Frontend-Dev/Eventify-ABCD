import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const awardId = parseInt(id);

        if (isNaN(awardId)) {
            return NextResponse.json({ success: false, error: "Invalid award ID." }, { status: 400 });
        }

        const award = await prisma.award.findUnique({
            where: { id: awardId },
            include: {
                categories: {
                    orderBy: { order: "asc" },
                    include: {
                        items: { orderBy: { order: "asc" } },
                        carouselImages: { orderBy: { order: "asc" } },
                    },
                },
            },
        });

        if (!award) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Award with id: ${awardId} not found.`,
                },
                { status: 404 },
            );
        }

        return NextResponse.json({ success: true, data: award }, { status: 200 });
    } catch (error) {
        console.error("GET /api/awards/[id] error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch award." }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const awardId = parseInt(id);

        if (isNaN(awardId)) {
            return NextResponse.json({ success: false, error: "Invalid award ID." }, { status: 400 });
        }

        const body = await request.json();

        const existingAward = await prisma.award.findUnique({
            where: { id: awardId },
        });

        if (!existingAward) {
            return NextResponse.json({ success: false, error: "Award not found." }, { status: 404 });
        }

        const updatedAward = await prisma.award.update({
            where: { id: awardId },
            data: {
                year: body.year ?? existingAward.year,
                order: body.order ?? existingAward.order,
            },
            include: {
                categories: {
                    orderBy: { order: "asc" },
                    include: {
                        items: { orderBy: { order: "asc" } },
                        carouselImages: { orderBy: { order: "asc" } },
                    },
                },
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: updatedAward,
                message: "Award updated successfully.",
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("PUT /api/awards/[id] error:", error);
        return NextResponse.json({ success: false, error: "Failed to update award." }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const awardId = parseInt(id);

        if (isNaN(awardId)) {
            return NextResponse.json({ success: false, error: "Invalid award ID." }, { status: 400 });
        }

        const existingAward = await prisma.award.findUnique({
            where: { id: awardId },
        });

        if (!existingAward) {
            return NextResponse.json({ success: false, error: "Award not found." }, { status: 404 });
        }

        await prisma.award.delete({
            where: { id: awardId },
        });

        return NextResponse.json({ success: true, message: "Award deleted successfully." }, { status: 200 });
    } catch (error) {
        console.error("DELETE /api/awards/[id] error:", error);
        return NextResponse.json({ success: false, error: "Failed to delete award." }, { status: 500 });
    }
}
