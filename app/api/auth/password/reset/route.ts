import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
    try {
        const { email, newPassword } = await request.json();

        if (!email || !newPassword) {
            return NextResponse.json({ success: false, error: "Email and new password are required" }, { status: 400 });
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ success: false, error: "Password must be at least 6 characters" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword },
        });

        return NextResponse.json({ success: true, message: "Password reset successfully" }, { status: 200 });
    } catch (error) {
        console.error("POST /api/auth/password/reset error:", error);
        return NextResponse.json({ success: false, error: "Failed to reset password" }, { status: 500 });
    }
}
