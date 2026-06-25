"use client";

import * as React from "react";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type SizeVariant = "sm" | "default" | "lg";

interface ShareLinkedInButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    url?: string;
    title?: string;
    summary?: string;
    size?: SizeVariant;
}

const sizeMap: Record<SizeVariant, { button: string; icon: number }> = {
    sm: { button: "h-8 w-8", icon: 14 },
    default: { button: "h-9 w-9", icon: 16 },
    lg: { button: "h-12 w-12", icon: 20 },
};

// LinkedIn Icon Component
const LinkedInIcon = ({ size = 16 }: { size?: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
    </svg>
);

const ShareLinkedInButton = React.forwardRef<HTMLButtonElement, ShareLinkedInButtonProps>(({ url, title = "", summary = "", size = "default", className, onClick, ...props }, ref) => {
    const [shared, setShared] = React.useState<boolean>(false);

    const handleShare = (event: React.MouseEvent<HTMLButtonElement>) => {
        let shareUrl = url;

        // If no URL provided, use current page URL
        if (!shareUrl && typeof window !== "undefined") {
            shareUrl = window.location.href;
        }

        if (shareUrl) {
            // Construct LinkedIn share URL
            const linkedinUrl = new URL("https://www.linkedin.com/sharing/share-offsite/");
            linkedinUrl.searchParams.append("url", shareUrl);

            // Open LinkedIn in new window
            window.open(linkedinUrl.toString(), "_blank", "noopener,noreferrer,width=600,height=600");

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
            aria-label={shared ? "Shared" : "Share on LinkedIn"}
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
                <LinkedInIcon size={iconSize} />
            </div>
        </button>
    );
});

ShareLinkedInButton.displayName = "ShareLinkedInButton";

export { ShareLinkedInButton };
export type { ShareLinkedInButtonProps };
