// app/api/contacts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendContactFormNotificationEmail, sendContactConfirmationEmail } from "@/lib/email";
import { ADDITIONAL_CONTACT_RECIPIENTS, CONTACT_FORM_CONFIG } from "@/lib/config/admin-emails";

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

        // Create contact submission in database
        const newContact = await prisma.contactSubmission.create({
            data: {
                name: body.name.trim(),
                email: body.email.trim().toLowerCase(),
                phone: body.phone.trim(),
                message: body.message.trim(),
                status: ContactSubmissionStatus.NEW,
            },
        });

        console.log("📝 New contact submission created:", newContact.id);

        // Send notification emails
        if (CONTACT_FORM_CONFIG.enableEmailNotification) {
            try {
                // Get the logged-in user's email (primary recipient)
                const session = await getServerSession(authOptions);
                const userEmail = session?.user?.email;

                // Build recipient list: primary user email + additional emails
                const recipientEmails = [...(userEmail ? [userEmail] : []), ...ADDITIONAL_CONTACT_RECIPIENTS];

                if (recipientEmails.length > 0) {
                    const emailsSent = await sendContactFormNotificationEmail(
                        {
                            name: body.name,
                            email: body.email,
                            phone: body.phone,
                            message: body.message,
                        },
                        recipientEmails,
                    );

                    if (emailsSent) {
                        console.log(`✅ Admin notifications sent to ${recipientEmails.length} recipient(s)`);
                        console.log(`Primary: ${userEmail || "No logged-in user"}`);
                        console.log(`Additional: ${ADDITIONAL_CONTACT_RECIPIENTS.join(", ") || "None"}`);
                    }
                } else {
                    console.warn("⚠️ No recipients found for contact notification email");
                }
            } catch (emailError) {
                console.error("⚠️ Failed to send admin notification emails:", emailError);
                // Don't fail the request if email fails
            }
        }

        // Send confirmation email to the person who submitted the form
        try {
            await sendContactConfirmationEmail(body.email, body.name);
            console.log("✅ Confirmation email sent to user:", body.email);
        } catch (emailError) {
            console.error("⚠️ Failed to send confirmation email to user:", emailError);
            // Don't fail the request if email fails
        }

        return NextResponse.json(
            {
                success: true,
                data: newContact,
                message: "Contact submission received successfully. We'll be in touch soon!",
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

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idParam } = await params;
        const id = parseInt(idParam);
        const body = await request.json();

        const contact = await prisma.contactSubmission.findUnique({
            where: { id },
        });

        if (!contact) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Contact submission not found.",
                },
                { status: 404 },
            );
        }

        const updatedContact = await prisma.contactSubmission.update({
            where: { id },
            data: {
                status: body.status,
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: updatedContact,
                message: "Contact submission updated successfully.",
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("PATCH /api/contacts error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to update contact submission.",
            },
            { status: 500 },
        );
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idParam } = await params;
        const id = parseInt(idParam);

        const contact = await prisma.contactSubmission.findUnique({
            where: { id },
        });

        if (!contact) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Contact submission not found.",
                },
                { status: 404 },
            );
        }

        await prisma.contactSubmission.delete({
            where: { id },
        });

        return NextResponse.json(
            {
                success: true,
                message: "Contact submission deleted successfully.",
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("DELETE /api/contacts error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to delete contact submission.",
            },
            { status: 500 },
        );
    }
}
