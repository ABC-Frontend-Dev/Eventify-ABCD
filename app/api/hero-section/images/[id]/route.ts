import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type HeroImageUpdateBody = {
    altText?: string;
    title?: string;
    description?: string;
    isActive?: boolean;
};

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const imageId = parseInt(id);

        if (isNaN(imageId)) {
            return NextResponse.json({ success: false, error: "Invalid hero image ID." }, { status: 400 });
        }

        const body: HeroImageUpdateBody = await request.json();

        const existing = await prisma.heroImage.findUnique({ where: { id: imageId } });

        if (!existing) {
            return NextResponse.json({ success: false, error: "Hero image not found." }, { status: 404 });
        }

        const updated = await prisma.$transaction(async (tx) => {
            if (body.isActive) {
                // Only one image can be active at a time — deactivate all siblings first.
                await tx.heroImage.updateMany({
                    where: { heroId: existing.heroId, id: { not: imageId } },
                    data: { isActive: false },
                });
            }

            return tx.heroImage.update({
                where: { id: imageId },
                data: {
                    altText: body.altText !== undefined ? body.altText.trim() || null : existing.altText,
                    title: body.title !== undefined ? body.title.trim() || null : existing.title,
                    description: body.description !== undefined ? body.description.trim() || null : existing.description,
                    isActive: body.isActive !== undefined ? body.isActive : existing.isActive,
                },
            });
        });

        return NextResponse.json({ success: true, data: updated, message: "Hero image updated successfully." }, { status: 200 });
    } catch (error) {
        console.error("PUT /api/hero-section/images/[id] error:", error);
        return NextResponse.json({ success: false, error: "Failed to update hero image." }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const imageId = parseInt(id);

        if (isNaN(imageId)) {
            return NextResponse.json({ success: false, error: "Invalid hero image ID." }, { status: 400 });
        }

        const existing = await prisma.heroImage.findUnique({ where: { id: imageId } });

        if (!existing) {
            return NextResponse.json({ success: false, error: "Hero image not found." }, { status: 404 });
        }

        await prisma.heroImage.delete({ where: { id: imageId } });

        return NextResponse.json({ success: true, message: "Hero image deleted successfully." }, { status: 200 });
    } catch (error) {
        console.error("DELETE /api/hero-section/images/[id] error:", error);
        return NextResponse.json({ success: false, error: "Failed to delete hero image." }, { status: 500 });
    }
}
