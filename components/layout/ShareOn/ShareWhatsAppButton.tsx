"use client";

import * as React from "react";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { LogosWhatsappIcon } from "@/components/icons/LogosWhatsappIcon";

type SizeVariant = "sm" | "default" | "lg";

interface ShareWhatsAppButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    url?: string;
    text?: string;
    size?: SizeVariant;
}

const sizeMap: Record<SizeVariant, { button: string; icon: number }> = {
    sm: { button: "h-8 w-8", icon: 14 },
    default: { button: "h-9 w-9", icon: 16 },
    lg: { button: "h-12 w-12", icon: 20 },
};

// WhatsApp Icon Component
const WhatsAppIcon = ({ size = 16 }: { size?: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
);

const ShareWhatsAppButton = React.forwardRef<HTMLButtonElement, ShareWhatsAppButtonProps>(({ url, text = "", size = "default", className, onClick, ...props }, ref) => {
    const [shared, setShared] = React.useState<boolean>(false);

    const handleShare = (event: React.MouseEvent<HTMLButtonElement>) => {
        let shareUrl = url;

        // If no URL provided, use current page URL
        if (!shareUrl && typeof window !== "undefined") {
            shareUrl = window.location.href;
        }

        if (shareUrl) {
            // Construct WhatsApp share URL
            const message = text ? `${text}\n${shareUrl}` : shareUrl;
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

            // Open WhatsApp in new window
            window.open(whatsappUrl, "_blank", "noopener,noreferrer");

            setShared(true);
            setTimeout(() => setShared(false), 1500);
        }

        onClick?.(event);
    };

    const { button: buttonSize, icon: iconSize } = sizeMap[size];

    return (
        <button
            ref={ref}
            type="button"
            onClick={handleShare}
            aria-label={shared ? "Shared" : "Share on WhatsApp"}
            disabled={shared}
            className={cn(
                "relative cursor-pointer active:scale-[0.97] transition-all ease-out duration-200 inline-flex items-center justify-center rounded-md text-neutral-900 disabled:pointer-events-none disabled:opacity-100 dark:text-neutral-50",
                buttonSize,
                className,
            )}
            {...props}
        >
            <div className={cn("transition-all duration-200", shared ? "scale-100 opacity-100 blur-none" : "scale-70 opacity-0 blur-[2px]")}>
                <CheckIcon size={iconSize} strokeWidth={2} aria-hidden="true" />
            </div>
            <div className={cn("absolute transition-all duration-200", shared ? "scale-0 opacity-0 blur-[2px]" : "scale-100 opacity-100 blur-none")}>
                {/* <WhatsAppIcon size={iconSize} /> */}
                <LogosWhatsappIcon />
            </div>
        </button>
    );
});

ShareWhatsAppButton.displayName = "ShareWhatsAppButton";

export { ShareWhatsAppButton };
export type { ShareWhatsAppButtonProps };
