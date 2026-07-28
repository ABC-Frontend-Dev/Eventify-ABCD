import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type TeamMemberBody = {
    position?: number; // omit for auto-added overflow members (36+)
    name: string;
    role: string;
    image: string;
};

const COLLAGE_MAX_POSITION = 35;

export async function GET() {
    try {
        const members = await prisma.teamMember.findMany({
            orderBy: { position: "asc" },
        });

        return NextResponse.json({ success: true, data: members, count: members.length }, { status: 200 });
    } catch (error) {
        console.error("GET /api/team error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch team members." }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body: TeamMemberBody = await request.json();

        if (!body.name || !body.role || !body.image) {
            return NextResponse.json({ success: false, error: "Name, role, and image are required." }, { status: 400 });
        }

        let position: number;

        if (body.position) {
            // Explicit collage slot — must be within the fixed 1-35 layout.
            if (body.position < 1 || body.position > COLLAGE_MAX_POSITION) {
                return NextResponse.json({ success: false, error: `Collage slot must be between 1 and ${COLLAGE_MAX_POSITION}.` }, { status: 400 });
            }

            const existing = await prisma.teamMember.findUnique({ where: { position: body.position } });

            if (existing) {
                return NextResponse.json({ success: false, error: `Slot ${body.position} is already taken by "${existing.name}".` }, { status: 400 });
            }

            position = body.position;
        } else {
            // No position given -> overflow member, auto-append to the end of the list.
            const maxPosition = await prisma.teamMember.aggregate({ _max: { position: true } });
            position = Math.max(maxPosition._max.position ?? 0, COLLAGE_MAX_POSITION) + 1;
        }

        const newMember = await prisma.teamMember.create({
            data: {
                position,
                name: body.name,
                role: body.role,
                image: body.image,
            },
        });

        return NextResponse.json({ success: true, data: newMember, message: "Team member created successfully." }, { status: 201 });
    } catch (error) {
        console.error("POST /api/team error:", error);
        return NextResponse.json({ success: false, error: "Failed to create team member." }, { status: 500 });
    }
}
