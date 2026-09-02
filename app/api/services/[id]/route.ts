// app/api/services/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        const serviceId = parseInt(id);
        if (isNaN(serviceId)) {
            return NextResponse.json(
                { success: false, error: "Invalid service ID." },
                { status: 400 }
            );
        }

        const service = await prisma.service.findUnique({
            where: { id: serviceId },
            include: { comparisonImages: { orderBy: { order: "asc" } } },
        });

        if (!service) {
            return NextResponse.json(
                { success: false, error: "Service not found." },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: service }, { status: 200 });
    } catch (error) {
        console.error("GET /api/services/[id] error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch service." },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        const serviceId = parseInt(id);
        if (isNaN(serviceId)) {
            return NextResponse.json(
                { success: false, error: "Invalid service ID." },
                { status: 400 }
            );
        }

        const body = await request.json();

        const existing = await prisma.service.findUnique({
            where: { id: serviceId },
        });
        if (!existing) {
            return NextResponse.json(
                { success: false, error: "Service not found." },
                { status: 404 }
            );
        }

        // Check URL uniqueness if changed
        if (body.url && body.url !== existing.url) {
            const urlTaken = await prisma.service.findUnique({
                where: { url: body.url },
            });
            if (urlTaken) {
                return NextResponse.json(
                    { success: false, error: "A service with this URL already exists." },
                    { status: 400 }
                );
            }
        }

        // Handle comparison images replacement
        if (body.comparisonImages !== undefined) {
            await prisma.serviceComparisonImage.deleteMany({
                where: { serviceId },
            });
        }

        const updatedService = await prisma.service.update({
            where: { id: serviceId },
            data: {
                title: body.title ?? existing.title,
                url: body.url ?? existing.url,
                breadcrumb: body.breadcrumb ?? existing.breadcrumb,
                description:
                    body.description !== undefined
                        ? body.description || null
                        : existing.description,
                content: body.content ?? existing.content,
                bannerImage:
                    body.bannerImage !== undefined
                        ? body.bannerImage
                        : existing.bannerImage,
                bannerImageAlt:
                    body.bannerImageAlt !== undefined
                        ? body.bannerImageAlt || null
                        : existing.bannerImageAlt,
                mediaType: body.mediaType ?? existing.mediaType,
                videoUrl:
                    body.videoUrl !== undefined
                        ? body.videoUrl || null
                        : existing.videoUrl,
                videoPoster:
                    body.videoPoster !== undefined
                        ? body.videoPoster || null
                        : existing.videoPoster,
                order: body.order ?? existing.order,
                ...(body.comparisonImages !== undefined && {
                    comparisonImages: {
                        createMany: {
                            data: (body.comparisonImages as any[]).map(
                                (img: any, idx: number) => ({
                                    beforeImage: img.beforeImage,
                                    beforeAlt: img.beforeAlt || null,
                                    afterImage: img.afterImage,
                                    afterAlt: img.afterAlt || null,
                                    order: idx,
                                })
                            ),
                        },
                    },
                }),
            },
            include: {
                comparisonImages: { orderBy: { order: "asc" } },
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: updatedService,
                message: "Service updated successfully.",
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("PUT /api/services/[id] error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to update service." },
            { status: 500 }
        );
    }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        const serviceId = parseInt(id);
        if (isNaN(serviceId)) {
            return NextResponse.json(
                { success: false, error: "Invalid service ID." },
                { status: 400 }
            );
        }

        const existing = await prisma.service.findUnique({
            where: { id: serviceId },
        });
        if (!existing) {
            return NextResponse.json(
                { success: false, error: "Service not found." },
                { status: 404 }
            );
        }

        await prisma.service.delete({ where: { id: serviceId } });

        return NextResponse.json(
            { success: true, message: "Service deleted successfully." },
            { status: 200 }
        );
    } catch (error) {
        console.error("DELETE /api/services/[id] error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to delete service." },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        const serviceId = parseInt(id);
        const { newOrder } = await request.json();

        if (isNaN(serviceId) || typeof newOrder !== "number") {
            return NextResponse.json(
                { success: false, error: "Invalid parameters." },
                { status: 400 }
            );
        }

        const updated = await prisma.service.update({
            where: { id: serviceId },
            data: { order: newOrder },
        });

        return NextResponse.json({ success: true, data: updated }, { status: 200 });
    } catch (error) {
        console.error("PATCH /api/services/[id] error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to reorder service." },
            { status: 500 }
        );
    }
}