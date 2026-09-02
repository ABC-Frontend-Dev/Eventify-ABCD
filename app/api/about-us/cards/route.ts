// app/api/about-us/cards
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type CreateCardBody = {
    frontFacePartOne: string;       // required now
    frontFacePartTwo?: string;
    backFace: string;
    sortOrder?: number;
};

export async function POST(request: NextRequest) {
    try {
        const aboutUs = await prisma.aboutUs.findFirst({
            select: { id: true },
        });

        if (!aboutUs) {
            return NextResponse.json(
                { success: false, error: "About Us content not found. Create the About Us record first." },
                { status: 404 }
            );
        }

        const currentCardCount = await prisma.aboutUsCard.count({
            where: { aboutUsId: aboutUs.id },
        });

        if (currentCardCount >= 3) {
            return NextResponse.json(
                { success: false, error: "Cannot add more cards. Maximum limit of 3 cards reached." },
                { status: 400 }
            );
        }

        const body: CreateCardBody = await request.json();

        // frontFacePartOne is required
        if (!body.frontFacePartOne?.trim()) {
            return NextResponse.json(
                { success: false, error: "Front Face Part 1 is required." },
                { status: 400 }
            );
        }

        if (!body.backFace?.trim()) {
            return NextResponse.json(
                { success: false, error: "Back face content is required." },
                { status: 400 }
            );
        }

        const sortOrder = body.sortOrder ?? currentCardCount + 1;

        const newCard = await prisma.aboutUsCard.create({
            data: {
                frontFacePartOne: body.frontFacePartOne.trim(),
                frontFacePartTwo: body.frontFacePartTwo?.trim() || null,
                backFace: body.backFace.trim(),
                sortOrder,
                aboutUsId: aboutUs.id,
            },
        });

        return NextResponse.json(
            { success: true, data: newCard, message: "Card added successfully." },
            { status: 201 }
        );
    } catch (error) {
        console.error("POST /api/about-us/cards error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to add card." },
            { status: 500 }
        );
    }
}