"use client";

import * as React from "react";
import { MenuBar } from "@/components/ui/bottom-menu";
import { CopyButton } from "@/components/ui/copy-button";
import { ShareWhatsAppButton } from "@/components/layout/ShareOn/ShareWhatsAppButton";
import { ShareLinkedInButton } from "./ShareLinkedInButton";

const menuItems = [
    {
        icon: <CopyButton />,
        label: "Copy",
    },
    {
        icon: <ShareWhatsAppButton text="Check out this amazing page!" />,
        label: "WhatsApp",
    },
    {
        icon: <ShareLinkedInButton url="https://example.com" title="Check this out" summary="This is an amazing article" />,
        label: "LinkedIn",
    },
];

function ShareBtn() {
    return (
        <div className="flex items-center justify-start gap-3 mb-2 pb-3 border-b">
            <p className="text-lg font-product-sans-medium">Share On:</p>
            <MenuBar items={menuItems} />
        </div>
    );
}

export { ShareBtn };
