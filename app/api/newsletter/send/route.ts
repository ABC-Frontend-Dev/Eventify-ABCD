import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendNewsletterEmail } from "@/lib/email";
import { renderTemplate, type TemplateId } from "@/lib/newsletter-templates";

const SITE_URL = "https://eventifyentertainment.com";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { subject, templateId, templateData } = body as {
            subject: string;
            templateId: TemplateId;
            templateData: Record<string, string>;
        };

        if (!subject?.trim()) {
            return NextResponse.json({ success: false, error: "Subject is required." }, { status: 400 });
        }

        if (!templateId) {
            return NextResponse.json({ success: false, error: "Template is required." }, { status: 400 });
        }

        // Get all active subscribers
        const subscribers = await prisma.newsletterSubscriber.findMany({
            where: { isActive: true },
        });

        if (subscribers.length === 0) {
            return NextResponse.json({ success: false, error: "No active subscribers to send to." }, { status: 400 });
        }

        // Send emails one by one with per-subscriber unsubscribe link
        let successCount = 0;
        const errors: string[] = [];

        for (const subscriber of subscribers) {
            const unsubscribeUrl = `${SITE_URL}/api/newsletter/unsubscribe?token=${subscriber.unsubscribeToken}`;

            const html = renderTemplate(templateId, templateData, unsubscribeUrl);

            if (!html) {
                errors.push(`Invalid template: ${templateId}`);
                break;
            }

            const sent = await sendNewsletterEmail(subscriber.email, subject, html);
            if (sent) {
                successCount++;
            } else {
                errors.push(subscriber.email);
            }
        }

        // Log the send
        await prisma.newsletterSend.create({
            data: {
                subject,
                templateId,
                templateData,
                recipientCount: successCount,
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: `Newsletter sent to ${successCount} of ${subscribers.length} subscribers.`,
                successCount,
                totalCount: subscribers.length,
                errors: errors.length > 0 ? errors : undefined,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("POST /api/newsletter/send error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Failed to send newsletter.",
            },
            { status: 500 },
        );
    }
}
