// app/api/contacts/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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
        console.error("PATCH /api/contacts/[id] error:", error);
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
        console.error("DELETE /api/contacts/[id] error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to delete contact submission.",
            },
            { status: 500 },
        );
    }
}
