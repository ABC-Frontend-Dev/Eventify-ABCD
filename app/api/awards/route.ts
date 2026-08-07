import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type AwardImageData = {
    url: string;
    imageAlt?: string;
    title: string;
    description?: string;
};

type CategoryData = {
    name: string;
    icon: string;
    iconAlt: string;
    images: AwardImageData[];
};

type AwardBody = {
    year: number;
    categories: CategoryData[];
    order?: number;
};

export async function GET(request: NextRequest) {
    try {
        const awards = await prisma.award.findMany({
            orderBy: { year: "desc" },
            include: {
                categories: {
                    orderBy: { order: "asc" },
                    include: {
                        images: { orderBy: { order: "asc" } },
                    },
                },
            },
        });

        return NextResponse.json({ success: true, data: awards, count: awards.length }, { status: 200 });
    } catch (error) {
        console.error("GET /api/awards error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch awards." }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body: AwardBody = await request.json();

        if (!body.year) {
            return NextResponse.json({ success: false, error: "Year is required." }, { status: 400 });
        }

        if (!body.categories || body.categories.length === 0) {
            return NextResponse.json({ success: false, error: "At least one category is required." }, { status: 400 });
        }

        const existingAward = await prisma.award.findUnique({
            where: { year: body.year },
        });

        if (existingAward) {
            return NextResponse.json({ success: false, error: "Award for this year already exists." }, { status: 400 });
        }

        for (const category of body.categories) {
            if (!category.name?.trim()) {
                return NextResponse.json({ success: false, error: "All categories must have a name." }, { status: 400 });
            }
            if (!category.icon?.trim()) {
                return NextResponse.json({ success: false, error: "All categories must have an icon." }, { status: 400 });
            }
            if (!category.images || category.images.length === 0) {
                return NextResponse.json(
                    {
                        success: false,
                        error: `Category "${category.name}" must have at least one award image.`,
                    },
                    { status: 400 },
                );
            }
            for (const img of category.images) {
                if (!img.title?.trim()) {
                    return NextResponse.json({ success: false, error: "Each award image must have a title." }, { status: 400 });
                }
            }
        }

        const newAward = await prisma.award.create({
            data: {
                year: body.year,
                order: body.order ?? 0,
                categories: {
                    create: body.categories.map((category, catIndex) => ({
                        name: category.name,
                        icon: category.icon,
                        iconAlt: category.iconAlt,
                        order: catIndex,
                        images: {
                            create: category.images.map((img, imgIndex) => ({
                                url: img.url,
                                imageAlt: img.imageAlt ?? "",
                                title: img.title,
                                description: img.description ?? "",
                                order: imgIndex,
                            })),
                        },
                    })),
                },
            },
            include: {
                categories: {
                    orderBy: { order: "asc" },
                    include: {
                        images: { orderBy: { order: "asc" } },
                    },
                },
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: newAward,
                message: "Award created successfully.",
            },
            { status: 201 },
        );
    } catch (error) {
        console.error("POST /api/awards error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Failed to create award.",
            },
            { status: 500 },
        );
    }
}
