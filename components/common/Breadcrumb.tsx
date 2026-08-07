"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Breadcrumb({ props }: { props?: any }) {
    const pathname = usePathname();

    const pathSegments = pathname.split("/").filter(Boolean);

    // Matches any route under /blogs/*
    const isBlogPage = pathSegments[0] === "blogs" && pathSegments.length > 1;

    const textColor = isBlogPage ? "text-footer-bg" : "text-white";
    const separatorColor = isBlogPage ? "text-footer-bg" : "text-white";

    return (
        <ul className={`flex items-center flex-nowrap overflow-hidden w-full max-w-full gap-2 font-helvetica font-semibold tracking-wide ${props?.className || ""}`}>
            <li className="shrink-0 flex items-center">
                <Link href="/" className={`text-[10px] lg:text-xs leading-3.5 lg:leading-4 ${textColor} hover:text-primary transition-colors duration-200`}>
                    Home
                </Link>
            </li>

            {pathSegments.map((segment, index) => {
                const isLast = index === pathSegments.length - 1;

                let href = "/" + pathSegments.slice(0, index + 1).join("/");

                // Special case:
                // /services/abc -> Services breadcrumb goes to /#services
                if (segment === "services" && pathSegments.length > 1) {
                    href = "/#services";
                }

                return (
                    <li key={href} className={`flex items-center gap-2 ${isLast ? "min-w-0 shrink" : "shrink-0"}`}>
                        <span className={`text-[10px] lg:text-xs leading-3.5 lg:leading-4 ${separatorColor} shrink-0`}>/</span>

                        {isLast ? (
                            <span className="text-[10px] lg:text-xs leading-3.5 lg:leading-4 text-primary capitalize truncate block">{segment.replace(/-/g, " ")}</span>
                        ) : (
                            <Link
                                href={href}
                                className={`text-[10px] lg:text-xs leading-3.5 lg:leading-4 ${textColor} hover:text-primary transition-colors duration-200 capitalize truncate block shrink-0`}
                            >
                                {segment.replace(/-/g, " ")}
                            </Link>
                        )}
                    </li>
                );
            })}
        </ul>
    );
}
