import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const history = await prisma.newsletterSend.findMany({
            orderBy: { sentAt: "desc" },
            take: 20,
        });

        return NextResponse.json({ success: true, data: history }, { status: 200 });
    } catch (error) {
        console.error("GET /api/newsletter/history error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch history." }, { status: 500 });
    }
}
