// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
        }

        // Validate file type
        if (!file.type.startsWith("image/")) {
            return NextResponse.json({ success: false, error: "Only image files are allowed" }, { status: 400 });
        }

        // Validate file size (4MB)
        const maxSize = 4 * 1024 * 1024; // 4MB in bytes
        if (file.size > maxSize) {
            return NextResponse.json({ success: false, error: "File size exceeds 4MB" }, { status: 400 });
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generate unique filename
        const timestamp = Date.now();
        const originalName = file.name.replace(/\s/g, "-");
        const fileName = `${timestamp}-${originalName}`;

        // Define upload path
        const uploadDir = join(process.cwd(), "public", "images", "our-clients");

        // Create directory if it doesn't exist
        if (!existsSync(uploadDir)) {
            mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = join(uploadDir, fileName);

        // Write file to disk
        await writeFile(filePath, buffer);

        // Return the public path
        const publicPath = `/images/our-clients/${fileName}`;

        return NextResponse.json({
            success: true,
            path: publicPath,
            message: "File uploaded successfully",
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ success: false, error: "Failed to upload file" }, { status: 500 });
    }
}
