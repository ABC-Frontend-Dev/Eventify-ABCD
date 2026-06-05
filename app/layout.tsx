// app/layout.tsx
import "./globals.css";

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
} from "../public/fonts/fonts";

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
overflow-x-hidden
      `}
        >
            <body className="overflow-x-hidden max-w-full">{children}</body>
        </html>
    );
}
