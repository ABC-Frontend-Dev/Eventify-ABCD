// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

type RegisterBody = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
};

export async function POST(request: NextRequest) {
    try {
        const body: RegisterBody = await request.json();

        // Validation
        if (!body.firstName || !body.lastName || !body.email || !body.password) {
            return NextResponse.json(
                {
                    success: false,
                    error: "All fields are required.",
                },
                { status: 400 },
            );
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(body.email)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid email format.",
                },
                { status: 400 },
            );
        }

        // Password validation (minimum 6 characters)
        if (body.password.length < 6) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Password must be at least 6 characters long.",
                },
                { status: 400 },
            );
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: body.email.toLowerCase() },
        });

        if (existingUser) {
            return NextResponse.json(
                {
                    success: false,
                    error: "User with this email already exists.",
                },
                { status: 400 },
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(body.password, 10);

        // Create user
        const newUser = await prisma.user.create({
            data: {
                firstName: body.firstName,
                lastName: body.lastName,
                email: body.email.toLowerCase(),
                password: hashedPassword,
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                createdAt: true,
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: newUser,
                message: "User registered successfully.",
            },
            { status: 201 },
        );
    } catch (error) {
        console.error("POST /api/auth/register error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to register user.",
            },
            { status: 500 },
        );
    }
}
