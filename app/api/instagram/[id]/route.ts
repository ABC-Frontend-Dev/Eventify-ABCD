import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const MAX_ENABLED = 5;

// DELETE /api/instagram/:id
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
        }

        const { id } = await params;
        const postId = parseInt(id);

        if (isNaN(postId)) {
            return NextResponse.json({ success: false, error: "Invalid post ID." }, { status: 400 });
        }

        const existing = await prisma.instagramPost.findUnique({
            where: { id: postId },
        });

        if (!existing) {
            return NextResponse.json({ success: false, error: "Post not found." }, { status: 404 });
        }

        await prisma.instagramPost.delete({ where: { id: postId } });

        // Re-normalize order values after delete
        const remaining = await prisma.instagramPost.findMany({
            orderBy: { order: "asc" },
        });

        await prisma.$transaction(
            remaining.map((p, idx) =>
                prisma.instagramPost.update({
                    where: { id: p.id },
                    data: { order: idx },
                }),
            ),
        );

        return NextResponse.json({ success: true, message: "Post deleted successfully." }, { status: 200 });
    } catch (error) {
        console.error("DELETE /api/instagram/[id] error:", error);
        return NextResponse.json({ success: false, error: "Failed to delete post." }, { status: 500 });
    }
}

// PATCH /api/instagram/:id
// Body: { type: "toggle" } | { type: "reorder", newOrder: number[] }
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
        }

        const { id } = await params;
        const postId = parseInt(id);
        const body = await request.json();

        if (isNaN(postId)) {
            return NextResponse.json({ success: false, error: "Invalid post ID." }, { status: 400 });
        }

        // ── Toggle enable/disable ─────────────────────────────────────────────
        if (body.type === "toggle") {
            const post = await prisma.instagramPost.findUnique({
                where: { id: postId },
            });

            if (!post) {
                return NextResponse.json({ success: false, error: "Post not found." }, { status: 404 });
            }

            // If trying to enable, check max enabled limit
            if (!post.isEnabled) {
                const enabledCount = await prisma.instagramPost.count({
                    where: { isEnabled: true },
                });

                if (enabledCount >= MAX_ENABLED) {
                    return NextResponse.json(
                        {
                            success: false,
                            error: `Only ${MAX_ENABLED} posts can be enabled at once. Disable another post first.`,
                        },
                        { status: 400 },
                    );
                }
            }

            const updated = await prisma.instagramPost.update({
                where: { id: postId },
                data: { isEnabled: !post.isEnabled },
            });

            return NextResponse.json(
                {
                    success: true,
                    data: updated,
                    message: updated.isEnabled ? "Post enabled." : "Post disabled.",
                },
                { status: 200 },
            );
        }

        return NextResponse.json({ success: false, error: "Invalid request type." }, { status: 400 });
    } catch (error) {
        console.error("PATCH /api/instagram/[id] error:", error);
        return NextResponse.json({ success: false, error: "Failed to update post." }, { status: 500 });
    }
}
