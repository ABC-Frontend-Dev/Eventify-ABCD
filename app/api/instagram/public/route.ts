import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/instagram/public — returns only enabled posts, ordered
// No auth required — used by the public frontend
export async function GET() {
    try {
        const posts = await prisma.instagramPost.findMany({
            where: { isEnabled: true },
            orderBy: { order: "asc" },
            take: 5,
            select: {
                id: true,
                url: true,
                image: true,
                imageWidth: true,
                imageHeight: true,
                title: true,
            },
        });

        return NextResponse.json({ success: true, data: posts }, { status: 200 });
    } catch (error) {
        console.error("GET /api/instagram/public error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch posts." }, { status: 500 });
    }
}
