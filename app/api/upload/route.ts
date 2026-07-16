import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

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
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg", "video/quicktime", "video/x-msvideo"];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

const CONVERSION_CONFIG = {
    webp: {
        quality: 95,
        progressive: true,
    },
    webm: {
        quality: 95,
        video_codec: "vp9",
        audio_codec: "libopus",
        bit_rate: "2000k",
    },
};

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const folderKey = request.nextUrl.searchParams.get("folder") ?? "";
        const imageQuality = request.nextUrl.searchParams.get("imageQuality") ? parseInt(request.nextUrl.searchParams.get("imageQuality")!) : CONVERSION_CONFIG.webp.quality;
        const videoQuality = request.nextUrl.searchParams.get("videoQuality") ? parseInt(request.nextUrl.searchParams.get("videoQuality")!) : CONVERSION_CONFIG.webm.quality;

        if (!file) {
            return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ success: false, error: "File size exceeds 10 MB limit" }, { status: 400 });
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

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString("base64");
        const dataUri = `data:${file.type};base64,${base64}`;

        const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
        const folder = FOLDER_MAP[folderKey] ?? (isVideo ? "eventify/videos" : "eventify/images");

        const result = await cloudinary.uploader.upload(dataUri, {
            folder,
            resource_type: isVideo ? "video" : "image",
            unique_filename: true,
            overwrite: false,
            ...(isVideo
                ? {
                      format: "webm",
                      video_codec: CONVERSION_CONFIG.webm.video_codec,
                      audio_codec: CONVERSION_CONFIG.webm.audio_codec,
                      bit_rate: CONVERSION_CONFIG.webm.bit_rate,
                      quality: videoQuality,
                      flags: "progressive",
                  }
                : {
                      format: "webp",
                      quality: imageQuality,
                      fetch_format: "auto",
                      flags: "progressive",
                  }),
        });

        return NextResponse.json(
            {
                success: true,
                path: result.secure_url,
                publicId: result.public_id,
                filename: result.original_filename,
                size: result.bytes,
                type: isVideo ? "video/webm" : "image/webp",
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
        console.error("Error details:", error instanceof Error ? error.message : error);
        return NextResponse.json({ success: false, error: "Failed to upload file" }, { status: 500 });
    }
}
