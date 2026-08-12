// app/api/newsletter/subscribers/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// DELETE /api/newsletter/subscribers/:id
// Permanently deletes a subscriber from the database
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const subscriberId = parseInt(id);

        if (isNaN(subscriberId)) {
            return NextResponse.json({ success: false, error: "Invalid subscriber ID." }, { status: 400 });
        }

        const existing = await prisma.newsletterSubscriber.findUnique({
            where: { id: subscriberId },
        });

        if (!existing) {
            return NextResponse.json({ success: false, error: "Subscriber not found." }, { status: 404 });
        }

        await prisma.newsletterSubscriber.delete({
            where: { id: subscriberId },
        });

        return NextResponse.json({ success: true, message: "Subscriber removed successfully." }, { status: 200 });
    } catch (error) {
        console.error("DELETE /api/newsletter/subscribers/[id] error:", error);
        return NextResponse.json({ success: false, error: "Failed to remove subscriber." }, { status: 500 });
    }
}

// PATCH /api/newsletter/subscribers/:id
// Soft unsubscribe — keeps the record but marks isActive: false
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const subscriberId = parseInt(id);

        if (isNaN(subscriberId)) {
            return NextResponse.json({ success: false, error: "Invalid subscriber ID." }, { status: 400 });
        }

        const existing = await prisma.newsletterSubscriber.findUnique({
            where: { id: subscriberId },
        });

        if (!existing) {
            return NextResponse.json({ success: false, error: "Subscriber not found." }, { status: 404 });
        }

        if (!existing.isActive) {
            return NextResponse.json({ success: false, error: "Subscriber is already inactive." }, { status: 409 });
        }

        const updated = await prisma.newsletterSubscriber.update({
            where: { id: subscriberId },
            data: {
                isActive: false,
                unsubscribedAt: new Date(),
            },
        });

        return NextResponse.json({ success: true, data: updated, message: "Subscriber deactivated." }, { status: 200 });
    } catch (error) {
        console.error("PATCH /api/newsletter/subscribers/[id] error:", error);
        return NextResponse.json({ success: false, error: "Failed to deactivate subscriber." }, { status: 500 });
    }
}
