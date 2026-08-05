// app/api/about-us/cards/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type CreateCardBody = {
    frontFace: string;
    backFace: string;
    sortOrder?: number;
};

// POST: Add a single new card (up to 3 total)
export async function POST(request: NextRequest) {
    try {
        // 1. Fetch the existing single AboutUs record
        const aboutUs = await prisma.aboutUs.findFirst({
            select: { id: true },
        });

        if (!aboutUs) {
            return NextResponse.json(
                {
                    success: false,
                    error: "About Us content not found. Create the About Us record first before adding cards.",
                },
                { status: 404 },
            );
        }

        // 2. Check current card count
        const currentCardCount = await prisma.aboutUsCard.count({
            where: { aboutUsId: aboutUs.id },
        });

        if (currentCardCount >= 3) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Cannot add more cards. Maximum limit of 3 cards reached.",
                },
                { status: 400 },
            );
        }

        // 3. Validate body inputs
        const body: CreateCardBody = await request.json();

        if (!body.frontFace || !body.backFace) {
            return NextResponse.json({ success: false, error: "Front face and Back face content are required." }, { status: 400 });
        }

        // Default sortOrder to the next sequential index if not provided
        const sortOrder = body.sortOrder ?? currentCardCount + 1;

        // 4. Create card attached to the existing AboutUs record
        const newCard = await prisma.aboutUsCard.create({
            data: {
                frontFace: body.frontFace,
                backFace: body.backFace,
                sortOrder,
                aboutUsId: aboutUs.id,
            },
        });

        return NextResponse.json({ success: true, data: newCard, message: "Card added successfully." }, { status: 201 });
    } catch (error) {
        console.error("POST /api/about-us/cards error:", error);
        return NextResponse.json({ success: false, error: "Failed to add card." }, { status: 500 });
    }
}
