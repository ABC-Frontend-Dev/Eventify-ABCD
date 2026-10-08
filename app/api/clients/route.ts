// app/api/clients/route.ts
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
            // `id` breaks ties so clients sharing an `order` value keep a stable position
            orderBy: [{ order: "asc" }, { id: "asc" }],
        });

        return NextResponse.json({ success: true, data: clients, count: clients.length }, { status: 200 });
    } catch (error) {
        console.log("Get /api/clients error: ", error);
        return NextResponse.json({ success: false, error: "Failed to fetch Clients data." }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body: ClientBody = await request.json();

        if (!body.name || !body.image) {
            return NextResponse.json({ success: false, error: "Name and Image are required." }, { status: 400 });
        }

        // New client goes after the current last one. Using count() here collided with
        // existing `order` values once clients had been deleted (deletes leave gaps).
        const { _max } = await prisma.clients.aggregate({ _max: { order: true } });

        const newClient = await prisma.clients.create({
            data: {
                name: body.name,
                description: body.description || null,
                image: body.image,
                order: (_max.order ?? -1) + 1,
            },
        });

        return NextResponse.json({ success: true, data: newClient, message: "Client created successfully." }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: "Failed to create Client." }, { status: 500 });
    }
}
