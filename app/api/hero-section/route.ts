import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type HeroSectionBody = {
    mediaType: "video" | "image";
    videoUrl?: string;
    videoTitle?: string;
    videoDesc?: string;
};

// There is only ever one HeroSection row. This finds it, or creates a
// blank one on first use so the app never has to handle a totally missing row.
async function getOrCreateHeroSection() {
    let hero = await prisma.heroSection.findFirst({
        include: { images: { orderBy: { order: "asc" } } },
    });

    if (!hero) {
        hero = await prisma.heroSection.create({
            data: { mediaType: "video" },
            include: { images: { orderBy: { order: "asc" } } },
        });
    }

    return hero;
}

export async function GET() {
    try {
        const hero = await getOrCreateHeroSection();
        return NextResponse.json({ success: true, data: hero }, { status: 200 });
    } catch (error) {
        console.error("GET /api/hero-section error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch hero section." }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body: HeroSectionBody = await request.json();

        if (body.mediaType !== "video" && body.mediaType !== "image") {
            return NextResponse.json({ success: false, error: "mediaType must be 'video' or 'image'." }, { status: 400 });
        }

        if (body.mediaType === "video" && body.videoUrl === undefined) {
            const existingCheck = await getOrCreateHeroSection();
            if (!existingCheck.videoUrl && !body.videoUrl) {
                return NextResponse.json({ success: false, error: "Please upload a video before switching to video mode." }, { status: 400 });
            }
        }

        const existing = await getOrCreateHeroSection();

        const updated = await prisma.heroSection.update({
            where: { id: existing.id },
            data: {
                mediaType: body.mediaType,
                ...(body.videoUrl !== undefined ? { videoUrl: body.videoUrl } : {}),
                videoTitle: body.videoTitle?.trim() || null,
                videoDesc: body.videoDesc?.trim() || null,
            },
            include: { images: { orderBy: { order: "asc" } } },
        });

        return NextResponse.json({ success: true, data: updated, message: "Hero section updated successfully." }, { status: 200 });
    } catch (error) {
        console.error("PUT /api/hero-section error:", error);
        return NextResponse.json({ success: false, error: "Failed to update hero section." }, { status: 500 });
    }
}
