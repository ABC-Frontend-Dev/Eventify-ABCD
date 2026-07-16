import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type ServiceBody = {
    title: string;
    description: string;
    image: string;
    url: string;
    order?: number;
};

export async function GET(request: NextRequest) {
    try {
        const services = await prisma.service.findMany({
            orderBy: {
                order: "asc",
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: services,
                count: services.length,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("GET /api/services error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch services." }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body: ServiceBody = await request.json();

        if (!body.title || !body.description || !body.image || !body.url) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Title, description, image, and URL are required.",
                },
                { status: 400 },
            );
        }

        // Check if URL already exists
        const existingService = await prisma.service.findUnique({
            where: { url: body.url },
        });

        if (existingService) {
            return NextResponse.json({ success: false, error: "Service with this URL already exists." }, { status: 400 });
        }

        // Get max order and increment
        const maxOrderService = await prisma.service.findFirst({
            orderBy: { order: "desc" },
            select: { order: true },
        });

        const newOrder = (maxOrderService?.order ?? -1) + 1;

        const newService = await prisma.service.create({
            data: {
                title: body.title,
                description: body.description,
                image: body.image,
                url: body.url,
                order: body.order ?? newOrder,
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: newService,
                message: "Service created successfully.",
            },
            { status: 201 },
        );
    } catch (error) {
        console.error("POST /api/services error:", error);
        return NextResponse.json({ success: false, error: "Failed to create service." }, { status: 500 });
    }
}
