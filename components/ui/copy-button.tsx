"use client";

import * as React from "react";
import { CopyCheck, CopyIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type SizeVariant = "sm" | "default" | "lg";

interface CopyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    value?: string;
    size?: SizeVariant;
    copyUrl?: boolean;
}

const sizeMap: Record<SizeVariant, { button: string; icon: number }> = {
    sm: { button: "h-8 w-8", icon: 14 },
    default: { button: "h-2 md:h-9 w-2 md:w-9", icon: 16 },
    lg: { button: "h-12 w-12", icon: 20 },
};

// ─── Get the correct public URL ───────────────────────────────────────────────
// Priority:
// 1. Explicit `value` prop passed by parent
// 2. NEXT_PUBLIC_SITE_URL env var + current pathname (correct domain always)
// 3. window.location.href fallback (works on localhost)

function getPublicUrl(): string {
    if (typeof window === "undefined") return "";

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (siteUrl) {
        // Combine configured base URL with current path + search + hash
        const base = siteUrl.replace(/\/$/, ""); // strip trailing slash
        const path = window.location.pathname + window.location.search + window.location.hash;
        return `${base}${path}`;
    }

    // Fallback — works correctly on localhost
    return window.location.href;
}

// ─── Component ────────────────────────────────────────────────────────────────

const CopyButton = React.forwardRef<HTMLButtonElement, CopyButtonProps>(({ value, size = "default", copyUrl = false, className, onClick, ...props }, ref) => {
    const [copied, setCopied] = React.useState<boolean>(false);

    const handleCopy = (event: React.MouseEvent<HTMLButtonElement>) => {
        // Priority: explicit value → public URL
        const textToCopy = value ?? getPublicUrl();

        if (textToCopy) {
            navigator.clipboard.writeText(textToCopy).catch(() => {
                // Fallback for older browsers / non-https
                const textarea = document.createElement("textarea");
                textarea.value = textToCopy;
                textarea.style.position = "fixed";
                textarea.style.opacity = "0";
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();
                document.execCommand("copy");
                document.body.removeChild(textarea);
            });
        }

        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
        onClick?.(event);
    };

    const { button: buttonSize, icon: iconSize } = sizeMap[size];

    return (
        <button
            ref={ref}
            type="button"
            onClick={handleCopy}
            aria-label={copied ? "Copied!" : "Copy link"}
            disabled={copied}
            className={cn(
                "relative cursor-pointer active:scale-[0.97] transition-all ease-out duration-200",
                "inline-flex items-center justify-center rounded-md",
                "text-neutral-900 dark:text-neutral-50",
                "disabled:pointer-events-none disabled:opacity-100",
                buttonSize,
                className,
            )}
            {...props}
        >
            {/* Copied icon */}
            <div className={cn("transition-all duration-200", copied ? "scale-100 opacity-100 blur-none" : "scale-70 opacity-0 blur-[2px]")}>
                <CopyCheck className="w-3 md:w-4 h-3 md:h-4" strokeWidth={2} color="#fff" aria-hidden="true" />
            </div>

            {/* Copy icon */}
            <div className={cn("absolute transition-all duration-200", copied ? "scale-0 opacity-0 blur-[2px]" : "scale-100 opacity-100 blur-none")}>
                <CopyIcon className="w-3 md:w-4 h-3 md:h-4" color="#fff" aria-hidden="true" />
            </div>
        </button>
    );
});

CopyButton.displayName = "CopyButton";

export { CopyButton };
export type { CopyButtonProps };
