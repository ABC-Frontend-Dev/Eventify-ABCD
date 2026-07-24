// app/api/blogs/view/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get("slug");

        if (!slug) {
            return NextResponse.json({ success: false, error: "Slug parameter required" }, { status: 400 });
        }

        // Get user IP (anonymous tracking)
        const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";

        // Get user agent
        const userAgent = request.headers.get("user-agent") || undefined;

        // Find blog by slug
        const blog = await prisma.blog.findUnique({
            where: { slug },
        });

        if (!blog) {
            return NextResponse.json({ success: false, error: "Blog not found" }, { status: 404 });
        }

        // Record the view
        try {
            await prisma.blogView.create({
                data: {
                    blogId: blog.id,
                    userIp: ip,
                    userAgent,
                },
            });
        } catch (viewError) {
            console.warn("Failed to create BlogView record:", viewError);
        }

        // Update blog view count and last viewed timestamp
        await prisma.blog.update({
            where: { id: blog.id },
            data: {
                viewCount: blog.viewCount + 1,
                // Object literal may only specify known properties, and 'viewCount' does not exist in type '(Without<BlogUpdateInput, BlogUncheckedUpdateInput> & BlogUncheckedUpdateInput) | (Without<...> & BlogUpdateInput)'.ts(2353)
                // index.d.ts(11560, 5): The expected type comes from property 'data' which is declared here on type '{ select?: BlogSelect<DefaultArgs> | null | undefined; omit?: BlogOmit<DefaultArgs> | null | undefined; include?: BlogInclude<DefaultArgs> | null | undefined; data: (Without<...> & BlogUncheckedUpdateInput) | (Without<...> & BlogUpdateInput); where: BlogWhereUniqueInput; }'
                lastViewedAt: new Date(),
            },
        });

        return NextResponse.json({ success: true, message: "View recorded" }, { status: 200 });
    } catch (error) {
        console.error("POST /api/blogs/view error:", error);
        return NextResponse.json({ success: false, error: "Failed to record view" }, { status: 500 });
    }
}
