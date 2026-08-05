import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const VALID_TYPES = ["CLIENT", "SERVICE", "TEAM", "PROJECT", "AWARD", "BLOG", "SYL"] as const;
type SectionType = (typeof VALID_TYPES)[number];

// GET — fetch all sections
export async function GET() {
    try {
        const sections = await prisma.sectionTD.findMany({
            orderBy: { id: "asc" },
        });

        return NextResponse.json({ success: true, data: sections }, { status: 200 });
    } catch (error) {
        console.error("GET /api/sections error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch sections." }, { status: 500 });
    }
}
