import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type ComparisonImageInput = {
    beforeImage: string;
    beforeAlt?: string;
    afterImage: string;
    afterAlt?: string;
};

type ServiceBody = {
    title: string;
    url: string;
    breadcrumb?: string;
    description?: string;
    content: string;
    bannerImage: string;
    bannerImageAlt?: string;
    mediaType?: "image" | "video";
    videoUrl?: string;
    videoPoster?: string;
    order?: number;
    comparisonImages?: ComparisonImageInput[];
};

export async function GET() {
    try {
        const services = await prisma.service.findMany({
            orderBy: { order: "asc" },
            include: {
                comparisonImages: { orderBy: { order: "asc" } },
            },
        });

        return NextResponse.json(
            { success: true, data: services, count: services.length },
            { status: 200 }
        );
    } catch (error) {
        console.error("GET /api/services error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch services." },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body: ServiceBody = await request.json();

        if (!body.title || !body.content || !body.url) {
            return NextResponse.json(
                { success: false, error: "Title, content, and URL are required." },
                { status: 400 }
            );
        }

        // Validate mediaType
        if (body.mediaType === "video" && !body.videoUrl) {
            return NextResponse.json(
                { success: false, error: "Video URL is required when mediaType is video." },
                { status: 400 }
            );
        }

        if (
            body.mediaType === "image" &&
            body.comparisonImages &&
            body.comparisonImages.length > 0
        ) {
            for (const img of body.comparisonImages) {
                if (!img.beforeImage || !img.afterImage) {
                    return NextResponse.json(
                        {
                            success: false,
                            error: "Each comparison pair needs both before and after images.",
                        },
                        { status: 400 }
                    );
                }
            }
        }

        // Check URL uniqueness
        const existing = await prisma.service.findUnique({
            where: { url: body.url },
        });
        if (existing) {
            return NextResponse.json(
                { success: false, error: "A service with this URL already exists." },
                { status: 400 }
            );
        }

        // Auto-increment order
        const maxOrder = await prisma.service.findFirst({
            orderBy: { order: "desc" },
            select: { order: true },
        });

        const newService = await prisma.service.create({
            data: {
                title: body.title,
                url: body.url,
                breadcrumb: body.breadcrumb || body.title,
                description: body.description || null,
                content: body.content,
                bannerImage: body.bannerImage,
                bannerImageAlt: body.bannerImageAlt || null,
                mediaType: body.mediaType || "image",
                videoUrl: body.videoUrl || null,
                videoPoster: body.videoPoster || null,
                order: body.order ?? (maxOrder?.order ?? -1) + 1,
                comparisonImages:
                    body.comparisonImages?.length
                        ? {
                              createMany: {
                                  data: body.comparisonImages.map((img, idx) => ({
                                      beforeImage: img.beforeImage,
                                      beforeAlt: img.beforeAlt || null,
                                      afterImage: img.afterImage,
                                      afterAlt: img.afterAlt || null,
                                      order: idx,
                                  })),
                              },
                          }
                        : undefined,
            },
            include: {
                comparisonImages: { orderBy: { order: "asc" } },
            },
        });

        return NextResponse.json(
            { success: true, data: newService, message: "Service created successfully." },
            { status: 201 }
        );
    } catch (error) {
        console.error("POST /api/services error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to create service." },
            { status: 500 }
        );
    }
}