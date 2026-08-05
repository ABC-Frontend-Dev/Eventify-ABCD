import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const VALID_TYPES = ["CLIENT", "SERVICE", "TEAM", "PROJECT", "AWARD", "BLOG", "SYL"] as const;
type SectionType = (typeof VALID_TYPES)[number];

function isValidType(type: string): type is SectionType {
    return VALID_TYPES.includes(type as SectionType);
}

// GET — fetch one section by type
export async function GET(_req: NextRequest, { params }: { params: Promise<{ type: string }> }) {
    try {
        const { type } = await params;
        const upperType = type.toUpperCase();

        if (!isValidType(upperType)) {
            return NextResponse.json({ success: false, error: `Invalid section type: ${type}` }, { status: 400 });
        }

        const section = await prisma.sectionTD.findUnique({
            where: { type: upperType as SectionType },
        });

        return NextResponse.json({ success: true, data: section ?? null }, { status: 200 });
    } catch (error) {
        console.error("GET /api/sections/[type] error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch section." }, { status: 500 });
    }
}

// PUT — create or update a section (upsert)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ type: string }> }) {
    try {
        const { type } = await params;
        const upperType = type.toUpperCase();

        if (!isValidType(upperType)) {
            return NextResponse.json({ success: false, error: `Invalid section type: ${type}` }, { status: 400 });
        }

        const body = await req.json();

        if (!body.titlePartOne || !body.titlePartOne.trim()) {
            return NextResponse.json({ success: false, error: "titlePartOne is required." }, { status: 400 });
        }

        const section = await prisma.sectionTD.upsert({
            where: { type: upperType as SectionType },
            create: {
                type: upperType as SectionType,
                titlePartOne: body.titlePartOne.trim(),
                titlePartTwo: body.titlePartTwo?.trim() || null,
                description: body.description?.trim() || null,
            },
            update: {
                titlePartOne: body.titlePartOne.trim(),
                titlePartTwo: body.titlePartTwo?.trim() || null,
                description: body.description?.trim() || null,
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: section,
                message: "Section saved successfully.",
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("PUT /api/sections/[type] error:", error);
        return NextResponse.json({ success: false, error: "Failed to save section." }, { status: 500 });
    }
}

// DELETE — remove a section
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ type: string }> }) {
    try {
        const { type } = await params;
        const upperType = type.toUpperCase();

        if (!isValidType(upperType)) {
            return NextResponse.json({ success: false, error: `Invalid section type: ${type}` }, { status: 400 });
        }

        const existing = await prisma.sectionTD.findUnique({
            where: { type: upperType as SectionType },
        });

        if (!existing) {
            return NextResponse.json({ success: false, error: "Section not found." }, { status: 404 });
        }

        await prisma.sectionTD.delete({
            where: { type: upperType as SectionType },
        });

        return NextResponse.json({ success: true, message: "Section deleted." }, { status: 200 });
    } catch (error) {
        console.error("DELETE /api/sections/[type] error:", error);
        return NextResponse.json({ success: false, error: "Failed to delete section." }, { status: 500 });
    }
}
