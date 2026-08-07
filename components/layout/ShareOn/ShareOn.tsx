"use client";

import * as React from "react";
import { CopyButton } from "@/components/ui/copy-button";
import { ShareWhatsAppButton } from "@/components/layout/ShareOn/ShareWhatsAppButton";
import { ShareLinkedInButton } from "./ShareLinkedInButton";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip-button";

const shareBtn = [
    {
        id: 1,
        name: "Copy",
        designation: "",
        image: <CopyButton />,
    },
    {
        id: 2,
        name: "WhatsApp",
        designation: "",
        image: <ShareWhatsAppButton text="Check out this amazing page!" />,
    },
    {
        id: 3,
        name: "LinkedIn",
        designation: "",
        image: <ShareLinkedInButton url="https://example.com" title="Check this out" summary="This is an amazing article" />,
    },
];

function ShareBtn() {
    return (
        <div className="mt-3 sm:mt-6">
            {/* <p className="text-sm font-helvetica-neue-roman uppercase mb-1.5">Share</p> */}
            <AnimatedTooltip items={shareBtn} />
        </div>
    );
}

export { ShareBtn };
