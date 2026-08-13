import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// DELETE /api/admins/:id — only SUPER_ADMIN, cannot delete themselves
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
        }

        if (session.user.role !== "SUPER_ADMIN") {
            return NextResponse.json({ success: false, error: "Only the Super Admin can delete admins." }, { status: 403 });
        }

        const { id } = await params;
        const adminId = parseInt(id);

        if (isNaN(adminId)) {
            return NextResponse.json({ success: false, error: "Invalid admin ID." }, { status: 400 });
        }

        // Cannot delete yourself
        if (adminId === parseInt(session.user.id)) {
            return NextResponse.json({ success: false, error: "You cannot delete your own account." }, { status: 400 });
        }

        const target = await prisma.user.findUnique({
            where: { id: adminId },
        });

        if (!target) {
            return NextResponse.json({ success: false, error: "Admin not found." }, { status: 404 });
        }

        // Cannot delete another SUPER_ADMIN
        if (target.role === "SUPER_ADMIN") {
            return NextResponse.json(
                {
                    success: false,
                    error: "Cannot delete the Super Admin. Handover the role first.",
                },
                { status: 400 },
            );
        }

        await prisma.user.delete({ where: { id: adminId } });

        return NextResponse.json({ success: true, message: "Admin deleted successfully." }, { status: 200 });
    } catch (error) {
        console.error("DELETE /api/admins/[id] error:", error);
        return NextResponse.json({ success: false, error: "Failed to delete admin." }, { status: 500 });
    }
}
