// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Whitelisted folder map — keeps files organised in Cloudinary
const FOLDER_MAP: Record<string, string> = {
    clients: "eventify/clients",
    blogs: "eventify/blogs",
    projects: "eventify/projects",
    services: "eventify/services",
    banners: "eventify/banners",
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg", "video/quicktime", "video/x-msvideo"];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const folderKey = request.nextUrl.searchParams.get("folder") ?? "";

        if (!file) {
            return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ success: false, error: "File size exceeds 10 MB limit" }, { status: 400 });
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json({ success: false, error: "Invalid file type. Allowed: Images (JPEG, PNG, WebP, GIF) and Videos (MP4, WebM, OGG, MOV, AVI)" }, { status: 400 });
        }

        // Convert File → base64 data URI for Cloudinary
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString("base64");
        const dataUri = `data:${file.type};base64,${base64}`;

        const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
        const folder = FOLDER_MAP[folderKey] ?? (isVideo ? "eventify/videos" : "eventify/images");

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(dataUri, {
            folder,
            resource_type: isVideo ? "video" : "image",
            // Auto-generate a unique public_id — no need to manage filenames
            unique_filename: true,
            overwrite: false,
        });

        return NextResponse.json(
            {
                success: true,
                path: result.secure_url, // ← full Cloudinary HTTPS URL
                publicId: result.public_id,
                filename: result.original_filename,
                size: result.bytes,
                type: file.type,
                isVideo,
                width: result.width,
                height: result.height,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        return NextResponse.json({ success: false, error: "Failed to upload file" }, { status: 500 });
    }
}
