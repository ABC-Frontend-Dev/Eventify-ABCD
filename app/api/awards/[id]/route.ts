import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ──────────────────────────────────────────────────────────
// TYPE DEFINITIONS
// ──────────────────────────────────────────────────────────
type ItemData = {
    title: string;
    description: string;
};

type CarouselImageData = {
    url: string;
};

type CategoryData = {
    id?: number;
    name: string;
    icon: string;
    iconAlt: string;
    items: ItemData[];
    carouselImages: CarouselImageData[];
    gradientWidthClass: string;
};

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const awardId = parseInt(id);

        if (isNaN(awardId)) {
            return NextResponse.json({ success: false, error: "Invalid award ID." }, { status: 400 });
        }

        const award = await prisma.award.findUnique({
            where: { id: awardId },
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

        if (!award) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Award with id: ${awardId} not found.`,
                },
                { status: 404 },
            );
        }

        return NextResponse.json({ success: true, data: award }, { status: 200 });
    } catch (error) {
        console.error("GET /api/awards/[id] error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch award." }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const awardId = parseInt(id);

        if (isNaN(awardId)) {
            return NextResponse.json({ success: false, error: "Invalid award ID." }, { status: 400 });
        }

        const body = await request.json();

        const existingAward = await prisma.award.findUnique({
            where: { id: awardId },
            include: {
                categories: {
                    include: {
                        items: true,
                        carouselImages: true,
                    },
                },
            },
        });

        if (!existingAward) {
            return NextResponse.json({ success: false, error: "Award not found." }, { status: 404 });
        }

        console.log("📥 Updating award:", { id: awardId, year: body.year });

        // ────────────────────────────────────────────────────────────
        // STEP 1: Delete old categories (cascade deletes items & images)
        // ────────────────────────────────────────────────────────────
        if (body.categories && body.categories.length > 0) {
            await prisma.awardCategory.deleteMany({
                where: { awardId: awardId },
            });
            console.log("🗑️ Deleted old categories");
        }

        // ────────────────────────────────────────────────────────────
        // STEP 2: Update award year/order & create new categories
        // ────────────────────────────────────────────────────────────
        const updatedAward = await prisma.award.update({
            where: { id: awardId },
            data: {
                year: body.year ?? existingAward.year,
                order: body.order ?? existingAward.order,
                categories: body.categories
                    ? {
                          create: body.categories.map((category: CategoryData, catIndex: number) => {
                              console.log(`📦 Updating category: ${category.name}`);

                              return {
                                  name: category.name,
                                  icon: category.icon,
                                  iconAlt: category.iconAlt,
                                  gradientWidthClass: category.gradientWidthClass,
                                  order: catIndex,
                                  items: {
                                      create: (category.items || []).map((item: ItemData, itemIndex: number) => ({
                                          title: item.title,
                                          description: item.description,
                                          order: itemIndex,
                                      })),
                                  },
                                  carouselImages: {
                                      create: (category.carouselImages || []).map((img: CarouselImageData, imgIndex: number) => ({
                                          url: img.url,
                                          order: imgIndex,
                                      })),
                                  },
                              };
                          }),
                      }
                    : undefined,
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

        console.log("🎉 Award updated successfully:", {
            id: updatedAward.id,
            year: updatedAward.year,
            categoriesCount: updatedAward.categories.length,
        });

        return NextResponse.json(
            {
                success: true,
                data: updatedAward,
                message: "Award updated successfully with all categories and images.",
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("PUT /api/awards/[id] error:", error);

        if (error instanceof Error) {
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
        }

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Failed to update award.",
            },
            { status: 500 },
        );
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const awardId = parseInt(id);

        if (isNaN(awardId)) {
            return NextResponse.json({ success: false, error: "Invalid award ID." }, { status: 400 });
        }

        const existingAward = await prisma.award.findUnique({
            where: { id: awardId },
        });

        if (!existingAward) {
            return NextResponse.json({ success: false, error: "Award not found." }, { status: 404 });
        }

        await prisma.award.delete({
            where: { id: awardId },
        });

        return NextResponse.json({ success: true, message: "Award deleted successfully." }, { status: 200 });
    } catch (error) {
        console.error("DELETE /api/awards/[id] error:", error);
        return NextResponse.json({ success: false, error: "Failed to delete award." }, { status: 500 });
    }
}
