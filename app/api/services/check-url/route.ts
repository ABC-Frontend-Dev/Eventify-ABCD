import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const url = request.nextUrl.searchParams.get("url");

        if (!url) {
            return NextResponse.json({ success: false, error: "URL is required" }, { status: 400 });
        }

        // Check if URL exists in database
        const existingService = await prisma.service.findUnique({
            where: { url },
        });

        return NextResponse.json(
            {
                success: true,
                available: !existingService,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("GET /api/services/check-url error:", error);
        return NextResponse.json({ success: false, error: "Failed to check URL availability" }, { status: 500 });
    }
}
