import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/team/layout
// Returns all team members with their grid layout positions
export async function GET() {
    try {
        const members = await prisma.teamMember.findMany({
            include: { gridLayout: true },
            orderBy: { id: "asc" },
        });

        // Shape into the format react-grid-layout expects
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

// PUT /api/team/layout
// Body: Array of { i: string (teamMemberId), x, y, w, h }
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();

        if (!Array.isArray(body)) {
            return NextResponse.json({ success: false, error: "Expected an array of layout items." }, { status: 400 });
        }

        // Validate each item
        for (const item of body) {
            if (!item.i || typeof item.x !== "number" || typeof item.y !== "number" || typeof item.w !== "number" || typeof item.h !== "number") {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Each item must have i, x, y, w, h.",
                    },
                    { status: 400 },
                );
            }
        }

        // Upsert each layout entry
        await prisma.$transaction(
            body.map((item) =>
                prisma.teamsGridLayout.upsert({
                    where: { teamMemberId: parseInt(item.i) },
                    update: {
                        x: item.x,
                        y: item.y,
                        width: item.w,
                        height: item.h,
                    },
                    create: {
                        teamMemberId: parseInt(item.i),
                        x: item.x,
                        y: item.y,
                        width: item.w,
                        height: item.h,
                    },
                }),
            ),
        );

        return NextResponse.json({ success: true, message: "Layout saved successfully." }, { status: 200 });
    } catch (error) {
        console.error("PUT /api/team/layout error:", error);
        return NextResponse.json({ success: false, error: "Failed to save team layout." }, { status: 500 });
    }
}
