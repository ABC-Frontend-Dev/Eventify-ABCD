// app/api/clients/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const clientId = parseInt(id);

        if (isNaN(clientId)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid client ID.",
                },
                {
                    status: 400,
                },
            );
        }

        const client = await prisma.clients.findUnique({
            where: {
                id: clientId,
            },
        });

        if (!client) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Client with id: ${clientId} is not found.`,
                },
                {
                    status: 404,
                },
            );
        }

        return NextResponse.json(
            {
                success: true,
                data: client,
            },
            {
                status: 200,
            },
        );
    } catch (error) {
        console.error("GET /api/clients/[id] error:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to get client.",
            },
            { status: 500 },
        );
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const clientId = parseInt(id);

        if (isNaN(clientId)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid client ID.",
                },
                {
                    status: 400,
                },
            );
        }

        const body = await request.json();

        const existingClient = await prisma.clients.findUnique({
            where: {
                id: clientId,
            },
        });

        if (!existingClient) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Client not found.",
                },
                {
                    status: 404,
                },
            );
        }

        const updateClient = await prisma.clients.update({
            where: {
                id: clientId,
            },

            data: {
                name: body.name ?? existingClient.name,
                image: body.image ?? existingClient.image,
                description: body.description ?? existingClient.description,
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: updateClient,
                message: "Client updated successfully.",
            },
            {
                status: 200,
            },
        );
    } catch (error) {
        console.log("PUT /api/clients/[id] error:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to update client",
            },
            {
                status: 500,
            },
        );
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const clientId = await parseInt(id);

        if (isNaN(clientId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid client ID.",
                },
                {
                    status: 400,
                },
            );
        }

        const existingClient = await prisma.clients.findUnique({
            where: {
                id: clientId,
            },
        });

        if (!existingClient) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Client not found.",
                },
                {
                    status: 404,
                },
            );
        }

        await prisma.clients.delete({
            where: {
                id: clientId,
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: "Client deleted successfully.",
            },
            {
                status: 200,
            },
        );
    } catch (error) {
        console.log("DELETE /api/clients/[id] error:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to delete client.",
            },
            {
                status: 500,
            },
        );
    }
}
