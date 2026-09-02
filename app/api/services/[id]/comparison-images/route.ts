import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// GET all comparison images for a service
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

        const images = await prisma.serviceComparisonImage.findMany({
            where: { serviceId },
            orderBy: { order: "asc" },
        });

        return NextResponse.json({ success: true, data: images }, { status: 200 });
    } catch (error) {
        console.error("GET comparison-images error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch comparison images." },
            { status: 500 }
        );
    }
}

// POST add a new comparison image pair
export async function POST(request: NextRequest, { params }: Params) {
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

        if (!body.beforeImage || !body.afterImage) {
            return NextResponse.json(
                { success: false, error: "Both before and after images are required." },
                { status: 400 }
            );
        }

        const service = await prisma.service.findUnique({
            where: { id: serviceId },
        });
        if (!service) {
            return NextResponse.json(
                { success: false, error: "Service not found." },
                { status: 404 }
            );
        }

        const count = await prisma.serviceComparisonImage.count({
            where: { serviceId },
        });

        const newImage = await prisma.serviceComparisonImage.create({
            data: {
                serviceId,
                beforeImage: body.beforeImage,
                beforeAlt: body.beforeAlt || null,
                afterImage: body.afterImage,
                afterAlt: body.afterAlt || null,
                order: count,
            },
        });

        return NextResponse.json(
            { success: true, data: newImage, message: "Comparison pair added." },
            { status: 201 }
        );
    } catch (error) {
        console.error("POST comparison-images error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to add comparison pair." },
            { status: 500 }
        );
    }
}

// DELETE a specific comparison image pair
export async function DELETE(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        const serviceId = parseInt(id);
        const { imageId } = await request.json();

        if (isNaN(serviceId) || !imageId) {
            return NextResponse.json(
                { success: false, error: "Invalid parameters." },
                { status: 400 }
            );
        }

        const image = await prisma.serviceComparisonImage.findFirst({
            where: { id: imageId, serviceId },
        });
        if (!image) {
            return NextResponse.json(
                { success: false, error: "Comparison image not found." },
                { status: 404 }
            );
        }

        await prisma.serviceComparisonImage.delete({ where: { id: imageId } });

        // Re-order remaining
        const remaining = await prisma.serviceComparisonImage.findMany({
            where: { serviceId },
            orderBy: { order: "asc" },
        });
        await Promise.all(
            remaining.map((img, idx) =>
                prisma.serviceComparisonImage.update({
                    where: { id: img.id },
                    data: { order: idx },
                })
            )
        );

        return NextResponse.json(
            { success: true, message: "Comparison pair deleted." },
            { status: 200 }
        );
    } catch (error) {
        console.error("DELETE comparison-images error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to delete comparison pair." },
            { status: 500 }
        );
    }
}