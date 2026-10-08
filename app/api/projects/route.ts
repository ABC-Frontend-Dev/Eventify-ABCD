// app/api/projects/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type ProjectBody = {
    title: string;
    description?: string;
    bannerImage: string;
    images: string[];
    categoryId: number;
    clientId?: number | null;
    projectClientLogo?: string | null;
    hasTabs?: boolean;
    tabs?: Array<{
        name: string;
        images: string[];
    }>;
};

/**
 * GET /api/projects
 *
 * Optional query params (no params = the saved custom order, which is what the
 * public website uses):
 *   ?year=2025            only projects created in that year
 *   ?sort=custom          the order saved from the dashboard "Rearrange" (default)
 *   ?sort=newest|oldest   by created date
 *   ?sort=az|za           by title
 *
 * The response also includes `years` (every year that has at least one
 * project, newest first) so the UI can build the year filter.
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const sort = searchParams.get("sort") ?? "custom";
        const yearParam = searchParams.get("year");
        const year = yearParam ? Number(yearParam) : null;

        const where =
            year && Number.isInteger(year)
                ? {
                      createdAt: {
                          gte: new Date(Date.UTC(year, 0, 1)),
                          lt: new Date(Date.UTC(year + 1, 0, 1)),
                      },
                  }
                : undefined;

        const orderBy =
            sort === "az"
                ? [{ title: "asc" as const }]
                : sort === "za"
                  ? [{ title: "desc" as const }]
                  : sort === "oldest"
                    ? [{ createdAt: "asc" as const }]
                    : sort === "newest"
                      ? [{ createdAt: "desc" as const }]
                      : // custom: saved order first, newest id first for ties
                        [{ order: "asc" as const }, { id: "desc" as const }];

        const [projects, allDates] = await Promise.all([
            prisma.project.findMany({
                where,
                orderBy,
                include: {
                    category: true,
                    client: true,
                    tabs: {
                        orderBy: {
                            order: "asc",
                        },
                    },
                },
            }),
            // Always computed from ALL projects so the year options don't
            // disappear when one year is selected.
            prisma.project.findMany({ select: { createdAt: true } }),
        ]);

        const years = [...new Set(allDates.map((p) => p.createdAt.getUTCFullYear()))].sort((a, b) => b - a);

        return NextResponse.json(
            {
                success: true,
                data: projects,
                count: projects.length,
                years,
            },
            {
                status: 200,
            },
        );
    } catch (error) {
        console.log("GET /api/projects error: ", error);
        return NextResponse.json({ success: false, error: "Failed to fetch Projects data." }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body: ProjectBody = await request.json();

        if (!body.title || !body.bannerImage || !body.categoryId) {
            return NextResponse.json({ success: false, error: "Title, banner image, and category are required." }, { status: 400 });
        }

        // Validate tabs or images
        if (body.hasTabs) {
            if (!body.tabs || body.tabs.length === 0) {
                return NextResponse.json({ success: false, error: "At least one tab is required when tabs are enabled." }, { status: 400 });
            }
        } else {
            if (!body.images || body.images.length === 0) {
                return NextResponse.json({ success: false, error: "At least one image is required." }, { status: 400 });
            }
        }

        // Validate client if provided
        if (body.clientId) {
            const clientExists = await prisma.clients.findUnique({
                where: { id: body.clientId },
            });
            if (!clientExists) {
                return NextResponse.json({ success: false, error: "Client not found." }, { status: 404 });
            }
        }

        // New projects go to the top of the custom order (same as before,
        // when the list was simply newest-first).
        const first = await prisma.project.aggregate({ _min: { order: true } });
        const nextOrder = (first._min.order ?? 0) - 1;

        const newProject = await prisma.project.create({
            data: {
                title: body.title,
                description: body.description?.trim() || null,
                bannerImage: body.bannerImage,
                categoryId: body.categoryId,
                clientId: body.clientId || null,
                projectClientLogo: body.projectClientLogo || null,
                hasTabs: body.hasTabs || false,
                order: nextOrder,
                images: body.hasTabs ? [] : body.images,
                tabs: body.hasTabs
                    ? {
                          create:
                              body.tabs?.map((tab, index) => ({
                                  name: tab.name,
                                  images: tab.images,
                                  order: index,
                              })) || [],
                      }
                    : undefined,
            },
            include: {
                category: true,
                client: true,
                tabs: true,
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: newProject,
                message: "Project created successfully.",
            },
            {
                status: 201,
            },
        );
    } catch (error) {
        console.error("POST /api/projects error:", error);
        return NextResponse.json({ success: false, error: "Failed to create Project." }, { status: 500 });
    }
}