// app/api/about-us/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type CardInput = {
    id?: number;
    frontFace: string;
    backFace: string;
    sortOrder: number;
};

type AboutUsBody = {
    titlePartOne: string;
    titlePartTwo?: string;
    description: string;
    image: string;
    imageAlt?: string;
    cards?: CardInput[];
};

// GET: Fetch the About Us section with its cards
export async function GET() {
    try {
        const aboutUs = await prisma.aboutUs.findFirst({
            include: {
                cards: {
                    orderBy: {
                        sortOrder: "asc",
                    },
                },
            },
        });

        if (!aboutUs) {
            return NextResponse.json({ success: false, error: "About Us content not found." }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: aboutUs }, { status: 200 });
    } catch (error) {
        console.error("GET /api/about-us error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch About Us data." }, { status: 500 });
    }
}

// POST: Create the About Us record (Only allowed once)
export async function POST(request: NextRequest) {
    try {
        const existingCount = await prisma.aboutUs.count();
        if (existingCount > 0) {
            return NextResponse.json({ success: false, error: "About Us content already exists. Use PUT to update." }, { status: 400 });
        }

        const body: AboutUsBody = await request.json();

        if (!body.titlePartOne || !body.description || !body.image) {
            return NextResponse.json({ success: false, error: "TitlePartOne, Description, and Image are required." }, { status: 400 });
        }

        if (body.titlePartOne.length > 50 || (body.titlePartTwo && body.titlePartTwo.length > 50)) {
            return NextResponse.json({ success: false, error: "Title parts cannot exceed 50 characters." }, { status: 400 });
        }

        if (body.cards && body.cards.length > 3) {
            return NextResponse.json({ success: false, error: "A maximum of 3 cards is allowed." }, { status: 400 });
        }

        const newAboutUs = await prisma.aboutUs.create({
            data: {
                titlePartOne: body.titlePartOne,
                titlePartTwo: body.titlePartTwo || null,
                description: body.description,
                image: body.image,
                imageAlt: body.imageAlt ?? "Eventify Banner Image",
                cards: body.cards?.length
                    ? {
                          create: body.cards.map((card) => ({
                              frontFace: card.frontFace,
                              backFace: card.backFace,
                              sortOrder: card.sortOrder,
                          })),
                      }
                    : undefined,
            },
            include: {
                cards: {
                    orderBy: { sortOrder: "asc" },
                },
            },
        });

        return NextResponse.json({ success: true, data: newAboutUs, message: "About Us created successfully." }, { status: 201 });
    } catch (error) {
        console.error("POST /api/about-us error:", error);
        return NextResponse.json({ success: false, error: "Failed to create About Us content." }, { status: 500 });
    }
}

// PUT: Update the existing About Us record and replace/update cards
export async function PUT(request: NextRequest) {
    try {
        const existingAboutUs = await prisma.aboutUs.findFirst();

        if (!existingAboutUs) {
            return NextResponse.json({ success: false, error: "About Us content does not exist. Use POST to create." }, { status: 404 });
        }

        const body: AboutUsBody = await request.json();

        if (body.titlePartOne && body.titlePartOne.length > 50) {
            return NextResponse.json({ success: false, error: "TitlePartOne cannot exceed 50 characters." }, { status: 400 });
        }

        if (body.titlePartTwo && body.titlePartTwo.length > 50) {
            return NextResponse.json({ success: false, error: "TitlePartTwo cannot exceed 50 characters." }, { status: 400 });
        }

        if (body.cards && body.cards.length > 3) {
            return NextResponse.json({ success: false, error: "A maximum of 3 cards is allowed." }, { status: 400 });
        }

        // Transaction to handle optional card replacement cleanly
        const updatedAboutUs = await prisma.$transaction(async (tx) => {
            if (body.cards !== undefined) {
                await tx.aboutUsCard.deleteMany({
                    where: { aboutUsId: existingAboutUs.id },
                });
            }

            return await tx.aboutUs.update({
                where: { id: existingAboutUs.id },
                data: {
                    titlePartOne: body.titlePartOne ?? existingAboutUs.titlePartOne,
                    titlePartTwo: body.titlePartTwo ?? existingAboutUs.titlePartTwo,
                    description: body.description ?? existingAboutUs.description,
                    image: body.image ?? existingAboutUs.image,
                    imageAlt: body.imageAlt ?? existingAboutUs.imageAlt,
                    cards:
                        body.cards !== undefined
                            ? {
                                  create: body.cards.map((card) => ({
                                      frontFace: card.frontFace,
                                      backFace: card.backFace,
                                      sortOrder: card.sortOrder,
                                  })),
                              }
                            : undefined,
                },
                include: {
                    cards: {
                        orderBy: { sortOrder: "asc" },
                    },
                },
            });
        });

        return NextResponse.json({ success: true, data: updatedAboutUs, message: "About Us updated successfully." }, { status: 200 });
    } catch (error) {
        console.error("PUT /api/about-us error:", error);
        return NextResponse.json({ success: false, error: "Failed to update About Us content." }, { status: 500 });
    }
}

// DELETE: Delete About Us record and cascade delete cards
export async function DELETE() {
    try {
        const existingAboutUs = await prisma.aboutUs.findFirst();

        if (!existingAboutUs) {
            return NextResponse.json({ success: false, error: "About Us content not found." }, { status: 404 });
        }

        await prisma.aboutUs.delete({
            where: { id: existingAboutUs.id },
        });

        return NextResponse.json({ success: true, message: "About Us content deleted successfully." }, { status: 200 });
    } catch (error) {
        console.error("DELETE /api/about-us error:", error);
        return NextResponse.json({ success: false, error: "Failed to delete About Us content." }, { status: 500 });
    }
}
