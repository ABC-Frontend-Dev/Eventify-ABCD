// app/api/instagram/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const MAX_POSTS = 10;
const MAX_ENABLED = 5;

// GET /api/instagram — returns all posts ordered by `order`
export async function GET() {
    try {
        const posts = await prisma.instagramPost.findMany({
            orderBy: { order: "asc" },
        });

        return NextResponse.json({ success: true, data: posts }, { status: 200 });
    } catch (error) {
        console.error("GET /api/instagram error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch posts." }, { status: 500 });
    }
}

// POST /api/instagram — add a new post (admin only)
// Pre-fetches image + title from microlink on save
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
        }

        const body = await request.json();
        const { url } = body;

        if (!url?.trim()) {
            return NextResponse.json({ success: false, error: "Instagram URL is required." }, { status: 400 });
        }

        // Basic Instagram URL validation
        const isInstagramUrl = /^https?:\/\/(www\.)?instagram\.com\/.+/.test(url.trim());
        if (!isInstagramUrl) {
            return NextResponse.json({ success: false, error: "Please enter a valid Instagram URL." }, { status: 400 });
        }

        // Check max 10 posts
        const totalCount = await prisma.instagramPost.count();
        if (totalCount >= MAX_POSTS) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Maximum ${MAX_POSTS} posts allowed. Delete one to add more.`,
                },
                { status: 400 },
            );
        }

        // Check duplicate
        const existing = await prisma.instagramPost.findUnique({
            where: { url: url.trim() },
        });
        if (existing) {
            return NextResponse.json({ success: false, error: "This Instagram post is already added." }, { status: 409 });
        }

        // Pre-fetch preview from microlink
        let image: string | null = null;
        let imageWidth: number | null = null;
        let imageHeight: number | null = null;
        let title: string | null = null;

        try {
            const mlRes = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url.trim())}`);
            const mlJson = await mlRes.json();

            if (mlJson.status === "success") {
                image = mlJson.data?.image?.url ?? null;
                imageWidth = mlJson.data?.image?.width ?? null;
                imageHeight = mlJson.data?.image?.height ?? null;
                title = mlJson.data?.title ?? null;
            }
        } catch (mlError) {
            // Non-fatal — save without preview
            console.warn("Microlink fetch failed (non-fatal):", mlError);
        }

        // Assign order = last position
        const maxOrder = await prisma.instagramPost.aggregate({
            _max: { order: true },
        });
        const nextOrder = (maxOrder._max.order ?? -1) + 1;

        const post = await prisma.instagramPost.create({
            data: {
                url: url.trim(),
                image,
                imageWidth,
                imageHeight,
                title,
                isEnabled: false,
                order: nextOrder,
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: post,
                message: "Instagram post added successfully.",
            },
            { status: 201 },
        );
    } catch (error) {
        console.error("POST /api/instagram error:", error);
        return NextResponse.json({ success: false, error: "Failed to add post." }, { status: 500 });
    }
}
