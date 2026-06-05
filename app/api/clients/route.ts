import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type ClientBody = {
    name: string;
    description?: string;
    image: string;
};

export async function GET() {
    try {
        const clients = await prisma.clients.findMany({
            orderBy: {
                id: "asc",
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: clients,
                count: clients.length,
            },
            {
                status: 200,
            },
        );
    } catch (error) {
        console.log("Get /api/clients error: ", error);

        return NextResponse.json({ sucess: false, error: "Failed to fetch Clients data." }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body: ClientBody = await request.json();

        if (!body.name || !body.image) {
            return NextResponse.json({ sucess: false, error: "Name and Image are required." }, { status: 400 });
        }

        const newClient = await prisma.clients.create({
            data: {
                name: body.name,
                description: body.description || null,
                image: body.image,
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: newClient,
                message: "Client created successfully.",
            },
            {
                status: 201,
            },
        );
    } catch (error) {
        return NextResponse.json({ status: false, error: "Failed to create Client." }, { status: 500 });
    }
}
