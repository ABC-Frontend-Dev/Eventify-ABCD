import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: Promise<{ url: string }> }) {
    try {
        const { url } = await params;

        const service = await prisma.service.findUnique({
            where: { url },
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
                    error: `Service with url: ${url} not found.`,
                },
                { status: 404 },
            );
        }

        return NextResponse.json({ success: true, data: service }, { status: 200 });
    } catch (error) {
        console.error("GET /api/services/by-url/[url] error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch service." }, { status: 500 });
    }
}
