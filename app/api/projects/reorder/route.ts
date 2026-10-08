// app/api/projects/reorder/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(request: NextRequest) {
    try {
        const body: { ids: number[] } = await request.json();

        if (!Array.isArray(body.ids) || body.ids.length === 0) {
            return NextResponse.json({ success: false, error: "ids array is required" }, { status: 400 });
        }

        await prisma.$transaction(
            body.ids.map((id, index) =>
                prisma.project.update({
                    where: { id },
                    data: { order: index },
                }),
            ),
        );

        return NextResponse.json({ success: true, message: "Order updated successfully" }, { status: 200 });
    } catch (error) {
        console.error("Reorder projects error:", error);
        return NextResponse.json({ success: false, error: "Failed to reorder projects" }, { status: 500 });
    }
}