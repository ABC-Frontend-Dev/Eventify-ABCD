import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendAdminWelcomeEmail } from "@/lib/email";

// GET /api/admins — all admins can view the list
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
        }

        const admins = await prisma.user.findMany({
            orderBy: { id: "asc" },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });

        return NextResponse.json({ success: true, data: admins }, { status: 200 });
    } catch (error) {
        console.error("GET /api/admins error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch admins." }, { status: 500 });
    }
}

// POST /api/admins — only SUPER_ADMIN can create a new admin
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
        }

        if (session.user.role !== "SUPER_ADMIN") {
            return NextResponse.json({ success: false, error: "Only the Super Admin can add new admins." }, { status: 403 });
        }

        const body = await request.json();
        const { firstName, lastName, email, password } = body;

        if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !password?.trim()) {
            return NextResponse.json({ success: false, error: "All fields are required." }, { status: 400 });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return NextResponse.json({ success: false, error: "Invalid email format." }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ success: false, error: "Password must be at least 6 characters." }, { status: 400 });
        }

        const existing = await prisma.user.findUnique({
            where: { email: email.trim().toLowerCase() },
        });

        if (existing) {
            return NextResponse.json({ success: false, error: "An admin with this email already exists." }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = await prisma.user.create({
            data: {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim().toLowerCase(),
                password: hashedPassword,
                role: "ADMIN",
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });

        // Send welcome email with plain password
        await sendAdminWelcomeEmail(
            newAdmin.email,
            newAdmin.firstName,
            newAdmin.lastName,
            password, // plain text — sent once for onboarding
        ).catch((err) => console.error("Welcome email failed (non-fatal):", err));

        return NextResponse.json(
            {
                success: true,
                data: newAdmin,
                message: `Admin created and welcome email sent to ${newAdmin.email}.`,
            },
            { status: 201 },
        );
    } catch (error) {
        console.error("POST /api/admins error:", error);
        return NextResponse.json({ success: false, error: "Failed to create admin." }, { status: 500 });
    }
}
