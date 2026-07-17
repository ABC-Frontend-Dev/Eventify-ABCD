import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type ComparisonBody = {
    title?: string;
    description?: string;
    beforeImage?: string;
    afterImage?: string;
    order?: number;
};

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const comparisonId = parseInt(id);

        if (isNaN(comparisonId)) {
            return NextResponse.json({ success: false, error: "Invalid comparison ID." }, { status: 400 });
        }

        const comparison = await prisma.comparison.findUnique({
            where: { id: comparisonId },
        });

        if (!comparison) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Comparison with id: ${comparisonId} not found.`,
                },
                { status: 404 },
            );
        }

        return NextResponse.json({ success: true, data: comparison }, { status: 200 });
    } catch (error) {
        console.error("GET /api/comparisons/[id] error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch comparison." }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const comparisonId = parseInt(id);

        if (isNaN(comparisonId)) {
            return NextResponse.json({ success: false, error: "Invalid comparison ID." }, { status: 400 });
        }

        const body: ComparisonBody = await request.json();

        const existingComparison = await prisma.comparison.findUnique({
            where: { id: comparisonId },
        });

        if (!existingComparison) {
            return NextResponse.json({ success: false, error: "Comparison not found." }, { status: 404 });
        }

        const updatedComparison = await prisma.comparison.update({
            where: { id: comparisonId },
            data: {
                title: body.title ?? existingComparison.title,
                description: body.description ?? existingComparison.description,
                beforeImage: body.beforeImage ?? existingComparison.beforeImage,
                afterImage: body.afterImage ?? existingComparison.afterImage,
                order: body.order ?? existingComparison.order,
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: updatedComparison,
                message: "Comparison updated successfully.",
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("PUT /api/comparisons/[id] error:", error);
        return NextResponse.json({ success: false, error: "Failed to update comparison." }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const comparisonId = parseInt(id);

        if (isNaN(comparisonId)) {
            return NextResponse.json({ success: false, error: "Invalid comparison ID." }, { status: 400 });
        }

        const existingComparison = await prisma.comparison.findUnique({
            where: { id: comparisonId },
        });

        if (!existingComparison) {
            return NextResponse.json({ success: false, error: "Comparison not found." }, { status: 404 });
        }

        await prisma.comparison.delete({
            where: { id: comparisonId },
        });

        return NextResponse.json({ success: true, message: "Comparison deleted successfully." }, { status: 200 });
    } catch (error) {
        console.error("DELETE /api/comparisons/[id] error:", error);
        return NextResponse.json({ success: false, error: "Failed to delete comparison." }, { status: 500 });
    }
}
