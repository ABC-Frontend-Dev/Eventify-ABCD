// components/layout/ShareOn/ShareOn.tsx
"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { CopyButton } from "@/components/ui/copy-button";
import { ShareWhatsAppButton } from "@/components/layout/ShareOn/ShareWhatsAppButton";
import { ShareLinkedInButton } from "./ShareLinkedInButton";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip-button";
import { useToasts } from "@/components/ui/toast";

interface ShareBtnProps {
    /** Full URL to share. Defaults to the current page URL if omitted. */
    url?: string;
    /** Title/summary used for LinkedIn + Instagram's copy-link fallback message. */
    title?: string;
    summary?: string;
}

function FacebookIcon() {
    return (
        <svg viewBox="0 0 24 24" className="w-3 md:w-6 h-3 md:h-6" fill="currentColor">
            <path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94z" />
        </svg>
    );
}

function InstagramIcon() {
    return (
        <svg viewBox="0 0 24 24" className="w-3 md:w-5 h-3 md:h-5 stroke-footer-bg" strokeWidth={0.25} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2.2c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.64-.07-4.85s.02-3.58.07-4.85c.15-3.23 1.67-4.77 4.92-4.92 1.27-.06 1.65-.07 4.85-.07zM12 0C8.74 0 8.33.01 7.05.07 2.7.27.28 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95C23.73 2.72 21.3.28 16.95.07 15.67.01 15.26 0 12 0z" />
            <path d="M12 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84zm0 10.16A4 4 0 1 1 16 12a4 4 0 0 1-4 4zM19.85 5.6a1.44 1.44 0 1 1-1.44-1.44 1.44 1.44 0 0 1 1.44 1.44z" />
        </svg>
    );
}

function ShareFacebookButton({ url }: { url: string }) {
    const handleShare = () => {
        const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        window.open(shareUrl, "_blank", "noopener,noreferrer,width=600,height=600");
    };

    return (
        <button onClick={handleShare} aria-label="Share on Facebook" className="w-full h-full flex items-center justify-center cursor-pointer">
            <FacebookIcon />
        </button>
    );
}

function ShareInstagramButton({ url, title }: { url: string; title?: string }) {
    const toast = useToasts();

    const handleShare = async () => {
        // Instagram has no official web "share to feed/story" URL like Facebook or
        // LinkedIn — this is a real platform limitation, not a bug. We try the
        // native OS share sheet first (Instagram may appear there on mobile),
        // and otherwise fall back to copying the link for the user to paste
        // manually into a Story, DM, or bio.
        if (typeof navigator !== "undefined" && navigator.share) {
            try {
                await navigator.share({ url, title });
                return;
            } catch {
                // user cancelled the share sheet — do nothing further
                return;
            }
        }

        try {
            await navigator.clipboard.writeText(url);
            toast.success("Link copied! Instagram doesn't support direct web sharing — paste this into a Story, DM, or your bio.");
        } catch {
            toast.error("Couldn't copy the link. Please copy it manually.");
        }
    };

    return (
        <button onClick={handleShare} aria-label="Share on Instagram" className="w-full h-full flex items-center justify-center cursor-pointer">
            <InstagramIcon />
        </button>
    );
}

function ShareBtn({ url, title = "Check out this amazing page!", summary = "This is an amazing article" }: ShareBtnProps) {
    const pathname = usePathname();
    const resolvedUrl = url ?? (typeof window !== "undefined" ? `${window.location.origin}${pathname}` : "");

    const shareBtn = [
        // {
        //     id: 1,
        //     name: "Copy",
        //     designation: "",
        //     image: <CopyButton />,
        // },
        // {
        //     id: 2,
        //     name: "WhatsApp",
        //     designation: "",
        //     image: <ShareWhatsAppButton text={title} />,
        // },
        {
            id: 1,
            name: "Facebook",
            designation: "",
            image: <ShareFacebookButton url={resolvedUrl} />,
        },
        {
            id: 2,
            name: "Instagram",
            designation: "",
            image: <ShareInstagramButton url={resolvedUrl} title={title} />,
        },
        {
            id: 3,
            name: "LinkedIn",
            designation: "",
            image: <ShareLinkedInButton url={resolvedUrl} title={title} summary={summary} />,
        },
    ];

    return (
        <div className="flex gap-1.5 items-center justify-center">
            <p className="text-xl font-helvetica-neue-roman normal-case">Share: </p>
            <AnimatedTooltip items={shareBtn} />
        </div>
    );
}

export { ShareBtn };
