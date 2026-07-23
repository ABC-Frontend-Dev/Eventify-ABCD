// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";

import { SITE_CONFIG, getAbsoluteUrl } from "@/lib/constants";
export const metadata: Metadata = {
    metadataBase: new URL(SITE_CONFIG.baseUrl),
    title: {
        default: SITE_CONFIG.name,
        template: `%s | ${SITE_CONFIG.name}`,
    },
    description: SITE_CONFIG.description,
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    alternates: {
        canonical: getAbsoluteUrl("/"),
    },
};
import {
    fontHelvetica,
    fontHelveticaNeueHeavy,
    fontProductSansLight,
    fontProductSansBold,
    fontProductSansBlack,
    fontProductSansMedium,
    fontHelveticaMedium,
    fontHelveticaBold,
    fontProductSansRegular,
    fontHelveticaNeueRoman,
    fontHelveticaThin,
} from "../public/fonts/fonts";
import { Providers } from "./providers";

// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html
            lang="en"
            className={`
        ${fontHelvetica.variable}
        ${fontHelveticaMedium.variable}
        ${fontHelveticaBold.variable}
        ${fontHelveticaNeueHeavy.variable}
        ${fontProductSansLight.variable}
        ${fontProductSansRegular.variable}
        ${fontProductSansBold.variable}
        ${fontProductSansBlack.variable}
        ${fontProductSansMedium.variable}
        ${fontHelveticaNeueRoman.variable}
        ${fontHelveticaThin.variable}
      `}
        >
            <body className="max-w-full">
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
