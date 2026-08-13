import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET /api/admins/profile — own profile
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: parseInt(session.user.id) },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });

        if (!user) {
            return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: user }, { status: 200 });
    } catch (error) {
        console.error("GET /api/admins/profile error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch profile." }, { status: 500 });
    }
}

// PUT /api/admins/profile — update own name/email or change password
export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
        }

        const body = await request.json();
        const userId = parseInt(session.user.id);

        // ── Password change flow ──────────────────────────────────────────────
        if (body.type === "password") {
            const { currentPassword, newPassword, confirmPassword } = body;

            if (!currentPassword || !newPassword || !confirmPassword) {
                return NextResponse.json({ success: false, error: "All password fields are required." }, { status: 400 });
            }

            if (newPassword.length < 6) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "New password must be at least 6 characters.",
                    },
                    { status: 400 },
                );
            }

            if (newPassword !== confirmPassword) {
                return NextResponse.json({ success: false, error: "New passwords do not match." }, { status: 400 });
            }

            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user) {
                return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
            }

            const isCurrentValid = await bcrypt.compare(currentPassword, user.password);
            if (!isCurrentValid) {
                return NextResponse.json({ success: false, error: "Current password is incorrect." }, { status: 400 });
            }

            const hashed = await bcrypt.hash(newPassword, 10);
            await prisma.user.update({
                where: { id: userId },
                data: { password: hashed },
            });

            return NextResponse.json({ success: true, message: "Password changed successfully." }, { status: 200 });
        }

        // ── Profile update flow ───────────────────────────────────────────────
        if (body.type === "profile") {
            const { firstName, lastName, email } = body;

            if (!firstName?.trim() || !lastName?.trim() || !email?.trim()) {
                return NextResponse.json({ success: false, error: "First name, last name and email are required." }, { status: 400 });
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.trim())) {
                return NextResponse.json({ success: false, error: "Invalid email format." }, { status: 400 });
            }

            // Check if email is taken by another user
            const emailTaken = await prisma.user.findFirst({
                where: {
                    email: email.trim().toLowerCase(),
                    NOT: { id: userId },
                },
            });

            if (emailTaken) {
                return NextResponse.json({ success: false, error: "This email is already in use." }, { status: 409 });
            }

            const updated = await prisma.user.update({
                where: { id: userId },
                data: {
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    email: email.trim().toLowerCase(),
                },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    role: true,
                },
            });

            return NextResponse.json(
                {
                    success: true,
                    data: updated,
                    message: "Profile updated successfully.",
                },
                { status: 200 },
            );
        }

        return NextResponse.json({ success: false, error: "Invalid request type." }, { status: 400 });
    } catch (error) {
        console.error("PUT /api/admins/profile error:", error);
        return NextResponse.json({ success: false, error: "Failed to update profile." }, { status: 500 });
    }
}
