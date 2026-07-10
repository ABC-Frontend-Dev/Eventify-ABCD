// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// Maximum file size (10MB in bytes)
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Allowed file types
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];

const ALLOWED_VIDEO_TYPES = [
    "video/mp4",
    "video/webm",
    "video/ogg",
    "video/quicktime", // .mov files
    "video/x-msvideo", // .avi files
];

const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
        }

        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            const sizeMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
            return NextResponse.json(
                {
                    success: false,
                    error: `File size exceeds limit. Maximum allowed: ${sizeMB}MB`,
                },
                { status: 400 },
            );
        }

        // Check file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid file type. Allowed: Images (JPEG, PNG, WebP, GIF) and Videos (MP4, WebM, OGG, MOV, AVI)",
                },
                { status: 400 },
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Determine upload directory
        const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
        const uploadDir = isVideo ? "videos" : "images";

        // Generate unique filename
        const timestamp = Date.now();
        const originalName = file.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9.-]/g, "");
        const filename = `${timestamp}-${originalName}`;

        // Create paths
        const uploadPath = path.join(process.cwd(), "public", uploadDir, filename);
        const publicPath = `/${uploadDir}/${filename}`;

        // Ensure directory exists
        const dirPath = path.join(process.cwd(), "public", uploadDir);
        await mkdir(dirPath, { recursive: true });

        // Write file
        await writeFile(uploadPath, buffer);

        return NextResponse.json(
            {
                success: true,
                path: publicPath,
                filename: filename,
                size: file.size,
                type: file.type,
                isVideo: isVideo,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to upload file",
            },
            { status: 500 },
        );
    }
}
