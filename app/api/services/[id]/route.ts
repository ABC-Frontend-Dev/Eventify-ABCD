import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const serviceId = parseInt(id);

        if (isNaN(serviceId)) {
            return NextResponse.json({ success: false, error: "Invalid service ID." }, { status: 400 });
        }

        const service = await prisma.service.findUnique({
            where: { id: serviceId },
            include: {
                images: {
                    orderBy: {
                        order: "asc",
                    },
                },
            },
        });

        if (!service) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Service with id: ${serviceId} not found.`,
                },
                { status: 404 },
            );
        }

        return NextResponse.json({ success: true, data: service }, { status: 200 });
    } catch (error) {
        console.error("GET /api/services/[id] error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch service." }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const serviceId = parseInt(id);

        if (isNaN(serviceId)) {
            return NextResponse.json({ success: false, error: "Invalid service ID." }, { status: 400 });
        }

        const body = await request.json();

        const existingService = await prisma.service.findUnique({
            where: { id: serviceId },
            include: { images: true },
        });

        if (!existingService) {
            return NextResponse.json({ success: false, error: "Service not found." }, { status: 404 });
        }

        // Check if new URL is unique (if URL is being changed)
        if (body.url && body.url !== existingService.url) {
            const urlExists = await prisma.service.findUnique({
                where: { url: body.url },
            });
            if (urlExists) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Service with this URL already exists.",
                    },
                    { status: 400 },
                );
            }
        }

        // Handle images update
        let imageOperations = undefined;
        if (body.images && Array.isArray(body.images)) {
            // Delete old images
            await prisma.serviceImage.deleteMany({
                where: { serviceId },
            });

            // Create new images
            imageOperations = {
                createMany: {
                    data: body.images.map((img: { image: string; title?: string }, idx: number) => ({
                        image: img.image,
                        title: img.title || `Image ${idx + 1}`,
                        order: idx,
                    })),
                },
            };
        }

        const updatedService = await prisma.service.update({
            where: { id: serviceId },
            data: {
                title: body.title ?? existingService.title,
                description: body.description ?? existingService.description,
                content: body.content ?? existingService.content,
                image: body.image ?? existingService.image,
                bannerImage: body.bannerImage ?? existingService.bannerImage,
                url: body.url ?? existingService.url,
                order: body.order ?? existingService.order,
                ...(imageOperations && { images: imageOperations }),
            },
            include: {
                images: {
                    orderBy: {
                        order: "asc",
                    },
                },
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: updatedService,
                message: "Service updated successfully.",
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("PUT /api/services/[id] error:", error);
        return NextResponse.json({ success: false, error: "Failed to update service." }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const serviceId = parseInt(id);

        if (isNaN(serviceId)) {
            return NextResponse.json({ success: false, error: "Invalid service ID." }, { status: 400 });
        }

        const existingService = await prisma.service.findUnique({
            where: { id: serviceId },
        });

        if (!existingService) {
            return NextResponse.json({ success: false, error: "Service not found." }, { status: 404 });
        }

        // Delete service (cascade will delete images)
        await prisma.service.delete({
            where: { id: serviceId },
        });

        return NextResponse.json({ success: true, message: "Service deleted successfully." }, { status: 200 });
    } catch (error) {
        console.error("DELETE /api/services/[id] error:", error);
        return NextResponse.json({ success: false, error: "Failed to delete service." }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const serviceId = parseInt(id);
        const { newOrder } = await request.json();

        if (isNaN(serviceId) || typeof newOrder !== "number") {
            return NextResponse.json({ success: false, error: "Invalid parameters." }, { status: 400 });
        }

        const updatedService = await prisma.service.update({
            where: { id: serviceId },
            data: { order: newOrder },
        });

        return NextResponse.json({ success: true, data: updatedService }, { status: 200 });
    } catch (error) {
        console.error("PATCH /api/services/[id] error:", error);
        return NextResponse.json({ success: false, error: "Failed to reorder service." }, { status: 500 });
    }
}
