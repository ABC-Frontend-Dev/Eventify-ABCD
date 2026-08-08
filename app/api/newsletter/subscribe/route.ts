import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email || typeof email !== "string") {
            return NextResponse.json({ success: false, error: "Email is required." }, { status: 400 });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return NextResponse.json({ success: false, error: "Please enter a valid email address." }, { status: 400 });
        }

        const normalised = email.trim().toLowerCase();

        // Check if already subscribed
        const existing = await prisma.newsletterSubscriber.findUnique({
            where: { email: normalised },
        });

        if (existing) {
            if (existing.isActive) {
                return NextResponse.json({ success: false, error: "You are already subscribed!" }, { status: 409 });
            }

            // Re-subscribe
            await prisma.newsletterSubscriber.update({
                where: { email: normalised },
                data: {
                    isActive: true,
                    unsubscribedAt: null,
                },
            });

            await sendWelcomeEmail(normalised);

            return NextResponse.json({ success: true, message: "Welcome back! You've been re-subscribed." }, { status: 200 });
        }

        // New subscriber
        await prisma.newsletterSubscriber.create({
            data: { email: normalised },
        });

        // Send welcome email (non-blocking)
        sendWelcomeEmail(normalised).catch(console.error);

        return NextResponse.json({ success: true, message: "Successfully subscribed! Welcome aboard 🎉" }, { status: 201 });
    } catch (error) {
        console.error("POST /api/newsletter/subscribe error:", error);
        return NextResponse.json({ success: false, error: "Failed to subscribe. Please try again." }, { status: 500 });
    }
}
