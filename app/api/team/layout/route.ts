import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const members = await prisma.teamMember.findMany({
            include: { gridLayout: true },
            orderBy: { id: "asc" },
        });

        const layoutItems = members
            .filter((m) => m.gridLayout !== null)
            .map((m) => ({
                i: String(m.id),
                x: m.gridLayout!.x,
                y: m.gridLayout!.y,
                w: m.gridLayout!.width,
                h: m.gridLayout!.height,
                content: {
                    img: m.image,
                    name: m.name,
                    role: m.role,
                },
            }));

        return NextResponse.json({ success: true, data: layoutItems }, { status: 200 });
    } catch (error) {
        console.error("GET /api/team/layout error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch team layout." }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();

        if (!Array.isArray(body) || body.length === 0) {
            return NextResponse.json({ success: false, error: "Expected a non-empty array of layout items." }, { status: 400 });
        }

        // Validate all items first before touching the DB
        for (const item of body) {
            const id = parseInt(item.i);
            if (isNaN(id) || typeof item.x !== "number" || typeof item.y !== "number" || typeof item.w !== "number" || typeof item.h !== "number") {
                return NextResponse.json({ success: false, error: `Invalid item: ${JSON.stringify(item)}` }, { status: 400 });
            }
        }

        const memberIds = body.map((item) => parseInt(item.i));

        // ── Step 1: Delete ALL existing layouts for these members ─────────────
        // Must be fully committed before inserting new ones to avoid
        // @@unique([x, y]) conflicts when items swap positions.
        await prisma.teamsGridLayout.deleteMany({
            where: {
                teamMemberId: { in: memberIds },
            },
        });

        // ── Step 2: Insert all new layouts fresh ──────────────────────────────
        // Separate await ensures Step 1 is fully done before Step 2 starts.
        await prisma.teamsGridLayout.createMany({
            data: body.map((item) => ({
                teamMemberId: parseInt(item.i),
                x: Math.round(item.x),
                y: Math.round(item.y),
                width: Math.round(item.w),
                height: Math.round(item.h),
            })),
        });

        return NextResponse.json({ success: true, message: "Layout saved successfully." }, { status: 200 });
    } catch (error) {
        console.error("PUT /api/team/layout error:", error);
        return NextResponse.json({ success: false, error: "Failed to save layout." }, { status: 500 });
    }
}
