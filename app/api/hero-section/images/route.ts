import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type HeroImageBody = {
    imageUrl: string;
    altText?: string;
    title?: string;
    description?: string;
    isActive?: boolean;
};

async function getOrCreateHeroSectionId() {
    const existing = await prisma.heroSection.findFirst();
    if (existing) return existing.id;
    const created = await prisma.heroSection.create({ data: { mediaType: "video" } });
    return created.id;
}

export async function GET() {
    try {
        const heroId = await getOrCreateHeroSectionId();
        const images = await prisma.heroImage.findMany({
            where: { heroId },
            orderBy: { order: "asc" },
        });
        return NextResponse.json({ success: true, data: images }, { status: 200 });
    } catch (error) {
        console.error("GET /api/hero-section/images error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch hero images." }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body: HeroImageBody = await request.json();

        if (!body.imageUrl) {
            return NextResponse.json({ success: false, error: "imageUrl is required." }, { status: 400 });
        }

        const heroId = await getOrCreateHeroSectionId();
        const count = await prisma.heroImage.count({ where: { heroId } });

        const newImage = await prisma.$transaction(async (tx) => {
            if (body.isActive) {
                await tx.heroImage.updateMany({ where: { heroId }, data: { isActive: false } });
            }

            return tx.heroImage.create({
                data: {
                    heroId,
                    imageUrl: body.imageUrl,
                    altText: body.altText?.trim() || null,
                    title: body.title?.trim() || null,
                    description: body.description?.trim() || null,
                    isActive: !!body.isActive,
                    order: count,
                },
            });
        });

        return NextResponse.json({ success: true, data: newImage, message: "Hero image added successfully." }, { status: 201 });
    } catch (error) {
        console.error("POST /api/hero-section/images error:", error);
        return NextResponse.json({ success: false, error: "Failed to add hero image." }, { status: 500 });
    }
}
