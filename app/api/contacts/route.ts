// app/api/contacts/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

enum ContactSubmissionStatus {
    NEW = "NEW",
    READ = "READ",
}

type ContactBody = {
    name: string;
    email: string;
    phone: string;
    message: string;
};

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Get query parameters
        const search = searchParams.get("search");
        const status = searchParams.get("status");
        const sortBy = searchParams.get("sortBy") || "latest";
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");

        // Build where clause
        const where: any = {};

        // Search filter
        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { phone: { contains: search, mode: "insensitive" } },
                { message: { contains: search, mode: "insensitive" } },
            ];
        }

        // Status filter
        if (status && Object.values(ContactSubmissionStatus).includes(status as ContactSubmissionStatus)) {
            where.status = status;
        }

        // Build orderBy clause
        let orderBy: any = {};
        switch (sortBy) {
            case "latest":
                orderBy = { submittedAt: "desc" };
                break;
            case "oldest":
                orderBy = { submittedAt: "asc" };
                break;
            case "name-asc":
                orderBy = { name: "asc" };
                break;
            case "name-desc":
                orderBy = { name: "desc" };
                break;
            default:
                orderBy = { submittedAt: "desc" };
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Fetch total count
        const totalCount = await prisma.contactSubmission.count({ where });

        // Fetch contacts
        const contacts = await prisma.contactSubmission.findMany({
            where,
            orderBy,
            skip,
            take: limit,
        });

        return NextResponse.json(
            {
                success: true,
                data: contacts,
                pagination: {
                    total: totalCount,
                    page,
                    limit,
                    totalPages: Math.ceil(totalCount / limit),
                },
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("GET /api/contacts error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch contact submissions.",
            },
            { status: 500 },
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body: ContactBody = await request.json();

        // Validation
        if (!body.name || !body.email || !body.phone || !body.message) {
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
                    error: "Invalid email address.",
                },
                { status: 400 },
            );
        }

        // Phone validation (basic)
        const phoneRegex = /^[0-9+\-\s()]+$/;
        if (!phoneRegex.test(body.phone)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid phone number.",
                },
                { status: 400 },
            );
        }

        const newContact = await prisma.contactSubmission.create({
            data: {
                name: body.name.trim(),
                email: body.email.trim().toLowerCase(),
                phone: body.phone.trim(),
                message: body.message.trim(),
                status: ContactSubmissionStatus.NEW,
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: newContact,
                message: "Contact submission received successfully.",
            },
            { status: 201 },
        );
    } catch (error) {
        console.error("POST /api/contacts error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to submit contact form.",
            },
            { status: 500 },
        );
    }
}
