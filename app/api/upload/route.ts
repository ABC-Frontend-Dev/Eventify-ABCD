// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const FOLDER_MAP: Record<string, string> = {
    clients: "eventify/clients",
    blogs: "eventify/blogs",
    projects: "eventify/projects",
    services: "eventify/services",
    banners: "eventify/banners",
    hero: "eventify/hero",
    videos: "eventify/videos",
    comparisons: "eventify/comparisons",
    "about-us": "eventify/about-us",
    awards: "eventify/awards",
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB fallback

const FOLDER_SIZE_LIMITS: Record<string, { image?: number; video?: number }> = {
    hero: {
        image: 5 * 1024 * 1024,
        video: 200 * 1024 * 1024,
    },
    videos: {
        video: 200 * 1024 * 1024,
    },
    "about-us": {
        image: 2 * 1024 * 1024,
    },
    awards: {
        image: 1 * 1024 * 1024,
    },
    // ✅ blogs: images only, 1 MB cap
    blogs: {
        image: 1 * 1024 * 1024, // 1 MB
    },
    // ✅ projects: 1 MB images, 1 GB videos
    projects: {
        image: 1 * 1024 * 1024,
        video: 1 * 1024 * 1024 * 1024,
    },
};

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg", "video/quicktime", "video/x-msvideo"];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

function formatSize(bytes: number): string {
    if (bytes >= 1024 * 1024 * 1024) {
        const gb = bytes / (1024 * 1024 * 1024);
        return `${gb % 1 === 0 ? gb.toFixed(0) : gb.toFixed(1)}GB`;
    }
    const mb = bytes / (1024 * 1024);
    return `${mb % 1 === 0 ? mb.toFixed(0) : mb.toFixed(1)}MB`;
}

function uploadStream(buffer: Buffer, options: Record<string, unknown>): Promise<Record<string, unknown>> {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
            if (error) return reject(error);
            if (!result) return reject(new Error("No result from Cloudinary"));
            resolve(result as Record<string, unknown>);
        });
        const readable = new Readable();
        readable.push(buffer);
        readable.push(null);
        readable.pipe(stream);
    });
}

export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const folderKey = request.nextUrl.searchParams.get("folder") ?? "";

        if (!file) {
            return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid file type. Allowed: Images (JPEG, PNG, WebP, GIF) and Videos (MP4, WebM, OGG, MOV, AVI)",
                },
                { status: 400 },
            );
        }

        const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

        // ── blogs folder: reject videos entirely ──────────────────────────────
        if (folderKey === "blogs" && isVideo) {
            return NextResponse.json({ success: false, error: "Video uploads are not allowed for blog images." }, { status: 400 });
        }

        const folderLimits = FOLDER_SIZE_LIMITS[folderKey];
        const maxSize = (isVideo ? folderLimits?.video : folderLimits?.image) ?? MAX_FILE_SIZE;

        if (file.size > maxSize) {
            return NextResponse.json(
                {
                    success: false,
                    error: `File size exceeds the ${formatSize(maxSize)} limit for this upload.`,
                },
                { status: 400 },
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const folder = FOLDER_MAP[folderKey] ?? (isVideo ? "eventify/videos" : "eventify/images");

        let uploadOptions: Record<string, unknown>;

        if (isVideo) {
            uploadOptions = {
                folder,
                resource_type: "video",
                unique_filename: true,
                overwrite: false,
            };
        } else {
            uploadOptions = {
                folder,
                resource_type: "image",
                unique_filename: true,
                overwrite: false,
                format: "webp",
                quality: "auto:best",
                fetch_format: "auto",
            };
        }

        const result = await uploadStream(buffer, uploadOptions);

        return NextResponse.json(
            {
                success: true,
                path: result.secure_url,
                publicId: result.public_id,
                filename: result.original_filename,
                size: result.bytes,
                type: isVideo ? (result.format as string) : "image/webp",
                isVideo,
                width: result.width,
                height: result.height,
                format: result.format,
                duration: isVideo ? result.duration : null,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        return NextResponse.json({ success: false, error: "Failed to upload file" }, { status: 500 });
    }
}
