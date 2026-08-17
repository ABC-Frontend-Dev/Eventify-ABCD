import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// PUT /api/instagram/reorder
// Body: { orderedIds: number[] } — full ordered list of post IDs
export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
        }

        const body = await request.json();
        const { orderedIds } = body;

        if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
            return NextResponse.json({ success: false, error: "orderedIds array is required." }, { status: 400 });
        }

        // Update each post's order based on its position in the array
        await prisma.$transaction(
            orderedIds.map((id: number, index: number) =>
                prisma.instagramPost.update({
                    where: { id },
                    data: { order: index },
                }),
            ),
        );

        return NextResponse.json({ success: true, message: "Order saved." }, { status: 200 });
    } catch (error) {
        console.error("PUT /api/instagram/reorder error:", error);
        return NextResponse.json({ success: false, error: "Failed to save order." }, { status: 500 });
    }
}
