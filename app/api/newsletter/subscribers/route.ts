import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const showAll = request.nextUrl.searchParams.get("all") === "true";

        const subscribers = await prisma.newsletterSubscriber.findMany({
            where: showAll ? undefined : { isActive: true },
            orderBy: { subscribedAt: "desc" },
        });

        return NextResponse.json(
            {
                success: true,
                data: subscribers,
                count: subscribers.length,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("GET /api/newsletter/subscribers error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch subscribers." }, { status: 500 });
    }
}
