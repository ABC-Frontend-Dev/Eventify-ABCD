import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const memberId = parseInt(id);

        if (isNaN(memberId)) {
            return NextResponse.json({ success: false, error: "Invalid team member ID." }, { status: 400 });
        }

        const member = await prisma.teamMember.findUnique({
            where: { id: memberId },
        });

        if (!member) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Team member with id: ${memberId} not found.`,
                },
                { status: 404 },
            );
        }

        return NextResponse.json({ success: true, data: member }, { status: 200 });
    } catch (error) {
        console.error("GET /api/team/[id] error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch team member." }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const memberId = parseInt(id);

        if (isNaN(memberId)) {
            return NextResponse.json({ success: false, error: "Invalid team member ID." }, { status: 400 });
        }

        const body = await request.json();

        if (!body.name || !body.role || !body.image) {
            return NextResponse.json({ success: false, error: "Name, role, and image are required." }, { status: 400 });
        }

        const existingMember = await prisma.teamMember.findUnique({
            where: { id: memberId },
        });

        if (!existingMember) {
            return NextResponse.json({ success: false, error: "Team member not found." }, { status: 404 });
        }

        // If position wasn't sent (overflow member being edited without touching placement), keep it as-is.
        let position = existingMember.position;

        if (body.position && body.position !== existingMember.position) {
            if (body.position < 1) {
                return NextResponse.json({ success: false, error: "Position must be at least 1." }, { status: 400 });
            }

            const positionTaken = await prisma.teamMember.findUnique({ where: { position: body.position } });

            if (positionTaken) {
                return NextResponse.json({ success: false, error: `Slot ${body.position} is already taken by "${positionTaken.name}".` }, { status: 400 });
            }

            position = body.position;
        }

        const updatedMember = await prisma.teamMember.update({
            where: { id: memberId },
            data: {
                position,
                name: body.name,
                role: body.role,
                image: body.image,
            },
        });

        return NextResponse.json({ success: true, data: updatedMember, message: "Team member updated successfully." }, { status: 200 });
    } catch (error) {
        console.error("PUT /api/team/[id] error:", error);
        return NextResponse.json({ success: false, error: "Failed to update team member." }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const memberId = parseInt(id);

        if (isNaN(memberId)) {
            return NextResponse.json({ success: false, error: "Invalid team member ID." }, { status: 400 });
        }

        const existingMember = await prisma.teamMember.findUnique({
            where: { id: memberId },
        });

        if (!existingMember) {
            return NextResponse.json({ success: false, error: "Team member not found." }, { status: 404 });
        }

        await prisma.teamMember.delete({
            where: { id: memberId },
        });

        return NextResponse.json({ success: true, message: "Team member deleted successfully." }, { status: 200 });
    } catch (error) {
        console.error("DELETE /api/team/[id] error:", error);
        return NextResponse.json({ success: false, error: "Failed to delete team member." }, { status: 500 });
    }
}
