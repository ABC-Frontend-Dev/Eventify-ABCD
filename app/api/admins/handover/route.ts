import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendHandoverEmail } from "@/lib/email";

// POST /api/admins/handover
// Body: { targetAdminId: number }
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
        }

        if (session.user.role !== "SUPER_ADMIN") {
            return NextResponse.json(
                {
                    success: false,
                    error: "Only the Super Admin can hand over the role.",
                },
                { status: 403 },
            );
        }

        const body = await request.json();
        const { targetAdminId } = body;

        if (!targetAdminId || isNaN(parseInt(targetAdminId))) {
            return NextResponse.json({ success: false, error: "Target admin ID is required." }, { status: 400 });
        }

        const currentSuperAdminId = parseInt(session.user.id);
        const newSuperAdminId = parseInt(targetAdminId);

        if (currentSuperAdminId === newSuperAdminId) {
            return NextResponse.json({ success: false, error: "You are already the Super Admin." }, { status: 400 });
        }

        const targetAdmin = await prisma.user.findUnique({
            where: { id: newSuperAdminId },
        });

        if (!targetAdmin) {
            return NextResponse.json({ success: false, error: "Target admin not found." }, { status: 404 });
        }

        if (targetAdmin.role === "SUPER_ADMIN") {
            return NextResponse.json({ success: false, error: "This admin is already the Super Admin." }, { status: 400 });
        }

        // Atomic transaction: demote current → promote target
        await prisma.$transaction([
            prisma.user.update({
                where: { id: currentSuperAdminId },
                data: { role: "ADMIN" },
            }),
            prisma.user.update({
                where: { id: newSuperAdminId },
                data: { role: "SUPER_ADMIN" },
            }),
        ]);

        // Send email to new super admin
        const currentAdmin = await prisma.user.findUnique({
            where: { id: currentSuperAdminId },
            select: { firstName: true, lastName: true },
        });

        await sendHandoverEmail(targetAdmin.email, targetAdmin.firstName, `${currentAdmin?.firstName ?? ""} ${currentAdmin?.lastName ?? ""}`.trim()).catch((err) =>
            console.error("Handover email failed (non-fatal):", err),
        );

        return NextResponse.json(
            {
                success: true,
                message: `Super Admin role handed over to ${targetAdmin.firstName} ${targetAdmin.lastName}.`,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("POST /api/admins/handover error:", error);
        return NextResponse.json({ success: false, error: "Failed to hand over role." }, { status: 500 });
    }
}
