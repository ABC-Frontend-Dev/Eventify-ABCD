import { NextResponse } from "next/server";

const IG_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;

interface IGMedia {
    id: string;
    caption?: string;
    media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
    media_url: string;
    thumbnail_url?: string; // present for VIDEO
    permalink: string;
    timestamp: string;
}

export async function GET() {
    if (!IG_TOKEN) {
        return NextResponse.json({ success: false, error: "Instagram token not configured." }, { status: 500 });
    }

    try {
        const fields = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp";
        const res = await fetch(`https://graph.instagram.com/me/media?fields=${fields}&access_token=${IG_TOKEN}`, {
            next: { revalidate: 3600 }, // cache 1 hour — avoid hitting Instagram on every request
        });

        const json = await res.json();

        if (json.error) {
            console.error("Instagram API error:", json.error);
            return NextResponse.json({ success: false, error: json.error.message }, { status: 502 });
        }

        const media: IGMedia[] = json.data ?? [];

        // Videos: media_url points to the .mp4 file, not a viewable thumbnail —
        // use thumbnail_url for display purposes when it's a video.
        const formatted = media.map((m) => ({
            id: m.id,
            caption: m.caption ?? null,
            isVideo: m.media_type === "VIDEO",
            image: m.media_type === "VIDEO" ? (m.thumbnail_url ?? m.media_url) : m.media_url,
            permalink: m.permalink,
            timestamp: m.timestamp,
        }));

        return NextResponse.json({ success: true, data: formatted });
    } catch (error) {
        console.error("GET /api/instagram/latest error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch Instagram feed." }, { status: 502 });
    }
}
