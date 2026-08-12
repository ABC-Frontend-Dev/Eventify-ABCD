import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const members = await prisma.teamMember.findMany({
            orderBy: { id: "asc" },
            include: { gridLayout: true },
        });

        return NextResponse.json({ success: true, data: members, count: members.length }, { status: 200 });
    } catch (error) {
        console.error("GET /api/team error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch team members." }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.name || !body.role || !body.image) {
            return NextResponse.json({ success: false, error: "Name, role, and image are required." }, { status: 400 });
        }

        // Find a free spot automatically
        // Get all existing grid layouts to find a free cell
        const existingLayouts = await prisma.teamsGridLayout.findMany();

        // Build a set of occupied (x, y) for w=1, h=2 blocks
        // We'll find next available x position in the last row, or start a new row
        const COLS = 10;
        const DEFAULT_W = 1;
        const DEFAULT_H = 2;

        // Find the max y used
        let nextX = 0;
        let nextY = 0;

        if (existingLayouts.length > 0) {
            // Get all occupied cells
            const occupied = new Set<string>();
            for (const layout of existingLayouts) {
                for (let dx = 0; dx < layout.width; dx++) {
                    for (let dy = 0; dy < layout.height; dy++) {
                        occupied.add(`${layout.x + dx},${layout.y + dy}`);
                    }
                }
            }

            // Find first free slot scanning row by row
            let found = false;
            outer: for (let y = 0; y < 1000; y++) {
                for (let x = 0; x <= COLS - DEFAULT_W; x++) {
                    // Check if DEFAULT_W x DEFAULT_H block fits here
                    let fits = true;
                    for (let dx = 0; dx < DEFAULT_W; dx++) {
                        for (let dy = 0; dy < DEFAULT_H; dy++) {
                            if (occupied.has(`${x + dx},${y + dy}`)) {
                                fits = false;
                                break;
                            }
                        }
                        if (!fits) break;
                    }
                    if (fits) {
                        nextX = x;
                        nextY = y;
                        found = true;
                        break outer;
                    }
                }
            }

            if (!found) {
                nextX = 0;
                nextY = 0;
            }
        }

        const newMember = await prisma.teamMember.create({
            data: {
                name: body.name,
                role: body.role,
                image: body.image,
                gridLayout: {
                    create: {
                        x: nextX,
                        y: nextY,
                        width: DEFAULT_W,
                        height: DEFAULT_H,
                    },
                },
            },
            include: { gridLayout: true },
        });

        return NextResponse.json(
            {
                success: true,
                data: newMember,
                message: "Team member created successfully.",
            },
            { status: 201 },
        );
    } catch (error) {
        console.error("POST /api/team error:", error);
        return NextResponse.json({ success: false, error: "Failed to create team member." }, { status: 500 });
    }
}
