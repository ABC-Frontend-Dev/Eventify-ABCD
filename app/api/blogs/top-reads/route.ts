// app/api/blogs/top-reads/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

enum BlogStatus {
    DRAFT = "DRAFT",
    PUBLISHED = "PUBLISHED",
    ARCHIVED = "ARCHIVED",
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit") || "5");
        const days = parseInt(searchParams.get("days") || "30"); // Last 30 days

        // Option 1: All-time top reads
        if (days === 0) {
            const topReads = await prisma.blog.findMany({
                where: {
                    status: BlogStatus.PUBLISHED,
                    viewCount: {
                        gt: 0, // Only blogs with views
                    },
                    // Object literal may only specify known properties, and 'viewCount' does not exist in type 'BlogWhereInput'.ts(2353)
                },
                orderBy: {
                    viewCount: "desc",
                },
                take: limit,
                include: {
                    author: {
                        select: {
                            name: true,
                        },
                    },
                    category: {
                        select: {
                            name: true,
                        },
                    },
                },
            });

            return NextResponse.json({ success: true, data: topReads, period: "all-time" }, { status: 200 });
        }

        // Option 2: Top reads in specific period
        const dateFrom = new Date();
        dateFrom.setDate(dateFrom.getDate() - days);

        const topReads = await prisma.blog.findMany({
            where: {
                status: BlogStatus.PUBLISHED,
                views: {
                    some: {
                        viewedAt: {
                            gte: dateFrom,
                        },
                    },
                },
            },
            orderBy: {
                viewCount: "desc",
            },
            take: limit,
            include: {
                author: {
                    select: {
                        name: true,
                    },
                },
                category: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: topReads,
                period: `Last ${days} days`,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("GET /api/blogs/top-reads error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch top reads" }, { status: 500 });
    }
}
