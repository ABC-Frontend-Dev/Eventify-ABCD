// app/api/contacts/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");

        const where: any = {};
        if (status) {
            where.status = status;
        }

        const contacts = await prisma.contactSubmission.findMany({
            where,
            orderBy: { submittedAt: "desc" },
        });

        // Generate CSV
        const headers = ["ID", "Name", "Email", "Phone", "Message", "Status", "Submitted Date", "Submitted Time"];
        const rows = contacts.map((contact) => {
            const submittedDate = new Date(contact.submittedAt);
            return [
                contact.id,
                `"${contact.name}"`,
                contact.email,
                contact.phone,
                `"${contact.message.replace(/"/g, '""')}"`, // Escape quotes
                contact.status,
                submittedDate.toLocaleDateString(),
                submittedDate.toLocaleTimeString(),
            ].join(",");
        });

        const csv = [headers.join(","), ...rows].join("\n");

        return new NextResponse(csv, {
            status: 200,
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename="contact-submissions-${new Date().toISOString().split("T")[0]}.csv"`,
            },
        });
    } catch (error) {
        console.error("GET /api/contacts/export error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to export contact submissions.",
            },
            { status: 500 },
        );
    }
}
