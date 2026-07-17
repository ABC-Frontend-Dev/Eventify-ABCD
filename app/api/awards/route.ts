import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type ItemData = {
    title: string;
    description: string;
};

type CarouselImageData = {
    url: string;
};

type CategoryData = {
    name: string;
    icon: string;
    iconAlt: string;
    items: ItemData[];
    carouselImages: CarouselImageData[];
    gradientWidthClass: string;
};

type AwardBody = {
    year: number;
    categories: CategoryData[];
    order?: number;
};

export async function GET(request: NextRequest) {
    try {
        const awards = await prisma.award.findMany({
            orderBy: {
                year: "desc",
            },
            include: {
                categories: {
                    orderBy: { order: "asc" },
                    include: {
                        items: { orderBy: { order: "asc" } },
                        carouselImages: { orderBy: { order: "asc" } },
                    },
                },
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: awards,
                count: awards.length,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("GET /api/awards error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch awards." }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body: AwardBody = await request.json();

        console.log("📥 Received award creation request:", {
            year: body.year,
            categoriesCount: body.categories?.length || 0,
        });

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
            if (!category.items || category.items.length === 0) {
                return NextResponse.json(
                    {
                        success: false,
                        error: `Category "${category.name}" must have at least one award item.`,
                    },
                    { status: 400 },
                );
            }
            if (!category.carouselImages || category.carouselImages.length === 0) {
                return NextResponse.json(
                    {
                        success: false,
                        error: `Category "${category.name}" must have at least one carousel image.`,
                    },
                    { status: 400 },
                );
            }
        }

        console.log("✅ All validations passed. Creating award with categories...");

        const newAward = await prisma.award.create({
            data: {
                year: body.year,
                order: body.order ?? 0,
                categories: {
                    create: body.categories.map((category, catIndex) => {
                        console.log(`📦 Creating category: ${category.name} with ${category.items.length} items and ${category.carouselImages.length} images`);

                        return {
                            name: category.name,
                            icon: category.icon,
                            iconAlt: category.iconAlt,
                            gradientWidthClass: category.gradientWidthClass,
                            order: catIndex,
                            items: {
                                create: category.items.map((item, itemIndex) => ({
                                    title: item.title,
                                    description: item.description,
                                    order: itemIndex,
                                })),
                            },
                            carouselImages: {
                                create: category.carouselImages.map((img, imgIndex) => ({
                                    url: img.url,
                                    order: imgIndex,
                                })),
                            },
                        };
                    }),
                },
            },
            include: {
                categories: {
                    orderBy: { order: "asc" },
                    include: {
                        items: { orderBy: { order: "asc" } },
                        carouselImages: { orderBy: { order: "asc" } },
                    },
                },
            },
        });

        console.log("🎉 Award created successfully:", {
            id: newAward.id,
            year: newAward.year,
            categoriesCount: newAward.categories.length,
        });

        return NextResponse.json(
            {
                success: true,
                data: newAward,
                message: "Award created successfully with all categories.",
            },
            { status: 201 },
        );
    } catch (error) {
        console.error("❌ POST /api/awards error:", error);

        if (error instanceof Error) {
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
        }

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Failed to create award.",
            },
            { status: 500 },
        );
    }
}
